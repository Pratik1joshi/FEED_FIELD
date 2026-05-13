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
