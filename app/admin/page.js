"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UploadPanel from "@/components/UploadPanel";
import AuthModal from "@/components/AuthModal";
import { useAppState } from "@/app/providers/AppStateProvider";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const { isAuthenticated, user, uploadedDocuments, isLoading } = useAppState();
  const [authOpen, setAuthOpen] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session) {
          const expiresAt = session.expires_at; // seconds since epoch
          if (typeof expiresAt === "number" && Date.now() / 1000 >= expiresAt) {
            setSessionExpired(true);
            setAuthOpen(true);
          }
        } else {
          // No session — treat as expired only for admin page access
          setSessionExpired(true);
          setAuthOpen(true);
        }
      } catch (err) {
        // On error, open the login modal so the user can re-authenticate
        if (mounted) {
          setSessionExpired(true);
          setAuthOpen(true);
        }
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="admin-shell">
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <section className="admin-hero surface-card">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Document Control</h1>
          <p>
            Upload PDFs to Supabase, replace the latest itinerary, and keep the field
            views aligned with the newest source files.
          </p>
          {isLoading ? <p className="admin-loading-text">Checking your admin session...</p> : null}
          {sessionExpired ? (
            <p className="admin-notice" style={{ marginTop: '0.75rem' }}>
              Your session has expired or you are not signed in — please sign in to access admin features.
            </p>
          ) : null}
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