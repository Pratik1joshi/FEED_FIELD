import Link from "next/link";

export default function LocationCards({ locations }) {
  return (
    <section className="locations-section">
      <div className="section-head">
        <h2>Field Locations</h2>
        <p>
          Each location card links to expedition documents, route briefings, and
          field notes.
        </p>
      </div>

      <div className="location-grid">
        {locations.map((location) => (
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
    </section>
  );
}
