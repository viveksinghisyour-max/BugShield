import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import settings

logger = logging.getLogger("bugshield.email")


def is_smtp_configured() -> bool:
    """Check if SMTP credentials are fully provided."""
    return bool(settings.smtp_host and settings.smtp_user and settings.smtp_password)


def send_otp_email(recipient_email: str, otp_code: str) -> tuple[bool, str]:
    """
    Sends a 6-digit OTP code to the recipient email address via SMTP.
    Returns (success: bool, message: str).
    """
    if not is_smtp_configured():
        logger.warning(
            "SMTP is not configured in backend/.env. "
            "Please configure SMTP_HOST, SMTP_USER, and SMTP_PASSWORD to send real emails."
        )
        return False, "SMTP is not configured. Email was not dispatched."

    from_addr = settings.smtp_from_email or settings.smtp_user
    subject = f"BugShield — Your Verification Code: {otp_code}"

    # Plain text version
    text_content = f"""Hello,

Your BugShield verification code is: {otp_code}

This code is valid for 5 minutes and can only be used once (maximum 3 attempts).
If you did not request this verification code, please ignore this email.

— BugShield Security Team
https://bugshield.io
"""

    # HTML version with modern dark-themed BugShield cyber branding
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BugShield Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050811; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #050811; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%); padding: 30px 40px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 10px 14px; margin-bottom: 12px;">
                <span style="font-size: 28px; line-height: 1;">🛡️</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">BugShield</h1>
              <p style="margin: 4px 0 0; color: #bfdbfe; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">AI Security Scanner</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 40px 24px; text-align: center;">
              <h2 style="margin: 0 0 12px; color: #ffffff; font-size: 20px; font-weight: 700;">Account Verification</h2>
              <p style="margin: 0 0 28px; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                Use the 6-digit one-time password below to sign in or complete your registration.
              </p>

              <!-- OTP Code Display -->
              <div style="background-color: #030712; border: 1px solid #3b82f6; border-radius: 12px; padding: 18px 24px; margin: 0 auto 28px; display: inline-block; box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #60a5fa; margin-left: 8px;">
                  {otp_code}
                </span>
              </div>

              <!-- Security Warning Badge -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 12px 16px; text-align: left;">
                    <p style="margin: 0; color: #e2e8f0; font-size: 12px; line-height: 1.5;">
                      ⏱️ <strong>Valid for:</strong> 5 minutes<br>
                      🔒 <strong>Security:</strong> Maximum 3 verification attempts<br>
                      ⚠️ <strong>Never share:</strong> BugShield staff will never ask for this code
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                If you did not request this email, someone may have entered your address by mistake. Your account remains safe and no action is required.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #070d19; padding: 20px 40px; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; color: #475569; font-size: 11px;">
                &copy; BugShield AI Security Platform. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"BugShield Security <{from_addr}>"
    msg["To"] = recipient_email

    msg.attach(MIMEText(text_content, "plain", "utf-8"))
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        if settings.smtp_ssl:
            with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=10) as server:
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
                if settings.smtp_tls:
                    server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)

        logger.info(f"Verification email successfully dispatched to {recipient_email}")
        return True, "Verification email successfully sent."
    except Exception as exc:
        err_msg = f"Failed to send email via SMTP ({settings.smtp_host}:{settings.smtp_port}): {exc}"
        logger.error(err_msg)
        return False, err_msg
