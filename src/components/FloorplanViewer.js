import React, { useState } from "react";

// ─── Room definitions — positions match the SVG layout below ─────────────────
// Each room has an id, label, finish code, area, and SVG rect coordinates
const ROOMS = [
  { id: "101", name: "Main Lobby",     code: "PC-1", sf: "3,240", x: 20,  y: 20,  w: 200, h: 160 },
  { id: "102", name: "Reception",      code: "PC-1", sf: "680",   x: 220, y: 20,  w: 120, h: 80  },
  { id: "110", name: "Break Room",     code: "EP-2", sf: "420",   x: 220, y: 100, w: 120, h: 80  },
  { id: "112", name: "Corridor A",     code: "PC-1", sf: "1,880", x: 20,  y: 180, w: 320, h: 50  },
  { id: "201", name: "Open Office",    code: "CP-1", sf: "8,400", x: 340, y: 20,  w: 220, h: 210 },
  { id: "210", name: "Server Room",    code: "EP-3", sf: "340",   x: 20,  y: 230, w: 100, h: 100 },
  { id: "215", name: "Janitor",        code: "EP-2", sf: "65",    x: 120, y: 230, w: 80,  h: 100 },
  { id: "220", name: "Conference",     code: "PC-1", sf: "1,200", x: 200, y: 230, w: 140, h: 100 },
  { id: "230", name: "Storage",        code: "EP-2", sf: "280",   x: 340, y: 230, w: 100, h: 100 },
  { id: "240", name: "Mech. Room",     code: "EP-3", sf: "180",   x: 440, y: 230, w: 120, h: 100 },
];

// Finish code → fill color (semi-transparent for legibility)
const CODE_COLORS = {
  "PC-1": { fill: "rgba(78,142,247,0.18)",  stroke: "rgba(78,142,247,0.6)",  text: "#89b4fa" },
  "EP-2": { fill: "rgba(76,175,125,0.18)",  stroke: "rgba(76,175,125,0.6)",  text: "#81c995" },
  "EP-3": { fill: "rgba(76,175,125,0.10)",  stroke: "rgba(76,175,125,0.4)",  text: "#81c995" },
  "CP-1": { fill: "rgba(224,160,64,0.18)",  stroke: "rgba(224,160,64,0.6)",  text: "#f0b860" },
  "RB-1": { fill: "rgba(224,92,92,0.18)",   stroke: "rgba(224,92,92,0.6)",   text: "#f08080" },
};

const DEFAULT_COLOR = { fill: "rgba(255,255,255,0.05)", stroke: "rgba(255,255,255,0.2)", text: "#7e8a9a" };

// ─── Legend item ──────────────────────────────────────────────────────────────
const LegendItem = ({ code, label }) => {
  const c = CODE_COLORS[code] ?? DEFAULT_COLOR;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 14, height: 14, borderRadius: 3,
        background: c.fill, border: `1.5px solid ${c.stroke}`,
        flexShrink: 0,
      }} />
      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
        <span style={{ color: c.text, fontWeight: 500 }}>{code}</span> — {label}
      </span>
    </div>
  );
};

