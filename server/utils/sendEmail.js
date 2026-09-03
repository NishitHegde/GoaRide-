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
 * Multi-Provider Waterfall Delivery:
 * 1. Gmail / Nodemailer SMTP (if SMTP_USER & SMTP_PASSWORD exist)
 * 2. Resend API (if RESEND_API_KEY exists)
 * 3. Brevo REST API (if BREVO_API_KEY exists)
 * 
 * Safe server logs only (Never logs OTPs, passwords, or API keys).
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
  // Clean app password by removing any space characters (e.g. "wsfo tebr urdm gjse" -> "wsfotebrurdmgjse")
  const rawSmtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '';
  const smtpPass = rawSmtpPass.replace(/\s+/g, '');
  
  const resendApiKey = process.env.RESEND_API_KEY;
  const brevoApiKey = process.env.BREVO_API_KEY;

  console.log(`[Email Service] Attempting to send verification OTP email to: ${email}`);

  const subject = 'Verify your email address';

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

  let lastError = null;

  // PROVIDER CHOICE 1: Gmail / Nodemailer SMTP (Tested & Verified Working)
  if (smtpUser && smtpPass) {
    console.log(`[Email Service] Attempting delivery via Nodemailer SMTP (${smtpHost}:${smtpPort}) for ${smtpUser}...`);
    const fromEmail = `"GoaRide Verification" <${smtpUser}>`;

    try {
      const transporter = nodemailer.createTransport({
        service: (smtpHost.includes('gmail') || smtpUser.includes('gmail')) ? 'gmail' : undefined,
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

      const info = await transporter.sendMail({
        from: fromEmail,
        to: email,
        subject,
        html: htmlContent,
      });

      console.log(`[Email Service Success] Delivered via SMTP to ${email} (Message ID: ${info.messageId})`);
      return { sent: true, maskedEmail: maskEmail(email), messageId: info.messageId };
    } catch (smtpErr) {
      console.warn(`[Email Service Warning] SMTP delivery failed to ${email}: ${smtpErr.message}`);
      lastError = smtpErr;
    }
  }

  // PROVIDER CHOICE 2: Resend HTTP API (Fallback / Alternative)
  if (resendApiKey) {
    console.log('[Email Service] Attempting delivery via Resend API...');
    const fromAddress = process.env.EMAIL_FROM || 'GoaRide <onboarding@resend.dev>';
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey.trim()}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [email],
          subject,
          html: htmlContent,
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        console.log(`[Email Service Success] Delivered via Resend API to ${email} (Message ID: ${resData.id})`);
        return { sent: true, maskedEmail: maskEmail(email), messageId: resData.id };
      } else {
        const errorMsg = resData.message || JSON.stringify(resData);
        console.warn(`[Email Service Warning] Resend API error: ${errorMsg}`);
        lastError = new Error(`Resend API error: ${errorMsg}`);
      }
    } catch (resendErr) {
      console.warn(`[Email Service Warning] Resend API fetch failed: ${resendErr.message}`);
      lastError = resendErr;
    }
  }

  // PROVIDER CHOICE 3: Brevo REST API
  if (brevoApiKey) {
    console.log('[Email Service] Attempting delivery via Brevo API...');
    const fromAddress = process.env.EMAIL_FROM || smtpUser || 'no-reply@goaride.com';
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': brevoApiKey.trim(),
        },
        body: JSON.stringify({
          sender: { name: 'GoaRide Verification', email: fromAddress },
          to: [{ email, name: name || 'Rider' }],
          subject,
          htmlContent,
        }),
      });

      const brevoData = await response.json();
      if (response.ok) {
        console.log(`[Email Service Success] Delivered via Brevo API to ${email} (Message ID: ${brevoData.messageId})`);
        return { sent: true, maskedEmail: maskEmail(email), messageId: brevoData.messageId };
      } else {
        const errorMsg = brevoData.message || JSON.stringify(brevoData);
        console.warn(`[Email Service Warning] Brevo API error: ${errorMsg}`);
        lastError = new Error(`Brevo API error: ${errorMsg}`);
      }
    } catch (brevoErr) {
      console.warn(`[Email Service Warning] Brevo API delivery failed: ${brevoErr.message}`);
      lastError = brevoErr;
    }
  }

  // ALL PROVIDERS FAILED OR UNCONFIGURED
  const finalError = lastError
    ? new Error(`Email delivery failed: ${lastError.message}`)
    : new Error('No production email provider configured. Please check SMTP_USER & SMTP_PASSWORD in server/.env');

  console.error(`[Email Service Error] ${finalError.message}`);
  throw finalError;
};

// Legacy compatibility export
export const sendVerificationEmail = sendOtpEmail;
