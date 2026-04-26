import { notFound } from "next/navigation";
import LocationWorkspace from "@/components/LocationWorkspace";
import {
  getLocationBySlug,
  locationDocuments,
  locations,
} from "@/lib/expedition-data";

export function generateStaticParams() {
  return locations.map((location) => ({ slug: location.slug }));
}

export default async function LocationPage({ params }) {
  const resolvedParams = await params;
  const location = getLocationBySlug(resolvedParams.slug);

  if (!location) {
    notFound();
  }

  const defaultDocuments = locationDocuments[location.slug] ?? [];

  return (
    <div className="location-page-shell">
      <LocationWorkspace location={location} defaultDocuments={defaultDocuments} />
    </div>
  );
}
