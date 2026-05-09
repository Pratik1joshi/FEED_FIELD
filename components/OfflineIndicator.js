"use client";

import { useEffect, useState } from "react";

export default function OfflineIndicator() {
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

  if (!mounted || isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-400 px-4 py-2 z-50">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        <div className="flex-shrink-0 w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
        <p className="text-sm text-yellow-800 font-medium">
          You're offline. Some features may be limited. Cached content is available.
        </p>
      </div>
    </div>
  );
}
