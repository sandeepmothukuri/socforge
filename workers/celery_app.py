"""Celery worker application for background security operations tasks."""

import os
from celery import Celery

broker_url = os.environ.get("CELERY_BROKER_URL", "redis://redis:6379/1")
result_backend = os.environ.get("CELERY_RESULT_BACKEND", "redis://redis:6379/2")

app = Celery("socforge_workers", broker=broker_url, backend=result_backend)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    imports=[
        "workers.jobs.telemetry_ingestion",
        "workers.jobs.detection_replay",
        "workers.jobs.action_cleaner",
    ],
    beat_schedule={
        "expire-stale-containment-actions-hourly": {
            "task": "workers.jobs.expire_stale_response_actions",
            "schedule": 3600.0,
        },
    },
)


@app.task(name="ping")
def ping():
    return "pong"
