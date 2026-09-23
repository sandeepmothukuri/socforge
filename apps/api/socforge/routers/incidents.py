"""Incidents router — incident response lifecycle, summaries, and tracking."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from socforge.auth.dependencies import CurrentAnalyst, CurrentUser
from socforge.database import get_db
from socforge.models.operations import AuditAction, Incident, IncidentSeverity, IncidentStatus
from socforge.services.audit import record_audit_event

router = APIRouter(prefix="/incidents", tags=["Incidents"])


class IncidentCreate(BaseModel):
    title: str = Field(..., max_length=512)
    description: str | None = None
    severity: IncidentSeverity = IncidentSeverity.medium
    investigation_id: str | None = None
    affected_systems: list[str] = Field(default_factory=list)
    affected_users: list[str] = Field(default_factory=list)
    mitre_techniques: list[str] = Field(default_factory=list)


class IncidentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: IncidentStatus | None = None
    severity: IncidentSeverity | None = None
    executive_summary: str | None = None
    technical_summary: str | None = None
    timeline: list[dict[str, Any]] | None = None
    affected_systems: list[str] | None = None
    affected_users: list[str] | None = None


class IncidentRead(BaseModel):
    id: str
    title: str
    description: str | None
    severity: str
    status: str
    executive_summary: str | None
    technical_summary: str | None
    timeline: list[dict[str, Any]]
    affected_systems: list[str]
    affected_users: list[str]
    investigation_id: str | None
    mitre_techniques: list[str]
    assigned_to_id: str | None
    created_by_id: str | None
    opened_at: datetime
    closed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm(cls, inc: Incident) -> IncidentRead:
        return cls(
            id=str(inc.id),
            title=inc.title,
            description=inc.description,
            severity=inc.severity.value,
            status=inc.status.value,
            executive_summary=inc.executive_summary,
            technical_summary=inc.technical_summary,
            timeline=inc.timeline or [],
            affected_systems=inc.affected_systems or [],
            affected_users=inc.affected_users or [],
            investigation_id=str(inc.investigation_id) if inc.investigation_id else None,
            mitre_techniques=inc.mitre_techniques or [],
            assigned_to_id=str(inc.assigned_to_id) if inc.assigned_to_id else None,
            created_by_id=str(inc.created_by_id) if inc.created_by_id else None,
            opened_at=inc.opened_at,
            closed_at=inc.closed_at,
            created_at=inc.created_at,
            updated_at=inc.updated_at,
        )


@router.get("", response_model=list[IncidentRead], summary="List incidents")
async def list_incidents(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    status: IncidentStatus | None = None,
    severity: IncidentSeverity | None = None,
) -> list[IncidentRead]:
    q = select(Incident).order_by(Incident.created_at.desc())
    if status:
        q = q.where(Incident.status == status)
    if severity:
        q = q.where(Incident.severity == severity)
    incidents = (await db.execute(q)).scalars().all()
    return [IncidentRead.from_orm(inc) for inc in incidents]


@router.post("", response_model=IncidentRead, status_code=status.HTTP_201_CREATED, summary="Create incident")
async def create_incident(
    payload: IncidentCreate,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> IncidentRead:
    inv_id = uuid.UUID(payload.investigation_id) if payload.investigation_id else None
    inc = Incident(
        title=payload.title,
        description=payload.description,
        severity=payload.severity,
        investigation_id=inv_id,
        affected_systems=payload.affected_systems,
        affected_users=payload.affected_users,
        mitre_techniques=payload.mitre_techniques,
        created_by_id=current_user.id,
        assigned_to_id=current_user.id,
    )
    db.add(inc)
    await db.flush()

    await record_audit_event(
        db,
        action=AuditAction.incident_created,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="incident",
        target_id=str(inc.id),
    )

    return IncidentRead.from_orm(inc)


@router.get("/{incident_id}", response_model=IncidentRead, summary="Get incident details")
async def get_incident(
    incident_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> IncidentRead:
    iid = uuid.UUID(incident_id)
    inc = (await db.execute(select(Incident).where(Incident.id == iid))).scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentRead.from_orm(inc)


@router.patch("/{incident_id}", response_model=IncidentRead, summary="Update incident status / summaries")
async def update_incident(
    incident_id: str,
    payload: IncidentUpdate,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> IncidentRead:
    iid = uuid.UUID(incident_id)
    inc = (await db.execute(select(Incident).where(Incident.id == iid))).scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    update_dict = payload.model_dump(exclude_none=True)
    for k, v in update_dict.items():
        setattr(inc, k, v)

    if payload.status == IncidentStatus.closed and not inc.closed_at:
        inc.closed_at = datetime.now(UTC)

    await record_audit_event(
        db,
        action=AuditAction.incident_updated,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="incident",
        target_id=incident_id,
        metadata=update_dict,
    )

    return IncidentRead.from_orm(inc)
