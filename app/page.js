"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import LocationCards from "@/components/LocationCards";
import {
  getSegmentsWithCoordinates,
  locations,
  routeSegments,
} from "@/lib/expedition-data";

const RouteMap = dynamic(() => import("@/components/RouteMap"), {
  ssr: false,
  loading: () => <div className="route-map surface-card" />,
});

export default function Home() {
  const [activeSegmentId, setActiveSegmentId] = useState(null);

  const activeSegment = useMemo(
    () => routeSegments.find((segment) => segment.id === activeSegmentId),
    [activeSegmentId],
  );

  const segmentsWithCoordinates = useMemo(() => getSegmentsWithCoordinates(), []);
  const handleLocationSelect = useCallback(() => {
    setActiveSegmentId(null);
  }, []);

  return (
    <div className="home-shell">
      {/* <section className="hero surface-card">
        <div className="hero-copy">
          <p className="eyebrow">Route and Climate Overview</p>
          <h1>Northbound Transect Through Nepal</h1>
          <p>
            The route moves from humid lowlands into high-altitude cold-desert
            terrain. Expect sharper winds, thinner air, and faster weather
            changes as you move toward Upper Mustang.
          </p>
        </div>
        <div className="hero-meta">
          <span>9 Locations</span>
          <span>{segmentsWithCoordinates.length} Clickable Segments</span>
          <span>Dates + Key Site Highlights</span>
        </div>
      </section> */}

      <section className="map-region">
        <RouteMap
          locations={locations}
          activeSegmentId={activeSegmentId}
          onSegmentSelect={setActiveSegmentId}
          onLocationSelect={handleLocationSelect}
        />

        {activeSegment ? (
          <aside className="segment-panel surface-card">
            <p className="eyebrow">Route Segment</p>
            <h2>{activeSegment.title}</h2>
            <div className="segment-meta">
              <p>
                <strong>Elevation:</strong> {activeSegment.elevationChange}
              </p>
              <p>
                <strong>Climate:</strong> {activeSegment.climateTransition}
              </p>
              <p>
                <strong>Window:</strong> {activeSegment.itineraryWindow}
              </p>
            </div>
            <ul>
              {activeSegment.visitFocus.slice(0, 1).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <ul>
              {activeSegment.watchFor.slice(0, 1).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        ) : null}
      </section>

      <LocationCards locations={locations} />
    </div>
  );
}
