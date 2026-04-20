import React from "react";

// ─── Mock data — delete this once your backend is wired up ───────────────────
const MOCK = {
  totalSF:       42180,
  totalLF:       6340,
  sectionsFound: 7,
  roomsFound:    134,
};

// ─── Individual card ─────────────────────────────────────────────────────────
const Card = ({ label, value, unit, accent }) => (
  <div className="summary-card">
    <div className="summary-card__label">{label}</div>
    <div className={`summary-card__value${accent ? " summary-card__value--accent" : ""}`}>
      {typeof value === "number" ? value.toLocaleString() : value}
    </div>
    {unit && <div className="summary-card__unit">{unit}</div>}
  </div>
);

// ─── SummaryCards ────────────────────────────────────────────────────────────
// Props:
//   data — the normalized project object from App.js
//          Falls back to MOCK data if not provided (useful during development)
const SummaryCards = ({ data }) => {
  const d = data ?? MOCK;

  return (
    <div className="summary-cards">
      <Card
        label="Total floor area"
        value={d.totalSF}
        unit="sq ft"
      />
      <Card
        label="Base linear footage"
        value={d.totalLF}
        unit="lf — mixed type"
        accent
      />
      <Card
        label="Spec sections found"
        value={d.sectionsFound}
        unit="Div 01, 03 &amp; 09"
      />
      <Card
        label="Rooms parsed"
        value={d.roomsFound}
        unit="with finish codes"
      />
    </div>
  );
};

export default SummaryCards;