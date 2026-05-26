const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const trimTrailingSlash = (url) => url?.replace(/\/$/, "");

const getFrontendUrl = () =>
  trimTrailingSlash(process.env.FRONTEND_URL) || "http://localhost:3000";

const getApiUrl = () =>
  trimTrailingSlash(process.env.API_URL || process.env.BACKEND_URL) ||
  "http://localhost:5002";

const sendVerificationEmail = async ({ to, name, token }) => {
  const verifyUrl = `${getApiUrl()}/api/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to,
    subject: "Verify your Learnly account",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="margin:0;padding:0;background:#f0faf5;font-family:'Segoe UI',sans-serif">
        <div style="max-width:560px;margin:40px auto;background:#ffffff;
          border-radius:16px;overflow:hidden;border:1px solid #dcfce7">

          <!-- Header -->
          <div style="background:#1a7f5a;padding:32px;text-align:center">
            <div style="display:inline-flex;align-items:center;gap:10px">
              <div style="width:36px;height:36px;background:rgba(255,255,255,0.15);
                border-radius:10px;display:inline-flex;align-items:center;
                justify-content:center">
                <span style="color:white;font-size:18px">✓</span>
              </div>
              <span style="color:white;font-size:22px;font-weight:800;
                letter-spacing:-0.5px">
                learn<span style="color:#f0c93a">ly</span>
              </span>
            </div>
          </div>

          <!-- Body -->
          <div style="padding:40px 32px">
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;
              color:#0d3d2a;letter-spacing:-0.5px">
              Welcome to Learnly, ${name}! 👋
            </h1>
            <p style="margin:0 0 24px;color:#4a7a61;font-size:15px;
              line-height:1.6">
              You're one step away from accessing thousands of courses.
              Verify your email to activate your account.
            </p>

            <a href="${verifyUrl}"
              style="display:inline-block;background:#1a7f5a;color:white;
                font-size:15px;font-weight:700;padding:14px 32px;
                border-radius:10px;text-decoration:none;letter-spacing:-0.2px">
              Verify my email →
            </a>

            <p style="margin:24px 0 0;color:#9ca3af;font-size:13px">
              This link expires in 24 hours. If you didn't create an account,
              you can safely ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding:20px 32px;border-top:1px solid #f0faf5;
            text-align:center">
            <p style="margin:0;color:#9ca3af;font-size:12px">
              Stop struggling. Start understanding. —
              <a href="${getFrontendUrl()}"
                style="color:#1a7f5a;text-decoration:none">
                learnly.com
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

const sendPasswordResetEmail = async ({ to, name, token }) => {
  const resetUrl = `${getFrontendUrl()}/reset-password?token=${token}`;

  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to,
    subject: "Reset your Learnly password",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f0faf5;
        font-family:'Segoe UI',sans-serif">
        <div style="max-width:560px;margin:40px auto;background:#ffffff;
          border-radius:16px;overflow:hidden;border:1px solid #dcfce7">

          <div style="background:#1a7f5a;padding:32px;text-align:center">
            <span style="color:white;font-size:22px;font-weight:800">
              learn<span style="color:#f0c93a">ly</span>
            </span>
          </div>

          <div style="padding:40px 32px">
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;
              color:#0d3d2a">
              Reset your password
            </h1>
            <p style="margin:0 0 24px;color:#4a7a61;font-size:15px;
              line-height:1.6">
              Hi ${name}, we received a request to reset your password.
              Click the button below to create a new one.
            </p>

            <a href="${resetUrl}"
              style="display:inline-block;background:#1a7f5a;color:white;
                font-size:15px;font-weight:700;padding:14px 32px;
                border-radius:10px;text-decoration:none">
              Reset my password →
            </a>

            <p style="margin:24px 0 0;color:#9ca3af;font-size:13px">
              This link expires in 1 hour. If you didn't request this,
              ignore this email — your password won't change.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
