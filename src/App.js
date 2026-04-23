import axios from "axios";
import React, { useState } from "react";
import "./App.css";

import SummaryCards       from "./components/SummaryCards";
import SpecSummaryProse   from "./components/SpecSummaryProse";
import SpecSectionGrid    from "./components/SpecSectionGrid";
import TableViewer        from "./components/TableViewer";
import ChatPanel          from "./components/ChatPanel";
import FloorplanViewer    from "./components/FloorplanViewer";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_RESPONSE = {
  project_id:        "mock-001",
  project_name:      "Meridian Office Complex",
  bid_number:        "2024-0887",
  pages_read:        847,
  processed_at:      new Date().toISOString(),
  summary: {
    total_sf:        42180,
    total_lf:        6340,
    sections_found:  7,
    rooms_found:     134,
  },
  spec_sections:     [],
  division_01_items: [],
  rooms:             [],
  tables:            [],
};

// ─── SHA-256 helper ───────────────────────────────────────────────────────────
async function sha256FromBase64(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Normalize backend response ───────────────────────────────────────────────
function normalizeResponse(apiData) {
  return {
    projectId:     apiData.project_id              ?? "unknown",
    projectName:   apiData.project_name            ?? "Untitled Project",
    bidNumber:     apiData.bid_number              ?? "—",
    processedAt:   apiData.processed_at            ?? new Date().toISOString(),
    pagesRead:     apiData.pages_read              ?? 0,
    totalSF:       apiData.summary?.total_sf       ?? 0,
    totalLF:       apiData.summary?.total_lf       ?? 0,
    sectionsFound: apiData.summary?.sections_found ?? 0,
    roomsFound:    apiData.summary?.rooms_found    ?? 0,
    specSections:  apiData.spec_sections           ?? [],
    specOutput:    apiData.spec_output             ?? "",
    tables:        apiData.tables                  ?? [],
  };
}

// ─── Ingest Agent ─────────────────────────────────────────────────────────────
const IngestAgent = ({ onSuccess, hasProject }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status,       setStatus]       = useState("");
  const [isUploading,  setIsUploading]  = useState(false);

  const onFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setStatus(file ? file.name : "");
  };

  const onFileUpload = async () => {
    if (!selectedFile) { setStatus("Pick a file first."); return; }
    setIsUploading(true);
    setStatus("Reading file…");

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const b64s = String(reader.result).split(",")[1];
        const sha  = await sha256FromBase64(b64s);
        const payload = {
          project_id: "cretebid-" + Date.now(),
          files: [{
            filename:    selectedFile.name,
            uri:         `data:${selectedFile.type || "application/pdf"};base64,${b64s}`,
            sha256:      sha,
            uploaded_by: "frontend",
            tags:        ["upload"],
          }],
          options: { dedup: "hash" },
        };
        setStatus("Uploading…");
        const res = await axios.post(
          "http://127.0.0.1:8000/v1/ingest/run",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );
        setStatus("✅ Done");
        onSuccess(normalizeResponse(res.data));
      } catch (err) {
        console.error("Upload failed:", err);
        setStatus(`❌ Failed (HTTP ${err?.response?.status ?? "unknown"})`);
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => { setStatus("❌ Failed to read file."); setIsUploading(false); };
    reader.readAsDataURL(selectedFile);
  };

  const loadMock = () => {
    onSuccess(normalizeResponse(MOCK_RESPONSE));
    setStatus("✅ Sample data loaded");
  };

  return (
    <div className="ingest-agent">
      <div className="ingest-agent__header">
        <div className="ingest-agent__title">Ingest Agent</div>
        <div className="ingest-agent__sub">
          {hasProject ? "Upload a new document" : "Upload a bid document to analyze"}
        </div>
      </div>
      <div className="ingest-agent__body">
        <label className="ingest-file-label">
          <input type="file" accept="application/pdf"
            onChange={onFileChange} className="file-input" />
          <span className="ingest-file-icon">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <path d="M2 12V14h12v-2M8 2v8m0-8L5 5m3-3l3 3"/>
            </svg>
          </span>
          <span className="ingest-file-text">
            {selectedFile ? selectedFile.name : "Choose a PDF…"}
          </span>
        </label>
        <button className="ingest-upload-btn" onClick={onFileUpload}
          disabled={!selectedFile || isUploading}>
          {isUploading ? "Analyzing…" : "Upload & Analyze"}
        </button>
        {status && <div className="ingest-status">{status}</div>}
        <div className="ingest-divider"><span>or</span></div>
        <button className="ingest-mock-btn" onClick={loadMock}>
          Preview with sample data
        </button>
      </div>
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  const [projectData,  setProjectData]  = useState(null);
  const [activeRoom,   setActiveRoom]   = useState(null);

  return (
    <div className="app-shell">

      {/* ── Left sidebar ────────────────────────────────────────────────────── */}
      <aside className="app-sidebar">

        <div className="app-sidebar__brand">
          <span className="app-sidebar__logo">Crete<span>Bid</span></span>
        </div>

        <IngestAgent
          onSuccess={setProjectData}
          hasProject={!!projectData}
        />

        <div className="app-sidebar__divider" />

        <div className="app-sidebar__chat">
          <ChatPanel
            projectId={projectData?.projectId ?? null}
            projectData={projectData}
          />
        </div>

      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="app-main">

        {!projectData ? (

          // ── Empty state ──────────────────────────────────────────────────────
          <div className="empty-state">
            <div className="empty-state__icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
                stroke="currentColor" strokeWidth="1">
                <rect x="8" y="4" width="32" height="40" rx="3"/>
                <path d="M16 16h16M16 23h16M16 30h10"/>
                <circle cx="36" cy="36" r="8"
                  fill="var(--color-bg)" stroke="currentColor"/>
                <path d="M33 36h6M36 33v6"/>
              </svg>
            </div>
            <div className="empty-state__title">Ready to analyze</div>
            <div className="empty-state__sub">
              Upload a bid document using the Ingest Agent on the left,
              or load sample data to preview the dashboard.
            </div>
            <button className="empty-state__cta"
              onClick={() => document.querySelector(".ingest-mock-btn")?.click()}>
              Preview with sample data →
            </button>
          </div>

        ) : (

          // ── Dashboard ────────────────────────────────────────────────────────
          <>
            {/* Top bar */}
            <div className="main-topbar">
              <div>
                <div className="project-title">{projectData.projectName}</div>
                <div className="project-sub">
                  Bid {projectData.bidNumber}
                  &nbsp;·&nbsp; {projectData.pagesRead} pages parsed
                  &nbsp;·&nbsp; {new Date(projectData.processedAt).toLocaleDateString()}
                </div>
              </div>
              <span className="badge badge--success">Analysis complete</span>
            </div>

            <div className="main-scroll">

              {/* 1. Spec prose summary */}
              {projectData.specOutput && (
                <section className="dashboard-section">
                  <div className="section-label">Specification analysis</div>
                  <SpecSummaryProse specOutput={projectData.specOutput} />
                </section>
              )}

              {/* 2. Spec sections */}
              <section className="dashboard-section">
                <div className="section-label">Concrete flooring spec sections found</div>
                <SpecSectionGrid sections={projectData.specSections} />
              </section>

              {/* 3. Floorplan viewing window */}
              <section className="dashboard-section">
                <div className="section-label">
                  Floorplan viewer
                  {activeRoom && (
                    <span style={{
                      marginLeft: 10, fontFamily: "var(--font-mono)",
                      color: "var(--color-accent)", fontSize: 10,
                    }}>
                      — Room {activeRoom.id} selected
                    </span>
                  )}
                </div>
                <FloorplanViewer
                  projectName={projectData.projectName}
                  onRoomClick={setActiveRoom}
                />
              </section>

              {/* 4. Extracted tables — below floorplan */}
              <section className="dashboard-section">
                <div className="section-label">Extracted tables</div>
                <TableViewer tables={projectData.tables} />
              </section>

            </div>
          </>

        )}

      </main>
    </div>
  );
};

export default App;
