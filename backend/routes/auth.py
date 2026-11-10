import re
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
    password: str
    role: str = "developer"


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(payload: RegisterRequest):
    email = clean_email_strict(payload.email)
    name = payload.name.strip()
    validate_password(payload.password)

    if not re.match(r"^[a-zA-Z\s]{2,50}$", name):
        raise HTTPException(
            status_code=422,
            detail="Name must be 2-50 characters and contain only letters and spaces",
        )

    with get_db() as db:
        exists = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if exists:
            raise HTTPException(status_code=409, detail="Email already registered")

        role = "admin" if email.lower() == settings.admin_email.lower() else "developer"
        pwd = hash_password(payload.password)
        cursor = db.execute(
            "INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)",
            (name, email, pwd, role, utc_now()),
        )
        user_id = cursor.lastrowid

    token = create_access_token({"sub": str(user_id), "role": role, "email": email})
    return {
        "token": token,
        "user": {"id": user_id, "name": name, "email": email, "role": role},
    }


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

    if not user.get("password") or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user["role"] = str(user["role"]).lower()
    token = create_access_token({"sub": str(user["id"]), "role": user["role"], "email": email})
    safe_user = {key: user[key] for key in ("id", "name", "email", "role", "created_at")}
    return {"token": token, "user": safe_user}


@router.get("/me")
def me(user=Depends(current_user)):
    return user
