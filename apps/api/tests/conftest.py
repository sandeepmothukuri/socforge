"""Pytest conftest configuring python path and test environment for SOCForge testing."""

import os
import sys
from pathlib import Path

tests_dir = Path(__file__).resolve().parent
api_dir = tests_dir.parent
monorepo_root = api_dir.parent.parent
cli_dir = monorepo_root / "apps" / "cli"

for path in [api_dir, cli_dir, monorepo_root]:
    path_str = str(path)
    if path_str not in sys.path:
        sys.path.insert(0, path_str)

# Ensure default test environment configuration for test suite execution
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("SECRET_KEY", "ci-test-secret-key-not-used-in-production-32chars")
os.environ.setdefault(
    "DATABASE_URL", "postgresql+asyncpg://socforge:socforge@localhost:5432/socforge"
)
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("AI_PROVIDER", "mock")
os.environ.setdefault("DEFAULT_ADMIN_EMAIL", "admin@socforge.local")
os.environ.setdefault("DEFAULT_ADMIN_PASSWORD", "ci-admin-password")
