import React, { useState } from "react";

// ─── Mock data — delete once backend is wired up ─────────────────────────────
const MOCK_SECTIONS = [
  {
    id:       "PC",
    csi:      "03 35 43",
    title:    "Polished Concrete Finishing",
    status:   "in-scope",
    desc:     "800 grit min. ASTM F2170 moisture ≤75% RH. FF 35 / FL 25 tolerance required. 3 mockup panels per floor.",
    flags:    ["Mockup req.", "FF/FL tolerance", "ASTM F2170"],
    codes:    ["PC-1", "PC-2"],
    drawer: {
      substrate:  "Existing slab — diamond grind to CSP 2-3. Remove all adhesive residue.",
      moisture:   "ASTM F2170 in-situ RH ≤75%. Test 72 hrs min. One test per 1,000 sf.",
      mockup:     "100 sf panel per floor, 800 grit finish. Owner approval required before production.",
      tolerance:  "FF 35 / FL 25 minimum. Correct high spots before grinding.",
      rooms: [
        { no: "101", name: "Main lobby",  sf: "3,240", lf: "228" },
        { no: "102", name: "Reception",   sf: "680",   lf: "106" },
        { no: "112", name: "Corridor A",  sf: "1,880", lf: "312" },
      ],
      totalSF: "5,800",
    },
  },
  {
    id:       "EP",
    csi:      "09 67 23",
    title:    "Resinous Flooring",
    status:   "in-scope",
    desc:     "Epoxy broadcast system. ASTM F1869 ≤3 lbs/1000 sf/24hr. Integral cove base at wet areas. Submit product data + installer quals.",
    flags:    ["Submittal req.", "Moisture test", "Installer quals"],
    codes:    ["EP-2", "EP-3"],
    drawer: {
      substrate:  "Shot blast to ICRI CSP 3. All cracks routed and filled. Min 28-day cure.",
      moisture:   "ASTM F1869 ≤3 lbs/1,000 sf/24hr. Two tests min per area. Provide certified results.",
      mockup:     "50 sf sample panel, full system including base. Submit before ordering materials.",
      tolerance:  "Trowel-applied primer + broadcast aggregate + seal coat. 3/16\" total thickness.",
      rooms: [
        { no: "110", name: "Break room",     sf: "420", lf: "84" },
        { no: "215", name: "Janitor closet", sf: "65",  lf: "32" },
      ],
      totalSF: "485",
    },
  },
  {
    id:       "RB",
    csi:      "09 65 13",
    title:    "Resilient Base & Accessories",
    status:   "in-scope",
    desc:     "4\" rubber base, coved at carpet areas. Straight at hard surface. Color schedule on Sheet A-601. Min 6 LF samples required.",
    flags:    ["Sample req."],
    codes:    ["RB-1"],
    drawer: {
      substrate:  "Clean, dry wall surface. Remove all existing base and adhesive residue.",
      moisture:   "Not applicable for resilient base installation.",
      mockup:     "6 LF minimum sample, both coved and straight profiles. Owner selects color from schedule A-601.",
      tolerance:  "4\" height, continuous contact with floor. No gaps at seams exceeding 1/32\".",
      rooms: [
        { no: "112", name: "Corridor A",  sf: "—",   lf: "312" },
        { no: "201", name: "Open office", sf: "—",   lf: "580" },
      ],
      totalSF: "892 lf",
    },
  },
  {
    id:       "CP",
    csi:      "09 68 13",
    title:    "Tile Carpeting (adjacent scope)",
    status:   "monitor",
    desc:     "Interface condition at polished concrete boundary. Confirm transition strip responsibility with GC before bid.",
    flags:    ["Clarify w/ GC"],
    codes:    ["CP-1"],
    drawer: {
      substrate:  "Not in your scope — note interface condition at PC-1 boundary.",
      moisture:   "Confirm with GC who owns moisture testing at carpet/concrete interface.",
      mockup:     "Not in your scope.",
      tolerance:  "Transition strip at all hard-surface boundaries. Clarify responsibility with GC.",
      rooms: [
        { no: "201", name: "Open office", sf: "8,400", lf: "580" },
      ],
      totalSF: "8,400",
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Map a finish code prefix to its chip CSS modifier
function chipClass(code) {
  if (code.startsWith("PC")) return "finish-chip--pc";
  if (code.startsWith("EP")) return "finish-chip--ep";
  if (code.startsWith("CP")) return "finish-chip--cp";
  if (code.startsWith("RB")) return "finish-chip--rb";
  return "finish-chip--pc";
}

// Map a flag string to a badge variant
function flagBadge(flag) {
  if (flag.toLowerCase().includes("gc") || flag.toLowerCase().includes("clarify")) return "badge--warn";
  if (flag.toLowerCase().includes("monitor")) return "badge--info";
  return "badge--warn";
}

// Status badge
function statusBadge(status) {
  if (status === "in-scope") return { cls: "badge--success", label: "In scope" };
  if (status === "monitor")  return { cls: "badge--info",    label: "Monitor" };
  return                            { cls: "badge--accent",  label: status };
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
const Drawer = ({ section, code, onClose }) => {
  if (!section) return null;
  const d = section.drawer;

  return (
    <>
      {/* Overlay */}
      <div
        className={`drawer-overlay ${section ? "drawer-overlay--open" : ""}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`drawer ${section ? "drawer--open" : ""}`}>
        <button className="drawer__close" onClick={onClose}>✕</button>

        <div className="drawer__inner">
          {/* Code pill + section info */}
          <div style={{ marginBottom: 14 }}>
            <span className={`finish-chip ${chipClass(code)}`} style={{ fontSize: 13, padding: "4px 14px" }}>
              {code}
            </span>
          </div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", marginBottom: 6 }}>
            CSI {section.csi}
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>
            {section.title}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {section.flags.map((f) => (
              <span key={f} className={`badge ${flagBadge(f)}`}>{f}</span>
            ))}
          </div>

          {/* Spec blocks */}
          <div className="drawer__block">
            <div className="drawer__block-label">Substrate prep</div>
            <div className="drawer__block-text">{d.substrate}</div>
          </div>
          <div className="drawer__block">
            <div className="drawer__block-label">Moisture testing</div>
            <div className="drawer__block-text">{d.moisture}</div>
          </div>
          <div className="drawer__block">
            <div className="drawer__block-label">Mockup requirement</div>
            <div className="drawer__block-text">{d.mockup}</div>
          </div>
          <div className="drawer__block">
            <div className="drawer__block-label">Tolerances & system</div>
            <div className="drawer__block-text">{d.tolerance}</div>
          </div>

          {/* Rooms using this code */}
          <div className="drawer__block">
            <div className="drawer__block-label">
              Rooms using {code} &nbsp;·&nbsp; {d.totalSF} total
            </div>
            {d.rooms.map((r) => (
              <div key={r.no} className="drawer__room-row">
                <span className="drawer__room-name">{r.no} — {r.name}</span>
                <span className="drawer__room-sf">{r.sf} sf / {r.lf} lf</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── SpecSectionGrid ──────────────────────────────────────────────────────────
// Props:
//   sections — array from normalized project data (falls back to MOCK_SECTIONS)
const SpecSectionGrid = ({ sections }) => {
  const data = (sections && sections.length > 0) ? sections : MOCK_SECTIONS;

  // activeCode = the finish code string that was clicked, e.g. "PC-1"
  // activeSection = the full section object that owns that code
  const [activeCode,    setActiveCode]    = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  const openDrawer = (code, section) => {
    setActiveCode(code);
    setActiveSection(section);
  };

  const closeDrawer = () => {
    setActiveCode(null);
    setActiveSection(null);
  };

  return (
    <>
      <div className="spec-grid">
        {data.map((section) => {
          const sb = statusBadge(section.status);
          // Highlight this card if the open drawer belongs to it
          const isHighlighted = activeSection?.id === section.id;

          return (
            <div
              key={section.id}
              className={`spec-card${isHighlighted ? " spec-card--highlight" : ""}`}
            >
              {/* Header row: CSI code + status badge */}
              <div className="spec-card__header">
                <span className="spec-card__csi">{section.csi}</span>
                <span className={`badge ${sb.cls}`}>{sb.label}</span>
              </div>

              {/* Title */}
              <div className="spec-card__title">{section.title}</div>

              {/* Description */}
              <div className="spec-card__desc">{section.desc}</div>

              {/* Action flags */}
              <div className="spec-card__flags">
                {section.flags.map((f) => (
                  <span key={f} className={`badge ${flagBadge(f)}`}>{f}</span>
                ))}
              </div>

              {/* Finish code pills — clicking opens the drawer */}
              <div className="spec-card__codes">
                <span className="spec-card__codes-label">Finish codes:</span>
                {section.codes.map((code) => (
                  <span
                    key={code}
                    className={`finish-chip ${chipClass(code)}`}
                    onClick={() => openDrawer(code, section)}
                    title="Click to view full spec"
                  >
                    {code} ↗
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer — rendered outside the grid so it overlays everything */}
      <Drawer
        section={activeSection}
        code={activeCode}
        onClose={closeDrawer}
      />
    </>
  );
};

export default SpecSectionGrid;