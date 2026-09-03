import { Resend } from 'resend';
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

// Singleton Pooled Transporter Cache for Nodemailer Fallback
let cachedTransporter = null;

const getSmtpTransporter = (smtpHost, smtpPort, smtpUser, smtpPass) => {
  const isGmail = smtpHost.includes('gmail') || smtpUser.includes('gmail');
  
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
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
 * Uses official Resend SDK as primary provider with Nodemailer SMTP failover.
 * 
 * @param {Object} options
 * @param {string} options.email - Recipient email address
 * @param {string} options.name - Recipient name
 * @param {string} options.otp - 6-digit plain OTP
 */
export const sendOtpEmail = async ({ email, name, otp }) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'GoaRide <onboarding@resend.dev>';

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const rawSmtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '';
  const smtpPass = rawSmtpPass.replace(/\s+/g, '');

  // SERVER-SIDE LOGGING (NEVER LOG API KEYS OR PASSWORDS)
  console.log(`[Email Service] OTP request received for: ${email}`);
  console.log(`[Email Service] OTP generated successfully`);

  // ALWAYS LOG OTP TO SERVER TERMINAL CONSOLE FOR DEV/ADMIN TESTING
  console.log('\n================================================================');
  console.log(`🔐 GOARIDE EMAIL OTP FOR: ${email}`);
  console.log(`🔑 6-DIGIT VERIFICATION OTP: ${otp}`);
  console.log('⏰ EXPIRES IN: 5 MINUTES');
  console.log('================================================================\n');

  const uniqueRef = Date.now().toString().slice(-4);
  const subject = `Your Email Verification Code [${otp}] #${uniqueRef}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#080f1e;color:#e2e8f0;">
  <div style="max-width:460px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:32px;text-align:center;">
    <div style="font-size:26px;font-weight:900;color:#ffffff;margin-bottom:6px;">Goa<span style="color:#f59e0b;">Ride</span></div>
    <div style="font-size:11px;font-weight:800;letter-spacing:1.5px;color:#38bdf8;margin-bottom:24px;">EMAIL VERIFICATION CODE</div>
    <p style="font-size:14px;color:#cbd5e1;margin-bottom:20px;">Hi <strong>${name || 'Rider'}</strong>, use the 6-digit code below to verify your email address:</p>
    <div style="background:#091322;border:1px solid #334155;border-radius:14px;padding:18px;margin:20px 0;">
      <div style="font-family:monospace;font-size:36px;font-weight:900;letter-spacing:10px;color:#38bdf8;">${otp}</div>
      <div style="font-size:11px;color:#f59e0b;margin-top:6px;font-weight:700;">⏳ Valid for 5 minutes</div>
    </div>
    <p style="font-size:12px;color:#64748b;margin-top:24px;">🔒 Security Warning: If you did not request this verification code, please safely ignore this email. Never share your verification code with anyone.</p>
  </div>
</body>
</html>
  `;

  let lastError = null;

  // PROVIDER 1: OFFICIAL RESEND SDK (if RESEND_API_KEY is configured in server/.env)
  if (resendApiKey) {
    console.log('[Email Service] Attempting to send OTP email via Resend SDK...');
    try {
      const resend = new Resend(resendApiKey.trim());
      const { data, error } = await resend.emails.send({
        from: emailFrom,
        to: [email],
        subject,
        html: htmlContent,
      });

      if (error) {
        console.warn(`[Email Service Warning] Resend SDK returned error: ${error.message || JSON.stringify(error)}`);
        lastError = new Error(error.message || 'Resend API failure');
      } else if (data?.id) {
        console.log(`[Email Service Success] Resend response received. OTP email sent successfully to ${email} (ID: ${data.id})`);
        return { sent: true, maskedEmail: maskEmail(email), messageId: data.id };
      }
    } catch (resendErr) {
      console.warn(`[Email Service Warning] Resend SDK invocation failed: ${resendErr.message}`);
      lastError = resendErr;
    }
  }

  // PROVIDER 2: NODEMAILER SMTP FALLBACK (Gmail / Custom SMTP)
  if (smtpUser && smtpPass) {
    console.log(`[Email Service] Attempting delivery via Pooled Nodemailer SMTP for ${smtpUser}...`);
    try {
      const transporter = getSmtpTransporter(smtpHost, smtpPort, smtpUser, smtpPass);

      const info = await transporter.sendMail({
        from: emailFrom || `"GoaRide Security" <${smtpUser}>`,
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

  // NO PROVIDER CONFIGURED OR ALL PROVIDERS FAILED
  const finalError = lastError
    ? new Error(`Email delivery failed: ${lastError.message}`)
    : new Error('Missing RESEND_API_KEY in server/.env. Please configure RESEND_API_KEY or SMTP credentials.');

  console.error(`[Email Service Error] ${finalError.message}`);
  throw finalError;
};

// Legacy compatibility export
export const sendVerificationEmail = sendOtpEmail;
