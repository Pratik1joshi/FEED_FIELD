"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchDocumentsForUser,
  signInWithEmail,
  signOut as supabaseSignOut,
  supabase,
} from "@/lib/supabase";

const AppStateContext = createContext(null);

const STORAGE_KEYS = {
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

function isItineraryDocument(document) {
  const title = document?.title?.toLowerCase() ?? "";
  const type = document?.type?.toLowerCase() ?? "";

  return title.includes("itinerary") || type.includes("itinerary");
}

function getFileNameFromPath(filePath, fallback) {
  if (!filePath) {
    return fallback ?? "";
  }

  const parts = String(filePath).split("/");
  return parts[parts.length - 1] || fallback || "";
}

function sanitizeDocumentUrl(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === "{}" || trimmed === "[object Object]") {
    return "";
  }

  return trimmed;
}

function normalizeDocumentRow(row) {
  if (!row) {
    return null;
  }

  const url = sanitizeDocumentUrl(row.file_url);
  const fileNameFallback = url ? url.split("/").pop() : "";
  const fileName =
    getFileNameFromPath(row.file_path, fileNameFallback) ||
    row.title ||
    "document";

  return {
    id: row.id,
    title: row.title,
    locationSlug: row.location_slug,
    type: row.document_type,
    format: row.format,
    filePath: row.file_path,
    fileName,
    url,
    uploadedAt: row.uploaded_at ?? row.created_at ?? null,
    userId: row.user_id,
  };
}

export function AppStateProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [notesByLocation, setNotesByLocation] = useState(() =>
    safeReadJson(STORAGE_KEYS.notesByLocation, {}),
  );
  const [authError, setAuthError] = useState(null);

  // Sync notes to localStorage
  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEYS.notesByLocation,
      JSON.stringify(notesByLocation),
    );
  }, [notesByLocation]);

  // Initialize auth state and listen for changes
  useEffect(() => {
    const initializeAuth = async () => {
      let loadingTimeout = null;

      loadingTimeout = window.setTimeout(() => {
        setIsLoading(false);
      }, 4000);

      try {
        // Check if user is already logged in
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          // Fetch uploaded documents for this user
          await fetchUploadedDocuments(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (loadingTimeout) {
          window.clearTimeout(loadingTimeout);
        }
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await fetchUploadedDocuments(session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUploadedDocuments([]);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function fetchUploadedDocuments(userId) {
    try {
      // Prefer server-side API that uses the service role key to bypass
      // RLS/read issues that occur when client sessions are inconsistent.
      const res = await fetch(`/api/documents?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) {
        console.error("Document API returned error", res.status);
        setUploadedDocuments([]);
        return;
      }

      const payload = await res.json();
      const rows = payload?.data ?? [];
      const normalized = rows.map(normalizeDocumentRow).filter(Boolean);
      setUploadedDocuments(normalized);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }

  async function signIn(email, password) {
    setAuthError(null);
    const { data, error } = await signInWithEmail(email, password);
    if (error) {
      setAuthError(error.message);
      return { error };
    }
    return { data };
  }

  async function signOut() {
    setAuthError(null);
    const { error } = await supabaseSignOut();
    if (error) {
      setAuthError(error.message);
      return { error };
    }
    setUser(null);
    setIsAuthenticated(false);
    setUploadedDocuments([]);
    return { error: null };
  }

  function addUploadedDocument(document) {
    const nextDocument = {
      ...document,
      id:
        document?.id ??
        `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: document?.userId ?? user?.id,
    };

    setUploadedDocuments((prev) => {
      if (!isItineraryDocument(nextDocument)) {
        return [nextDocument, ...prev];
      }

      return [
        nextDocument,
        ...prev.filter(
          (entry) =>
            entry.locationSlug !== nextDocument.locationSlug ||
            !isItineraryDocument(entry),
        ),
      ];
    });
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
      user,
      isAuthenticated,
      isLoading,
      uploadedDocuments,
      notesByLocation,
      authError,
      signIn,
      signOut,
      addUploadedDocument,
      addNote,
    }),
    [isAuthenticated, isLoading, uploadedDocuments, notesByLocation, authError, user],
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
