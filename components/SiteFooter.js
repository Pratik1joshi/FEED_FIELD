"use client";

import { useState } from "react";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";
import { useAppState } from "@/app/providers/AppStateProvider";

export default function SiteFooter() {
  const { isAuthenticated, user, isLoading } = useAppState();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <footer className="site-footer surface-card">
        <div className="site-footer-copy">
          <p>This was developed by IHRR (Institute of Himalayan Risk Reduction)</p>
          <p>
            Itinerary PDFs can be replaced with the latest upload, and the frontend
            will show the newest version first.
          </p>
        </div>

        <div className="site-footer-actions">
          <button
            className="footer-admin-button"
            type="button"
            onClick={() => setAuthOpen(true)}
          >
            {isLoading
              ? "Checking session..."
              : isAuthenticated && user
                ? user.email
                : "Admin Login"}
          </button>
          <Link className="footer-admin-link" href="/admin">
            Admin panel
          </Link>
        </div>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
