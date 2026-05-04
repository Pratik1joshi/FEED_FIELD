import Link from "next/link";
import { locationDocuments, locations } from "@/lib/expedition-data";

const sectionOrder = ["Base Route", "Lower Mustang", "Upper Mustang"];

function getSectionLocations(sectionName) {
  if (sectionName === "Base Route") {
    return locations.filter((location) => !location.region);
  }

  return locations.filter((location) => location.region === sectionName);
}

export default function FieldDocumentsPage() {
  const sections = sectionOrder.map((sectionName) => ({
    id:
      sectionName === "Base Route"
        ? "base-route"
        : sectionName.toLowerCase().replace(/\s+/g, "-"),
    name: sectionName,
    locations: getSectionLocations(sectionName),
  }));

  return (
    <div className="field-docs-shell">
      <section className="field-docs-intro surface-card">
        <p className="eyebrow">Field Documents</p>
        <h1>Table of Contents</h1>
        <p>
          Use this menu to jump to each location workspace and open the related
          route briefings, prospectuses, and field notes.
        </p>

        <nav className="field-docs-toc" aria-label="Field document sections">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.name}
            </a>
          ))}
        </nav>
      </section>

      <div className="field-docs-grid">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="field-docs-section surface-card">
            <div className="field-docs-section-head">
              <div>
                <p className="eyebrow">{section.name}</p>
                <h2>{section.name}</h2>
              </div>
              <span>{section.locations.length} locations</span>
            </div>

            <div className="field-docs-location-list">
              {section.locations.map((location) => {
                const documents = locationDocuments[location.slug] ?? [];

                return (
                  <article key={location.slug} className="field-docs-location">
                    <div className="field-docs-location-head">
                      <div>
                        <h3>{location.name}</h3>
                        <p>{location.description}</p>
                      </div>
                      <Link href={`/location/${location.slug}`} className="field-docs-open-link">
                        Open workspace
                      </Link>
                    </div>

                    <div className="field-docs-meta-row">
                      <span>{location.elevation}</span>
                      <span>{location.temperatureRange}</span>
                    </div>

                    <div className="field-docs-docs">
                      <p>Included documents</p>
                      <ul>
                        {documents.map((document) => (
                          <li key={document.id}>{document.title}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
