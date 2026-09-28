"""Root pytest conftest configuring python path and test environment for monorepo testing."""

import os
import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
api_dir = root_dir / "apps" / "api"
cli_dir = root_dir / "apps" / "cli"

for path in [api_dir, cli_dir, root_dir]:
    path_str = str(path)
    if path_str not in sys.path:
        sys.path.insert(0, path_str)

# Ensure default test environment configuration for test suite execution
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("SECRET_KEY", "ci-test-secret-key-not-used-in-production-32chars")
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://socforge:socforge@localhost:5432/socforge")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("AI_PROVIDER", "mock")
os.environ.setdefault("DEFAULT_ADMIN_EMAIL", "admin@socforge.local")
os.environ.setdefault("DEFAULT_ADMIN_PASSWORD", "ci-admin-password")
