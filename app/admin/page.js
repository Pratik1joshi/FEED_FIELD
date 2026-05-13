"use client";

import Link from "next/link";
import UploadPanel from "@/components/UploadPanel";
import { useAppState } from "@/app/providers/AppStateProvider";

export default function AdminPage() {
  const { isAuthenticated, user, uploadedDocuments, isLoading } = useAppState();

  return (
    <div className="admin-shell">
      <section className="admin-hero surface-card">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Document Control</h1>
          <p>
            Upload PDFs to Supabase, replace the latest itinerary, and keep the field
            views aligned with the newest source files.
          </p>
          {isLoading ? <p className="admin-loading-text">Checking your admin session...</p> : null}
        </div>

        <div className="admin-hero-actions">
          {isAuthenticated && user ? (
            <span className="admin-auth-pill">Logged in • {user.email}</span>
          ) : (
            <span className="admin-auth-pill">Not logged in</span>
          )}
          <Link className="footer-admin-link" href="/field-documents">
            Back to documents
          </Link>
        </div>
      </section>

      {!isAuthenticated ? (
        <section className="admin-notice surface-card">
          <p className="eyebrow">Access required</p>
          <h2>Sign in to upload</h2>
          <p>Use the footer admin login to sign in with your Supabase account.</p>
        </section>
      ) : (
        <div className="admin-grid">
          <UploadPanel />

          <section className="admin-summary surface-card">
            <h2>Latest uploads</h2>
            {uploadedDocuments.length ? (
              <ul className="admin-upload-list">
                {uploadedDocuments.slice(0, 8).map((document) => (
                  <li key={document.id}>
                    <strong>{document.title}</strong>
                    <span>
                      {document.locationSlug} • {document.format.toUpperCase()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No uploads saved yet.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}