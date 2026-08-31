/**
 * File-based persistent database using NeDB.
 * Works on Render's free tier (ephemeral disk warning: data lives on the
 * container's disk and re-seeds on redeploy — fine for a school project;
 * upgrade to MongoDB Atlas for permanent production data).
 */
const Datastore = require('nedb-promises');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'db');
if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

const db = {
  users:         Datastore.create({ filename: path.join(dbPath, 'users.db'), autoload: true }),
  materials:     Datastore.create({ filename: path.join(dbPath, 'materials.db'), autoload: true }),
  groups:        Datastore.create({ filename: path.join(dbPath, 'groups.db'), autoload: true }),
  resets:        Datastore.create({ filename: path.join(dbPath, 'resets.db'), autoload: true }),
  downloads:     Datastore.create({ filename: path.join(dbPath, 'downloads.db'), autoload: true }),
  favorites:     Datastore.create({ filename: path.join(dbPath, 'favorites.db'), autoload: true }),
  announcements: Datastore.create({ filename: path.join(dbPath, 'announcements.db'), autoload: true }),
  payments:      Datastore.create({ filename: path.join(dbPath, 'payments.db'), autoload: true })
};

db.users.ensureIndex({ fieldName: 'email', unique: true });
db.favorites.ensureIndex({ fieldName: 'userId' });
db.payments.ensureIndex({ fieldName: 'reference', unique: true });
db.payments.ensureIndex({ fieldName: 'userId' });
db.payments.ensureIndex({ fieldName: 'checkoutRequestId' });

module.exports = db;
