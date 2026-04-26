"use client";

import { useState } from "react";
import { useAppState } from "@/app/providers/AppStateProvider";
import { locations } from "@/lib/expedition-data";

const validTags = ["prospectus", "route briefing", "general document"];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read file."));

    reader.readAsDataURL(file);
  });
}

export default function UploadPanel({ selectedLocationSlug }) {
  const { isAuthenticated, addUploadedDocument } = useAppState();
  const [file, setFile] = useState(null);
  const [locationSlug, setLocationSlug] = useState(selectedLocationSlug);
  const [tag, setTag] = useState("general document");
  const [title, setTitle] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isAuthenticated) {
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

    try {
      const fileData = await fileToDataUrl(file);

      addUploadedDocument({
        title: title.trim() || file.name,
        locationSlug,
        type: tag,
        format,
        fileName: file.name,
        fileData,
      });

      setStatusMessage("Upload saved and linked to location documents.");
      setFile(null);
      setTitle("");
    } catch {
      setStatusMessage("Upload failed. Try again.");
    }
  }

  return (
    <section className="upload-panel surface-card">
      <h3>Upload Document</h3>
      <p>Authenticated researchers can add source files to any location.</p>

      <form onSubmit={handleSubmit} className="upload-form">
        <input
          value={title}
          placeholder="Document title"
          onChange={(event) => setTitle(event.target.value)}
        />

        <select
          value={locationSlug}
          onChange={(event) => setLocationSlug(event.target.value)}
        >
          {locations.map((location) => (
            <option key={location.slug} value={location.slug}>
              {location.name}
            </option>
          ))}
        </select>

        <select value={tag} onChange={(event) => setTag(event.target.value)}>
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
        />

        <button type="submit">Upload</button>
      </form>

      {statusMessage ? <p className="upload-status">{statusMessage}</p> : null}
      {!isAuthenticated ? (
        <p className="upload-hint">
          Use the navbar login toggle to simulate authenticated upload access.
        </p>
      ) : null}
    </section>
  );
}
