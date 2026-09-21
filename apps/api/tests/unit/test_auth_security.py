"""Unit tests for authentication security utilities."""

from socforge.auth.security import (
    create_access_token,
    decode_token,
    generate_api_key,
    hash_password,
    hash_token,
    verify_password,
)


def test_password_hashing():
    pw = "SuperSecretPassword123!"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_api_key_generation():
    full_key, prefix, key_hash = generate_api_key()
    assert full_key.startswith("sf_")
    assert prefix == full_key[:12]
    assert hash_token(full_key) == key_hash


def test_token_creation_and_decoding():
    token = create_access_token("test-user-id-123", {"email": "test@socforge.local"})
    payload = decode_token(token)
    assert payload["sub"] == "test-user-id-123"
    assert payload["email"] == "test@socforge.local"
    assert payload["type"] == "access"
