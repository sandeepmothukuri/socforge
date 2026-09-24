"""Alembic environment configuration.

The application uses SQLAlchemy's async engine. Alembic therefore runs its
migration context through an asyncpg-backed engine, including when CI exposes
an ALEMBIC_DATABASE_URL using the synchronous PostgreSQL URL scheme.
"""

from __future__ import annotations

import asyncio
import os
from logging.config import fileConfig


def _normalise_async_database_url() -> str:
    """Return an async PostgreSQL URL and make it available before model import.

    ``socforge.database`` constructs the application engine at import time.
    Normalising the environment before importing the models prevents the
    application module from attempting to build an AsyncEngine with psycopg2.
    """

    database_url = os.environ.get("ALEMBIC_DATABASE_URL") or os.environ.get(
        "DATABASE_URL", ""
    )
    if database_url.startswith("postgresql+psycopg2://"):
        database_url = database_url.replace(
            "postgresql+psycopg2://", "postgresql+asyncpg://", 1
        )
    elif database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    if database_url:
        os.environ["DATABASE_URL"] = database_url
    return database_url


database_url = _normalise_async_database_url()

from alembic import context  # noqa: E402
from sqlalchemy import pool  # noqa: E402
from sqlalchemy.engine import Connection  # noqa: E402
from sqlalchemy.ext.asyncio import async_engine_from_config  # noqa: E402

# Import all models so Alembic sees them after the database URL is normalised.
import socforge.models  # noqa: E402, F401
from socforge.database import Base  # noqa: E402

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

if database_url:
    config.set_main_option("sqlalchemy.url", database_url)


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = config.get_main_option("sqlalchemy.url")

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    try:
        async with connectable.connect() as connection:
            await connection.run_sync(do_run_migrations)
    finally:
        await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
