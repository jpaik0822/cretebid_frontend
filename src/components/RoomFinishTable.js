import React, { useState } from "react";

// ─── Mock data — delete once backend is wired up ─────────────────────────────
const MOCK_ROOMS = [
  { id: "101", name: "Main lobby",     finishCode: "PC-1", baseType: "Integral cove",  sf: 3240,  lf: 228 },
  { id: "102", name: "Reception",      finishCode: "PC-1", baseType: "Integral cove",  sf: 680,   lf: 106 },
  { id: "110", name: "Break room",     finishCode: "EP-2", baseType: "Integral cove",  sf: 420,   lf: 84  },
  { id: "112", name: "Corridor A",     finishCode: "PC-1", baseType: "Resilient 4\"",  sf: 1880,  lf: 312 },
  { id: "201", name: "Open office",    finishCode: "CP-1", baseType: "Resilient 4\"",  sf: 8400,  lf: 580 },
  { id: "210", name: "Server room",    finishCode: "EP-3", baseType: "Integral cove",  sf: 340,   lf: 74  },
  { id: "215", name: "Janitor closet", finishCode: "EP-2", baseType: "Integral cove",  sf: 65,    lf: 32  },
];

// Spec detail keyed by finish code — shown in the drawer
const MOCK_SPEC_DETAIL = {
  "PC-1": {
    csi:       "03 35 43",
    title:     "Polished Concrete Finishing",
    substrate: "Existing slab — diamond grind to CSP 2-3. Remove all adhesive residue.",
    moisture:  "ASTM F2170 in-situ RH ≤75%. Test 72 hrs min. One test per 1,000 sf.",
    mockup:    "100 sf panel per floor, 800 grit finish. Owner approval required before production.",
    tolerance: "FF 35 / FL 25 minimum. Correct high spots before grinding.",
    flags:     ["Mockup req.", "FF/FL tolerance", "ASTM F2170"],
  },
  "EP-2": {
    csi:       "09 67 23",
    title:     "Resinous Flooring — Epoxy Broadcast",
    substrate: "Shot blast to ICRI CSP 3. All cracks routed and filled. Min 28-day cure.",
    moisture:  "ASTM F1869 ≤3 lbs/1,000 sf/24hr. Two tests min per area. Provide certified results.",
    mockup:    "50 sf sample panel, full system including base. Submit before ordering materials.",
    tolerance: "Trowel-applied primer + broadcast aggregate + seal coat. 3/16\" total thickness.",
    flags:     ["Submittal req.", "Moisture test", "Installer quals"],
  },
  "EP-3": {
    csi:       "09 67 23",
    title:     "Resinous Flooring — Epoxy Seal (light duty)",
    substrate: "Diamond grind to CSP 2. Vacuum all dust before application.",
    moisture:  "ASTM F1869 ≤3 lbs/1,000 sf/24hr. Same requirements as EP-2.",
    mockup:    "Not required for EP-3 if EP-2 mockup approved.",
    tolerance: "Two-coat seal system, 10 mil DFT per coat. Anti-static additive in server areas.",
    flags:     ["Submittal req.", "Anti-static req."],
  },
  "CP-1": {
    csi:       "09 68 13",
    title:     "Tile Carpeting (adjacent scope)",
    substrate: "Not in your scope — note interface condition at PC-1 boundary.",
    moisture:  "Confirm with GC who owns moisture testing at carpet/concrete interface.",
    mockup:    "Not in your scope.",
    tolerance: "Transition strip at all hard-surface boundaries. Clarify responsibility with GC.",
    flags:     ["Clarify w/ GC", "Monitor only"],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function chipClass(code) {
  if (code.startsWith("PC")) return "finish-chip--pc";
  if (code.startsWith("EP")) return "finish-chip--ep";
  if (code.startsWith("CP")) return "finish-chip--cp";
  if (code.startsWith("RB")) return "finish-chip--rb";
  return "finish-chip--pc";
}

function flagBadgeClass(flag) {
  const f = flag.toLowerCase();
  if (f.includes("gc") || f.includes("clarify") || f.includes("monitor")) return "badge--info";
  return "badge--warn";
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
const Drawer = ({ code, rooms, specDetail, onClose }) => {
  const isOpen = !!code;

  // Rooms that share this finish code
  const matchedRooms = rooms.filter((r) => r.finishCode === code);
  const totalSF = matchedRooms.reduce((sum, r) => sum + r.sf, 0);
  const totalLF = matchedRooms.reduce((sum, r) => sum + r.lf, 0);
  const spec    = specDetail?.[code];

  return (
    <>
      <div
        className={`drawer-overlay${isOpen ? " drawer-overlay--open" : ""}`}
        onClick={onClose}
      />
      <div className={`drawer${isOpen ? " drawer--open" : ""}`}>
        <button className="drawer__close" onClick={onClose}>✕</button>

        {isOpen && spec && (
          <div className="drawer__inner">

            {/* Code + section header */}
            <div style={{ marginBottom: 14 }}>
              <span
                className={`finish-chip ${chipClass(code)}`}
                style={{ fontSize: 13, padding: "4px 14px", cursor: "default" }}
              >
                {code}
              </span>
            </div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", marginBottom: 4 }}>
              CSI {spec.csi}
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 10 }}>
              {spec.title}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {spec.flags.map((f) => (
                <span key={f} className={`badge ${flagBadgeClass(f)}`}>{f}</span>
              ))}
            </div>

            {/* Spec blocks */}
            <div className="drawer__block">
              <div className="drawer__block-label">Substrate prep</div>
              <div className="drawer__block-text">{spec.substrate}</div>
            </div>
            <div className="drawer__block">
              <div className="drawer__block-label">Moisture testing</div>
              <div className="drawer__block-text">{spec.moisture}</div>
            </div>
            <div className="drawer__block">
              <div className="drawer__block-label">Mockup requirement</div>
              <div className="drawer__block-text">{spec.mockup}</div>
            </div>
            <div className="drawer__block">
              <div className="drawer__block-label">Tolerances & system</div>
              <div className="drawer__block-text">{spec.tolerance}</div>
            </div>

            {/* Rooms using this code */}
            <div className="drawer__block">
              <div className="drawer__block-label">
                Rooms using {code}&nbsp;·&nbsp;
                {totalSF.toLocaleString()} sf&nbsp;/&nbsp;{totalLF.toLocaleString()} lf total
              </div>
              {matchedRooms.map((r) => (
                <div key={r.id} className="drawer__room-row">
                  <span className="drawer__room-name">{r.id} — {r.name}</span>
                  <span className="drawer__room-sf">
                    {r.sf.toLocaleString()} sf / {r.lf.toLocaleString()} lf
                  </span>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </>
  );
};

// ─── RoomFinishTable ──────────────────────────────────────────────────────────
// Props:
//   rooms      — array of room objects from normalized project data
//   specDetail — object keyed by finish code with drawer content
//                Both fall back to mock data if not provided
const RoomFinishTable = ({ rooms, specDetail }) => {
  const roomData = (rooms      && rooms.length > 0) ? rooms      : MOCK_ROOMS;
  const specData = (specDetail && Object.keys(specDetail).length > 0) ? specDetail : MOCK_SPEC_DETAIL;

  const [activeCode, setActiveCode] = useState(null);

  const openDrawer  = (code) => setActiveCode(code);
  const closeDrawer = ()     => setActiveCode(null);

  return (
    <>
      <div className="room-table-wrap">

        {/* Header */}
        <div className="room-table-head">
          <span>Room #</span>
          <span>Room name</span>
          <span>Floor finish</span>
          <span>Base type</span>
          <span>Area (sf)</span>
          <span>Base (lf)</span>
        </div>

        {/* Rows */}
        {roomData.map((room, i) => (
          <div
            key={room.id ?? i}
            className="room-table-row"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <span className="room-table-row__number">{room.id}</span>
            <span>{room.name}</span>
            <span>
              <span
                className={`finish-chip ${chipClass(room.finishCode)}`}
                onClick={() => openDrawer(room.finishCode)}
                title="Click to view spec"
              >
                {room.finishCode} ↗
              </span>
            </span>
            <span style={{ color: "var(--color-text-secondary)", fontSize: 11 }}>
              {room.baseType}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
              {room.sf.toLocaleString()}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
              {room.lf.toLocaleString()}
            </span>
          </div>
        ))}

      </div>

      <div className="room-table-note">
        Click any finish code ↗ to view the full spec section and all rooms using that finish.
      </div>

      {/* Drawer */}
      <Drawer
        code={activeCode}
        rooms={roomData}
        specDetail={specData}
        onClose={closeDrawer}
      />
    </>
  );
};

export default RoomFinishTable;