// ─── FloorplanViewer ──────────────────────────────────────────────────────────
// Props:
//   projectName — shown in the sheet title bar
//   onRoomClick — optional callback when a room is clicked (room object passed)
const FloorplanViewer = ({ projectName, onRoomClick }) => {
  const [hoveredRoom,  setHoveredRoom]  = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleRoomClick = (room) => {
    setSelectedRoom(selectedRoom?.id === room.id ? null : room);
    if (onRoomClick) onRoomClick(room);
  };

  const SVG_W = 580;
  const SVG_H = 340;

  return (
    <div className="floorplan-viewer">

      {/* Feature Preview banner */}
      <div className="floorplan-viewer__preview-banner">
        <div className="floorplan-viewer__preview-banner-title">
          Feature Preview — Sample Architectural Drawing
        </div>
        <div className="floorplan-viewer__preview-banner-subtitle">
          Room Geometry Agent demo using sample floor plan data. Live integration processes uploaded architectural drawings.
        </div>
      </div>

      {/* Sheet title bar */}
      <div className="floorplan-viewer__titlebar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="floorplan-viewer__sheet-tag">Sheet A-101</span>
          <span className="floorplan-viewer__title">
            {projectName ?? "Meridian Office Complex"} — Level 1 Floor Plan
          </span>
        </div>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
          Scale: 1/8" = 1'-0"
        </span>
      </div>

      {/* SVG floorplan */}
      <div className="floorplan-viewer__canvas">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ display: "block" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none"
                stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width={SVG_W} height={SVG_H} fill="url(#grid)"/>

          {/* North arrow */}
          <g transform="translate(548, 30)">
            <circle cx="0" cy="0" r="14"
              fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
            <path d="M0 -10 L4 4 L0 1 L-4 4 Z"
              fill="rgba(255,255,255,0.5)"/>
            <text x="0" y="22" textAnchor="middle"
              fontSize="8" fill="rgba(255,255,255,0.4)"
              fontFamily="monospace">N</text>
          </g>

          {/* Dimension line — horizontal */}
          <line x1="20" y1="310" x2="560" y2="310"
            stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="4,2"/>
          <text x="290" y="322" textAnchor="middle"
            fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">
            142'-0"
          </text>

          {/* Dimension line — vertical */}
          <line x1="572" y1="20" x2="572" y2="330"
            stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="4,2"/>

          {/* Rooms */}
          {ROOMS.map((room) => {
            const c         = CODE_COLORS[room.code] ?? DEFAULT_COLOR;
            const isHovered  = hoveredRoom?.id  === room.id;
            const isSelected = selectedRoom?.id === room.id;

            return (
              <g
                key={room.id}
                onClick={() => handleRoomClick(room)}
                onMouseEnter={() => setHoveredRoom(room)}
                onMouseLeave={() => setHoveredRoom(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Room fill */}
                <rect
                  x={room.x} y={room.y}
                  width={room.w} height={room.h}
                  fill={isSelected ? c.stroke : isHovered ? c.fill.replace("0.18", "0.28") : c.fill}
                  stroke={isSelected ? c.text : c.stroke}
                  strokeWidth={isSelected ? 2 : 1}
                  rx="1"
                />

                {/* Room number */}
                <text
                  x={room.x + 6} y={room.y + 14}
                  fontSize="9"
                  fontFamily="monospace"
                  fill="rgba(255,255,255,0.5)"
                  fontWeight="500"
                >
                  {room.id}
                </text>

                {/* Room name — only if wide enough */}
                {room.w >= 80 && (
                  <text
                    x={room.x + room.w / 2}
                    y={room.y + room.h / 2 - 8}
                    textAnchor="middle"
                    fontSize={room.w < 100 ? "8" : "9"}
                    fontFamily="monospace"
                    fill="rgba(255,255,255,0.6)"
                  >
                    {room.name}
                  </text>
                )}

                {/* Finish code pill */}
                <rect
                  x={room.x + room.w / 2 - 18}
                  y={room.y + room.h / 2 + 2}
                  width={36} height={14}
                  rx="3"
                  fill={c.stroke}
                  opacity="0.7"
                />
                <text
                  x={room.x + room.w / 2}
                  y={room.y + room.h / 2 + 13}
                  textAnchor="middle"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="500"
                  fill="white"
                >
                  {room.code}
                </text>

                {/* SF label */}
                {room.h >= 80 && (
                  <text
                    x={room.x + room.w / 2}
                    y={room.y + room.h - 8}
                    textAnchor="middle"
                    fontSize="7"
                    fontFamily="monospace"
                    fill="rgba(255,255,255,0.3)"
                  >
                    {room.sf} SF
                  </text>
                )}
              </g>
            );
          })}

          {/* Exterior walls — bold border around whole plan */}
          <rect
            x={20} y={20} width={540} height={310}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="2"
            rx="1"
          />
        </svg>
      </div>

      {/* Selected room info bar */}
      {selectedRoom && (
        <div className="floorplan-viewer__room-info">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={`finish-chip finish-chip--${selectedRoom.code.split("-")[0].toLowerCase()}`}
              style={{ cursor: "default" }}>
              {selectedRoom.code}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
              {selectedRoom.id} — {selectedRoom.name}
            </span>
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: 11,
            fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
            <span>{selectedRoom.sf} SF</span>
            <button
              style={{ background: "none", border: "none", cursor: "pointer",
                fontSize: 11, fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)", padding: 0 }}
              onClick={() => setSelectedRoom(null)}
            >
              Deselect ✕
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="floorplan-viewer__legend">
        <span className="floorplan-viewer__legend-label">Finish legend:</span>
        <LegendItem code="PC-1" label="Polished Concrete (03 35 43)" />
        <LegendItem code="EP-2" label="Resinous Epoxy Broadcast (09 67 23)" />
        <LegendItem code="EP-3" label="Resinous Epoxy Seal (09 67 23)" />
        <LegendItem code="CP-1" label="Tile Carpet — adjacent (09 68 13)" />
      </div>

    </div>
  );
};

export default FloorplanViewer;