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

async function fetchRoadGeometry(fromCoordinate, toCoordinate, signal) {
  const [fromLng, fromLat] = fromCoordinate;
  const [toLng, toLat] = toCoordinate;

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${fromLng},${fromLat};${toLng},${toLat}` +
    `?overview=full&alternatives=false&steps=false&geometries=geojson`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const routeCoordinates = payload?.routes?.[0]?.geometry?.coordinates;
  if (!routeCoordinates?.length) {
    return null;
  }

  if (!isWithinNepalBounds(routeCoordinates)) {
    return null;
  }

  const straightDistance = haversineDistanceKm(fromCoordinate, toCoordinate);
  const routeDistance = polylineDistanceKm(routeCoordinates);

  if (straightDistance > 0 && routeDistance > straightDistance * 3.2) {
    return null;
  }

  return routeCoordinates;
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

      fetchRoadGeometry(
        fallbackCoordinates[0],
        fallbackCoordinates[1],
        routeAbortController.signal,
      )
        .then((roadCoordinates) => {
          if (!roadCoordinates || !map.hasLayer(segmentLayer)) {
            return;
          }

          const roadLatLngCoordinates = roadCoordinates.map(([lng, lat]) => [
            lat,
            lng,
          ]);
          segmentLayer.setLatLngs(roadLatLngCoordinates);
          segmentLayer.bringToFront();
        })
        .catch(() => {
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
