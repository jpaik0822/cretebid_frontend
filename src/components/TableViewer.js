import React, { useState } from "react";

// ─── Mock data — delete once backend is wired up ─────────────────────────────
// Each table has an id, a label shown in the dropdown, and a rows/columns shape
// that mirrors what your backend parser will return for any extracted table
const MOCK_TABLES = [
  {
    id:      "room-finish-schedule",
    label:   "Room Finish Schedule",
    page:    12,
    columns: ["Room #", "Room Name", "Floor Finish", "Base Type", "Area (SF)", "Base (LF)"],
    rows: [
      ["101", "Main lobby",     "PC-1", "Integral cove",  "3,240", "228"],
      ["102", "Reception",      "PC-1", "Integral cove",  "680",   "106"],
      ["110", "Break room",     "EP-2", "Integral cove",  "420",   "84" ],
      ["112", "Corridor A",     "PC-1", "Resilient 4\"",  "1,880", "312"],
      ["201", "Open office",    "CP-1", "Resilient 4\"",  "8,400", "580"],
      ["210", "Server room",    "EP-3", "Integral cove",  "340",   "74" ],
      ["215", "Janitor closet", "EP-2", "Integral cove",  "65",    "32" ],
    ],
  },
  {
    id:      "spec-sections",
    label:   "Spec Sections — Div 03 & 09",
    page:    4,
    columns: ["CSI Section", "Title", "Status", "Key Requirements"],
    rows: [
      ["03 35 43", "Polished Concrete Finishing",    "In scope", "800 grit, FF35/FL25, ASTM F2170"],
      ["09 67 23", "Resinous Flooring",              "In scope", "Epoxy broadcast, ASTM F1869"],
      ["09 65 13", "Resilient Base & Accessories",   "In scope", "4\" rubber base, coved/straight"],
      ["09 68 13", "Tile Carpeting (adjacent scope)","Monitor",  "Confirm transition w/ GC"],
    ],
  },
  {
    id:      "division-01",
    label:   "Division 01 — General Requirements",
    page:    2,
    columns: ["Section", "Title", "Requirement", "Status"],
    rows: [
      ["01 33 23", "Submittals",            "Product data + quals 21 days before work", "Action req."],
      ["01 45 00", "Quality Control",       "Third-party inspection at substrate + finish", "Action req."],
      ["01 43 39", "Mockup Requirements",   "100 sf panel per finish type, owner approval", "Action req."],
      ["01 78 00", "Closeout Requirements", "Maintenance manual, 2-yr warranty",            "Note"],
    ],
  },
  {
    id:      "moisture-testing",
    label:   "Moisture Testing Requirements",
    page:    18,
    columns: ["Finish Code", "Standard", "Limit", "Min Tests", "Timing"],
    rows: [
      ["PC-1", "ASTM F2170", "≤75% RH",              "1 per 1,000 sf", "72 hrs min, HVAC running"],
      ["EP-2", "ASTM F1869", "≤3 lbs/1,000 sf/24hr", "2 per area",     "After HVAC operational" ],
      ["EP-3", "ASTM F1869", "≤3 lbs/1,000 sf/24hr", "2 per area",     "After HVAC operational" ],
    ],
  },
  {
    id:      "mockup-schedule",
    label:   "Mockup Schedule",
    page:    21,
    columns: ["Finish Type", "Size Required", "Location", "Approval Required", "Notes"],
    rows: [
      ["PC-1 Polished Concrete", "100 sf",  "Per floor",       "Owner",    "800 grit, submit before production"],
      ["EP-2 Epoxy Broadcast",   "50 sf",   "Designated area", "Owner",    "Full system incl. base"            ],
      ["RB-1 Resilient Base",    "6 lf min","Sample board",    "Architect","Both coved and straight profiles"  ],
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Determine if a cell value looks like a finish code so we can color it
function isFinishCode(val) {
  return /^(PC|EP|CP|RB)-\d+$/.test(String(val).trim());
}

function finishChipClass(code) {
  if (code.startsWith("PC")) return "finish-chip--pc";
  if (code.startsWith("EP")) return "finish-chip--ep";
  if (code.startsWith("CP")) return "finish-chip--cp";
  if (code.startsWith("RB")) return "finish-chip--rb";
  return "";
}

// Render a cell — finish codes get colored chips, everything else is plain text
function renderCell(val) {
  const str = String(val).trim();
  if (isFinishCode(str)) {
    return (
      <span className={`finish-chip ${finishChipClass(str)}`} style={{ cursor: "default" }}>
        {str}
      </span>
    );
  }
  return str;
}

// ─── TableViewer ──────────────────────────────────────────────────────────────
// Props:
//   tables — array of extracted table objects from normalized project data
//            Falls back to MOCK_TABLES if not provided
const TableViewer = ({ tables }) => {
  const data = (tables && tables.length > 0) ? tables : MOCK_TABLES;

  const [selectedId, setSelectedId] = useState(null);
  const [isOpen,     setIsOpen]     = useState(false);

  const selectedTable = data.find((t) => t.id === selectedId) ?? null;

  const handleSelect = (id) => {
    if (id === selectedId) {
      // Clicking the same table again collapses it
      setSelectedId(null);
      setIsOpen(false);
    } else {
      setSelectedId(id);
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    setSelectedId(null);
    setIsOpen(false);
  };

  return (
    <div className="table-viewer">

      {/* ── Dropdown selector ─────────────────────────────────────────────── */}
      <div className="table-viewer__selector">
        <div className="table-viewer__selector-label">
          Select a table to view
        </div>

        <div className="table-viewer__dropdown-wrap">
          <select
            className="table-viewer__select"
            value={selectedId ?? ""}
            onChange={(e) => handleSelect(e.target.value)}
          >
            <option value="" disabled>
              — Choose a table ({data.length} extracted) —
            </option>
            {data.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}{t.page ? `  ·  p.${t.page}` : ""}
              </option>
            ))}
          </select>

          {/* Clear button — only shown when a table is selected */}
          {selectedId && (
            <button className="table-viewer__clear" onClick={handleClear}>
              ✕
            </button>
          )}
        </div>

        {/* Pill list — quick-select chips for each table */}
        <div className="table-viewer__pills">
          {data.map((t) => (
            <button
              key={t.id}
              className={`table-viewer__pill${selectedId === t.id ? " table-viewer__pill--active" : ""}`}
              onClick={() => handleSelect(t.id)}
            >
              {t.label}
              {t.page && (
                <span className="table-viewer__pill-page">p.{t.page}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Expanded table — renders inline below when a table is selected ── */}
      {isOpen && selectedTable && (
        <div className="table-viewer__expanded">

          {/* Table header bar */}
          <div className="table-viewer__expanded-header">
            <div>
              <div className="table-viewer__expanded-title">
                {selectedTable.label}
              </div>
              {selectedTable.page && (
                <div className="table-viewer__expanded-meta">
                  Extracted from page {selectedTable.page} &nbsp;·&nbsp;
                  {selectedTable.rows.length} rows &nbsp;·&nbsp;
                  {selectedTable.columns.length} columns
                </div>
              )}
            </div>
            <button className="table-viewer__collapse" onClick={handleClear}>
              Collapse ↑
            </button>
          </div>

          {/* Scrollable table */}
          <div className="table-viewer__table-scroll">
            <table className="table-viewer__table">
              <thead>
                <tr>
                  {selectedTable.columns.map((col, i) => (
                    <th key={i} className="table-viewer__th">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedTable.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className="table-viewer__tr"
                  >
                    {row.map((cell, ci) => (
                      <td key={ci} className="table-viewer__td">
                        {renderCell(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Row count footer */}
          <div className="table-viewer__footer">
            {selectedTable.rows.length} rows extracted
          </div>

        </div>
      )}

    </div>
  );
};

export default TableViewer;