const express = require('express');
const db = require('../models/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Update profile (choose university/faculty/course/year)
router.put('/profile', auth, async (req, res) => {
  const { university, faculty, course, year, fullName } = req.body;
  const update = {};
  ['university', 'faculty', 'course', 'year', 'fullName'].forEach(k => {
    if (req.body[k] !== undefined) update[k] = req.body[k];
  });
  await db.users.update({ _id: req.user.id }, { $set: update });
  const user = await db.users.findOne({ _id: req.user.id });
  const { password, ...safe } = user;
  res.json({ user: safe });
});

// User's download history
router.get('/downloads', auth, async (req, res) => {
  const items = await db.downloads.find({ userId: req.user.id }).sort({ downloadedAt: -1 }).limit(50);
  res.json(items);
});

module.exports = router;
