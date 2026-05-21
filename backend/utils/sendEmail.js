const nodemailer = require('nodemailer');

/**
 * Helper to generate a highly-polished HTML email template for OTPs
 * @param {string} userName - The name of the user
 * @param {string} otp - The 6-digit OTP code
 * @param {string} purpose - The purpose of the OTP (e.g. registration, login 2FA, password change)
 */
const getOtpTemplate = (userName, otp, purpose) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Code</title>
        <style>
          body {
            font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .email-container {
            max-width: 580px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 0 1px 0 rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(226, 232, 240, 0.8);
          }
          .header-banner {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            color: #ffffff;
          }
          .logo-text {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin: 0;
            display: inline-flex;
            align-items: center;
          }
          .logo-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 800;
            margin-right: 8px;
          }
          .header-title {
            font-size: 20px;
            font-weight: 600;
            margin-top: 15px;
            margin-bottom: 0;
            opacity: 0.95;
          }
          .content-body {
            padding: 40px 35px;
            color: #334155;
            line-height: 1.6;
          }
          .greeting {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 12px;
          }
          .intro-text {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 25px;
          }
          .otp-card {
            background-color: #f0fdf4;
            border: 2px dashed #86efac;
            border-radius: 20px;
            padding: 25px 15px;
            text-align: center;
            margin: 25px 0;
          }
          .otp-code {
            font-size: 38px;
            font-weight: 800;
            letter-spacing: 6px;
            color: #047857;
            margin: 0;
            font-family: 'Courier New', Courier, monospace;
          }
          .otp-purpose {
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            color: #059669;
            letter-spacing: 1.5px;
            margin-top: 8px;
            display: block;
          }
          .warning-text {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 25px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          .footer {
            background-color: #f8fafc;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            font-size: 11px;
            color: #94a3b8;
          }
          .footer-links a {
            color: #10b981;
            text-decoration: none;
            margin: 0 8px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header-banner">
            <div>
              <span class="logo-badge">E</span>
              <span class="logo-text">Expensify Finance</span>
            </div>
            <h1 class="header-title">Security Verification</h1>
          </div>
          <div class="content-body">
            <h2 class="greeting">Hello, ${userName}</h2>
            <p class="intro-text">
              To secure your Expensify account, we've generated a secure One-Time Password (OTP) for your request: <strong>${purpose}</strong>.
            </p>
            
            <div class="otp-card">
              <p class="otp-code">${otp}</p>
              <span class="otp-purpose">Verification Code</span>
            </div>
            
            <p class="intro-text" style="text-align: center;">
              This code will expire in <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email or update your password.
            </p>
            
            <div class="warning-text">
              🔒 <strong>Expensify Protection:</strong> We will never ask for your password, secure keys, or OTP code over call or chat. Please do not share this code with anyone.
            </div>
          </div>
          <div class="footer">
            <p>Designed with ❤️ by Expensify Finance in 2026</p>
            <p class="footer-links">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Dashboard</a> • 
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/settings">Security Settings</a>
            </p>
            <p style="margin-top: 15px; font-size: 10px; opacity: 0.8;">&copy; 2026 Expensify Finance. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Send an OTP verification email using SMTP
 */
const sendOtpEmail = async ({ email, name, otp, purpose }) => {
  const smtpUser = (process.env.SMTP_USER || '').replace(/^['"]|['"]$/g, '');
  const smtpPass = (process.env.SMTP_PASS || '').replace(/^['"]|['"]$/g, '');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const mailOptions = {
    from: `"Expensify Finance" <${smtpUser}>`,
    to: email,
    subject: `[Expensify] ${otp} is your verification code`,
    html: getOtpTemplate(name, otp, purpose),
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('OTP Email sent successfully: %s', info.messageId);
  return info;
};

module.exports = {
  sendOtpEmail,
};
