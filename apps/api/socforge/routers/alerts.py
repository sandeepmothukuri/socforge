"""Alerts router — ingest, list, detail, update."""

from __future__ import annotations

import json
import uuid
from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from socforge.auth.dependencies import CurrentAnalyst, CurrentUser
from socforge.database import get_db
from socforge.models.alert import Alert, AlertSeverity, AlertStatus
from socforge.models.operations import AuditAction
from socforge.services.audit import record_audit_event

router = APIRouter(prefix="/alerts", tags=["Alerts"])


# ── Schemas ──────────────────────────────────────────────────────────────────


import ipaddress


class AlertCreate(BaseModel):
    source: str = Field(..., max_length=128, description="Source system name (e.g. wazuh, splunk)")
    title: str = Field(..., max_length=512)
    description: str | None = None
    severity: AlertSeverity = AlertSeverity.medium
    external_id: str | None = None

    event_time: datetime | None = None
    source_ip: str | None = None
    destination_ip: str | None = None
    source_host: str | None = None
    destination_host: str | None = None
    username: str | None = None
    process_name: str | None = None
    process_command_line: str | None = None
    file_hash: str | None = None
    domain: str | None = None
    url: str | None = None

    mitre_techniques: list[str] = Field(default_factory=list)
    mitre_tactics: list[str] = Field(default_factory=list)
    raw_event: dict[str, Any] | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("source_ip", "destination_ip", mode="before")
    @classmethod
    def validate_ip(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        try:
            # Validate IPv4 or IPv6
            ipaddress.ip_address(v.strip())
            return v.strip()
        except ValueError:
            raise ValueError(f"Invalid IP address format: {v}")



class AlertUpdate(BaseModel):
    status: AlertStatus | None = None
    severity: AlertSeverity | None = None
    risk_score: float | None = Field(default=None, ge=0.0, le=100.0)
    mitre_techniques: list[str] | None = None
    mitre_tactics: list[str] | None = None
    description: str | None = None


class AlertRead(BaseModel):
    id: str
    external_id: str | None
    source: str
    title: str
    description: str | None
    severity: str
    status: str
    risk_score: float | None
    event_time: datetime | None
    source_ip: str | None
    destination_ip: str | None
    source_host: str | None
    destination_host: str | None
    username: str | None
    process_name: str | None
    process_command_line: str | None
    file_hash: str | None
    domain: str | None
    url: str | None
    mitre_techniques: list[str]
    mitre_tactics: list[str]
    raw_event: dict | None
    metadata: dict
    created_at: datetime
    updated_at: datetime
    ingested_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm(cls, alert: Alert) -> "AlertRead":
        return cls(
            id=str(alert.id),
            external_id=alert.external_id,
            source=alert.source,
            title=alert.title,
            description=alert.description,
            severity=alert.severity.value,
            status=alert.status.value,
            risk_score=alert.risk_score,
            event_time=alert.event_time,
            source_ip=alert.source_ip,
            destination_ip=alert.destination_ip,
            source_host=alert.source_host,
            destination_host=alert.destination_host,
            username=alert.username,
            process_name=alert.process_name,
            process_command_line=alert.process_command_line,
            file_hash=alert.file_hash,
            domain=alert.domain,
            url=alert.url,
            mitre_techniques=alert.mitre_techniques or [],
            mitre_tactics=alert.mitre_tactics or [],
            raw_event=alert.raw_event,
            metadata=alert.extra_metadata or {},
            created_at=alert.created_at,
            updated_at=alert.updated_at,
            ingested_at=alert.ingested_at,
        )


class AlertListResponse(BaseModel):
    items: list[AlertRead]
    total: int
    page: int
    page_size: int


class IngestResponse(BaseModel):
    ingested: int
    failed: int
    errors: list[str]


# ── Endpoints ─────────────────────────────────────────────────────────────────


@router.get("", response_model=AlertListResponse, summary="List alerts")
async def list_alerts(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    severity: AlertSeverity | None = None,
    status: AlertStatus | None = None,
    source: str | None = None,
    search: str | None = None,
) -> AlertListResponse:
    """List alerts with optional filtering and pagination."""
    query = select(Alert)

    if severity:
        query = query.where(Alert.severity == severity)
    if status:
        query = query.where(Alert.status == status)
    if source:
        query = query.where(Alert.source == source)
    if search:
        query = query.where(Alert.title.ilike(f"%{search}%"))

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar_one()

    query = query.order_by(Alert.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    alerts = result.scalars().all()

    return AlertListResponse(
        items=[AlertRead.from_orm(a) for a in alerts],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=AlertRead, status_code=status.HTTP_201_CREATED, summary="Create alert")
async def create_alert(
    payload: AlertCreate,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AlertRead:
    """Create a single alert via the API."""
    if payload.external_id:
        existing = await db.execute(
            select(Alert).where(
                Alert.source == payload.source,
                Alert.external_id == payload.external_id,
            )
        )
        existing_alert = existing.scalar_one_or_none()
        if existing_alert:
            # Return existing alert (deduplication)
            return AlertRead.from_orm(existing_alert)

    alert = Alert(

        source=payload.source,
        title=payload.title,
        description=payload.description,
        severity=payload.severity,
        external_id=payload.external_id,
        event_time=payload.event_time,
        source_ip=payload.source_ip,
        destination_ip=payload.destination_ip,
        source_host=payload.source_host,
        destination_host=payload.destination_host,
        username=payload.username,
        process_name=payload.process_name,
        process_command_line=payload.process_command_line,
        file_hash=payload.file_hash,
        domain=payload.domain,
        url=payload.url,
        mitre_techniques=payload.mitre_techniques,
        mitre_tactics=payload.mitre_tactics,
        raw_event=payload.raw_event,
        extra_metadata=payload.metadata,
    )
    db.add(alert)
    await db.flush()

    await record_audit_event(
        db,
        action=AuditAction.alert_created,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="alert",
        target_id=str(alert.id),
    )
    await db.commit()
    await db.refresh(alert)

    return AlertRead.from_orm(alert)


@router.post(
    "/ingest",
    response_model=IngestResponse,
    summary="Bulk ingest alerts from JSON or NDJSON",
)
async def ingest_alerts(
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(description="JSON array or NDJSON file of alert objects"),
) -> IngestResponse:
    """Bulk ingest alerts from a JSON array or newline-delimited JSON file.

    The file must contain AlertCreate-compatible objects. Malformed records
    are rejected individually without blocking the valid records.
    """
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum 50 MB.",
        )

    ingested = 0
    failed = 0
    errors: list[str] = []

    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded")

    # Try JSON array first, then NDJSON
    records: list[dict] = []
    text = text.strip()
    if text.startswith("["):
        try:
            records = json.loads(text)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON: {e}")
    else:
        for i, line in enumerate(text.splitlines()):
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError as e:
                errors.append(f"Line {i + 1}: {e}")
                failed += 1

    for record in records:
        try:
            payload = AlertCreate.model_validate(record)
            alert = Alert(
                source=payload.source,
                title=payload.title,
                description=payload.description,
                severity=payload.severity,
                external_id=payload.external_id,
                event_time=payload.event_time,
                source_ip=payload.source_ip,
                destination_ip=payload.destination_ip,
                source_host=payload.source_host,
                destination_host=payload.destination_host,
                username=payload.username,
                process_name=payload.process_name,
                process_command_line=payload.process_command_line,
                file_hash=payload.file_hash,
                domain=payload.domain,
                url=payload.url,
                mitre_techniques=payload.mitre_techniques,
                mitre_tactics=payload.mitre_tactics,
                raw_event=payload.raw_event,
                extra_metadata=payload.metadata,
            )
            db.add(alert)
            ingested += 1
        except Exception as e:
            errors.append(str(e)[:256])
            failed += 1

    return IngestResponse(ingested=ingested, failed=failed, errors=errors[:50])


@router.get("/{alert_id}", response_model=AlertRead, summary="Get alert by ID")
async def get_alert(
    alert_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AlertRead:
    try:
        aid = uuid.UUID(alert_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid alert ID")

    result = await db.execute(select(Alert).where(Alert.id == aid))
    alert = result.scalar_one_or_none()
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")

    return AlertRead.from_orm(alert)


@router.patch("/{alert_id}", response_model=AlertRead, summary="Update alert")
async def update_alert(
    alert_id: str,
    payload: AlertUpdate,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AlertRead:
    try:
        aid = uuid.UUID(alert_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid alert ID")

    result = await db.execute(select(Alert).where(Alert.id == aid))
    alert = result.scalar_one_or_none()
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")

    update_data = payload.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(alert, field, value)

    await record_audit_event(
        db,
        action=AuditAction.alert_updated,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="alert",
        target_id=alert_id,
        metadata=update_data,
    )

    return AlertRead.from_orm(alert)
