"""Database engine and session management."""

from __future__ import annotations

import os
import sys
from typing import TYPE_CHECKING

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from socforge.config import get_settings

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator


def _build_engine():
    settings = get_settings()
    is_test = os.environ.get("APP_ENV") == "test" or "pytest" in sys.modules
    if is_test:
        return create_async_engine(
            settings.database_url,
            poolclass=NullPool,
            echo=False,
        )
    return create_async_engine(
        settings.database_url,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
        pool_pre_ping=True,
        echo=settings.is_development and settings.debug,
    )


engine = _build_engine()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that provides a database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
