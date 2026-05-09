"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistry() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✓ Service Worker registered successfully");

          // Check for updates every minute
          const interval = setInterval(() => {
            registration.update();
          }, 60000);

          // Listen for controller changes (new service worker activated)
          let updateAvailable = false;
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                updateAvailable = true;
                console.log("✓ App update available");
              }
            });
          });

          return () => clearInterval(interval);
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
