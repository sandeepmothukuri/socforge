"""Celery background task for scheduled detection rule replay and confusion matrix evaluation."""

from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any

from sqlalchemy import select
from socforge.database import AsyncSessionLocal
from socforge.models.detection import Detection
from socforge.services.detection_replay import replay_detection
from workers.celery_app import app

logger = logging.getLogger(__name__)


async def _replay_task(rule_id: str, dataset_name: str = "synthetic-soc-v1") -> dict[str, Any]:
    async with AsyncSessionLocal() as db:
        rid = uuid.UUID(rule_id)
        rule = (await db.execute(select(Detection).where(Detection.id == rid))).scalar_one_or_none()
        if not rule:
            return {"error": f"Rule {rule_id} not found"}

        result = replay_detection(rule.rule_language, rule.rule_content, dataset_name)
        return {
            "rule_id": rule_id,
            "dataset": dataset_name,
            "matched_events": result.matched_events,
            "true_positives": result.true_positives,
            "false_positives": result.false_positives,
            "precision": result.precision,
            "recall": result.recall,
            "f1": result.f1,
            "error": result.error,
        }


@app.task(name="workers.jobs.run_detection_replay_job")
def run_detection_replay_job(rule_id: str, dataset_name: str = "synthetic-soc-v1") -> dict[str, Any]:
    """Execute background detection rule replay against a dataset."""
    try:
        return asyncio.run(_replay_task(rule_id, dataset_name))
    except Exception as exc:
        logger.error(f"Detection replay task failed: {exc}")
        return {"error": str(exc)}
