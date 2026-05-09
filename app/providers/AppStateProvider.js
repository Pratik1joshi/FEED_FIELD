"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppStateContext = createContext(null);

const STORAGE_KEYS = {
  isAuthenticated: "field-platform-auth",
  uploadedDocuments: "field-platform-uploaded-documents",
  notesByLocation: "field-platform-notes-by-location",
};

function safeReadJson(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AppStateProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    safeReadJson(STORAGE_KEYS.isAuthenticated, false),
  );
  const [uploadedDocuments, setUploadedDocuments] = useState(() =>
    safeReadJson(STORAGE_KEYS.uploadedDocuments, []),
  );
  const [notesByLocation, setNotesByLocation] = useState(() =>
    safeReadJson(STORAGE_KEYS.notesByLocation, {}),
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Ignore registration errors to avoid blocking the app.
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEYS.isAuthenticated,
      JSON.stringify(isAuthenticated),
    );
  }, [isAuthenticated]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEYS.uploadedDocuments,
      JSON.stringify(uploadedDocuments),
    );
  }, [uploadedDocuments]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEYS.notesByLocation,
      JSON.stringify(notesByLocation),
    );
  }, [notesByLocation]);

  function toggleAuth() {
    setIsAuthenticated((prev) => !prev);
  }

  function addUploadedDocument(document) {
    setUploadedDocuments((prev) => [
      {
        ...document,
        id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      },
      ...prev,
    ]);
  }

  function addNote(locationSlug, note) {
    setNotesByLocation((prev) => {
      const notesForLocation = prev[locationSlug] ?? [];
      return {
        ...prev,
        [locationSlug]: [
          {
            ...note,
            id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt: new Date().toISOString(),
          },
          ...notesForLocation,
        ],
      };
    });
  }

  const value = useMemo(
    () => ({
      isAuthenticated,
      uploadedDocuments,
      notesByLocation,
      toggleAuth,
      addUploadedDocument,
      addNote,
    }),
    [isAuthenticated, uploadedDocuments, notesByLocation],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return context;
}
