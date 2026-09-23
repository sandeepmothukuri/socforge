"""Authentication utilities — password hashing, JWT tokens, secret encryption."""

from __future__ import annotations

import base64
import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
from cryptography.fernet import Fernet, InvalidToken
from jose import jwt

from socforge.config import get_settings

ALGORITHM = "HS256"
TOKEN_TYPE = "Bearer"


def hash_password(plain: str) -> str:
    pwd_bytes = plain.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        pwd_bytes = plain.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed.encode("utf-8"))
    except Exception:
        return False


def hash_token(token: str) -> str:
    """SHA-256 hash of a token for storage. Tokens are never stored in plain text."""
    return hashlib.sha256(token.encode()).hexdigest()


def generate_api_key() -> tuple[str, str, str]:
    """Generate a new API key.

    Returns:
        (full_key, key_prefix, key_hash)
        full_key is shown to the user once. key_hash is stored. key_prefix
        lets the user identify which key it is without exposing the full value.
    """
    raw = secrets.token_urlsafe(40)
    full_key = f"sf_{raw}"
    prefix = full_key[:12]
    key_hash = hash_token(full_key)
    return full_key, prefix, key_hash


def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    settings = get_settings()
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(UTC),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def create_refresh_token(subject: str) -> str:
    settings = get_settings()
    expire = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(UTC),
        "jti": secrets.token_hex(16),
        "type": "refresh",
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    """Decode and verify a JWT. Raises JWTError on failure."""
    settings = get_settings()
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])


# ── Secret Encryption for Integrations & Credentials ─────────────────────────


def _get_fernet() -> Fernet:
    """Derive a 32-byte Fernet key deterministically from settings.SECRET_KEY."""
    settings = get_settings()
    key_bytes = hashlib.sha256(settings.secret_key.encode("utf-8")).digest()
    b64_key = base64.urlsafe_b64encode(key_bytes)
    return Fernet(b64_key)


def encrypt_secret(plain: str) -> str:
    """Encrypt a sensitive secret string (e.g. API key, token, password)."""
    if not plain:
        return ""
    f = _get_fernet()
    return f.encrypt(plain.encode("utf-8")).decode("utf-8")


def decrypt_secret(cipher: str) -> str:
    """Decrypt an encrypted secret string. Returns empty string if invalid."""
    if not cipher:
        return ""
    try:
        f = _get_fernet()
        return f.decrypt(cipher.encode("utf-8")).decode("utf-8")
    except (InvalidToken, Exception):
        return ""
