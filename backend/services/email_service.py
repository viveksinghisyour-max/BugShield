import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import requests
from config import settings

logger = logging.getLogger("bugshield.email")


def is_email_configured() -> bool:
    """Check if any email provider is configured (HTTP API or SMTP)."""
    return bool(
        getattr(settings, "resend_api_key", "")
        or getattr(settings, "brevo_api_key", "")
        or (settings.smtp_host and settings.smtp_user and settings.smtp_password)
    )


def is_smtp_configured() -> bool:
    return is_email_configured()


def _send_via_resend(recipient_email: str, subject: str, html_content: str, text_content: str) -> tuple[bool, str]:
    """Dispatches email via Resend HTTPS API (Port 443 - works on Render free tier)."""
    try:
        from_email = settings.smtp_from_email or "BugShield <onboarding@resend.dev>"
        res = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.resend_api_key.strip()}",
                "Content-Type": "application/json",
            },
            json={
                "from": from_email,
                "to": [recipient_email],
                "subject": subject,
                "html": html_content,
                "text": text_content,
            },
            timeout=10.0,
        )
        if res.status_code in (200, 201):
            logger.info(f"Verification email dispatched via Resend to {recipient_email}")
            return True, "Verification email successfully sent via Resend API."
        err_detail = res.text
        logger.error(f"Resend API error: {err_detail}")
        return False, f"Resend API error: {err_detail}"
    except Exception as exc:
        logger.error(f"Failed to send email via Resend: {exc}")
        return False, f"Resend request failed: {exc}"


def _send_via_brevo(recipient_email: str, subject: str, html_content: str, text_content: str) -> tuple[bool, str]:
    """Dispatches email via Brevo HTTPS API (Port 443 - works on Render free tier)."""
    try:
        from_email = settings.smtp_from_email or settings.smtp_user or "security@bugshield.io"
        res = requests.post(
            "https://api.brevo.com/v3/smtp/email",
            headers={
                "api-key": settings.brevo_api_key.strip(),
                "Content-Type": "application/json",
            },
            json={
                "sender": {"name": "BugShield Security", "email": from_email},
                "to": [{"email": recipient_email}],
                "subject": subject,
                "htmlContent": html_content,
                "textContent": text_content,
            },
            timeout=10.0,
        )
        if res.status_code in (200, 201):
            logger.info(f"Verification email dispatched via Brevo to {recipient_email}")
            return True, "Verification email successfully sent via Brevo API."
        err_detail = res.text
        logger.error(f"Brevo API error: {err_detail}")
        return False, f"Brevo API error: {err_detail}"
    except Exception as exc:
        logger.error(f"Failed to send email via Brevo: {exc}")
        return False, f"Brevo request failed: {exc}"


def send_otp_email(recipient_email: str, otp_code: str) -> tuple[bool, str]:
    """
    Sends a 6-digit OTP code to the recipient email address.
    Supports Resend API (HTTPS), Brevo API (HTTPS), and standard SMTP.
    Returns (success: bool, message: str).
    """
    if not is_email_configured():
        logger.warning(
            "No email service configured in backend/.env. "
            "Please configure RESEND_API_KEY, BREVO_API_KEY, or SMTP credentials to send real emails."
        )
        return False, "No email service configured. Email was not dispatched."

    from_addr = settings.smtp_from_email or settings.smtp_user or "no-reply@bugshield.io"
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

    # 1. Prefer HTTPS API (Resend) if configured (Port 443 - never blocked by cloud providers)
    if getattr(settings, "resend_api_key", None):
        return _send_via_resend(recipient_email, subject, html_content, text_content)

    # 2. Prefer HTTPS API (Brevo) if configured (Port 443 - never blocked by cloud providers)
    if getattr(settings, "brevo_api_key", None):
        return _send_via_brevo(recipient_email, subject, html_content, text_content)

    # 3. Standard SMTP fallback (works on local machine or unblocked cloud hosts)
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
        err_msg = str(exc)
        if "101" in err_msg or "unreachable" in err_msg.lower() or "timeout" in err_msg.lower():
            detailed_err = (
                f"Failed to connect to SMTP ({settings.smtp_host}:{settings.smtp_port}): {exc}. "
                "Cloud platforms like Render free tier block outbound SMTP ports (25, 465, 587). "
                "Please add RESEND_API_KEY or BREVO_API_KEY in Render Environment Variables to send via HTTPS."
            )
        else:
            detailed_err = f"Failed to send email via SMTP ({settings.smtp_host}:{settings.smtp_port}): {exc}"

        logger.error(detailed_err)
        return False, detailed_err
