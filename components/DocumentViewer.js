"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import mammoth from "mammoth";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

function dataUrlToArrayBuffer(dataUrl) {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binaryString = window.atob(base64);
  const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
  return bytes.buffer;
}

const DocumentViewer = forwardRef(function DocumentViewer(
  { documentEntry },
  ref,
) {
  const [numPages, setNumPages] = useState(0);
  const [docxHtml, setDocxHtml] = useState("");
  const [docxError, setDocxError] = useState("");
  const pageRefs = useRef({});
  const wrapperRef = useRef(null);

  const isPdf = documentEntry?.format === "pdf";
  const isDocx = documentEntry?.format === "docx";

  const pdfSource = useMemo(() => {
    if (!documentEntry || !isPdf) {
      return null;
    }

    if (documentEntry.fileData) {
      return documentEntry.fileData;
    }

    return documentEntry.url;
  }, [documentEntry, isPdf]);

  useEffect(() => {
    if (!documentEntry || !isDocx) {
      setDocxHtml("");
      setDocxError("");
      return;
    }

    async function convertDocxToHtml() {
      try {
        setDocxError("");
        const arrayBuffer = documentEntry.fileData
          ? dataUrlToArrayBuffer(documentEntry.fileData)
          : await fetch(documentEntry.url).then((response) =>
              response.arrayBuffer(),
            );

        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocxHtml(result.value);
      } catch {
        setDocxError("Unable to render DOCX content.");
      }
    }

    convertDocxToHtml();
  }, [documentEntry, isDocx]);

  useImperativeHandle(ref, () => ({
    scrollToPage(pageNumber) {
      if (isPdf && pageRefs.current[pageNumber]) {
        pageRefs.current[pageNumber].scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }

      if (wrapperRef.current) {
        wrapperRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
  }));

  if (!documentEntry) {
    return (
      <div className="doc-viewer-empty surface-card">
        Select a document from the sidebar to start reading.
      </div>
    );
  }

  return (
    <section className="document-viewer surface-card" ref={wrapperRef}>
      <header className="document-viewer-head">
        <h3>{documentEntry.title}</h3>
        <span>{documentEntry.format.toUpperCase()}</span>
      </header>

      {isPdf ? (
        <Document
          file={pdfSource}
          loading={<p>Loading PDF pages...</p>}
          onLoadSuccess={({ numPages: totalPages }) => setNumPages(totalPages)}
        >
          <div className="pdf-page-stack">
            {Array.from({ length: numPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <div
                  className="pdf-page-wrap"
                  key={pageNumber}
                  ref={(node) => {
                    pageRefs.current[pageNumber] = node;
                  }}
                >
                  <Page pageNumber={pageNumber} width={920} renderTextLayer />
                  <small>Page {pageNumber}</small>
                </div>
              );
            })}
          </div>
        </Document>
      ) : null}

      {isDocx ? (
        <article className="docx-rendered-content">
          {docxError ? (
            <p>{docxError}</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
          )}
        </article>
      ) : null}
    </section>
  );
});

export default DocumentViewer;
