"""SOCForge FastAPI application factory."""

from __future__ import annotations

import contextlib
import logging
from collections.abc import AsyncGenerator

import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from socforge.config import get_settings
from socforge.routers import (
    agents,
    alerts,
    audit,
    auth,
    detections,
    entities,
    events,
    health,
    hunts,
    incidents,
    integrations,
    investigations,
)

logger = structlog.get_logger(__name__)


def _configure_logging() -> None:
    settings = get_settings()
    log_level = getattr(logging, settings.log_level, logging.INFO)

    structlog.configure(
        processors=[
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )
    logging.basicConfig(level=log_level)


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler — startup and shutdown.

    Database schema is managed exclusively by Alembic migrations.
    The application does NOT call Base.metadata.create_all() at startup.
    Run `alembic upgrade head` before starting the application.
    """
    settings = get_settings()
    logger.info(
        "socforge_starting",
        version=settings.app_version,
        environment=settings.app_env.value,
        ai_provider=settings.ai_provider.value,
    )

    # Verify database connectivity (does NOT create or modify schema)
    try:
        from sqlalchemy import text

        from socforge.database import engine
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("database_connected")
    except Exception as e:
        logger.error("database_connection_failed", error=str(e))
        # Don't fail startup — health endpoint will report degraded

    yield

    logger.info("socforge_shutdown")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    _configure_logging()
    settings = get_settings()

    app = FastAPI(
        title="SOCForge API",
        description=(
            "Evidence-driven security operations for investigation, "
            "threat hunting, and detection engineering.\n\n"
            "Author: Sandeep Mothukuri | https://github.com/sandeepmothukuri"
        ),
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── Middleware ───────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Security headers middleware
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if not settings.is_development:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )
        return response

    # ── Exception handlers ───────────────────────────────────────────────────────
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error(
            "unhandled_exception",
            method=request.method,
            url=str(request.url),
            error=str(exc),
            exc_info=exc,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred.",
                }
            },
        )

    # ── Routers ───────────────────────────────────────────────────────────────
    api_prefix = "/api/v1"

    app.include_router(health.router)  # /health, /ready, /metrics (no prefix)
    app.include_router(auth.router, prefix=api_prefix)
    app.include_router(alerts.router, prefix=api_prefix)
    app.include_router(events.router, prefix=api_prefix)
    app.include_router(entities.router, prefix=api_prefix)
    app.include_router(investigations.router, prefix=api_prefix)
    app.include_router(hunts.router, prefix=api_prefix)
    app.include_router(detections.router, prefix=api_prefix)
    app.include_router(incidents.router, prefix=api_prefix)
    app.include_router(agents.router, prefix=api_prefix)
    app.include_router(integrations.router, prefix=api_prefix)
    app.include_router(audit.router, prefix=api_prefix)
    app.include_router(audit.responses_router, prefix=api_prefix)
    app.include_router(audit.workspaces_router, prefix=api_prefix)

    @app.get("/", include_in_schema=False)
    async def root():
        return {
            "product": "SOCForge",
            "description": "Evidence-driven security operations platform",
            "version": settings.app_version,
            "docs": "/docs",
            "health": "/health",
            "api": "/api/v1",
        }

    return app


app = create_app()
