const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../models/db');
const { sign, auth } = require('../middleware/auth');

const router = express.Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '11elimu72';

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const existing = await db.users.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email taken' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await db.users.insert({
      fullName,
      email: email.toLowerCase(),
      password: hashed,
      role: 'student',
      university: null,
      faculty: null,
      course: null,
      year: null,
      createdAt: new Date().toISOString()
    });
    const token = sign({ id: user._id, email: user.email, role: user.role });
    res.json({
      token,
      user: { id: user._id, fullName, email: user.email, role: user.role,
              university: null, faculty: null, course: null }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // Admin backdoor via admin password
    if (email.toLowerCase() === 'admin@elimumaterial.co.ke' && password === ADMIN_PASSWORD) {
      let admin = await db.users.findOne({ email: 'admin@elimumaterial.co.ke' });
      if (!admin) {
        admin = await db.users.insert({
          fullName: 'System Administrator',
          email: 'admin@elimumaterial.co.ke',
          password: await bcrypt.hash(ADMIN_PASSWORD, 10),
          role: 'admin',
          createdAt: new Date().toISOString()
        });
      }
      const token = sign({ id: admin._id, email: admin.email, role: 'admin' });
      return res.json({ token, user: { id: admin._id, fullName: admin.fullName, email: admin.email, role: 'admin' } });
    }

    const user = await db.users.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = sign({ id: user._id, email: user.email, role: user.role });
    res.json({
      token,
      user: {
        id: user._id, fullName: user.fullName, email: user.email, role: user.role,
        university: user.university, faculty: user.faculty, course: user.course, year: user.year
      }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin dedicated endpoint
router.post('/admin-login', async (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid admin password' });
  let admin = await db.users.findOne({ email: 'admin@elimumaterial.co.ke' });
  if (!admin) {
    admin = await db.users.insert({
      fullName: 'System Administrator',
      email: 'admin@elimumaterial.co.ke',
      password: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: 'admin',
      createdAt: new Date().toISOString()
    });
  }
  const token = sign({ id: admin._id, email: admin.email, role: 'admin' });
  res.json({ token, user: { id: admin._id, fullName: admin.fullName, email: admin.email, role: 'admin' } });
});

// Forgot password – issues a reset token (in production you'd email it)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const user = await db.users.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ ok: true, message: 'If the email exists, a reset code has been sent.' });
    const code = crypto.randomInt(100000, 999999).toString();
    await db.resets.insert({
      email: user.email, code, expiresAt: Date.now() + 15 * 60 * 1000, used: false
    });
    // For school-project mode we return the code directly. In production you'd email it.
    res.json({ ok: true, message: 'Reset code generated.', resetCode: code });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'All fields required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const rec = await db.resets.findOne({ email: email.toLowerCase(), code, used: false });
    if (!rec) return res.status(400).json({ error: 'Invalid or expired code' });
    if (Date.now() > rec.expiresAt) return res.status(400).json({ error: 'Code expired' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.users.update({ email: email.toLowerCase() }, { $set: { password: hashed } });
    await db.resets.update({ _id: rec._id }, { $set: { used: true } });
    res.json({ ok: true, message: 'Password reset successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  const user = await db.users.findOne({ _id: req.user.id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = user;
  res.json({ user: safe });
});

module.exports = router;
