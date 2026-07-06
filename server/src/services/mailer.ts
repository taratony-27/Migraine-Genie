import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASS = process.env.SMTP_PASS!;
const MAIL_FROM = process.env.MAIL_FROM!;

if (!SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
  console.warn("Mailer env vars missing. Check SMTP_USER/SMTP_PASS/MAIL_FROM in your .env");
}

// Brevo (Sendinblue) SMTP relay
export const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: SMTP_USER, // your Brevo account email
    pass: SMTP_PASS, // your Brevo SMTP key (not account password)
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