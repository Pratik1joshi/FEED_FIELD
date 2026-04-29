"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppState } from "@/app/providers/AppStateProvider";

const DocumentViewer = dynamic(() => import("@/components/DocumentViewer"), {
  ssr: false,
  loading: () => (
    <div className="doc-viewer-empty surface-card">Loading document viewer...</div>
  ),
});

const tabOrder = ["prospectus", "route briefing", "documents"];

export default function LocationWorkspace({ location, defaultDocuments }) {
  const viewerRef = useRef(null);
  const { uploadedDocuments } = useAppState();
  const [activeTab, setActiveTab] = useState("prospectus");
  const [selectedDocId, setSelectedDocId] = useState(null);

  const documentsForLocation = useMemo(() => {
    const uploadedForLocation = uploadedDocuments.filter(
      (entry) => entry.locationSlug === location.slug,
    );
    return [...defaultDocuments, ...uploadedForLocation];
  }, [defaultDocuments, location.slug, uploadedDocuments]);

  const documentsByTab = useMemo(
    () => ({
      prospectus: documentsForLocation.filter(
        (entry) => entry.type === "prospectus",
      ),
      "route briefing": documentsForLocation.filter(
        (entry) => entry.type === "route briefing",
      ),
      documents: documentsForLocation.filter(
        (entry) => entry.type === "general document" || !entry.type,
      ),
    }),
    [documentsForLocation],
  );

  const availableTabs = useMemo(() => {
    return tabOrder.filter(
      (tab) => documentsByTab[tab] && documentsByTab[tab].length > 0
    );
  }, [documentsByTab]);

  // Auto-select the first available tab if the current one is empty
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      let timeoutId = setTimeout(() => {
        setActiveTab(availableTabs[0]);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [availableTabs, activeTab]);

  const visibleDocuments = documentsByTab[activeTab] ?? [];
  const activeDocument = 
    visibleDocuments.find(d => d.id === selectedDocId) ?? visibleDocuments[0] ?? null;

  // Reset selected document when tab changes
  useEffect(() => {
    let timeoutId;
    timeoutId = setTimeout(() => {
      setSelectedDocId(null);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [activeTab]);

  return (
    <div className="location-workspace">
      <aside className="location-sidebar surface-card">
        <div className="location-sidebar-head">
          <h1>{location.name}</h1>
          <p>{location.description}</p>
        </div>

        <ul className="location-tabs">
          {availableTabs.length > 0 ? (
            availableTabs.map((tab) => (
              <li key={tab}>
                <button
                  className={`location-tab ${activeTab === tab ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "notes"
                    ? "Notes"
                    : tab
                        .split(" ")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                </button>
              </li>
            ))
          ) : (
            <li>
              <div className="location-tab" style={{ opacity: 0.5 }}>
                No documents
              </div>
            </li>
          )}
        </ul>

      </aside>

      <main className="location-main">
        <>
          <div className="document-list surface-card">
            <h2>
              {activeTab === "documents"
                ? "Documents"
                : activeTab === "prospectus"
                  ? "Prospectus"
                  : "Route Briefing"}
            </h2>
            {visibleDocuments.length ? (
              <ul>
                {visibleDocuments.map((entry) => (
                  <li 
                    key={entry.id}
                    className={activeDocument?.id === entry.id ? "active-doc-item" : ""}
                    onClick={() => setSelectedDocId(entry.id)}
                    style={{ cursor: "pointer", padding: "0.5rem", borderRadius: "4px", backgroundColor: activeDocument?.id === entry.id ? "var(--color-primary-light)" : "transparent" }}
                  >
                    {entry.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No documents available for this tab yet.</p>
            )}
          </div>
          <DocumentViewer documentEntry={activeDocument} ref={viewerRef} />
        </>
      </main>
    </div>
  );
}
