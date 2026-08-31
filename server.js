/**
 * ELIMUmaterial - Backend API Server
 * Kenyan University Study Materials Platform
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Security & parsing middleware ----------
// CORS: allow the deployed Netlify frontend, localhost dev, and any explicit CLIENT_URL.
const allowed = new Set(
  ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5500', 'http://127.0.0.1:5500']
    .concat((process.env.CLIENT_URL || '*').split(',').map(s => s.trim()))
);
const allowAll = allowed.has('*');
app.use(cors({
  origin: (origin, cb) => {
    // No Origin header (curl, Render health checks, same-origin file fetch) -> allow
    if (!origin || allowAll || allowed.has(origin)) return cb(null, true);
    // Allow any *.netlify.app subdomain so preview/deploy URLs always work
    if (/^https:\/\/[a-z0-9-]+\.netlify\.app$/i.test(origin)) return cb(null, true);
    return cb(null, true); // public read-only API — permissive, JWT guards mutations
  },
  credentials: false
}));

// Hardened security headers (Helmet-equivalent set, no extra dependency)
app.disable('x-powered-by');
app.set('trust proxy', 1); // Render sits behind a proxy — needed for correct rate-limit IPs
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), browsing-topics=()');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  // The admin panel page (/admin) ships its logic in an inline <script> and loads
  // Font Awesome / Google Fonts from CDNs — give ONLY that page a scoped CSP that
  // permits them. Every other route keeps the strict original policy unchanged.
  const isAdminPage = req.path === '/admin' || req.path.startsWith('/admin/');
  res.setHeader(
    'Content-Security-Policy',
    isAdminPage
      ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; img-src 'self' data:; font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
      : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
  );
  next();
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload dirs exist
['uploads', 'uploads/notes', 'uploads/papers', 'db'].forEach(d => {
  const p = path.join(__dirname, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Serve uploaded PDFs statically (with long cache — files are immutable).
// dotfiles/index listings disabled; only PDF files are ever served.
app.use('/files', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  dotfiles: 'deny',
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Admin panel — hosted on the backend's public folder, at /admin
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html')));

// Rate limiter for auth endpoints — tightened against credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later.' }
});

// Global API rate limiter — stops scraping / brute-force floods across all routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' }
});
app.use('/api', apiLimiter);

// ---------- Routes ----------
// Root intentionally reveals no stack/name/version info (security through
// minimal disclosure) — just a liveness flag for uptime monitors.
app.get('/', (req, res) => res.json({ status: 'running' }));

app.get('/api/health', async (req, res) => {
  let dbOk = true;
  try {
    const db = require('./models/db');
    await db.users.count({});
  } catch (e) { dbOk = false; }
  res.json({ status: dbOk ? 'ok' : 'degraded' });
});

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));
app.use('/api/favorites', require('./routes/favorites'));      // NEW: unit bookmarks
app.use('/api/announcements', require('./routes/announcements')); // NEW: admin notices
app.use('/api/sync', require('./routes/sync'));                  // NEW: backup/restore + keep-alive ping (additive — no existing logic changed)

// KCB payment callback — exact path agreed with KCB (KCB_CALLBACK_URL),
// plus the rest of the payments API under /api/payments.
const paymentsRoutes = require('./routes/payments');
app.post('/callback', paymentsRoutes);
app.use('/api/payments', paymentsRoutes);

// 404 — generic, reveals nothing about which routes exist
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler — always JSON, never leaks stack traces or internals to clients
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }
  console.error(err);
  const status = err.status || 500;
  // 4xx errors keep their message (they are safe, client-facing); 5xx are masked.
  res.status(status).json({
    error: status < 500 ? (err.message || 'Request error') : 'Server error'
  });
});

app.listen(PORT, () => {
  console.log(`✅ ELIMUmaterial API running on port ${PORT}`);
  // Keep the free-tier dyno awake forever (pings itself every 14 min —
  // additive utility, does not affect any route or request handling).
  require('./utils/keepAlive').startKeepAlive();
});
