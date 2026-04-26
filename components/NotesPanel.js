"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/app/providers/AppStateProvider";

export default function NotesPanel({ locationSlug, onJumpToPage }) {
  const { notesByLocation, addNote } = useAppState();
  const [noteText, setNoteText] = useState("");
  const [pageNumber, setPageNumber] = useState("");

  const notes = useMemo(
    () => notesByLocation[locationSlug] ?? [],
    [locationSlug, notesByLocation],
  );

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedText = noteText.trim();
    if (!trimmedText) {
      return;
    }

    const parsedPageNumber = Number(pageNumber);

    addNote(locationSlug, {
      text: trimmedText,
      pageNumber:
        Number.isNaN(parsedPageNumber) || parsedPageNumber <= 0
          ? null
          : parsedPageNumber,
    });

    setNoteText("");
    setPageNumber("");
  }

  return (
    <aside className="notes-panel surface-card">
      <h3>Field Notes</h3>
      <form className="note-form" onSubmit={handleSubmit}>
        <textarea
          placeholder="Add an observation, data point, or question..."
          value={noteText}
          onChange={(event) => setNoteText(event.target.value)}
          rows={4}
        />
        <input
          type="number"
          min="1"
          placeholder="Optional page #"
          value={pageNumber}
          onChange={(event) => setPageNumber(event.target.value)}
        />
        <button type="submit">Save note</button>
      </form>

      <ul className="note-list">
        {notes.length ? (
          notes.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                className="note-item"
                onClick={() => onJumpToPage(note.pageNumber)}
              >
                <p>{note.text}</p>
                <small>
                  {note.pageNumber
                    ? `Page ${note.pageNumber}`
                    : "No page anchor"}
                </small>
              </button>
            </li>
          ))
        ) : (
          <li>
            <p className="note-empty">No notes yet for this location.</p>
          </li>
        )}
      </ul>
    </aside>
  );
}
