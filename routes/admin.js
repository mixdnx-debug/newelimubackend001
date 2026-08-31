const express = require('express');
const db = require('../models/db');
const { auth, adminOnly } = require('../middleware/auth');
const path = require('path');
const catalog = require(path.join(__dirname, '..', 'seed', 'catalog.js'));

const router = express.Router();

router.get('/stats', auth, adminOnly, async (req, res) => {
  const users = await db.users.count({ role: 'student' });
  const groups = await db.groups.count({});
  const materials = await db.materials.count({});
  const downloads = await db.downloads.count({});
  let unitCount = 0;
  catalog.courses.forEach(c => { unitCount += c.units.length; });
  res.json({
    users, groups, materials, downloads,
    universities: catalog.universities.length,
    courses: catalog.courses.length,
    units: unitCount
  });
});

router.get('/users', auth, adminOnly, async (req, res) => {
  const users = await db.users.find({}).sort({ createdAt: -1 });
  res.json(users.map(u => { const { password, ...s } = u; return s; }));
});

router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  await db.users.remove({ _id: req.params.id });
  res.json({ ok: true });
});

router.get('/downloads', auth, adminOnly, async (req, res) => {
  const items = await db.downloads.find({}).sort({ downloadedAt: -1 }).limit(200);
  res.json(items);
});

router.get('/materials', auth, adminOnly, async (req, res) => {
  const items = await db.materials.find({}).sort({ uploadedAt: -1 });
  res.json(items);
});

// ---- Wallet: all M-PESA transactions with their live status ----
router.get('/wallet', auth, adminOnly, async (req, res) => {
  const items = await db.payments.find({}).sort({ createdAt: -1 }).limit(500);
  res.json(items);
});

router.get('/wallet/summary', auth, adminOnly, async (req, res) => {
  const items = await db.payments.find({});
  const sum = { total: items.length, success: 0, pending: 0, initiated: 0, cancelled: 0, timeout: 0, failed: 0, collected: 0 };
  items.forEach(p => {
    if (sum[p.status] != null) sum[p.status] += 1;
    if (p.status === 'success') sum.collected += Number(p.amount || 0);
  });
  res.json(sum);
});

module.exports = router;
