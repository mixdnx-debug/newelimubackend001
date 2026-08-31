/**
 * ELIMUmaterial — KCB Buni M-PESA STK Push payments.
 *
 * A student pays PER UNIT: KES 23 for a unit's notes, KES 20 for its past
 * paper. Every attempt (initiated / pending / success / cancelled /
 * timeout / failed) is recorded in the payments store and shown in the
 * Admin Wallet.
 */
const express = require('express');
const crypto = require('crypto');
const db = require('../models/db');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ---------- KCB Buni configuration (environment variables) ----------
const KCB = {
  env:        process.env.KCB_ENV || 'sandbox',
  tokenUrl:   process.env.KCB_TOKEN_ENDPOINT || 'https://api.buni.kcbgroup.com/token',
  stkUrl:     process.env.KCB_STK_ENDPOINT   || 'https://api.buni.kcbgroup.com/mm/api/request/1.0.0/stkpush',
  key:        process.env.KCB_CONSUMER_KEY || '',
  secret:     process.env.KCB_CONSUMER_SECRET || '',
  callback:   process.env.KCB_CALLBACK_URL || '',
  shortCode:  process.env.KCB_SHORTCODE || process.env.KCB_TILL || '',
  till:       process.env.KCB_TILL || process.env.KCB_SHORTCODE || ''
};

// Per-unit prices (env overrides accepted for future tuning)
const NOTES_PRICE = process.env.UNIT_NOTES_PRICE || '23'; // KES per unit notes unlock
const PAPER_PRICE = process.env.UNIT_PAPER_PRICE || '20'; // KES per unit past-paper unlock
function priceFor(kind) { return kind === 'paper' ? Number(PAPER_PRICE) : Number(NOTES_PRICE); }

// ---------- Access-token cache (valid ~1 hour; refresh 5 min early) ----------
let cachedToken = { value: null, expiresAt: 0 };

async function getAccessToken() {
  if (cachedToken.value && Date.now() < cachedToken.expiresAt) return cachedToken.value;
  const basic = Buffer.from(`${KCB.key}:${KCB.secret}`).toString('base64');
  const resp = await fetch(`${KCB.tokenUrl}?grant_type=client_credentials`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.access_token) {
    throw new Error(data.fault?.description || data.error_description || 'Could not authenticate with the payment gateway');
  }
  const ttl = Number(data.expires_in || 3599);
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (ttl - 300) * 1000 };
  return data.access_token;
}

// ---------- Helpers ----------
function normalizePhone(raw) {
  let p = String(raw || '').replace(/[^\d+]/g, '');
  if (p.startsWith('+')) p = p.slice(1);
  if (/^0[17]\d{8}$/.test(p)) p = '254' + p.slice(1);          // 07xx / 01xx
  else if (/^[17]\d{8}$/.test(p)) p = '254' + p;               // 7xx / 1xx
  if (!/^254[17]\d{8}$/.test(p)) return null;
  return p;
}

