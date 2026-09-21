"""SOCForge application configuration.

All settings are loaded from environment variables.
The application will fail fast on startup if required variables are missing.
"""

from __future__ import annotations

from enum import Enum
from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn, RedisDsn, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    development = "development"
    testing = "testing"
    production = "production"


class AIProvider(str, Enum):
    openai = "openai"
    ollama = "ollama"
    vllm = "vllm"
    none = "none"


class StorageBackend(str, Enum):
    local = "local"
    s3 = "s3"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ────────────────────────────────────────
    app_env: Environment = Environment.development
    app_name: str = "SOCForge"
    app_version: str = "0.1.0"
    secret_key: str = Field(..., min_length=32)
    debug: bool = False
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"

    # ── API Server ─────────────────────────────────────────
    api_host: str = "0.0.0.0"
    api_port: int = Field(default=8000, ge=1, le=65535)
    api_reload: bool = False
    cors_origins: str | list[str] = "http://localhost:3000"

    # ── Database ───────────────────────────────────────────
    database_url: str = Field(..., description="PostgreSQL async DSN")
    database_pool_size: int = Field(default=10, ge=1, le=50)
    database_max_overflow: int = Field(default=20, ge=0, le=100)

    # ── Redis ──────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # ── Authentication ─────────────────────────────────────
    access_token_expire_minutes: int = Field(default=60, ge=5)
    refresh_token_expire_days: int = Field(default=7, ge=1)
    password_hash_rounds: int = Field(default=12, ge=10, le=14)

    # ── AI Provider ────────────────────────────────────────
    ai_provider: AIProvider = AIProvider.none
    ai_base_url: str = ""
    ai_api_key: str = ""
    ai_model: str = "gpt-4o-mini"
    ai_timeout_seconds: int = Field(default=60, ge=5)
    ai_max_tokens: int = Field(default=4096, ge=256)

    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1"

    # ── Storage ────────────────────────────────────────────
    storage_backend: StorageBackend = StorageBackend.local

    # ── Observability ──────────────────────────────────────
    enable_telemetry: bool = False
    otlp_endpoint: str = "http://localhost:4317"

    # ── Security ───────────────────────────────────────────
    rate_limit_requests: int = Field(default=100, ge=1)
    rate_limit_window_seconds: int = Field(default=60, ge=1)

    # ── Demo Mode ──────────────────────────────────────────
    demo_mode: bool = False

    # ── First Admin ────────────────────────────────────────
    first_admin_email: str = "admin@socforge.local"
    first_admin_password: str = "change-me-immediately"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @model_validator(mode="after")
    def validate_ai_config(self) -> Settings:
        if self.ai_provider in (AIProvider.openai, AIProvider.vllm):
            if not self.ai_base_url and self.ai_provider == AIProvider.vllm:
                raise ValueError("ai_base_url is required when AI_PROVIDER=vllm")
        return self

    @property
    def cors_origins_list(self) -> list[str]:
        if isinstance(self.cors_origins, str):
            return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        return list(self.cors_origins)

    @property
    def is_development(self) -> bool:
        return self.app_env == Environment.development

    @property
    def is_production(self) -> bool:
        return self.app_env == Environment.production

    @property
    def is_testing(self) -> bool:
        return self.app_env == Environment.testing


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the singleton settings instance."""
    return Settings()
