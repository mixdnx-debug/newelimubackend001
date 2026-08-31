/**
 * Persistent database layer — Neon (PostgreSQL).
 *
 * This module exposes EXACTLY the same interface the previous file-based
 * store exposed (find / findOne / insert / update / remove / count, with
 * .sort().skip().limit() cursor chaining), so every route, the payments/STK
 * flow, auth, seeding and the sync/backup module keep working WITHOUT a
 * single change to their logic.
 *
 * Why: Render's free tier has an ephemeral disk — file-based data was wiped
 * on every redeploy/restart. Neon is a managed Postgres database that lives
 * OUTSIDE the server, so all data now survives redeploys, restarts and
 * sleeps automatically. If the backend ever "loses" anything, it reads it
 * straight back from Neon on the next request — Neon is the source of truth.
 *
 * Configuration: set DATABASE_URL in the environment (Render dashboard →
 * Environment). Example:
 *   postgresql://user:pass@host/neondb?sslmode=require
 */
const { Pool } = require('pg');
const crypto = require('crypto');

const COLLECTIONS = [
  'users', 'materials', 'groups', 'resets',
  'downloads', 'favorites', 'announcements', 'payments'
];

// ---------------------------------------------------------------------------
// Connection pool
// ---------------------------------------------------------------------------
function buildPool() {
  const cs = (process.env.DATABASE_URL || '').trim();
  if (!cs) {
    console.error('❌ DATABASE_URL is not set — the API cannot reach the database.');
    return null;
  }
  // Keep only protocol/auth/host/db — query flags (sslmode, channel_binding)
  // are dropped and SSL is configured explicitly below (works on every pg version).
  let clean = cs;
  try { const u = new URL(cs); u.search = ''; clean = u.toString(); } catch (_) { /* use as-is */ }
  return new Pool({
    connectionString: clean,
    ssl: { rejectUnauthorized: false }, // Neon requires TLS; managed certs don't need local CA pinning
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });
}

const pool = buildPool();

// ---------------------------------------------------------------------------
// Schema bootstrap — runs once, before the first query. Idempotent.
// ---------------------------------------------------------------------------
const initPromise = (async () => {
  if (!pool) return;
  const client = await pool.connect();
  try {
    for (const name of COLLECTIONS) {
      await client.query(
        `CREATE TABLE IF NOT EXISTS "${name}" (_id TEXT PRIMARY KEY, data JSONB NOT NULL)`
      );
    }
    // Indexes mirroring the intent of the original datastore indexes.
    // Wrapped individually so a pre-existing duplicate can never block boot.
    const indexes = [
      `CREATE UNIQUE INDEX IF NOT EXISTS users_email_uidx ON "users" ((data->>'email'))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS payments_reference_uidx ON "payments" ((data->>'reference'))`,
      `CREATE INDEX IF NOT EXISTS payments_checkout_idx ON "payments" ((data->>'checkoutRequestId'))`,
      `CREATE INDEX IF NOT EXISTS payments_user_idx ON "payments" ((data->>'userId'))`,
      `CREATE INDEX IF NOT EXISTS favorites_user_idx ON "favorites" ((data->>'userId'))`
    ];
    for (const sql of indexes) {
      try { await client.query(sql); } catch (e) { console.log('⚠️ Index notice:', e.message); }
    }
    console.log('✅ Neon database ready (tables + indexes verified).');
  } finally {
    client.release();
  }
})().catch(e => console.error('❌ Database init failed:', e.message));

// ---------------------------------------------------------------------------
// Query matching — supports the exact query shapes used across the app:
// equality, nested { $or: [...] }, and common operator objects ($ne, $in,
// $regex, $lt/$lte/$gt/$gte). Deep-equality for array/object values.
// ---------------------------------------------------------------------------
function deepEqual(a, b) {
  if (a === b) return true;
  if (a instanceof Date) a = a.toISOString();
  if (b instanceof Date) b = b.toISOString();
  if (a === b) return true;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    try { return JSON.stringify(a) === JSON.stringify(b); } catch (_) { return false; }
  }
  return false;
}

function matchValue(actual, expected) {
  if (expected && typeof expected === 'object' && !Array.isArray(expected) && !(expected instanceof Date)) {
    const keys = Object.keys(expected);
    const isOperator = keys.length > 0 && keys.every(k => k.startsWith('$'));
    if (isOperator) {
      for (const [op, val] of Object.entries(expected)) {
        if (op === '$ne' && deepEqual(actual, val)) return false;
        if (op === '$in' && !(Array.isArray(val) && val.some(v => deepEqual(actual, v)))) return false;
        if (op === '$regex') {
          const re = val instanceof RegExp ? val : new RegExp(val, expected.$options || '');
          if (typeof actual !== 'string' || !re.test(actual)) return false;
        }
        if (op === '$lt' && !(actual < val)) return false;
        if (op === '$lte' && !(actual <= val)) return false;
        if (op === '$gt' && !(actual > val)) return false;
        if (op === '$gte' && !(actual >= val)) return false;
        if (op === '$exists' && ((actual !== undefined) !== !!val)) return false;
      }
      return true;
    }
  }
  return deepEqual(actual, expected);
}