function parseTransactionDate(v) {
  // KCB sends YYYYMMDDHHMMSS
  const s = String(v || '');
  if (s.length !== 14) return new Date().toISOString();
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}+03:00`;
}

function failureMessage(code, desc) {
  const c = Number(code);
  if (c === 1032) return 'Payment cancelled by user';
  if (c === 1037) return 'Payment timed out — phone unreachable or prompt not answered';
  if (c === 2001) return 'Wrong M-PESA PIN entered';
  if (c === 1)    return 'Insufficient M-PESA balance';
  return desc || `Payment failed (code ${code})`;
}

// ====================================================================
// STUDENT ENDPOINTS
// ====================================================================

// POST /api/payments/stk-push  { phoneNumber, courseId?, courseName?, universityName?, facultyName?, unitCode, unitName?, kind }
router.post('/stk-push', auth, async (req, res) => {
  try {
    if (!KCB.key || !KCB.secret) return res.status(500).json({ error: 'Payment gateway is not configured on the server.' });
    const { courseId, courseName, universityName, facultyName, unitCode, unitName } = req.body || {};
    const kind = (req.body && req.body.kind) === 'paper' ? 'paper' : 'notes';
    const phone = normalizePhone(req.body && req.body.phoneNumber);
    if (!phone) return res.status(400).json({ error: 'Enter a valid M-PESA phone number (e.g. 0797 977 136).' });
    if (!unitCode) return res.status(400).json({ error: 'Please choose a unit first.' });
    const amount = priceFor(kind);

    // Unique account reference per KCB spec: invoiceNumber = KCBTILL#ACCOUNTREF
    const accRef = 'ELM' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString('hex').toUpperCase();
    const invoiceNumber = `${KCB.till}#${accRef}`;

    const record = await db.payments.insert({
      userId: req.user.id,
      userEmail: req.user.email,
      phone,
      amount,
      courseId: courseId || null,
      courseName: courseName || courseId || null,
      universityName: universityName || null,
      facultyName: facultyName || null,
      unitCode,
      unitName: unitName || unitCode,
      kind,
      reference: accRef,
      invoiceNumber,
      merchantRequestId: null,
      checkoutRequestId: null,
      mpesaReceipt: null,
      status: 'initiated',
      resultCode: null,
      resultDesc: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    try {
      const token = await getAccessToken();
      const resp = await fetch(KCB.stkUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          amount: String(amount),
          invoiceNumber,
          sharedShortCode: true,
          orgShortCode: KCB.shortCode,
          orgPassKey: '',
          callbackUrl: KCB.callback,
          transactionDescription: `ELIMUmaterial ${kind === 'paper' ? 'past-paper' : 'notes'} unlock — ${unitCode}`
        })
      });
      const data = await resp.json().catch(() => ({}));
      const r = data.response || {};
      const statusCode = String(data.header?.statusCode ?? '');
      const responseCode = String(r.ResponseCode ?? '');

      if ((resp.ok && statusCode === '0') || responseCode === '0') {
        await db.payments.update({ _id: record._id }, { $set: {
          merchantRequestId: r.MerchantRequestID || null,
          checkoutRequestId: r.CheckoutRequestID || null,
          status: 'pending',
          resultDesc: r.CustomerMessage || 'STK push sent — awaiting customer PIN',
          updatedAt: new Date().toISOString()
        }});
        return res.json({
          ok: true,
          reference: accRef,
          checkoutRequestId: r.CheckoutRequestID || null,
          customerMessage: r.CustomerMessage || 'STK push sent — check your phone and enter your M-PESA PIN.'
        });
      }

      const msg = r.ResponseDescription || data.header?.statusDescription || data.fault?.description || 'STK push was rejected by the gateway';
      await db.payments.update({ _id: record._id }, { $set: {
        status: 'failed', resultCode: responseCode || statusCode || null, resultDesc: msg, updatedAt: new Date().toISOString()
      }});
      return res.status(400).json({ error: msg, reference: accRef });
    } catch (e) {
      await db.payments.update({ _id: record._id }, { $set: {
        status: 'failed', resultDesc: e.message, updatedAt: new Date().toISOString()
      }});
      return res.status(502).json({ error: 'Could not reach the payment gateway: ' + e.message, reference: accRef });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/payments/status/:reference — polled by the STK modal
router.get('/status/:reference', auth, async (req, res) => {
  try {
    const p = await db.payments.findOne({ reference: req.params.reference, userId: req.user.id });
    if (!p) return res.status(404).json({ error: 'Payment not found' });
    res.json({
      reference: p.reference,
      status: p.status,
      courseId: p.courseId,
      courseName: p.courseName,
      universityName: p.universityName,
      facultyName: p.facultyName,
      unitCode: p.unitCode || null,
      unitName: p.unitName || null,
      kind: p.kind || 'notes',
      amount: p.amount,
      phone: p.phone,
      mpesaReceipt: p.mpesaReceipt,
      resultDesc: p.resultDesc,
      createdAt: p.createdAt,
      completedAt: p.completedAt || null
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/payments/my — student's own payment history
router.get('/my', auth, async (req, res) => {
  try {
    const items = await db.payments.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/payments/receipt/:reference — professional PDF receipt (paid payments only)
router.get('/receipt/:reference', auth, async (req, res) => {
  try {
    const p = await db.payments.findOne({ reference: req.params.reference, userId: req.user.id });
    if (!p) return res.status(404).json({ error: 'Receipt not found' });
    if (p.status !== 'success') return res.status(400).json({ error: 'Receipt is only available after a successful payment.' });
    const user = await db.users.findOne({ _id: p.userId });
    const { buildReceipt } = require('../utils/receipt');
    await buildReceipt(res, p, user || { fullName: p.userEmail, email: p.userEmail });
  } catch (e) { if (!res.headersSent) res.status(500).json({ error: e.message }); }
});

// ====================================================================
// KCB CALLBACK (public — called by the KCB gateway)
// ====================================================================
async function handleCallback(req, res) {
  try {
    const cb = req.body && req.body.Body && req.body.Body.stkCallback;
    if (!cb) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const meta = {};
    const items = cb.CallbackMetadata && cb.CallbackMetadata.Item;
    if (Array.isArray(items)) items.forEach(i => { meta[i.Name] = i.Value; });

    const q = { $or: [{ checkoutRequestId: cb.CheckoutRequestID }, { merchantRequestId: cb.MerchantRequestID }] };
    const payment = await db.payments.findOne(q);
    if (payment) {
      const code = Number(cb.ResultCode);
      const success = code === 0;
      await db.payments.update({ _id: payment._id }, { $set: {
        status: success ? 'success' : (code === 1032 ? 'cancelled' : (code === 1037 ? 'timeout' : 'failed')),
        resultCode: cb.ResultCode,
        resultDesc: success ? 'Payment completed successfully' : failureMessage(cb.ResultCode, cb.ResultDesc),
        mpesaReceipt: meta.MpesaReceiptNumber || null,
        phone: meta.PhoneNumber ? String(meta.PhoneNumber) : payment.phone,
        amount: meta.Amount != null ? Number(meta.Amount) : payment.amount,
        completedAt: success ? new Date().toISOString() : null,
        transactionDate: meta.TransactionDate ? parseTransactionDate(meta.TransactionDate) : null,
        callbackAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }});
    }
  } catch (e) { console.error('KCB callback error:', e.message); }
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
}
router.post('/callback', handleCallback);

// ====================================================================
// ADMIN — Wallet: every transaction with its live status
// ====================================================================
router.get('/admin/all', auth, adminOnly, async (req, res) => {
  try {
    const items = await db.payments.find({}).sort({ createdAt: -1 }).limit(500);
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/admin/summary', auth, adminOnly, async (req, res) => {
  try {
    const items = await db.payments.find({});
    const sum = { total: items.length, success: 0, pending: 0, initiated: 0, cancelled: 0, timeout: 0, failed: 0, collected: 0 };
    items.forEach(p => {
      if (sum[p.status] != null) sum[p.status] += 1;
      if (p.status === 'success') sum.collected += Number(p.amount || 0);
    });
    res.json(sum);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
