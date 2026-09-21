"""Health, readiness, and metrics router."""

from __future__ import annotations

import time
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from socforge.config import get_settings
from socforge.database import get_db

router = APIRouter(tags=["Health"])

_start_time = time.time()


class HealthResponse(BaseModel):
    status: str  # ok | degraded | error
    version: str
    environment: str
    uptime_seconds: float
    components: dict[str, str]


class ReadyResponse(BaseModel):
    ready: bool
    checks: dict[str, bool]


@router.get("/health", response_model=HealthResponse, summary="Liveness check")
async def health(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> HealthResponse:
    """Returns overall application health.

    This endpoint checks database connectivity. Designed for use as a
    Docker/Kubernetes liveness probe.
    """
    settings = get_settings()
    components: dict[str, str] = {}

    # Check database
    try:
        await db.execute(text("SELECT 1"))
        components["database"] = "ok"
    except Exception as e:
        components["database"] = f"error: {type(e).__name__}"

    overall = "ok" if all(v == "ok" for v in components.values()) else "degraded"

    return HealthResponse(
        status=overall,
        version=settings.app_version,
        environment=settings.app_env.value,
        uptime_seconds=round(time.time() - _start_time, 2),
        components=components,
    )


@router.get("/ready", response_model=ReadyResponse, summary="Readiness check")
async def ready(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ReadyResponse:
    """Returns whether the application is ready to serve traffic.

    Designed for Kubernetes readiness probes. Returns 503 if not ready.
    """
    checks: dict[str, bool] = {}

    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = True
    except Exception:
        checks["database"] = False

    is_ready = all(checks.values())

    if not is_ready:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=503,
            detail={"ready": False, "checks": checks},
        )

    return ReadyResponse(ready=True, checks=checks)


@router.get("/metrics", summary="Basic application metrics (Prometheus-compatible text format)")
async def metrics() -> str:
    """Basic metrics endpoint.

    Returns uptime. For production monitoring, use the OpenTelemetry
    exporter configured via OTLP_ENDPOINT.
    """
    from fastapi.responses import PlainTextResponse

    uptime = round(time.time() - _start_time, 2)
    lines = [
        "# HELP socforge_uptime_seconds Time since application start",
        "# TYPE socforge_uptime_seconds gauge",
        f"socforge_uptime_seconds {uptime}",
        "# HELP socforge_info Application information",
        "# TYPE socforge_info gauge",
        f'socforge_info{{version="{get_settings().app_version}"}} 1',
    ]
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse("\n".join(lines) + "\n", media_type="text/plain; version=0.0.4")
