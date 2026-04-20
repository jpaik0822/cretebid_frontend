import React from "react";

// ─── Mock data — delete once backend is wired up ─────────────────────────────
const MOCK_ITEMS = [
  {
    id:     "01-33-23",
    name:   "01 33 23 — Submittals",
    desc:   "Product data, shop drawings, installer qualifications required 21 days before work",
    status: "action",
  },
  {
    id:     "01-45-00",
    name:   "01 45 00 — Quality Control",
    desc:   "Third-party inspection at substrate prep and final polish stages",
    status: "action",
  },
  {
    id:     "01-43-39",
    name:   "01 43 39 — Mockup Requirements",
    desc:   "One 100 sf panel per finish type; owner approval before production",
    status: "action",
  },
  {
    id:     "01-78-00",
    name:   "01 78 00 — Closeout Requirements",
    desc:   "Maintenance manual, warranty documentation, 2-year labor + material",
    status: "note",
  },
];

// ─── Badge config per status ──────────────────────────────────────────────────
function rowBadge(status) {
  switch (status) {
    case "action":  return { cls: "badge--warn",    label: "Action req." };
    case "note":    return { cls: "badge--info",    label: "Note" };
    case "danger":  return { cls: "badge--danger",  label: "Critical" };
    default:        return { cls: "badge--accent",  label: status };
  }
}

// ─── Division01List ───────────────────────────────────────────────────────────
// Props:
//   items — array from normalized project data (falls back to MOCK_ITEMS)
const Division01List = ({ items }) => {
  const data = (items && items.length > 0) ? items : MOCK_ITEMS;

  return (
    <div className="div01-list">
      {data.map((item, i) => {
        const badge = rowBadge(item.status);
        return (
          <div
            key={item.id ?? i}
            className="div01-row"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div>
              <div className="div01-row__name">{item.name}</div>
              <div className="div01-row__desc">{item.desc}</div>
            </div>
            <span className={`badge ${badge.cls}`} style={{ flexShrink: 0, marginLeft: 16 }}>
              {badge.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Division01List;