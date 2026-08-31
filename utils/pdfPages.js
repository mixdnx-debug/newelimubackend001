/**
 * ELIMUmaterial — Real PDF page counter (v1.0)
 *
 * Reads the actual page count from every seed notes PDF in uploads/notes.
 * Kept dependency-free (no pdf-lib install needed) by parsing the raw PDF
 * for /Type /Page markers. The result is cached in memory for the lifetime
 * of the process so subsequent lookups are O(1).
 *
 * Falls back gracefully to `null` if the file does not exist or cannot be
 * parsed — callers should treat null as "unknown" and use the catalog's
 * `pages` value instead.
 */
const fs = require('fs');
const path = require('path');

const NOTES_DIR = path.join(__dirname, '..', 'uploads', 'notes');
const cache = Object.create(null);

function countPagesSync(absPath) {
  try {
    if (!fs.existsSync(absPath)) return null;
    const buf = fs.readFileSync(absPath);
    // A PDFKit-generated PDF has a /Type /Page object per page. This is the
    // same approach used by most lightweight readers and is robust for the
    // deterministic files produced by seed/generatePdfs.js.
    const s = buf.toString('latin1');
    const matches = s.match(/\/Type\s*\/Page[^s]/g);
    if (matches && matches.length > 0) return matches.length;
    // Fallback: look for the /Count entry inside the /Pages root object.
    const m = s.match(/\/Type\s*\/Pages[\s\S]{0,200}?\/Count\s+(\d+)/);
    if (m) return parseInt(m[1], 10);
    return null;
  } catch (e) {
    return null;
  }
}

/** Returns the real page count for a unit's notes PDF, or null if unknown. */
function getUnitPages(unitCode) {
  const key = String(unitCode || '').toUpperCase();
  if (!key) return null;
  if (key in cache) return cache[key];
  const abs = path.join(NOTES_DIR, `${key}_notes.pdf`);
  const pages = countPagesSync(abs);
  cache[key] = pages;
  return pages;
}

/** Bulk-decorate a list of units with a real `pages` value where available. */
function decorateUnits(units) {
  if (!Array.isArray(units)) return units;
  return units.map(u => {
    const real = getUnitPages(u.code);
    return real ? { ...u, pages: real } : u;
  });
}

module.exports = { getUnitPages, decorateUnits };
