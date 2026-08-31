/**
 * Professional PDF payment receipt — ELIMUmaterial (PDFKit).
 */
const PDFDocument = require('pdfkit');

const BRAND = '#1e3a8a';
const ACCENT = '#f59e0b';
const GREEN = '#059669';
const MUTED = '#64748b';
const BORDER = '#e2e8f0';

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString('en-KE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Nairobi'
    });
  } catch { return String(iso || '-'); }
}

function buildReceipt(res, payment, user) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `attachment; filename="ELIMUmaterial-Receipt-${payment.reference}.pdf"`);
    doc.pipe(res);

    const W = doc.page.width;   // 595.28
    const MX = 56;              // horizontal margin
    const CW = W - MX * 2;      // content width

    // ---- Header band ----
    doc.rect(0, 0, W, 128).fill(BRAND);
    doc.rect(0, 128, W, 5).fill(ACCENT);

    // Logo mark
    doc.roundedRect(MX, 34, 54, 54, 13).fill(ACCENT);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(28)
       .text('E', MX, 45, { width: 54, align: 'center' });

    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(21)
       .text('ELIMU', MX + 66, 42, { continued: true })
       .fillColor(ACCENT).text('material');
    doc.fillColor('rgba(255,255,255,0.85)').font('Helvetica').fontSize(10.5)
       .text('Kenyan University Study Materials Platform', MX + 66, 70);

    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(17)
       .text('PAYMENT RECEIPT', 0, 46, { width: W - MX, align: 'right' });
    doc.font('Helvetica').fontSize(9.5).fillColor('rgba(255,255,255,0.85)')
       .text(`Receipt No: ${payment.reference}`, 0, 70, { width: W - MX, align: 'right' })
       .text(`Issued: ${fmtDate(new Date().toISOString())}`, 0, 84, { width: W - MX, align: 'right' });

    // ---- PAID badge ----
    doc.roundedRect(W - MX - 92, 148, 92, 26, 13).fill(GREEN);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12)
       .text('PAID', W - MX - 92, 155, { width: 92, align: 'center' });

    // ---- Billed to ----
    let y = 148;
    doc.fillColor(BRAND).font('Helvetica-Bold').fontSize(10.5).text('BILLED TO', MX, y);
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(13)
       .text(user.fullName || 'Student', MX, y + 16);
    doc.fillColor(MUTED).font('Helvetica').fontSize(10.5)
       .text(user.email || payment.userEmail || '-', MX, y + 33)
       .text(`M-PESA: ${payment.phone || '-'}`, MX, y + 48);

    // ---- Amount box ----
    y = 224;
    doc.roundedRect(MX, y, CW, 66, 12).fill('#f1f5f9');
    doc.fillColor(MUTED).font('Helvetica').fontSize(10)
       .text('AMOUNT PAID', MX + 20, y + 14);
    doc.fillColor(BRAND).font('Helvetica-Bold').fontSize(24)
       .text(`KES ${Number(payment.amount).toFixed(2)}`, MX + 20, y + 30);
    doc.fillColor(MUTED).font('Helvetica').fontSize(10)
       .text('Course notes unlock — all units', 0, y + 26, { width: W - MX - 20, align: 'right' });

    // ---- Details table ----
    y = 318;
    doc.fillColor(BRAND).font('Helvetica-Bold').fontSize(10.5).text('TRANSACTION DETAILS', MX, y);
    y += 16;

    const rows = [
      ['M-PESA Receipt No.', payment.mpesaReceipt || '-'],
      ['ELIMU Reference', payment.reference],
      ['Invoice Number', payment.invoiceNumber || '-'],
      ['Payment Date', fmtDate(payment.completedAt || payment.updatedAt)],
      ['Payment Method', 'M-PESA (KCB STK Push)'],
      ['Institution', payment.universityName || '-'],
      ['Faculty', payment.facultyName || '-'],
      ['Course Unlocked', payment.courseName || payment.courseId || '-'],
      ['Access', 'Unlimited downloads of all unit notes & past papers for this course'],
      ['Status', 'SUCCESS']
    ];

    rows.forEach(([label, value], i) => {
      const rh = 30;
      if (i % 2 === 0) doc.rect(MX, y, CW, rh).fill('#f8fafc');
      doc.fillColor(MUTED).font('Helvetica').fontSize(9.5)
         .text(label, MX + 14, y + 9, { width: 190 });
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5)
         .text(String(value), MX + 208, y + 9, { width: CW - 208 - 14 });
      y += rh;
    });

    doc.rect(MX, 318 + 16, CW, rows.length * 30).lineWidth(1).strokeColor(BORDER).stroke();

    // ---- Thank-you note ----
    y += 22;
    doc.fillColor('#0f172a').font('Helvetica').fontSize(9.5)
       .text('Thank you for your purchase. This receipt confirms your payment and unlocks downloads for every unit in the course above. Keep this receipt for your records — you may re-download it anytime from your dashboard.', MX, y, { width: CW, lineGap: 3 });

    // ---- Footer band ----
    doc.rect(0, 800, W, 42).fill(BRAND);
    doc.fillColor('#ffffff').font('Helvetica').fontSize(8.5)
       .text('ELIMUmaterial · support@elimumaterial.co.ke · Payments processed securely via KCB Bank (Buni) · © 2026 ELIMUmaterial',
         0, 816, { width: W, align: 'center' });

    doc.end();
  });
}

module.exports = { buildReceipt };
