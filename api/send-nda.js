// Serverless mailer for the Tezelate NDA signing page (Vercel + Resend).
// Receives the signed PDF + signing details and emails them to both founders.
// Requires env var RESEND_API_KEY (set in Vercel project settings).

const { Resend } = require('resend');

// ---- EDIT THESE TWO IF NEEDED ----
const FROM = 'Tezelate NDA <nda@tezelate.com>';        // must be a Resend-verified domain
const RECIPIENTS = ['fhow@tezelate.com', 'cstagg@tezelate.com'];
// ----------------------------------

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const b = req.body || {};
    if (!b.pdfBase64 || !b.counterparty || !b.signerName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const html = `
      <h2 style="font-family:Arial">Signed NDA received</h2>
      <p style="font-family:Arial"><b>${esc(b.signerName)}</b> (${esc(b.signerTitle || '')}) signed the
      Tezelate Mutual NDA on behalf of <b>${esc(b.counterparty)}</b>. The signed PDF is attached.</p>
      <table style="font-family:Arial;font-size:14px;border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#555">Counterparty</td><td>${esc(b.counterparty)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#555">Signer</td><td>${esc(b.signerName)}, ${esc(b.signerTitle || '')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#555">Signer email</td><td>${esc(b.signerEmail || '')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#555">Company address</td><td>${esc(b.companyAddress || '')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#555">Signed at</td><td>${esc(b.signedAt || '')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#555">IP address</td><td>${esc(b.ip || '')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#555">Method</td><td>${esc(b.method || '')} signature</td></tr>
      </table>`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM,
      to: RECIPIENTS,
      reply_to: b.signerEmail || undefined,
      subject: `Signed NDA — ${b.counterparty}`,
      html,
      attachments: [{ filename: b.filename || 'Signed_NDA.pdf', content: b.pdfBase64 }],
    });
    if (error) return res.status(502).json({ error: error.message || 'send failed' });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'server error' });
  }
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
