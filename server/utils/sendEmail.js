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

// Singleton Pooled Transporter Cache for Instant High-Speed Dispatch
let cachedTransporter = null;

const getTransporter = (smtpHost, smtpPort, smtpUser, smtpPass) => {
  const isGmail = smtpHost.includes('gmail') || smtpUser.includes('gmail');
  
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
      service: isGmail ? 'gmail' : undefined,
      host: isGmail ? 'smtp.gmail.com' : smtpHost,
      port: isGmail ? 465 : smtpPort,
      secure: isGmail ? true : (smtpPort === 465),
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 6000,
      greetingTimeout: 6000,
      socketTimeout: 10000,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return cachedTransporter;
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
  const rawSmtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '';
  const smtpPass = rawSmtpPass.replace(/\s+/g, '');
  
  const resendApiKey = process.env.RESEND_API_KEY;
  const brevoApiKey = process.env.BREVO_API_KEY;

  // ALWAYS LOG OTP TO SERVER TERMINAL CONSOLE FOR INSTANT ADMIN/DEV ACCESS
  console.log('\n================================================================');
  console.log(`🔐 GOARIDE EMAIL OTP FOR: ${email}`);
  console.log(`🔑 6-DIGIT VERIFICATION OTP: ${otp}`);
  console.log('⏰ EXPIRES IN: 5 MINUTES');
  console.log('================================================================\n');

  // Unique subject line to prevent Gmail from grouping new codes into old conversation threads
  const uniqueRef = Date.now().toString().slice(-4);
  const subject = `[${otp}] Your GoaRide Verification Code #${uniqueRef}`;

  // Lightweight HTML template for instant delivery
  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#080f1e;color:#e2e8f0;">
  <div style="max-width:460px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:32px;text-align:center;">
    <div style="font-size:26px;font-weight:900;color:#ffffff;margin-bottom:6px;">Goa<span style="color:#f59e0b;">Ride</span></div>
    <div style="font-size:11px;font-weight:800;letter-spacing:1.5px;color:#38bdf8;margin-bottom:24px;">EMAIL VERIFICATION CODE</div>
    <p style="font-size:14px;color:#cbd5e1;margin-bottom:20px;">Hi <strong>${name || 'Rider'}</strong>, use the code below to complete your registration:</p>
    <div style="background:#091322;border:1px solid #334155;border-radius:14px;padding:18px;margin:20px 0;">
      <div style="font-family:monospace;font-size:36px;font-weight:900;letter-spacing:10px;color:#38bdf8;">${otp}</div>
      <div style="font-size:11px;color:#f59e0b;margin-top:6px;font-weight:700;">⏳ Valid for 5 minutes</div>
    </div>
    <p style="font-size:12px;color:#64748b;margin-top:24px;">If you didn't request this code, please safely ignore this email.</p>
  </div>
</body>
</html>
  `;

  let lastError = null;

  // PROVIDER 1: Resend HTTP API (if RESEND_API_KEY exists)
  if (resendApiKey) {
    console.log('[Email Service] Using Resend HTTP REST API for fast dispatch...');
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
        console.log(`[Email Service Success] Delivered via Resend API to ${email} (ID: ${resData.id})`);
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

  // PROVIDER 2: Brevo REST API (if BREVO_API_KEY exists)
  if (brevoApiKey) {
    console.log('[Email Service] Using Brevo REST API for fast dispatch...');
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
        console.log(`[Email Service Success] Delivered via Brevo API to ${email} (ID: ${brevoData.messageId})`);
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

  // PROVIDER 3: High-Speed Pooled Nodemailer SMTP (Gmail / Custom)
  if (smtpUser && smtpPass) {
    console.log(`[Email Service] Fast-dispatching via Pooled Nodemailer SMTP for ${smtpUser}...`);
    const fromEmail = process.env.EMAIL_FROM || `"GoaRide Verification" <goaride@gmail.com>`;

    try {
      const transporter = getTransporter(smtpHost, smtpPort, smtpUser, smtpPass);

      const info = await transporter.sendMail({
        from: fromEmail,
        to: email,
        subject,
        html: htmlContent,
        headers: {
          'X-Entity-Ref-ID': Date.now().toString(),
        },
      });

      console.log(`[Email Service Success] Delivered via SMTP to ${email} (ID: ${info.messageId})`);
      return { sent: true, maskedEmail: maskEmail(email), messageId: info.messageId };
    } catch (smtpErr) {
      console.warn(`[Email Service Warning] Pooled SMTP delivery failed: ${smtpErr.message}`);
      cachedTransporter = null;
      lastError = smtpErr;
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
