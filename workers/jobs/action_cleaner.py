"""Celery background task for expiring stale response actions."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone, timedelta
import logging

from sqlalchemy import select
from socforge.database import AsyncSessionLocal
from socforge.models.operations import ResponseAction, ResponseActionStatus
from workers.celery_app import app

logger = logging.getLogger(__name__)


async def _clean_stale_actions() -> int:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=2)
    async with AsyncSessionLocal() as db:
        res = await db.execute(
            select(ResponseAction).where(
                ResponseAction.status == ResponseActionStatus.pending_approval,
                ResponseAction.created_at < cutoff,
            )
        )
        stale_actions = res.scalars().all()
        expired_count = 0
        for action in stale_actions:
            action.status = ResponseActionStatus.rejected
            action.execution_result = {
                "status": "expired",
                "reason": "Approval window expired after 2 hours with no Four-Eyes authorization.",
                "expired_at": datetime.now(timezone.utc).isoformat(),
            }
            expired_count += 1
        await db.commit()
        return expired_count


@app.task(name="workers.jobs.expire_stale_response_actions")
def expire_stale_response_actions() -> dict[str, int]:
    """Background task to transition stale unapproved containment actions to expired/rejected."""
    try:
        count = asyncio.run(_clean_stale_actions())
        return {"expired_count": count}
    except Exception as exc:
        logger.error(f"Failed to expire stale response actions: {exc}")
        return {"error": str(exc), "expired_count": 0}
