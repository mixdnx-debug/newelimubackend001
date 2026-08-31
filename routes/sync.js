/**
 * ELIMUmaterial — Sync / Backup API (ADDITIVE MODULE — does not change any
 * existing route, logic or flow).
 *
 * Purpose:
 *   The Render free tier uses an ephemeral disk, so if the service restarts
 *   or redeploys, the NeDB files are re-seeded and data is lost. This module
 *   lets the standalone Netlify Admin Panel:
 *     1. EXPORT a full snapshot of every collection (permanent local backup).
 *     2. IMPORT (restore) records back into the backend after a wake/restart,
 *        so the backend continues exactly from where it went to sleep.
 *
 * Both endpoints are admin-only (JWT + role check) — students never see them.
 */
const express = require('express');
const db = require('../models/db');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Collections that are part of a full backup. Key = public name, value = datastore.
const COLLECTIONS = {
  users:         db.users,
  materials:     db.materials,
  groups:        db.groups,
  downloads:     db.downloads,
  favorites:     db.favorites,
  announcements: db.announcements,
  payments:      db.payments
};

/**
 * GET /api/sync/export
 * Returns every record of every collection, plus the server clock.
 * The admin panel stores this permanently on the admin's own device.
 */
router.get('/export', auth, adminOnly, async (req, res) => {
  try {
    const data = {};
    for (const [name, store] of Object.entries(COLLECTIONS)) {
      data[name] = await store.find({});
    }
    res.json({
      ok: true,
      serverTime: new Date().toISOString(),
      counts: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])),
      data
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * POST /api/sync/import   { collections: { payments: [...], users: [...], ... } }
 * Upserts each record by its original _id. Existing records are only
 * overwritten when the incoming copy is newer (by updatedAt/createdAt) so a
 * restore can never roll the backend backwards. Unique-index conflicts
 * (e.g. a user email that already exists) are skipped safely, never fatal.
 * Returns per-collection counters so the panel can report what happened.
 */
router.post('/import', auth, adminOnly, async (req, res) => {
  try {
    const collections = (req.body && req.body.collections) || {};
    const report = {};
    for (const [name, docs] of Object.entries(collections)) {
      const store = COLLECTIONS[name];
      if (!store || !Array.isArray(docs)) continue;
      let inserted = 0, updated = 0, skipped = 0, failed = 0;
      for (const doc of docs) {
        if (!doc || !doc._id) { skipped++; continue; }
        try {
          const existing = await store.findOne({ _id: doc._id });
          if (!existing) {
            // Respect unique business keys: if a record with the same unique
            // value already exists under a different _id, skip instead of crash.
            if (name === 'users' && doc.email) {
              const dupe = await store.findOne({ email: doc.email });
              if (dupe) { skipped++; continue; }
            }
            if (name === 'payments' && doc.reference) {
              const dupe = await store.findOne({ reference: doc.reference });
              if (dupe) { skipped++; continue; }
            }
            await store.insert(doc);
            inserted++;
          } else {
            const inT = Date.parse(doc.updatedAt || doc.createdAt || 0) || 0;
            const exT = Date.parse(existing.updatedAt || existing.createdAt || 0) || 0;
            if (inT >= exT) {
              await store.update({ _id: doc._id }, doc);
              updated++;
            } else {
              skipped++;
            }
          }
        } catch (_) { failed++; }
      }
      report[name] = { received: docs.length, inserted, updated, skipped, failed };
    }
    res.json({ ok: true, serverTime: new Date().toISOString(), report });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * GET /api/sync/ping — ultra-cheap keep-alive target (admin-only not required;
 * it exposes nothing but a timestamp, like /api/health). Used by the Netlify
 * admin panel's 10-minute pinger and the backend's own 14-minute self-ping.
 */
router.get('/ping', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), uptime: Math.round(process.uptime()) });
});

module.exports = router;
