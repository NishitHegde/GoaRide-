import nodemailer from 'nodemailer';

/**
 * Helper to mask email for UI display (e.g. n****@gmail.com)
 */
export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}****@${domain}`;
  }
  return `${localPart[0]}${'*'.repeat(Math.min(localPart.length - 2, 4))}${localPart[localPart.length - 1]}@${domain}`;
};

/**
 * Sends a real 6-digit verification OTP email to a newly registered or logging-in User.
 * 
 * @param {Object} options
 * @param {string} options.email - Recipient email address
 * @param {string} options.name - Recipient name
 * @param {string} options.otp - 6-digit plain OTP
 */
export const sendOtpEmail = async ({ email, name, otp }) => {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  const fromEmail = process.env.EMAIL_FROM || `"GoaRide Verification" <${smtpUser || 'no-reply@goaride.com'}>`;

  // Always log OTP to server terminal console for instant dev access / debugging
  console.log('\n================================================================');
  console.log(`🔐 GOARIDE EMAIL OTP FOR: ${email}`);
  console.log(`🔑 6-DIGIT VERIFICATION OTP: ${otp}`);
  console.log('⏰ EXPIRES IN: 5 MINUTES');
  console.log('================================================================\n');

  const subject = 'Verify your email address';
  const formattedOtp = otp.toString().split('').join(' ');

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
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      background-color: #080f1e;
      color: #e2e8f0;
    }
    .container {
      max-width: 520px;
      margin: 36px auto;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      padding: 32px;
      text-align: center;
    }
    .brand {
      font-size: 30px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .brand span {
      color: #f59e0b;
    }
    .badge {
      display: inline-block;
      margin-top: 10px;
      padding: 4px 14px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #ffffff;
    }
    .body {
      padding: 36px 32px;
      color: #cbd5e1;
      font-size: 15px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 12px;
    }
    .otp-card {
      background: #091322;
      border: 2px border-amber-500/30;
      border-radius: 18px;
      padding: 24px;
      text-align: center;
      margin: 28px 0;
      border: 1px solid #334155;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 12px;
      color: #38bdf8;
      margin: 8px 0;
      text-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
    }
    .timer-badge {
      font-size: 12px;
      font-weight: 700;
      color: #f59e0b;
      margin-top: 6px;
    }
    .footer {
      background: #080f1e;
      padding: 20px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #1e293b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Goa<span>Ride</span></div>
      <div class="badge">EMAIL VERIFICATION CODE</div>
    </div>

    <div class="body">
      <div class="greeting">Hi ${name || 'Rider'},</div>
      <p>Here is your 6-digit email verification code to activate your GoaRide account:</p>

      <div class="otp-card">
        <div style="font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 1px;">YOUR 6-DIGIT VERIFICATION CODE</div>
        <div class="otp-code">${otp}</div>
        <div class="timer-badge">⏳ Valid for 5 minutes only</div>
      </div>

      <p style="font-size: 13px; color: #94a3b8;">
        Enter this 6-digit code on the GoaRide verification screen to complete your registration.
      </p>

      <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
        🔒 Security Warning: If you did not request this verification code, please safely ignore this email. Never share your verification code with anyone.
      </p>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} GoaRide Rentals Pvt. Ltd. • Panaji, Goa<br>
      Automated Security Email • Do Not Reply
    </div>
  </div>
</body>
</html>
  `;

  let transporter;
  let isEthereal = false;

  if (smtpUser && smtpPass) {
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
      console.warn('Ethereal test account skipped:', e.message);
    }
  }

  if (!transporter) {
    return { sent: false, maskedEmail: maskEmail(email) };
  }

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject,
      html: htmlContent,
    });

    const etherealPreviewUrl = isEthereal ? nodemailer.getTestMessageUrl(info) : null;
    if (etherealPreviewUrl) {
      console.log(`📫 Ethereal Test Email Preview: ${etherealPreviewUrl}`);
    } else {
      console.log(`✅ 6-Digit OTP Email delivered to ${email} (MessageID: ${info.messageId})`);
    }

    return {
      sent: true,
      maskedEmail: maskEmail(email),
      etherealPreviewUrl,
    };
  } catch (error) {
    console.error(`❌ OTP Email delivery attempt to ${email} failed:`, error.message);
    return { sent: false, maskedEmail: maskEmail(email), error: error.message };
  }
};

// Legacy compatibility helper
export const sendVerificationEmail = sendOtpEmail;
