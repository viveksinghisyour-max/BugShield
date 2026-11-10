import os
from pathlib import Path
from pydantic import BaseModel

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent / ".env")
except Exception:
    pass

BASE_DIR = Path(__file__).resolve().parent

DEFAULT_NVIDIA_API_KEY = "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"
DEFAULT_NVIDIA_MODEL = "nvidia/nemotron-3.5-lightning-30b-a3b"


def _resolve_path(env_var: str, default: str) -> Path:
    raw = os.getenv(env_var, default)
    p = Path(raw)
    return p if p.is_absolute() else (BASE_DIR / p).resolve()


class Settings(BaseModel):
    app_name: str = "BugShield API"
    jwt_secret: str = os.getenv("BUGSHIELD_JWT_SECRET", "bugshield-super-secret-jwt-key-2026")
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60 * 8  # 8 hours

    database_path: Path = _resolve_path("BUGSHIELD_DB", "database/bugshield.sqlite3")
    upload_dir: Path = _resolve_path("BUGSHIELD_UPLOAD_DIR", "storage/uploads")
    reports_dir: Path = _resolve_path("BUGSHIELD_REPORTS_DIR", "reports")

    max_upload_mb: int = int(os.getenv("BUGSHIELD_MAX_UPLOAD_MB", "50"))
    frontend_origin: str = os.getenv("BUGSHIELD_FRONTEND_ORIGIN", "http://localhost:5173")
    nvidia_api_key: str = os.getenv("NVIDIA_API_KEY", DEFAULT_NVIDIA_API_KEY)
    nvidia_model: str = os.getenv("NVIDIA_MODEL", DEFAULT_NVIDIA_MODEL)
    admin_email: str = os.getenv("BUGSHIELD_ADMIN_EMAIL", "viveksinghisyour@gmail.com")


settings = Settings()
