"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useAppState } from "@/app/providers/AppStateProvider";

const DocumentViewer = dynamic(() => import("@/components/DocumentViewer"), {
  ssr: false,
  loading: () => (
    <div className="doc-viewer-empty surface-card">Loading document viewer...</div>
  ),
});

export default function LocationWorkspace({ location, defaultDocuments }) {
  const viewerRef = useRef(null);
  const { uploadedDocuments } = useAppState();
  const [publicDocuments, setPublicDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);

  function isItineraryDocument(entry) {
    const title = entry.title?.toLowerCase() ?? "";
    const type = entry.type?.toLowerCase() ?? "";

    return title.includes("itinerary") || type.includes("itinerary");
  }

  function documentSortScore(entry) {
    const title = entry.title?.toLowerCase() ?? "";
    const type = entry.type?.toLowerCase() ?? "";

    if (title.includes("itinerary") || type.includes("itinerary")) {
      return 0;
    }

    return 1;
  }

  useEffect(() => {
    let mounted = true;

    async function fetchPublic() {
      try {
        const res = await fetch(`/api/documents`);
        if (!mounted) return;
        if (!res.ok) {
          console.error("Failed to fetch public documents", res.status);
          return;
        }
        const payload = await res.json();
        const rows = payload?.data ?? [];
        if (mounted) setPublicDocuments(rows);
      } catch (err) {
        console.error("Error fetching public documents", err);
      }
    }

    fetchPublic();

    return () => {
      mounted = false;
    };
  }, []);

  const documentsForLocation = useMemo(() => {
    // Combine in-memory uploaded documents (immediate feedback) with public
    // documents stored in the database so all users can view latest uploads.
    const allSources = [
      ...uploadedDocuments,
      ...publicDocuments.map((d) => ({
        id: d.id,
        title: d.title,
        locationSlug: d.location_slug,
        type: d.document_type,
        format: d.format,
        fileName: d.file_path?.split('/')?.pop() ?? d.title,
        url: d.file_url,
        uploadedAt: d.uploaded_at,
        userId: d.user_id,
      })),
    ];

    // Deduplicate by id (uploadedDocuments may already contain the row)
    const dedupMap = new Map();
    for (const entry of allSources) {
      if (!entry || !entry.id) continue;
      if (!dedupMap.has(entry.id)) {
        dedupMap.set(entry.id, entry);
      }
    }

    const combined = Array.from(dedupMap.values());

    const uploadedForLocation = combined.filter(
      (entry) => entry.locationSlug === location.slug,
    );

    const latestUploadedItinerary = uploadedForLocation.find(isItineraryDocument);
    const defaultWithoutItinerary = defaultDocuments.filter(
      (entry) => !isItineraryDocument(entry),
    );
    const uploadedWithoutItinerary = uploadedForLocation.filter(
      (entry) => !isItineraryDocument(entry),
    );

    const mergedDocuments = latestUploadedItinerary
      ? [latestUploadedItinerary, ...defaultWithoutItinerary, ...uploadedWithoutItinerary]
      : [...defaultDocuments, ...uploadedForLocation];

    return mergedDocuments.sort(
      (left, right) => documentSortScore(left) - documentSortScore(right),
    );
  }, [defaultDocuments, location.slug, uploadedDocuments, publicDocuments]);

  const activeDocument =
    documentsForLocation.find((d) => d.id === selectedDocId) ??
    documentsForLocation[0] ??
    null;

  return (
    <div className="location-workspace">
      <aside className="location-sidebar surface-card">
        <div className="location-sidebar-head">
          <h1>{location.name}</h1>
          <p>{location.description}</p>
        </div>

        <div className="location-sidebar-documents">
          <h2>Documents</h2>
          {documentsForLocation.length ? (
            <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {documentsForLocation.map((entry) => (
                <li key={entry.id}>
                  <button
                    className={`location-tab ${activeDocument?.id === entry.id ? "active" : ""}`}
                    type="button"
                    onClick={() => setSelectedDocId(entry.id)}
                  >
                    {entry.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No documents available.</p>
          )}
        </div>

      </aside>

      <main className="location-main">
        <DocumentViewer documentEntry={activeDocument} ref={viewerRef} />
      </main>
    </div>
  );
}
