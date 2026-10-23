/*
 * Account email (verification and reset links). Sent through Resend when RESEND_API_KEY is set, from MAIL_FROM
 * (default no-reply@mail.vexadigital.in). Otherwise it goes to ACCOUNT_MAIL_WEBHOOK_URL, if that is set.
 */
const DEFAULT_FROM = "Vexa Digital <no-reply@mail.vexadigital.in>";

export const mailReady = () => Boolean(process.env.RESEND_API_KEY || process.env.ACCOUNT_MAIL_WEBHOOK_URL);

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type Mail = {
  to: string;
  subject: string;
  /** Plain-text version of the message. */
  text: string;
  link: string;
  /** Shown as the large heading of the HTML version. */
  heading?: string;
  /** The sentence or two above the button. */
  body?: string;
  /** The label on the button. */
  button?: string;
  /** Small print under the button. */
  note?: string;
};

/** A simple, table-based layout so it looks the same in Gmail, Outlook and phone mail apps. */
function html(mail: Mail): string {
  const heading = escape(mail.heading ?? mail.subject);
  const body = escape(mail.body ?? mail.text.split("\n\n")[0]);
  const button = escape(mail.button ?? "Open the link");
  const note = escape(mail.note ?? "If you did not ask for this, you can ignore this email.");
  const url = escape(mail.link);
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#eef7f6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef7f6;padding:32px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="padding:0 4px 18px;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;letter-spacing:.04em;color:#0B7F7C">Vexa <span style="font-weight:400;color:#064B4A">Digital</span></td></tr>
<tr><td style="background:#ffffff;border-radius:16px;border:1px solid #d3e6e4;padding:36px 32px;font-family:Arial,Helvetica,sans-serif;color:#12292a">
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;font-weight:700;color:#064B4A">${heading}</h1>
<p style="margin:0 0 28px;font-size:16px;line-height:1.65;color:#3d5352">${body}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px"><tr><td style="background:#0B7F7C;border-radius:999px"><a href="${url}" style="display:inline-block;padding:14px 30px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none">${button}</a></td></tr></table>
<p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:#5E7473">Button not working? Copy this address into your browser:</p>
<p style="margin:0 0 24px;font-size:13px;line-height:1.6;word-break:break-all"><a href="${url}" style="color:#0B7F7C">${url}</a></p>
<p style="margin:0;padding-top:20px;border-top:1px solid #e3eeed;font-size:13px;line-height:1.6;color:#5E7473">${note}</p>
</td></tr>
<tr><td style="padding:18px 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6b8180">Vexa Digital is a trade name used by Blue Wings.<br>This is an automatic message, so please do not reply to it.</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/** Sends one account email. False when no mail service is set up or the send failed. */
export async function sendAccountMail(mail: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ from: process.env.MAIL_FROM || DEFAULT_FROM, to: [mail.to], subject: mail.subject, text: mail.text, html: html(mail) }),
        signal: AbortSignal.timeout(8000),
        redirect: "error",
      });
      if (!res.ok) console.error(`mail: Resend refused the message (${res.status})`);
      return res.ok;
    } catch {
      console.error("mail: could not reach Resend");
      return false;
    }
  }

  const url = process.env.ACCOUNT_MAIL_WEBHOOK_URL;
  if (!url) return false;
  try {
    const token = process.env.ACCOUNT_MAIL_WEBHOOK_TOKEN;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(mail),
      signal: AbortSignal.timeout(5000),
      redirect: "error",
    });
    return res.ok;
  } catch {
    return false;
  }
}
