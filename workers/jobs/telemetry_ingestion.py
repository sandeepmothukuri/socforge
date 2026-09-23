"""Celery background task for batch telemetry log ingestion and normalization."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from socforge.database import AsyncSessionLocal
from socforge.models.alert import Alert
from socforge.normalization.engine import NormalizationEngine
from workers.celery_app import app

logger = logging.getLogger(__name__)


async def _process_batch(events: list[dict[str, Any] | str], workspace_id: str | None = None) -> dict[str, int]:
    engine = NormalizationEngine()
    normalized = engine.batch_normalize(events)

    count = 0
    async with AsyncSessionLocal() as db:
        for alert_create in normalized:
            alert = Alert(
                source=alert_create.source,
                title=alert_create.title,
                description=alert_create.description,
                severity=alert_create.severity,
                source_ip=alert_create.source_ip,
                destination_ip=alert_create.destination_ip,
                source_host=alert_create.source_host,
                destination_host=alert_create.destination_host,
                username=alert_create.username,
                process_name=alert_create.process_name,
                process_command_line=alert_create.process_command_line,
                file_hash=alert_create.file_hash,
                domain=alert_create.domain,
                url=alert_create.url,
                mitre_techniques=alert_create.mitre_techniques,
                mitre_tactics=alert_create.mitre_tactics,
                raw_event=alert_create.raw_event,
                extra_metadata=alert_create.metadata,
            )
            db.add(alert)
            count += 1
        await db.commit()

    return {"ingested": count, "total_received": len(events)}


@app.task(name="workers.jobs.ingest_telemetry_batch")
def ingest_telemetry_batch(events: list[dict[str, Any] | str], workspace_id: str | None = None) -> dict[str, int]:
    """Ingest, normalize, and commit a batch of security log records."""
    try:
        return asyncio.run(_process_batch(events, workspace_id))
    except Exception as exc:
        logger.error(f"Failed to ingest telemetry batch: {exc}")
        return {"ingested": 0, "error": str(exc)}
