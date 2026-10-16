from pathlib import Path
from pydantic import BaseModel
import os

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except Exception:
    pass


DEFAULT_NVIDIA_API_KEY = "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"
DEFAULT_NVIDIA_MODEL = "nvidia/nemotron-3.5-lightning-30b-a3b"


class Settings(BaseModel):
    app_name: str = "BugShield API"
    jwt_secret: str = os.getenv("BUGSHIELD_JWT_SECRET", "change-this-secret-in-production")
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60 * 8
    database_path: Path = Path(os.getenv("BUGSHIELD_DB", "database/bugshield.sqlite3"))
    upload_dir: Path = Path(os.getenv("BUGSHIELD_UPLOAD_DIR", "storage/uploads"))
    reports_dir: Path = Path(os.getenv("BUGSHIELD_REPORTS_DIR", "reports"))
    max_upload_mb: int = int(os.getenv("BUGSHIELD_MAX_UPLOAD_MB", "50"))
    frontend_origin: str = os.getenv("BUGSHIELD_FRONTEND_ORIGIN", "http://localhost:5173")
    nvidia_api_key: str = os.getenv("NVIDIA_API_KEY", DEFAULT_NVIDIA_API_KEY)
    nvidia_model: str = os.getenv("NVIDIA_MODEL", DEFAULT_NVIDIA_MODEL)
    gemini_api_key: str = os.getenv("NVIDIA_API_KEY", DEFAULT_NVIDIA_API_KEY)
    admin_email: str = os.getenv("BUGSHIELD_ADMIN_EMAIL", "admin@bugshield.io")


    # HTTP-Based Email API (Recommended for cloud hosting like Render/Vercel where SMTP ports are blocked)
    resend_api_key: str = os.getenv("RESEND_API_KEY", "")
    brevo_api_key: str = os.getenv("BREVO_API_KEY", "")

    # SMTP Email Configuration
    smtp_host: str = os.getenv("SMTP_HOST", "")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")
    smtp_from_email: str = os.getenv("SMTP_FROM_EMAIL", "")
    smtp_tls: bool = os.getenv("SMTP_TLS", "true").lower() in ("true", "1", "yes")
    smtp_ssl: bool = os.getenv("SMTP_SSL", "false").lower() in ("true", "1", "yes")
    dev_mode: bool = os.getenv("BUGSHIELD_DEV_MODE", "true").lower() in ("true", "1", "yes")

settings = Settings()


