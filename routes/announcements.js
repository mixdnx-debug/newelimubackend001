/**
 * Announcements — admin posts platform-wide notices; students see them on dashboards.
 * NEW feature (v1.1.0)
 */
const express = require('express');
const db = require('../models/db');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public: latest announcements (newest first)
router.get('/', async (req, res) => {
  const items = await db.announcements.find({}).sort({ createdAt: -1 }).limit(20);
  res.json(items);
});

// Admin: create
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Title and body required' });
    const ann = await db.announcements.insert({
      title: String(title).slice(0, 140),
      body: String(body).slice(0, 2000),
      createdBy: req.user.email,
      createdAt: new Date().toISOString()
    });
    res.json({ ok: true, announcement: ann });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: delete
router.delete('/:id', auth, adminOnly, async (req, res) => {
  await db.announcements.remove({ _id: req.params.id });
  res.json({ ok: true });
});

module.exports = router;
