import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST!;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASS = process.env.SMTP_PASS!;
const MAIL_FROM = process.env.MAIL_FROM!; // e.g. "AI Health Tracker <no-reply@yourdomain.com>"

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
  // don't throw at import time in prod builds, but make it loud
  console.warn("Mailer env vars missing. Check SMTP_HOST/SMTP_USER/SMTP_PASS/MAIL_FROM.");
}

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for 587/25
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendVerificationEmail(opts: {
  to: string;
  name: string;
  verifyUrl: string;
}) {
  const { to, name, verifyUrl } = opts;

  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject: "Verify your email",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <p>Hi ${escapeHtml(name)},</p>
        <p>Please verify your email by clicking the button below:</p>
        <p>
          <a href="${verifyUrl}"
             style="display:inline-block;padding:10px 14px;background:#1565c0;color:#fff;text-decoration:none;border-radius:6px">
            Verify Email
          </a>
        </p>
        <p>If the button doesn't work, open this link:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link expires soon for security.</p>
      </div>
    `,
  });
}

// minimal HTML escape
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => {
    const m: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return m[c] ?? c;
  });
}