"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistry() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return undefined;
    }

    const expectedAppUrl = process.env.NEXT_PUBLIC_APP_URL
      ? String(process.env.NEXT_PUBLIC_APP_URL).replace(/\/+$/, "")
      : window.location.origin;

    // Only register if current origin matches the expected app URL to avoid
    // picking up precache manifests from other deployments that cause 404s.
    if (window.location.origin !== expectedAppUrl) {
      // Unregister any existing service workers scoped to this origin to avoid
      // stale precache behavior when the site is served from another domain.
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => {
          r.unregister().then((ok) => {
            if (ok) {
              console.log("Unregistered service worker due to origin mismatch.");
            }
          });
        });
      });

      return undefined;
    }

    let intervalId = null;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("✓ Service Worker registered successfully");

        intervalId = window.setInterval(() => {
          try {
            void registration.update();
          } catch (error) {
            if (error?.name !== "InvalidStateError") {
              console.log("Service Worker update failed:", error);
            }
          }
        }, 60000);
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });

    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  return null;
}
