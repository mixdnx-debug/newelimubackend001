/**
 * Generates study-notes + past-paper PDFs for the NEW Chuka 2026 programmes
 * only (Economics & Statistics, Actuarial Science, BBA, Economics & Sociology).
 * Reuses the exact builders from generatePdfs.js — no logic duplicated.
 */
const path = require('path');
const fs = require('fs');
const { buildNotesPdf, buildPaperPdf } = require('./generatePdfs');
const { chukaCourses } = require('./chukaCatalog');

const NEW_IDS = ['chuka-bsc-econstat', 'chuka-bsc-actsci', 'chuka-bba', 'chuka-ba-ecosoc'];
const NOTES_DIR = path.join(__dirname, '..', 'uploads', 'notes');
const PAPERS_DIR = path.join(__dirname, '..', 'uploads', 'papers');

async function mapLimit(items, limit, fn) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) await fn(items[i++]);
  });
  await Promise.all(workers);
}

(async () => {
  const jobs = [];
  chukaCourses.filter(c => NEW_IDS.includes(c.id)).forEach(course => {
    course.units.forEach(unit => jobs.push({ unit, course }));
  });
  console.log('New-programme units:', jobs.length);
  let done = 0, failed = 0;
  await mapLimit(jobs, 12, async ({ unit, course }) => {
    const np = path.join(NOTES_DIR, `${unit.code}_notes.pdf`);
    const pp = path.join(PAPERS_DIR, `${unit.code}_pastpaper.pdf`);
    try {
      if (!fs.existsSync(np)) await buildNotesPdf(unit, course, np);
      if (!fs.existsSync(pp)) await buildPaperPdf(unit, course, pp);
      done++;
      if (done % 40 === 0) console.log(`  …${done}/${jobs.length}`);
    } catch (e) {
      failed++;
      [np, pp].forEach(p => { try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (_) {} });
      console.error('FAIL', unit.code, e.message);
    }
  });
  console.log(`Done: ${done} units, failed: ${failed}`);
})();
