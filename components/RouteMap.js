"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getSegmentsWithCoordinates } from "@/lib/expedition-data";

const NEPAL_BOUNDS = {
  minLng: 80,
  maxLng: 89,
  minLat: 26,
  maxLat: 31,
};

function haversineDistanceKm([lng1, lat1], [lng2, lat2]) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function polylineDistanceKm(coordinates) {
  if (!coordinates || coordinates.length < 2) {
    return 0;
  }

  let distance = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    distance += haversineDistanceKm(coordinates[index - 1], coordinates[index]);
  }
  return distance;
}

function isWithinNepalBounds(coordinates) {
  return coordinates.every(([lng, lat]) => {
    return (
      lng >= NEPAL_BOUNDS.minLng &&
      lng <= NEPAL_BOUNDS.maxLng &&
      lat >= NEPAL_BOUNDS.minLat &&
      lat <= NEPAL_BOUNDS.maxLat
    );
  });
}

function findNearestLocation(toCoordinate, allLocations, excludeLocations = []) {
  let nearest = null;
  let minDistance = Infinity;
  const excludedSlugs = new Set(
    (Array.isArray(excludeLocations) ? excludeLocations : [excludeLocations])
      .filter(Boolean)
      .map((location) => location.slug),
  );

  allLocations.forEach((location) => {
    if (excludedSlugs.has(location.slug)) {
      return;
    }

    const distance = haversineDistanceKm(toCoordinate, location.coordinates);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = location;
    }
  });

  return nearest;
}

function createCurvyFallbackCoordinates(fromCoordinate, toCoordinate, pointCount = 24) {
  const [fromLng, fromLat] = fromCoordinate;
  const [toLng, toLat] = toCoordinate;
  const deltaLng = toLng - fromLng;
  const deltaLat = toLat - fromLat;
  const distance = Math.hypot(deltaLng, deltaLat);

  if (distance === 0) {
    return [fromCoordinate, toCoordinate];
  }

  const unitPerpLng = -deltaLat / distance;
  const unitPerpLat = deltaLng / distance;
  const bendMagnitude = Math.min(Math.max(distance * 0.22, 0.03), 0.25);
  const bendDirection = (fromLng + fromLat + toLng + toLat) % 2 >= 1 ? 1 : -1;

  const controlPoint1 = [
    fromLng + deltaLng * 0.33 + unitPerpLng * bendMagnitude * bendDirection,
    fromLat + deltaLat * 0.33 + unitPerpLat * bendMagnitude * bendDirection,
  ];
  const controlPoint2 = [
    fromLng + deltaLng * 0.66 - unitPerpLng * bendMagnitude * 0.6 * bendDirection,
    fromLat + deltaLat * 0.66 - unitPerpLat * bendMagnitude * 0.6 * bendDirection,
  ];

  const coordinates = [];
  for (let index = 0; index <= pointCount; index += 1) {
    const t = index / pointCount;
    const inverseT = 1 - t;
    const lng =
      inverseT * inverseT * inverseT * fromLng +
      3 * inverseT * inverseT * t * controlPoint1[0] +
      3 * inverseT * t * t * controlPoint2[0] +
      t * t * t * toLng;
    const lat =
      inverseT * inverseT * inverseT * fromLat +
      3 * inverseT * inverseT * t * controlPoint1[1] +
      3 * inverseT * t * t * controlPoint2[1] +
      t * t * t * toLat;

    coordinates.push([lng, lat]);
  }

  return coordinates;
}

