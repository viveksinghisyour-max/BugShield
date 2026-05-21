import re
from email_validator import EmailNotValidError, validate_email
from fastapi import HTTPException, status


ALLOWED_ROLES = {"admin", "developer", "viewer"}

# Standard baseline regex (allows numbers like 12345@gmail.com for login)
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

# Strict regex (requires at least one letter in local part for registration)
STRICT_EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]*[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

def clean_email(email: str) -> str:
    email = email.strip()
    if not email or len(email) > 254:
        raise HTTPException(status_code=422, detail="Invalid email length")
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=422, detail="Invalid email format. Please check for typos or invalid characters.")
        
    try:
        return validate_email(email, check_deliverability=False).normalized.lower()
    except EmailNotValidError as exc:
        raise HTTPException(status_code=422, detail="Invalid email address") from exc

def clean_email_strict(email: str) -> str:
    email = email.strip()
    if not STRICT_EMAIL_REGEX.match(email):
        raise HTTPException(status_code=422, detail="Invalid email format. Please enter a valid business or personal email address.")
    return clean_email(email)


def validate_password(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")


def validate_role(role: str) -> str:
    normalized = role.lower().strip()
    if normalized not in ALLOWED_ROLES:
        raise HTTPException(status_code=422, detail="Invalid role")
    return normalized
