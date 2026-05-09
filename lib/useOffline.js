"use client";

import { useEffect, useState, useCallback } from "react";

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, mounted };
}

export function useServiceWorkerRegistration() {
  const [registration, setRegistration] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        setRegistration(reg);
        console.log("Service Worker registered successfully");

        // Check for updates periodically
        const interval = setInterval(() => {
          reg.update();
        }, 60000); // Check every minute

        return () => clearInterval(interval);
      })
      .catch((err) => {
        setError(err);
        console.error("Service Worker registration failed:", err);
      });
  }, []);

  return { registration, error };
}

export function useUpdateAvailable() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleControllerChange = () => {
      setUpdateAvailable(true);
    };

    navigator.serviceWorker
      .ready
      .then((reg) => {
        setRegistration(reg);
        reg.addEventListener("controllerchange", handleControllerChange);

        // Check for updates when the page becomes visible
        const handleVisibilityChange = () => {
          if (!document.hidden) {
            reg.update();
          }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
          reg.removeEventListener("controllerchange", handleControllerChange);
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange
          );
        };
      });
  }, []);

  const skipWaiting = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  }, [registration]);

  return { updateAvailable, skipWaiting };
}
