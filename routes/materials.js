const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const db = require('../models/db');
const { auth, adminOnly } = require('../middleware/auth');
const catalog = require(path.join(__dirname, '..', 'seed', 'catalog.js'));
const { getUnitPages } = require('../utils/pdfPages');

const router = express.Router();

// Multer for admin uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type === 'paper' ? 'papers' : 'notes';
    cb(null, path.join(__dirname, '..', 'uploads', type));
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-z0-9.\-_]/gi, '_');
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

// List materials for a unit
router.get('/unit/:unitCode', async (req, res) => {
  const unitCode = req.params.unitCode.toUpperCase();
  // Look up the unit in the catalog to see if there is a bundled seed PDF
  let unitData = null;
  catalog.courses.forEach(c => {
    c.units.forEach(u => {
      if (u.code.toUpperCase() === unitCode) unitData = { ...u, courseId: c.id };
    });
  });

  const uploaded = await db.materials.find({ unitCode });
  const items = [];
  if (unitData) {
    const seedFile = `notes/${unitCode}_notes.pdf`;
    const abs = path.join(__dirname, '..', 'uploads', seedFile);
    if (fs.existsSync(abs)) {
      const realPages = getUnitPages(unitCode);
      items.push({
        _id: `seed-${unitCode}`,
        title: `${unitData.name} — Complete Study Notes`,
        type: 'notes',
        unitCode,
        filename: seedFile,
        url: `/files/${seedFile}`,
        pages: realPages || unitData.pages || 20,
        uploadedAt: '2026-01-15T00:00:00.000Z',
        official: true
      });
    }
    const paperFile = `papers/${unitCode}_pastpaper.pdf`;
    const absP = path.join(__dirname, '..', 'uploads', paperFile);
    if (fs.existsSync(absP)) {
      items.push({
        _id: `seed-p-${unitCode}`,
        title: `${unitData.name} — Past Paper (2025)`,
        type: 'paper',
        unitCode,
        filename: paperFile,
        url: `/files/${paperFile}`,
        uploadedAt: '2026-01-15T00:00:00.000Z',
        official: true
      });
    }
  }
  uploaded.forEach(m => items.push({ ...m, url: `/files/${m.filename}` }));
  // Decorate unit metadata with the real page count where we know it.
  let unitOut = unitData;
  if (unitData) {
    const realPages = getUnitPages(unitCode);
    if (realPages) unitOut = { ...unitData, pages: realPages };
  }
  res.json({ unit: unitOut, materials: items });
});

// Track download
router.post('/track-download', auth, async (req, res) => {
  const { unitCode, materialId, title } = req.body;
  await db.downloads.insert({
    userId: req.user.id, unitCode, materialId, title,
    downloadedAt: new Date().toISOString()
  });
  res.json({ ok: true });
});

// Admin upload
router.post('/upload', auth, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { unitCode, title, type } = req.body;
    const rec = await db.materials.insert({
      unitCode: (unitCode || '').toUpperCase(),
      title: title || req.file.originalname,
      type: type === 'paper' ? 'paper' : 'notes',
      filename: `${type === 'paper' ? 'papers' : 'notes'}/${req.file.filename}`,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.user.email
    });
    res.json({ ok: true, material: rec });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin delete
router.delete('/:id', auth, adminOnly, async (req, res) => {
  const mat = await db.materials.findOne({ _id: req.params.id });
  if (!mat) return res.status(404).json({ error: 'Not found' });
  const abs = path.join(__dirname, '..', 'uploads', mat.filename);
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
  await db.materials.remove({ _id: req.params.id });
  res.json({ ok: true });
});

module.exports = router;
