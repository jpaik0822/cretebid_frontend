import React from "react";

// ─── Category labels to parse from prose ─────────────────────────────────────
const CATEGORIES = [
  "Substrate preparation",
  "Mockups",
  "Quality control",
  "Submittals",
  "Performance tolerances",
];

function parseProseBlocks(text) {
  if (!text) return [];

  // Find the FIRST occurrence of each category name in order.
  // The LLM may use "Category:" inline or "**Category**" on its own line.
  const matches = [];
  const usedCategories = new Set();

  for (const cat of CATEGORIES) {
    // Match the category name (case-insensitive) optionally wrapped in ** or ##,
    // followed by an optional colon/dash
    const pat = new RegExp(
      `(?:\\*{1,2}|#{1,3}\\s*)?${cat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\*{1,2})?\\s*[:\\-–—]?\\s*`,
      "i"
    );
    const m = pat.exec(text);
    if (m && !usedCategories.has(cat.toLowerCase())) {
      usedCategories.add(cat.toLowerCase());
      matches.push({ heading: cat, start: m.index, end: m.index + m[0].length });
    }
  }

  // Sort by position in text
  matches.sort((a, b) => a.start - b.start);

  if (matches.length === 0) {
    return text.trim() ? [{ heading: "Summary", body: text.trim() }] : [];
  }

  // Extract body text between each heading and the next
  const merged = {};
  const order = [];
  for (let i = 0; i < matches.length; i++) {
    const bodyStart = matches[i].end;
    const bodyEnd = i + 1 < matches.length ? matches[i + 1].start : text.length;
    const body = text.slice(bodyStart, bodyEnd).trim();
    const key = matches[i].heading.toLowerCase();

    // Merge duplicates: concatenate body text under the same heading
    if (merged[key]) {
      merged[key].body += "\n\n" + body;
    } else {
      merged[key] = { heading: matches[i].heading, body };
      order.push(key);
    }
  }

  return order.map((k) => merged[k]).filter((b) => b.body);
}

// ─── SpecSummaryProse ────────────────────────────────────────────────────────
const SpecSummaryProse = ({ specOutput }) => {
  if (!specOutput || !specOutput.trim()) return null;

  const blocks = parseProseBlocks(specOutput);

  return (
    <div className="prose-summary">
      {blocks.map((block, i) => (
        <div key={i} className="prose-summary__block">
          <div className="prose-summary__heading">{block.heading}</div>
          <div className="prose-summary__body">{block.body}</div>
        </div>
      ))}
    </div>
  );
};

export default SpecSummaryProse;
