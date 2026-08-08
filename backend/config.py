from pathlib import Path
from pydantic import BaseModel
import os

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except Exception:
    pass


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
    nvidia_api_key: str = os.getenv("NVIDIA_API_KEY", os.getenv("GEMINI_API_KEY", ""))
    gemini_api_key: str = os.getenv("NVIDIA_API_KEY", os.getenv("GEMINI_API_KEY", ""))
    admin_email: str = os.getenv("BUGSHIELD_ADMIN_EMAIL", "admin@bugshield.io")

settings = Settings()
