/**
 * Favorites / Bookmarks — students can star any unit for quick access.
 * NEW feature (v1.1.0)
 */
const express = require('express');
const db = require('../models/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// List my favorites
router.get('/', auth, async (req, res) => {
  const favs = await db.favorites.find({ userId: req.user.id }).sort({ addedAt: -1 });
  res.json(favs);
});

// Add a favorite unit
router.post('/', auth, async (req, res) => {
  try {
    const { unitCode, unitName, courseName } = req.body;
    if (!unitCode || !unitName) return res.status(400).json({ error: 'unitCode and unitName required' });
    const code = unitCode.toUpperCase();
    const existing = await db.favorites.findOne({ userId: req.user.id, unitCode: code });
    if (existing) return res.json({ ok: true, already: true, favorite: existing });
    const fav = await db.favorites.insert({
      userId: req.user.id,
      unitCode: code,
      unitName,
      courseName: courseName || null,
      addedAt: new Date().toISOString()
    });
    res.json({ ok: true, favorite: fav });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Remove a favorite
router.delete('/:unitCode', auth, async (req, res) => {
  await db.favorites.remove({ userId: req.user.id, unitCode: req.params.unitCode.toUpperCase() });
  res.json({ ok: true });
});

module.exports = router;
