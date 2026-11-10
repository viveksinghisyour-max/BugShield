from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from config import settings
from database import get_db, row_to_dict

bearer = HTTPBearer(auto_error=False)

ROLE_PERMISSIONS = {
    "admin": {"manage_users", "delete_projects", "upload_project", "run_scan", "view_all"},
    "developer": {"upload_project", "run_scan", "view_own"},
    "viewer": {"view_own"},
}


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8")[:72], password_hash.encode("utf-8"))
    except Exception:
        return False


def create_access_token(payload: dict[str, Any]) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_minutes)
    token_payload = {**payload, "exp": expires}
    return jwt.encode(token_payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired") from exc
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc


def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication token")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired") from exc
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    with get_db() as db:
        user = None
        if str(user_id).isdigit():
            user = row_to_dict(
                db.execute(
                    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
                    (int(user_id),),
                ).fetchone()
            )
        if not user and payload.get("email"):
            user = row_to_dict(
                db.execute(
                    "SELECT id, name, email, role, created_at FROM users WHERE email = ?",
                    (payload["email"],),
                ).fetchone()
            )

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    if user.get("email") and user["email"].lower() == settings.admin_email.lower() and str(user.get("role")).lower() != "admin":
        with get_db() as db:
            db.execute("UPDATE users SET role = 'admin' WHERE id = ?", (user["id"],))
        user["role"] = "admin"
    else:
        user["role"] = str(user["role"]).lower()

    return user


def require_permission(permission: str):
    def dependency(user=Depends(current_user)):
        if permission not in ROLE_PERMISSIONS.get(user["role"], set()):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        return user

    return dependency
