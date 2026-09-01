import nodemailer from 'nodemailer';

/**
 * Sends a real verification email to a newly registered User.
 * 
 * @param {Object} options
 * @param {string} options.email - Recipient email address
 * @param {string} options.name - Recipient name
 * @param {string} options.token - Unhashed verification token
 * @param {string} options.role - 'USER' or 'ADMIN'
 */
export const sendVerificationEmail = async ({ email, name, token, role = 'USER' }) => {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
  const fromEmail = process.env.EMAIL_FROM || `"GoaRide Verification" <${smtpUser || 'no-reply@goaride.com'}>`;

  const verificationUrl = `${clientUrl}/verify-email/${token}`;
  const isAdmin = role?.toUpperCase() === 'ADMIN';

  // ALWAYS LOG VERIFICATION LINK TO SERVER TERMINAL CONSOLE
  console.log('\n================================================================');
  console.log(`✉️ GOARIDE EMAIL VERIFICATION FOR: ${email}`);
  console.log(`🔗 VERIFICATION LINK: ${verificationUrl}`);
  console.log('================================================================\n');

  const subject = isAdmin
    ? 'Verify your GoaRide Admin Account'
    : 'Verify your GoaRide email address';

  const badgeText = isAdmin ? 'ADMINISTRATOR ACTION REQUIRED' : 'EMAIL VERIFICATION';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0b1727;
      color: #e2e8f0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #0f1d32;
      border: 1px solid #1e293b;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      padding: 35px 30px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -1px;
      text-decoration: none;
    }
    .logo span {
      color: #f59e0b;
    }
    .badge {
      display: inline-block;
      margin-top: 12px;
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #ffffff;
    }
    .body {
      padding: 35px 30px;
      color: #cbd5e1;
      font-size: 15px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 12px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      padding: 16px 36px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #0f172a !important;
      font-weight: 800;
      font-size: 15px;
      text-decoration: none;
      border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3);
      transition: all 0.2s ease;
    }
    .url-box {
      background: #091322;
      border: 1px solid #1e293b;
      padding: 14px;
      border-radius: 10px;
      word-break: break-all;
      font-size: 12px;
      color: #38bdf8;
      margin-top: 20px;
    }
    .footer {
      background: #091322;
      padding: 24px 30px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #1e293b;
    }
    .warning {
      color: #f59e0b;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Goa<span>Ride</span></div>
      <div class="badge">${badgeText}</div>
    </div>
    
    <div class="body">
      <div class="greeting">Hello ${name || 'Rider'},</div>
      <p>Thank you for signing up with <strong>GoaRide</strong> — Goa's premier self-drive vehicle rental platform.</p>
      
      <p>Please click the button below to verify your email address and activate your account.</p>
      
      <div class="btn-container">
        <a href="${verificationUrl}" class="btn" target="_blank">Verify Email Address</a>
      </div>

      <p class="warning">⚠️ Note: This verification link will expire in 30 minutes for security reasons.</p>
      
      <p>If the button above does not work, copy and paste the following link into your web browser:</p>
      <div class="url-box">${verificationUrl}</div>

      <p style="margin-top: 30px; font-size: 13px; color: #94a3b8;">If you did not register for a GoaRide account, please ignore this email.</p>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} GoaRide Vehicle Rentals Pvt. Ltd. • Panaji, Goa<br>
      Automated Security Verification Email • Do Not Reply
    </div>
  </div>
</body>
</html>
  `;

  let transporter;
  let isEthereal = false;

  if (smtpUser && smtpPass) {
    // Configured real SMTP Transporter (e.g. Gmail / Outlook / Custom SMTP)
    transporter = nodemailer.createTransport({
      service: smtpHost.includes('gmail') ? 'gmail' : undefined,
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  } else {
    // Auto Ethereal SMTP Test Transporter (if .env keys are not provided)
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isEthereal = true;
    } catch (e) {
      console.warn('Ethereal test account generation skipped:', e.message);
    }
  }

  if (!transporter) {
    return { verificationUrl, sent: false, reason: 'SMTP not configured in server/.env' };
  }

  try {
    const mailOptions = {
      from: fromEmail,
      to: email,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    const etherealPreviewUrl = isEthereal ? nodemailer.getTestMessageUrl(info) : null;

    if (etherealPreviewUrl) {
      console.log(`📫 Ethereal Test Email Preview URL: ${etherealPreviewUrl}`);
    } else {
      console.log(`✅ Real Verification Email delivered to ${email} (MessageID: ${info.messageId})`);
    }

    return {
      verificationUrl,
      sent: true,
      info,
      etherealPreviewUrl,
    };
  } catch (error) {
    console.error(`❌ Email delivery attempt to ${email} failed:`, error.message);
    return { verificationUrl, sent: false, error: error.message };
  }
};
