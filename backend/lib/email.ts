import { Resend } from 'resend';

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("⚠️ RESEND_API_KEY is missing. Email features will not work.");
}

export async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
  if (!resend) {
    console.error('[Email] Resend client not initialized (missing API key)');
    return false;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: 'Arcane Vault <noreply@resend.dev>',
      to: [to],
      subject: 'Your Arcane Vault OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981; text-align: center;">🔐 Arcane Vault</h1>
          <div style="background: #1a1a1a; border-radius: 12px; padding: 30px; text-align: center;">
            <p style="color: #888; margin-bottom: 20px;">Your verification code is:</p>
            <h2 style="color: #10b981; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h2>
            <p style="color: #666; margin-top: 20px; font-size: 14px;">This code expires in 5 minutes.</p>
          </div>
          <p style="color: #666; text-align: center; margin-top: 20px; font-size: 12px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[Email] Failed to send OTP:', error);
      return false;
    }

    console.log('[Email] OTP sent successfully to:', to, 'messageId:', data?.id);
    return true;
  } catch (err) {
    console.error('[Email] Error sending OTP:', err);
    return false;
  }
}

export async function sendEmailChangeVerification(to: string, newEmail: string, verificationLink: string): Promise<boolean> {
  if (!resend) {
    console.error('[Email] Resend client not initialized (missing API key)');
    return false;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: 'Arcane Vault <noreply@resend.dev>',
      to: [to],
      subject: 'Confirm Your Email Change - Arcane Vault',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981; text-align: center;">📧 Email Change Request</h1>
          <div style="background: #1a1a1a; border-radius: 12px; padding: 30px; text-align: center;">
            <p style="color: #888; margin-bottom: 20px;">You requested to change your email to:</p>
            <p style="color: #10b981; font-size: 18px; font-weight: bold;">${newEmail}</p>
            <a href="${verificationLink}" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Confirm Change
            </a>
          </div>
          <p style="color: #666; text-align: center; margin-top: 20px; font-size: 12px;">
            If you didn't request this change, please ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[Email] Failed to send email change verification:', error);
      return false;
    }

    console.log('[Email] Email change verification sent to:', to, 'messageId:', data?.id);
    return true;
  } catch (err) {
    console.error('[Email] Error sending email change verification:', err);
    return false;
  }
}
