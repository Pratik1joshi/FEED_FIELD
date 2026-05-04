"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export default function LocationCards({ locations }) {
  const [activeRegion, setActiveRegion] = useState("Lower Mustang");

  const coreLocations = useMemo(
    () => locations.filter((location) => !location.region),
    [locations],
  );

  const lowerMustangLocations = useMemo(
    () =>
      locations.filter((location) => location.region === "Lower Mustang"),
    [locations],
  );

  const upperMustangLocations = useMemo(
    () =>
      locations.filter((location) => location.region === "Upper Mustang"),
    [locations],
  );

  return (
    <section className="locations-section">
      <div className="section-head">
        <h2>Field Locations</h2>
        <p>
          Each location card links to expedition documents, route briefings, and
          field notes.
        </p>
      </div>

      {coreLocations.length ? (
        <div className="location-group">
          <div className="section-head section-head-sm">
            <h3>Base Route</h3>
            <p>Kathmandu, Chitwan, and Pokhara.</p>
          </div>

          <div className="location-grid">
            {coreLocations.map((location) => (
              <Link
                key={location.slug}
                href={`/location/${location.slug}`}
                className="location-card surface-card"
              >
                <div
                  className="location-image"
                  role="img"
                  aria-label={location.name}
                  style={{ backgroundImage: `url(${location.image})` }}
                />
                <div className="location-card-body">
                  <h3>{location.name}</h3>
                  <div className="meta-row">
                    <span>{location.elevation}</span>
                    <span>{location.temperatureRange}</span>
                  </div>
                  <p>{location.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="location-group">
        <div className="section-head section-head-sm">
          <h3>Mustang Regions</h3>
          <p>Press Lower or Upper to switch between the two regional blocks.</p>
        </div>

        <div className="region-switcher" aria-label="Mustang regions">
          <button
            type="button"
            className={`region-switcher-button ${activeRegion === "Lower Mustang" ? "active" : ""}`}
            onClick={() => setActiveRegion("Lower Mustang")}
            aria-pressed={activeRegion === "Lower Mustang"}
          >
            Lower Mustang
          </button>
          <button
            type="button"
            className={`region-switcher-button ${activeRegion === "Upper Mustang" ? "active" : ""}`}
            onClick={() => setActiveRegion("Upper Mustang")}
            aria-pressed={activeRegion === "Upper Mustang"}
          >
            Upper Mustang
          </button>
        </div>

        <div className="region-blocks">
          <article
            className={`region-block ${activeRegion === "Lower Mustang" ? "active" : ""}`}
            aria-hidden={activeRegion !== "Lower Mustang"}
          >
            <div className="region-block-head">
              <p className="eyebrow">Lower Mustang</p>
              <h4>Marpha, Jomsom, and Kagbeni</h4>
            </div>
            <div className="location-grid">
              {lowerMustangLocations.map((location) => (
                <Link
                  key={location.slug}
                  href={`/location/${location.slug}`}
                  className="location-card surface-card"
                >
                  <div
                    className="location-image"
                    role="img"
                    aria-label={location.name}
                    style={{ backgroundImage: `url(${location.image})` }}
                  />
                  <div className="location-card-body">
                    <h3>{location.name}</h3>
                    <div className="meta-row">
                      <span>{location.elevation}</span>
                      <span>{location.temperatureRange}</span>
                    </div>
                    <p>{location.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article
            className={`region-block ${activeRegion === "Upper Mustang" ? "active" : ""}`}
            aria-hidden={activeRegion !== "Upper Mustang"}
          >
            <div className="region-block-head">
              <p className="eyebrow">Upper Mustang</p>
              <h4>Ghami, Tsarang, and Lo Manthang</h4>
            </div>
            <div className="location-grid">
              {upperMustangLocations.map((location) => (
                <Link
                  key={location.slug}
                  href={`/location/${location.slug}`}
                  className="location-card surface-card"
                >
                  <div
                    className="location-image"
                    role="img"
                    aria-label={location.name}
                    style={{ backgroundImage: `url(${location.image})` }}
                  />
                  <div className="location-card-body">
                    <h3>{location.name}</h3>
                    <div className="meta-row">
                      <span>{location.elevation}</span>
                      <span>{location.temperatureRange}</span>
                    </div>
                    <p>{location.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
