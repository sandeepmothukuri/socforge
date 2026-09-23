"""Unit tests for SOCForge Settings and Configuration Validation."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from socforge.agents.providers import OfflineDeterministicProvider, get_ai_provider
from socforge.config import AIProvider, Environment, Settings


def test_settings_environment_normalization():
    """Verify that APP_ENV aliases (test, dev, prod) normalize cleanly to Environment enums."""
    s_test = Settings(
        app_env="test",
        secret_key="a" * 32,
        database_url="postgresql+asyncpg://user:pass@localhost:5432/db",
    )
    assert s_test.app_env == Environment.testing
    assert s_test.is_testing is True
    assert s_test.is_production is False

    s_dev = Settings(
        app_env="dev",
        secret_key="a" * 32,
        database_url="postgresql+asyncpg://user:pass@localhost:5432/db",
    )
    assert s_dev.app_env == Environment.development
    assert s_dev.is_development is True

    s_prod = Settings(
        app_env="production",
        secret_key="a" * 32,
        first_admin_password="SuperSecureProdPassword123!",
        database_url="postgresql+asyncpg://user:pass@localhost:5432/db",
    )
    assert s_prod.app_env == Environment.production
    assert s_prod.is_production is True


def test_settings_ai_provider_normalization():
    """Verify AI provider normalization and mock/none alias handling."""
    s_mock = Settings(
        secret_key="a" * 32,
        database_url="postgresql+asyncpg://user:pass@localhost:5432/db",
        ai_provider="mock",
    )
    assert s_mock.ai_provider == AIProvider.mock

    s_none = Settings(
        secret_key="a" * 32,
        database_url="postgresql+asyncpg://user:pass@localhost:5432/db",
        ai_provider="disabled",
    )
    assert s_none.ai_provider == AIProvider.none


def test_offline_ai_provider_in_mock_or_none():
    """Verify get_ai_provider returns OfflineDeterministicProvider without network dependencies."""
    provider = get_ai_provider()
    assert isinstance(provider, OfflineDeterministicProvider)


def test_production_insecure_secret_key_rejected():
    """Verify production rejects insecure secret keys."""
    with pytest.raises(ValidationError, match="Insecure SECRET_KEY"):
        Settings(
            app_env="production",
            secret_key="insecure-dev-secret-key-change-in-production",
            first_admin_password="ValidProdPassword123!",
            database_url="postgresql+asyncpg://user:pass@localhost:5432/db",
        )


def test_production_default_admin_password_rejected():
    """Verify production rejects default admin passwords."""
    with pytest.raises(ValidationError, match="Default FIRST_ADMIN_PASSWORD"):
        Settings(
            app_env="production",
            secret_key="a" * 32,
            first_admin_password="admin12345!",
            database_url="postgresql+asyncpg://user:pass@localhost:5432/db",
        )


def test_vllm_requires_base_url():
    """Verify vLLM provider validation enforces ai_base_url."""
    with pytest.raises(ValidationError, match="ai_base_url is required"):
        Settings(
            secret_key="a" * 32,
            database_url="postgresql+asyncpg://user:pass@localhost:5432/db",
            ai_provider="vllm",
            ai_base_url="",
        )


def test_cors_origins_parsing():
    """Verify comma-separated cors origins string is parsed to clean list."""
    s = Settings(
        secret_key="a" * 32,
        database_url="postgresql+asyncpg://user:pass@localhost:5432/db",
        cors_origins="https://app.socforge.io, https://soc.internal:3000 ",
    )
    assert s.cors_origins_list == ["https://app.socforge.io", "https://soc.internal:3000"]
