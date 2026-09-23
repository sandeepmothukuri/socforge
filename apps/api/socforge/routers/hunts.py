"""Threat hunting router — hunting cases, queries, observations, and promotion to findings."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from socforge.auth.dependencies import CurrentAnalyst, CurrentUser
from socforge.database import get_db
from socforge.models.hunt import Hunt, HuntObservation, HuntQuery, HuntStatus
from socforge.models.investigation import Finding, FindingConfidence
from socforge.models.operations import AuditAction
from socforge.services.audit import record_audit_event

router = APIRouter(prefix="/hunts", tags=["Threat Hunting"])


class HuntCreate(BaseModel):
    title: str = Field(..., max_length=512)
    hypothesis: str = Field(..., min_length=10)
    description: str | None = None
    mitre_techniques: list[str] = Field(default_factory=list)


class HuntQueryCreate(BaseModel):
    name: str = Field(..., max_length=256)
    description: str | None = None
    query_text: str = Field(..., min_length=3)
    query_language: str = "lucene"
    filters: dict[str, Any] = Field(default_factory=dict)


class HuntObservationCreate(BaseModel):
    title: str = Field(..., max_length=512)
    description: str = Field(..., min_length=10)
    supporting_event_ids: list[str] = Field(default_factory=list)
    entity_values: list[str] = Field(default_factory=list)


class PromoteObservationRequest(BaseModel):
    investigation_id: str
    confidence: FindingConfidence = FindingConfidence.medium


class HuntObservationRead(BaseModel):
    id: str
    hunt_id: str
    title: str
    description: str
    supporting_event_ids: list[str]
    entity_values: list[str]
    promoted_to_finding_id: str | None
    created_at: datetime


class HuntQueryRead(BaseModel):
    id: str
    hunt_id: str
    name: str
    description: str | None
    query_text: str
    query_language: str
    filters: dict[str, Any]
    created_at: datetime


class HuntRead(BaseModel):
    id: str
    title: str
    hypothesis: str
    description: str | None
    status: str
    mitre_techniques: list[str]
    assigned_to_id: str | None
    created_by_id: str | None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None
    queries: list[HuntQueryRead]
    observations: list[HuntObservationRead]

    @classmethod
    def from_orm(cls, h: Hunt) -> HuntRead:
        return cls(
            id=str(h.id),
            title=h.title,
            hypothesis=h.hypothesis,
            description=h.description,
            status=h.status.value,
            mitre_techniques=h.mitre_techniques or [],
            assigned_to_id=str(h.assigned_to_id) if h.assigned_to_id else None,
            created_by_id=str(h.created_by_id) if h.created_by_id else None,
            created_at=h.created_at,
            updated_at=h.updated_at,
            completed_at=h.completed_at,
            queries=[
                HuntQueryRead(
                    id=str(q.id),
                    hunt_id=str(q.hunt_id),
                    name=q.name,
                    description=q.description,
                    query_text=q.query_text,
                    query_language=q.query_language,
                    filters=q.filters or {},
                    created_at=q.created_at,
                )
                for q in (h.queries or [])
            ],
            observations=[
                HuntObservationRead(
                    id=str(o.id),
                    hunt_id=str(o.hunt_id),
                    title=o.title,
                    description=o.description,
                    supporting_event_ids=o.supporting_event_ids or [],
                    entity_values=o.entity_values or [],
                    promoted_to_finding_id=str(o.promoted_to_finding_id)
                    if o.promoted_to_finding_id
                    else None,
                    created_at=o.created_at,
                )
                for o in (h.observations or [])
            ],
        )


@router.get("", response_model=list[HuntRead], summary="List threat hunts")
async def list_hunts(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    status: HuntStatus | None = None,
) -> list[HuntRead]:
    q = (
        select(Hunt)
        .options(selectinload(Hunt.queries), selectinload(Hunt.observations))
        .order_by(Hunt.created_at.desc())
    )
    if status:
        q = q.where(Hunt.status == status)
    hunts = (await db.execute(q)).scalars().all()
    return [HuntRead.from_orm(h) for h in hunts]


@router.post("", response_model=HuntRead, status_code=status.HTTP_201_CREATED, summary="Create a threat hunt")
async def create_hunt(
    payload: HuntCreate,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> HuntRead:
    hunt = Hunt(
        title=payload.title,
        hypothesis=payload.hypothesis,
        description=payload.description,
        mitre_techniques=payload.mitre_techniques,
        created_by_id=current_user.id,
        assigned_to_id=current_user.id,
    )
    db.add(hunt)
    await db.flush()

    await record_audit_event(
        db,
        action=AuditAction.hunt_created,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="hunt",
        target_id=str(hunt.id),
    )

    q = (
        select(Hunt)
        .where(Hunt.id == hunt.id)
        .options(selectinload(Hunt.queries), selectinload(Hunt.observations))
    )
    res = await db.execute(q)
    return HuntRead.from_orm(res.scalar_one())


@router.post("/{hunt_id}/queries", response_model=HuntQueryRead, summary="Save hunting query")
async def add_hunt_query(
    hunt_id: str,
    payload: HuntQueryCreate,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> HuntQueryRead:
    hid = uuid.UUID(hunt_id)
    query_obj = HuntQuery(
        hunt_id=hid,
        name=payload.name,
        description=payload.description,
        query_text=payload.query_text,
        query_language=payload.query_language,
        filters=payload.filters,
    )
    db.add(query_obj)
    await db.flush()
    return HuntQueryRead(
        id=str(query_obj.id),
        hunt_id=str(query_obj.hunt_id),
        name=query_obj.name,
        description=query_obj.description,
        query_text=query_obj.query_text,
        query_language=query_obj.query_language,
        filters=query_obj.filters or {},
        created_at=query_obj.created_at,
    )


@router.post("/{hunt_id}/observations", response_model=HuntObservationRead, summary="Record hunting observation")
async def add_hunt_observation(
    hunt_id: str,
    payload: HuntObservationCreate,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> HuntObservationRead:
    hid = uuid.UUID(hunt_id)
    obs = HuntObservation(
        hunt_id=hid,
        title=payload.title,
        description=payload.description,
        supporting_event_ids=payload.supporting_event_ids,
        entity_values=payload.entity_values,
    )
    db.add(obs)
    await db.flush()
    return HuntObservationRead(
        id=str(obs.id),
        hunt_id=str(obs.hunt_id),
        title=obs.title,
        description=obs.description,
        supporting_event_ids=obs.supporting_event_ids or [],
        entity_values=obs.entity_values or [],
        promoted_to_finding_id=None,
        created_at=obs.created_at,
    )


@router.post("/{hunt_id}/observations/{obs_id}/promote", summary="Promote observation to an investigation finding")
async def promote_observation(
    hunt_id: str,
    obs_id: str,
    req: PromoteObservationRequest,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, str]:
    oid = uuid.UUID(obs_id)
    obs = (await db.execute(select(HuntObservation).where(HuntObservation.id == oid))).scalar_one_or_none()
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")

    inv_id = uuid.UUID(req.investigation_id)
    finding = Finding(
        investigation_id=inv_id,
        created_by_id=current_user.id,
        title=f"[Hunt] {obs.title}",
        description=obs.description,
        confidence=req.confidence,
        supporting_event_ids=obs.supporting_event_ids or [],
    )
    db.add(finding)
    await db.flush()

    obs.promoted_to_finding_id = finding.id

    await record_audit_event(
        db,
        action=AuditAction.finding_created,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="finding",
        target_id=str(finding.id),
        metadata={"promoted_from_hunt_observation": str(obs.id)},
    )

    return {
        "status": "promoted",
        "observation_id": str(obs.id),
        "finding_id": str(finding.id),
        "investigation_id": req.investigation_id,
    }