async function fetchRoadGeometry(fromCoordinate, toCoordinate, signal, retryCoordinate = null) {
  const [fromLng, fromLat] = fromCoordinate;
  const [toLng, toLat] = toCoordinate;

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${fromLng},${fromLat};${toLng},${toLat}` +
    `?overview=full&alternatives=false&steps=false&geometries=geojson`;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const routeCoordinates = payload?.routes?.[0]?.geometry?.coordinates;
    if (!routeCoordinates?.length) {
      return null;
    }

    // Allow some tolerance for routes that may briefly go outside Nepal bounds
    // but don't reject entirely as some valid mountain routes might do this
    const outOfBoundsPoints = routeCoordinates.filter(([lng, lat]) => {
      return (
        lng < NEPAL_BOUNDS.minLng - 0.5 ||
        lng > NEPAL_BOUNDS.maxLng + 0.5 ||
        lat < NEPAL_BOUNDS.minLat - 0.5 ||
        lat > NEPAL_BOUNDS.maxLat + 0.5
      );
    });

    // Reject only if majority of route is outside bounds
    if (outOfBoundsPoints.length > routeCoordinates.length * 0.5) {
      return null;
    }

    const straightDistance = haversineDistanceKm(fromCoordinate, toCoordinate);
    const routeDistance = polylineDistanceKm(routeCoordinates);

    // For mountain terrain, allow roads up to 5x the straight-line distance
    if (straightDistance > 0 && routeDistance > straightDistance * 5) {
      return null;
    }

    return routeCoordinates;
  } catch (err) {
    // Network or abort errors are expected during cleanup
    return null;
  }
}

const defaultSegmentStyle = {
  color: "#10454f",
  weight: 4,
  opacity: 0.95,
};

const hoverSegmentStyle = {
  color: "#f3722c",
  weight: 7,
  opacity: 1,
};

const activeSegmentStyle = {
  color: "#f4b000",
  weight: 6,
  opacity: 1,
};

export default function RouteMap({
  locations,
  activeSegmentId,
  onSegmentSelect = () => {},
  onLocationSelect = () => {},
}) {
  const router = useRouter();
  const mapContainerRef = useRef(null);
  const mapLayersRef = useRef({ markers: [], segments: {} });
  const activeSegmentRef = useRef(activeSegmentId);
  const segmentsWithCoordinates = useMemo(() => getSegmentsWithCoordinates(), []);

  useEffect(() => {
    activeSegmentRef.current = activeSegmentId;
  }, [activeSegmentId]);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return undefined;
    }

    const routeAbortController = new AbortController();
    const layerStore = mapLayersRef.current;
    const map = L.map(mapContainerRef.current, {
      center: [28.35, 84.2],
      zoom: 7,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    map.createPane("routeSegmentsPane");
    map.getPane("routeSegmentsPane").style.zIndex = "650";

    map.createPane("markerPaneTop");
    map.getPane("markerPaneTop").style.zIndex = "680";

    L.control.zoom({ position: "topright" }).addTo(map);

    segmentsWithCoordinates.forEach((segment) => {
      const isCurvyForced =
        segment.id === "jomsom-kagbeni" ||
        segment.id === "ghami-tsarang" ||
        (segment.from === "jomsom" && segment.to === "kagbeni");
      const fallbackCoordinates = segment.coordinates;
      const fallbackLatLngCoordinates = fallbackCoordinates.map(([lng, lat]) => [
        lat,
        lng,
      ]);
      const segmentLayer = L.polyline(fallbackLatLngCoordinates, {
        ...(segment.id === activeSegmentRef.current
          ? activeSegmentStyle
          : defaultSegmentStyle),
        smoothFactor: 1.5,
        pane: "routeSegmentsPane",
      }).addTo(map);

      segmentLayer.bringToFront();

      segmentLayer.on("click", () => {
        map.closePopup();
        onSegmentSelect(segment.id);
      });
      segmentLayer.on("mouseover", () => {
        map.getContainer().style.cursor = "pointer";
        if (segment.id !== activeSegmentRef.current) {
          segmentLayer.setStyle(hoverSegmentStyle);
        }
      });
      segmentLayer.on("mouseout", () => {
        map.getContainer().style.cursor = "";
        if (segment.id !== activeSegmentRef.current) {
          segmentLayer.setStyle(defaultSegmentStyle);
        }
      });

      layerStore.segments[segment.id] = segmentLayer;

      const attemptRoute = async () => {
        if (isCurvyForced) {
          const roadCoordinates = createCurvyFallbackCoordinates(
            fallbackCoordinates[0],
            fallbackCoordinates[1],
          );

          if (!map.hasLayer(segmentLayer)) return;
          const roadLatLngCoordinates = roadCoordinates.map(([lng, lat]) => [lat, lng]);
          segmentLayer.setLatLngs(roadLatLngCoordinates);
          segmentLayer.bringToFront();
          return;
        }

        let roadCoordinates = await fetchRoadGeometry(
          fallbackCoordinates[0],
          fallbackCoordinates[1],
          routeAbortController.signal,
        );

        // If no direct route, try routing to nearby waypoints along the destination
        if (!roadCoordinates) {
          // Try nearest location to destination (single-leg)
          const nearestLocation = findNearestLocation(
            fallbackCoordinates[1],
            locations,
            [
              locations.find((location) => location.slug === segment.from),
              locations.find((location) => location.slug === segment.to),
            ],
          );
          if (nearestLocation && nearestLocation.coordinates) {
            roadCoordinates = await fetchRoadGeometry(
              fallbackCoordinates[0],
              nearestLocation.coordinates,
              routeAbortController.signal,
            );
          }
        }

        // If still no route, attempt two-leg routing via nearby intermediate locations.
        // Try up to `k` nearest candidate intermediates (excluding segment endpoints).
        if (!roadCoordinates && locations.length > 0) {
          const fromCoord = fallbackCoordinates[0];
          const toCoord = fallbackCoordinates[1];
          const k = 3;
          const excluded = new Set([
            segment.from,
            segment.to,
          ]);

          const candidates = locations
            .filter((loc) => !excluded.has(loc.slug) && loc.coordinates)
            .map((loc) => ({
              loc,
              d: haversineDistanceKm(toCoord, loc.coordinates),
            }))
            .sort((a, b) => a.d - b.d)
            .slice(0, k)
            .map((x) => x.loc);

          for (let i = 0; i < candidates.length && !roadCoordinates; i += 1) {
            const candidate = candidates[i];
            try {
              const leg1 = await fetchRoadGeometry(fromCoord, candidate.coordinates, routeAbortController.signal);
              const leg2 = await fetchRoadGeometry(candidate.coordinates, toCoord, routeAbortController.signal);
              if (leg1 && leg1.length && leg2 && leg2.length) {
                // Combine legs, avoiding duplicate candidate point
                const combined = [...leg1];
                if (combined.length && leg2.length) {
                  const last = combined[combined.length - 1];
                  const firstOfLeg2 = leg2[0];
                  if (last[0] === firstOfLeg2[0] && last[1] === firstOfLeg2[1]) {
                    combined.push(...leg2.slice(1));
                  } else {
                    combined.push(...leg2);
                  }
                }
                roadCoordinates = combined;
                break;
              }
            } catch (e) {
              // ignore and try next candidate
            }
          }
        }

        if (!roadCoordinates) {
          roadCoordinates = createCurvyFallbackCoordinates(
            fallbackCoordinates[0],
            fallbackCoordinates[1],
          );
        }

        if (!map.hasLayer(segmentLayer)) {
          return;
        }

        const roadLatLngCoordinates = roadCoordinates.map(([lng, lat]) => [
          lat,
          lng,
        ]);
        segmentLayer.setLatLngs(roadLatLngCoordinates);
        segmentLayer.bringToFront();
      };

      attemptRoute().catch(() => {
        // Keep straight fallback when routing is unavailable or aborted.
      });
    });

    layerStore.markers = locations.map((location, index) => {
      const markerIcon = L.divIcon({
        className: "custom-marker-wrapper",
        html: `<span class="map-pin map-pin-enter" style="--pin-delay:${index * 130}ms"><span class="map-pin-core"></span></span>`,
        iconSize: [24, 32],
        iconAnchor: [12, 30],
      });

      const [lng, lat] = location.coordinates;
      const marker = L.marker([lat, lng], {
        icon: markerIcon,
        title: location.name,
        pane: "markerPaneTop",
      }).addTo(map);

      const popupHtml = `
        <button class="marker-popup-card" type="button" data-slug="${location.slug}">
          <img src="${location.image}" alt="${location.name}" />
          <div>
            <h4>${location.name}</h4>
            <p class="popup-date">${location.programDates ?? "Program date TBA"}</p>
            <p>${location.elevation} • ${location.temperatureRange}</p>
            <p class="popup-focus">${(location.keyVisits ?? []).slice(0, 1).join(" ")}</p>
            <p class="popup-watch">Watch for: ${(location.lookFor ?? []).slice(0, 1).join(" ")}</p>
            <span>Open location dossier</span>
          </div>
        </button>
      `;

      marker.bindPopup(popupHtml, {
        className: "location-popup",
        closeButton: false,
        offset: [0, -24],
        minWidth: 240,
      });

      marker.on("popupopen", (event) => {
        onLocationSelect(location.slug);
        const popupElement = event.popup.getElement();
        const cardButton = popupElement?.querySelector(".marker-popup-card");
        if (!cardButton) {
          return;
        }

        cardButton.addEventListener("click", () => {
          router.push(`/location/${location.slug}`);
        });
      });

      return marker;
    });

    const routeBounds = L.latLngBounds(
      locations.map((location) => [location.coordinates[1], location.coordinates[0]]),
    );
    map.fitBounds(routeBounds, { padding: [40, 40] });

    return () => {
      routeAbortController.abort();
      layerStore.markers.forEach((marker) => marker.remove());
      layerStore.markers = [];
      layerStore.segments = {};
      map.remove();
    };
  }, [locations, onLocationSelect, onSegmentSelect, router, segmentsWithCoordinates]);

  useEffect(() => {
    const segments = mapLayersRef.current.segments;
    Object.entries(segments).forEach(([segmentId, layer]) => {
      if (segmentId === activeSegmentId) {
        layer.setStyle(activeSegmentStyle);
      } else {
        layer.setStyle(defaultSegmentStyle);
      }
    });
  }, [activeSegmentId, segmentsWithCoordinates]);

  return <div className="route-map" ref={mapContainerRef} aria-label="Nepal expedition route map" />;
}
