import React, { useState, useEffect, useRef } from "react";

// ─── CSV generator ────────────────────────────────────────────────────────────
function generateCSV(projectData) {
  const rows      = projectData?.rooms      ?? [];
  const specDetail = projectData?.specDetail ?? {};

  const headers = [
    "Room #",
    "Room Name",
    "Floor Finish",
    "Base Type",
    "Area (sf)",
    "Base (lf)",
    "CSI Section",
    "Spec Title",
  ];

  const lines = rows.map((r) => {
    const spec = specDetail[r.finishCode] ?? {};
    return [
      r.id,
      r.name,
      r.finishCode,
      r.baseType,
      r.sf,
      r.lf,
      spec.csi   ?? "",
      spec.title ?? "",
    ]
      .map((val) => `"${String(val).replace(/"/g, '""')}"`)
      .join(",");
  });

  return [headers.join(","), ...lines].join("\n");
}

// ─── JSON generator ───────────────────────────────────────────────────────────
function generateJSON(projectData) {
  return JSON.stringify(
    {
      projectId:     projectData?.projectId   ?? "",
      projectName:   projectData?.projectName ?? "",
      bidNumber:     projectData?.bidNumber   ?? "",
      exportedAt:    new Date().toISOString(),
      summary: {
        totalSF:       projectData?.totalSF       ?? 0,
        totalLF:       projectData?.totalLF       ?? 0,
        sectionsFound: projectData?.sectionsFound ?? 0,
        roomsFound:    projectData?.roomsFound    ?? 0,
      },
      specSections:    projectData?.specSections ?? [],
      division01Items: projectData?.division01   ?? [],
      rooms:           projectData?.rooms        ?? [],
    },
    null,
    2
  );
}

// ─── Download helper ──────────────────────────────────────────────────────────
function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message }) => (
  <div className={`toast${message ? " toast--show" : ""}`}>
    {message}
  </div>
);

// ─── ExportDropdown ───────────────────────────────────────────────────────────
// Props:
//   data — the full normalized project object from App.js
const ExportDropdown = ({ data }) => {
  const [open,  setOpen]  = useState(false);
  const [toast, setToast] = useState("");
  const dropRef           = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const safeName = (data?.projectName ?? "cretebid-export")
    .replace(/\s+/g, "-")
    .toLowerCase();

  const handleExport = (type) => {
    setOpen(false);
    switch (type) {
      case "csv": {
        downloadFile(`${safeName}-rooms.csv`, generateCSV(data), "text/csv");
        showToast("CSV downloaded");
        break;
      }
      case "json": {
        downloadFile(`${safeName}-export.json`, generateJSON(data), "application/json");
        showToast("JSON downloaded");
        break;
      }
      case "excel": {
        // Generates a CSV that Excel opens natively.
        // To produce a true .xlsx file later, swap this with SheetJS:
        // npm install xlsx  →  import * as XLSX from "xlsx"
        downloadFile(`${safeName}-rooms.csv`, generateCSV(data), "text/csv");
        showToast("Excel-compatible CSV downloaded");
        break;
      }
      default:
        break;
    }
  };

  return (
    <>
      <div className="export-dropdown" ref={dropRef}>
        <button
          className="export-btn"
          onClick={() => setOpen((prev) => !prev)}
        >
          <svg
            width="14" height="14" viewBox="0 0 16 16"
            fill="none" stroke="currentColor" strokeWidth="1.5"
          >
            <path d="M8 2v8m0 0L5 7m3 3l3-3M2 11v1.5A1.5 1.5 0 003.5 14h9a1.5 1.5 0 001.5-1.5V11" />
          </svg>
          Export project
        </button>

        <div className={`export-drop__menu${open ? " export-drop__menu--open" : ""}`}>
          <div className="export-drop__option" onClick={() => handleExport("excel")}>
            <div className="export-drop__option-label">Excel — bid-ready workbook</div>
            <div className="export-drop__option-sub">All rooms, SF, LF, spec refs, flags</div>
          </div>
          <div className="export-drop__option" onClick={() => handleExport("csv")}>
            <div className="export-drop__option-label">CSV — quoting system import</div>
            <div className="export-drop__option-sub">Room-by-room flat file</div>
          </div>
          <hr className="export-drop__divider" />
          <div className="export-drop__option" onClick={() => handleExport("json")}>
            <div className="export-drop__option-label">JSON — API / developer export</div>
            <div className="export-drop__option-sub">Full structured data with spec refs</div>
          </div>
        </div>
      </div>

      <Toast message={toast} />
    </>
  );
};

export default ExportDropdown;