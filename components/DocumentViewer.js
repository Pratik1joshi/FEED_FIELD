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
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

function dataUrlToArrayBuffer(dataUrl) {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binaryString = window.atob(base64);
  const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
  return bytes.buffer;
}

function getPdfDownloadName(documentEntry) {
  const rawName =
    documentEntry?.fileName ||
    (typeof documentEntry?.url === "string"
      ? documentEntry.url.split("/").pop()
      : "") ||
    documentEntry?.title ||
    "document";
  const trimmedName = String(rawName).trim() || "document";
  const withoutQuery = trimmedName.split("?")[0].split("#")[0];
  const safeName =
    withoutQuery.replace(/[\\/:*?"<>|]+/g, "").trim() || "document";
  return safeName.toLowerCase().endsWith(".pdf")
    ? safeName
    : `${safeName}.pdf`;
}

const DocumentViewer = forwardRef(function DocumentViewer(
  { documentEntry },
  ref,
) {
  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
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

  const pdfDownloadName = useMemo(() => {
    if (!documentEntry || !isPdf) {
      return "";
    }

    return getPdfDownloadName(documentEntry);
  }, [documentEntry, isPdf]);

  const showPdfDownload = Boolean(isPdf && pdfSource);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return undefined;
    }

    const updateWidth = () => {
      const nextWidth = Math.floor(wrapper.clientWidth - 32);
      setPageWidth(Math.max(280, Math.min(920, nextWidth)));
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

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
        <div className="document-viewer-actions">
          <span>{documentEntry.format.toUpperCase()}</span>
          {showPdfDownload ? (
            <a
              className="document-download"
              href={pdfSource}
              download={pdfDownloadName}
            >
              Download PDF
            </a>
          ) : null}
        </div>
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
                  <Page
                    pageNumber={pageNumber}
                    width={pageWidth || 920}
                    renderTextLayer
                  />
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