function match(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;
  for (const [key, expected] of Object.entries(query)) {
    if (key === '$or') {
      if (!Array.isArray(expected) || !expected.some(sub => match(doc, sub))) return false;
      continue;
    }
    if (key === '$and') {
      if (!Array.isArray(expected) || !expected.every(sub => match(doc, sub))) return false;
      continue;
    }
    if (!matchValue(doc[key], expected)) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Sorting — same multi-key { field: 1 | -1 } semantics the app already uses.
// ---------------------------------------------------------------------------
function compare(a, b) {
  if (a instanceof Date) a = a.toISOString();
  if (b instanceof Date) b = b.toISOString();
  if (a === b) return 0;
  if (a === undefined || a === null) return -1;
  if (b === undefined || b === null) return 1;
  return a < b ? -1 : 1;
}

function sorter(spec) {
  const keys = Object.keys(spec || {});
  return (x, y) => {
    for (const k of keys) {
      const c = compare(x[k], y[k]);
      if (c !== 0) return spec[k] < 0 ? -c : c;
    }
    return 0;
  };
}

// ---------------------------------------------------------------------------
// Cursor — thenable, chainable: await db.x.find(q).sort({...}).limit(n)
// ---------------------------------------------------------------------------
class Cursor {
  constructor(store, query) {
    this._store = store;
    this._query = query || {};
    this._sort = null;
    this._skip = 0;
    this._limit = null;
  }
  sort(spec) { this._sort = spec; return this; }
  skip(n) { this._skip = n || 0; return this; }
  limit(n) { this._limit = n; return this; }
  then(resolve, reject) { return this.exec().then(resolve, reject); }
  async exec() {
    let docs = await this._store._all();
    docs = docs.filter(d => match(d, this._query));
    if (this._sort) docs.sort(sorter(this._sort));
    if (this._skip) docs = docs.slice(this._skip);
    if (this._limit != null) docs = docs.slice(0, this._limit);
    return docs;
  }
}

// ---------------------------------------------------------------------------
// Collection store — one JSONB table per collection. Documents keep their
// original _id (so the sync/backup import restores records by id, exactly
// like before).
// ---------------------------------------------------------------------------
class Store {
  constructor(name) { this.name = name; }

  async _ready() {
    await initPromise;
    if (!pool) throw new Error('DATABASE_URL is not configured');
  }

  async _all() {
    await this._ready();
    const { rows } = await pool.query(`SELECT data FROM "${this.name}"`);
    return rows.map(r => r.data);
  }

  find(query = {}) { return new Cursor(this, query); }

  async findOne(query = {}) {
    const docs = await this.find(query).limit(1);
    return docs.length ? docs[0] : null;
  }

  async count(query = {}) {
    const docs = await this._all();
    return docs.filter(d => match(d, query)).length;
  }

  async insert(doc) {
    await this._ready();
    const record = { ...(doc || {}) };
    if (!record._id) record._id = crypto.randomBytes(8).toString('hex'); // 16-char id, same shape as before
    await pool.query(
      `INSERT INTO "${this.name}" (_id, data) VALUES ($1, $2)`,
      [String(record._id), JSON.stringify(record)]
    );
    return record;
  }

  /**
   * update(query, updateDoc)
   *  - { $set: {...} }  → merges fields into matching documents
   *  - plain document   → full replacement of matching documents (_id kept)
   * Returns the number of documents updated — same contract as before.
   */
  async update(query, updateDoc, options = {}) {
    await this._ready();
    const docs = (await this._all()).filter(d => match(d, query));
    if (!options.multi && docs.length > 1) docs.length = 1; // single-doc update by default
    const usesOperators = updateDoc && Object.keys(updateDoc).some(k => k.startsWith('$'));
    let updated = 0;
    for (const doc of docs) {
      const next = usesOperators
        ? { ...doc, ...((updateDoc && updateDoc.$set) || {}) }
        : { ...(updateDoc || {}), _id: doc._id };
      await pool.query(
        `UPDATE "${this.name}" SET data = $2 WHERE _id = $1`,
        [String(doc._id), JSON.stringify(next)]
      );
      updated++;
    }
    return updated;
  }

  async remove(query, options = {}) {
    await this._ready();
    let docs = (await this._all()).filter(d => match(d, query));
    if (!options.multi && docs.length > 1) docs = docs.slice(0, 1); // single-doc remove by default
    if (!docs.length) return 0;
    const ids = docs.map(d => String(d._id));
    await pool.query(`DELETE FROM "${this.name}" WHERE _id = ANY($1)`, [ids]);
    return docs.length;
  }

  // Kept for API compatibility — indexes are created at bootstrap now.
  ensureIndex() { /* no-op: indexes live in Postgres */ }
}

const db = Object.fromEntries(COLLECTIONS.map(name => [name, new Store(name)]));

module.exports = db;
