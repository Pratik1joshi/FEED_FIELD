"use client";

import { useState } from "react";
import { useAppState } from "@/app/providers/AppStateProvider";
import { locations } from "@/lib/expedition-data";
import { getPublicUrl, insertDocumentRecord, uploadFileToBucket } from "@/lib/supabase";

const validTags = [
  "itinerary",
  "prospectus",
  "route briefing",
  "general document",
];

export default function UploadPanel({ selectedLocationSlug }) {
  const { isAuthenticated, user, addUploadedDocument } = useAppState();
  const [file, setFile] = useState(null);
  const [locationSlug, setLocationSlug] = useState(
    selectedLocationSlug ?? locations[0]?.slug ?? "",
  );
  const [tag, setTag] = useState("general document");
  const [title, setTitle] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isAuthenticated || !user) {
      setStatusMessage("You must be logged in as a researcher to upload.");
      return;
    }

    if (!file) {
      setStatusMessage("Select a PDF or DOCX file first.");
      return;
    }

    const normalizedName = file.name.toLowerCase();
    const format = normalizedName.endsWith(".pdf")
      ? "pdf"
      : normalizedName.endsWith(".docx")
        ? "docx"
        : null;

    if (!format) {
      setStatusMessage("Only PDF and DOCX files are supported.");
      return;
    }

    if (tag === "itinerary" && format !== "pdf") {
      setStatusMessage("Itinerary uploads must be PDFs.");
      return;
    }

    setIsUploading(true);
    setStatusMessage("Uploading to Supabase...");

    try {
      // Create a unique file path
      const timestamp = Date.now();
      const fileName = `${user.id}/${locationSlug}/${tag}/${timestamp}_${file.name}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await uploadFileToBucket(
        "documents",
        fileName,
        file,
        file.type,
      );

      if (uploadError) {
        setStatusMessage(`Upload failed: ${uploadError.message}`);
        setIsUploading(false);
        return;
      }

      // Get public URL
      const fileUrl = await getPublicUrl("documents", fileName);

      setStatusMessage("Saving document metadata...");

      const documentRecord = {
        user_id: user.id,
        title: title.trim() || file.name,
        location_slug: locationSlug,
        document_type: tag,
        format,
        file_path: fileName,
        file_url: fileUrl,
        uploaded_at: new Date().toISOString(),
      };

      const { data: insertedDocument, error: insertError } =
        await insertDocumentRecord(documentRecord);

      if (insertError) {
        setStatusMessage(
          `Upload succeeded, but saving metadata failed: ${insertError.message}`,
        );
        setIsUploading(false);
        return;
      }

      const fileNameFromPath =
        fileName.split("/").pop() || file.name || "document";
      const nextDocument = {
        id: insertedDocument?.id,
        title: insertedDocument?.title ?? documentRecord.title,
        locationSlug: insertedDocument?.location_slug ?? locationSlug,
        type: insertedDocument?.document_type ?? tag,
        format: insertedDocument?.format ?? format,
        filePath: insertedDocument?.file_path ?? fileName,
        fileName: fileNameFromPath,
        url: insertedDocument?.file_url ?? fileUrl,
        uploadedAt: insertedDocument?.uploaded_at ?? documentRecord.uploaded_at,
        userId: insertedDocument?.user_id ?? user.id,
      };

      // Add to app state
      addUploadedDocument(nextDocument);

      setStatusMessage("✓ Upload complete and linked to location documents.");
      setFile(null);
      setTitle("");
      setIsUploading(false);
    } catch (error) {
      setStatusMessage(`Upload failed: ${error.message}`);
      setIsUploading(false);
    }
  }

  return (
    <section className="upload-panel surface-card">
      <h3>Upload Document</h3>
      <p>Authenticated researchers can add source files to Supabase Storage.</p>

      <form onSubmit={handleSubmit} className="upload-form">
        <input
          value={title}
          placeholder="Document title"
          onChange={(event) => setTitle(event.target.value)}
          disabled={isUploading}
        />

        <select
          value={locationSlug}
          onChange={(event) => setLocationSlug(event.target.value)}
          disabled={isUploading}
        >
          {locations.map((location) => (
            <option key={location.slug} value={location.slug}>
              {location.name}
            </option>
          ))}
        </select>

        <select
          value={tag}
          onChange={(event) => setTag(event.target.value)}
          disabled={isUploading}
        >
          {validTags.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          disabled={isUploading}
        />

        <button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {statusMessage ? <p className="upload-status">{statusMessage}</p> : null}
      {!isAuthenticated ? (
        <p className="upload-hint">
          Use the footer admin login to sign in with your Supabase account.
        </p>
      ) : null}
    </section>
  );
}
