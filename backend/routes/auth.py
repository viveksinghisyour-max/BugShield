import re
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from config import settings
from database import get_db, row_to_dict, utc_now
from utils.security import create_access_token, current_user, hash_password, verify_password
from utils.validation import clean_email, clean_email_strict, validate_password

router = APIRouter(tags=["auth"])


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str = "OTP_AUTH"
    role: str = "developer"


class LoginRequest(BaseModel):
    email: str
    password: str


class SendOTPRequest(BaseModel):
    email: str


class VerifyOTPRequest(BaseModel):
    email: str
    code: str
    name: str | None = None


class SupabaseSyncRequest(BaseModel):
    email: str
    name: str | None = None


@router.post("/send-otp")
def send_otp(payload: SendOTPRequest):
    email = clean_email(payload.email)
    now = datetime.now(timezone.utc)
    cooldown_cutoff = (now - timedelta(seconds=60)).isoformat()
    expires_at = (now + timedelta(minutes=5)).isoformat()
    now_str = now.isoformat()

    with get_db() as db:
        recent = db.execute(
            "SELECT id FROM otp_codes WHERE email = ? AND created_at > ?",
            (email, cooldown_cutoff),
        ).fetchone()
        if recent:
            raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting another code.")

        db.execute("DELETE FROM otp_codes WHERE email = ?", (email,))
        code = f"{secrets.randbelow(1000000):06d}"
        db.execute(
            "INSERT INTO otp_codes (email, code, expires_at, created_at, attempts) VALUES (?, ?, ?, ?, 0)",
            (email, code, expires_at, now_str),
        )

    print(f"\n==================================================")
    print(f" [+] BUGSHIELD AI EMAIL OTP FOR {email}: [ {code} ] ")
    print(f" Valid for 5 minutes. Max 3 verification attempts. ")
    print(f"==================================================\n")

    return {
        "message": f"Verification code sent to {email}",
        "email": email,
        "expires_in_seconds": 300,
        "cooldown_seconds": 60,
    }


@router.post("/verify-otp")
def verify_otp(payload: VerifyOTPRequest):
    email = clean_email(payload.email)
    code = payload.code.strip()
    now_str = datetime.now(timezone.utc).isoformat()

    with get_db() as db:
        record = row_to_dict(
            db.execute(
                "SELECT * FROM otp_codes WHERE email = ? AND expires_at > ? ORDER BY id DESC LIMIT 1",
                (email, now_str),
            ).fetchone()
        )

        if not record:
            raise HTTPException(
                status_code=400, detail="Verification code has expired or is invalid. Please request a new code."
            )

        attempts = record.get("attempts", 0)
        if attempts >= 3:
            db.execute("DELETE FROM otp_codes WHERE email = ?", (email,))
            db.commit()
            raise HTTPException(status_code=429, detail="Maximum 3 attempts exceeded. Please request a new code.")

        if record["code"] != code:
            new_attempts = attempts + 1
            db.execute("UPDATE otp_codes SET attempts = ? WHERE id = ?", (new_attempts, record["id"]))
            db.commit()
            remaining = 3 - new_attempts
            if remaining > 0:
                raise HTTPException(status_code=400, detail=f"Invalid code. {remaining} attempt(s) remaining.")
            else:
                db.execute("DELETE FROM otp_codes WHERE email = ?", (email,))
                db.commit()
                raise HTTPException(
                    status_code=400, detail="Invalid code. Maximum 3 attempts exceeded, please request a new code."
                )

        db.execute("DELETE FROM otp_codes WHERE email = ?", (email,))

        user = row_to_dict(db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone())
        if not user:
            name = payload.name.strip() if payload.name and payload.name.strip() else email.split("@")[0].capitalize()
            role = "admin" if email.lower() == settings.admin_email.lower() else "developer"
            cursor = db.execute(
                "INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, 'OTP_AUTH', ?, ?)",
                (name, email, role, utc_now()),
            )
            user_id = cursor.lastrowid
            user = {"id": user_id, "name": name, "email": email, "role": role, "created_at": utc_now()}
        else:
            if email.lower() == settings.admin_email.lower() and str(user.get("role")).lower() != "admin":
                db.execute("UPDATE users SET role = 'admin' WHERE id = ?", (user["id"],))
                user["role"] = "admin"
            else:
                user["role"] = str(user["role"]).lower()

    token = create_access_token({"sub": str(user["id"]), "role": user["role"], "email": email})
    safe_user = {key: user[key] for key in ("id", "name", "email", "role", "created_at")}
    return {"token": token, "user": safe_user}


@router.post("/supabase-sync")
def supabase_sync(payload: SupabaseSyncRequest):
    email = clean_email(payload.email)
    with get_db() as db:
        user = row_to_dict(db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone())
        if not user:
            name = payload.name.strip() if payload.name and payload.name.strip() else email.split("@")[0].capitalize()
            role = "admin" if email.lower() == settings.admin_email.lower() else "developer"
            cursor = db.execute(
                "INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, 'OTP_AUTH', ?, ?)",
                (name, email, role, utc_now()),
            )
            user = {"id": cursor.lastrowid, "name": name, "email": email, "role": role, "created_at": utc_now()}
        else:
            if email.lower() == settings.admin_email.lower() and str(user.get("role")).lower() != "admin":
                db.execute("UPDATE users SET role = 'admin' WHERE id = ?", (user["id"],))
                user["role"] = "admin"
            else:
                user["role"] = str(user["role"]).lower()

    token = create_access_token({"sub": str(user["id"]), "role": user["role"], "email": email})
    safe_user = {key: user[key] for key in ("id", "name", "email", "role", "created_at")}
    return {"token": token, "user": safe_user}


@router.post("/register")
def register(payload: RegisterRequest):
    email = clean_email_strict(payload.email)
    name = payload.name.strip()
    if not re.match(r"^[a-zA-Z\s]{2,50}$", name):
        raise HTTPException(status_code=422, detail="Name must be 2-50 characters and contain only letters and spaces")
    with get_db() as db:
        exists = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if exists:
            raise HTTPException(status_code=409, detail="Email already registered")

        if email.lower() == settings.admin_email.lower():
            role = "admin"
        else:
            role = "developer"

        pwd = hash_password(payload.password) if payload.password and payload.password != "OTP_AUTH" else "OTP_AUTH"
        cursor = db.execute(
            "INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)",
            (name, email, pwd, role, utc_now()),
        )
        user_id = cursor.lastrowid
    token = create_access_token({"sub": str(user_id), "role": role, "email": email})
    return {"token": token, "user": {"id": user_id, "name": name, "email": email, "role": role}}


@router.post("/login")
def login(payload: LoginRequest):
    email = clean_email(payload.email)
    with get_db() as db:
        user = row_to_dict(db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone())
        if user and email.lower() == settings.admin_email.lower() and str(user.get("role")).lower() != "admin":
            db.execute("UPDATE users SET role = 'admin' WHERE id = ?", (user["id"],))
            user["role"] = "admin"
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user["password"] != "OTP_AUTH" and not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user["role"] = str(user["role"]).lower()
    token = create_access_token({"sub": str(user["id"]), "role": user["role"], "email": email})
    safe_user = {key: user[key] for key in ("id", "name", "email", "role", "created_at")}
    return {"token": token, "user": safe_user}


@router.get("/me")
def me(user=Depends(current_user)):
    return user

