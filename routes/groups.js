const express = require('express');
const db = require('../models/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// List all groups
router.get('/', async (req, res) => {
  const groups = await db.groups.find({}).sort({ createdAt: -1 });
  res.json(groups);
});

// Create group
router.post('/', auth, async (req, res) => {
  const { name, description, university, course, tags } = req.body;
  if (!name) return res.status(400).json({ error: 'Group name required' });
  const group = await db.groups.insert({
    name, description, university, course,
    tags: tags || [],
    createdBy: req.user.id,
    createdByName: req.user.email,
    members: [req.user.id],
    messages: [],
    createdAt: new Date().toISOString()
  });
  res.json(group);
});

// Join group
router.post('/:id/join', auth, async (req, res) => {
  const g = await db.groups.findOne({ _id: req.params.id });
  if (!g) return res.status(404).json({ error: 'Group not found' });
  if (g.members.includes(req.user.id)) return res.json({ ok: true, already: true });
  g.members.push(req.user.id);
  await db.groups.update({ _id: g._id }, { $set: { members: g.members } });
  res.json({ ok: true });
});

// Leave
router.post('/:id/leave', auth, async (req, res) => {
  const g = await db.groups.findOne({ _id: req.params.id });
  if (!g) return res.status(404).json({ error: 'Group not found' });
  g.members = g.members.filter(m => m !== req.user.id);
  await db.groups.update({ _id: g._id }, { $set: { members: g.members } });
  res.json({ ok: true });
});

// Post message
router.post('/:id/messages', auth, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Message required' });
  const g = await db.groups.findOne({ _id: req.params.id });
  if (!g) return res.status(404).json({ error: 'Group not found' });
  const msg = { userId: req.user.id, email: req.user.email, text, at: new Date().toISOString() };
  g.messages = g.messages || [];
  g.messages.push(msg);
  await db.groups.update({ _id: g._id }, { $set: { messages: g.messages } });
  res.json(msg);
});

// Delete (creator only)
router.delete('/:id', auth, async (req, res) => {
  const g = await db.groups.findOne({ _id: req.params.id });
  if (!g) return res.status(404).json({ error: 'Not found' });
  if (g.createdBy !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Only creator or admin can delete' });
  await db.groups.remove({ _id: g._id });
  res.json({ ok: true });
});

module.exports = router;
