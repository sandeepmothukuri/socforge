"""Investigations router — create, list, view workspace, add findings."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from socforge.auth.dependencies import CurrentAnalyst, CurrentUser
from socforge.database import get_db
from socforge.models.alert import Alert, Entity, EntityRelationship, Event
from socforge.models.investigation import Finding, FindingConfidence, Investigation, InvestigationAlert, InvestigationStatus
from socforge.models.operations import AuditAction
from socforge.services.audit import record_audit_event


router = APIRouter(prefix="/investigations", tags=["Investigations"])


class InvestigationCreate(BaseModel):
    title: str = Field(..., max_length=512)
    description: str | None = None
    severity: str | None = None
    alert_ids: list[str] = Field(default_factory=list)
    mitre_techniques: list[str] = Field(default_factory=list)
    mitre_tactics: list[str] = Field(default_factory=list)


class InvestigationUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: InvestigationStatus | None = None
    severity: str | None = None
    notes: str | None = None
    mitre_techniques: list[str] | None = None
    assigned_to_id: str | None = None


class FindingCreate(BaseModel):
    title: str = Field(..., max_length=512)
    description: str = Field(..., min_length=10)
    confidence: FindingConfidence = FindingConfidence.medium
    mitre_techniques: list[str] = Field(default_factory=list)
    mitre_tactics: list[str] = Field(default_factory=list)
    supporting_event_ids: list[str] = Field(default_factory=list)
    supporting_entity_ids: list[str] = Field(default_factory=list)
    response_recommendations: list[str] = Field(default_factory=list)
    justification: str | None = Field(default=None, description="Required justification if no supporting events are linked")



class FindingRead(BaseModel):
    id: str
    investigation_id: str
    title: str
    description: str
    confidence: str
    mitre_techniques: list[str]
    mitre_tactics: list[str]
    supporting_event_ids: list[str]
    supporting_entity_ids: list[str]
    response_recommendations: list[str]
    has_detection_hypothesis: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm(cls, f: Finding) -> "FindingRead":
        return cls(
            id=str(f.id),
            investigation_id=str(f.investigation_id),
            title=f.title,
            description=f.description,
            confidence=f.confidence.value,
            mitre_techniques=f.mitre_techniques or [],
            mitre_tactics=f.mitre_tactics or [],
            supporting_event_ids=f.supporting_event_ids or [],
            supporting_entity_ids=f.supporting_entity_ids or [],
            response_recommendations=f.response_recommendations or [],
            has_detection_hypothesis=f.has_detection_hypothesis,
            created_at=f.created_at,
            updated_at=f.updated_at,
        )


class InvestigationRead(BaseModel):
    id: str
    title: str
    description: str | None
    status: str
    severity: str | None
    risk_score: float | None
    assigned_to_id: str | None
    created_by_id: str | None
    mitre_techniques: list[str]
    mitre_tactics: list[str]
    notes: str | None
    opened_at: datetime
    closed_at: datetime | None
    created_at: datetime
    updated_at: datetime
    alert_count: int
    finding_count: int

    @classmethod
    def from_orm(cls, inv: Investigation) -> "InvestigationRead":
        return cls(
            id=str(inv.id),
            title=inv.title,
            description=inv.description,
            status=inv.status.value,
            severity=inv.severity,
            risk_score=inv.risk_score,
            assigned_to_id=str(inv.assigned_to_id) if inv.assigned_to_id else None,
            created_by_id=str(inv.created_by_id) if inv.created_by_id else None,
            mitre_techniques=inv.mitre_techniques or [],
            mitre_tactics=inv.mitre_tactics or [],
            notes=inv.notes,
            opened_at=inv.opened_at,
            closed_at=inv.closed_at,
            created_at=inv.created_at,
            updated_at=inv.updated_at,
            alert_count=len(inv.investigation_alerts),
            finding_count=len(inv.findings),
        )


class GraphNode(BaseModel):
    id: str
    type: str
    label: str
    data: dict[str, Any]


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str


class EvidenceGraph(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


@router.get("", response_model=list[InvestigationRead], summary="List investigations")
async def list_investigations(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: InvestigationStatus | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
) -> list[InvestigationRead]:
    query = select(Investigation).options(
        selectinload(Investigation.investigation_alerts),
        selectinload(Investigation.findings),
    )
    if status_filter:
        query = query.where(Investigation.status == status_filter)
    query = query.order_by(Investigation.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    return [InvestigationRead.from_orm(inv) for inv in result.scalars()]


@router.post(
    "",
    response_model=InvestigationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create investigation",
)
async def create_investigation(
    payload: InvestigationCreate,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> InvestigationRead:
    inv = Investigation(
        title=payload.title,
        description=payload.description,
        severity=payload.severity,
        mitre_techniques=payload.mitre_techniques,
        mitre_tactics=payload.mitre_tactics,
        created_by_id=current_user.id,
        assigned_to_id=current_user.id,
    )
    db.add(inv)
    await db.flush()

    # Link alerts
    for alert_id_str in payload.alert_ids:
        try:
            aid = uuid.UUID(alert_id_str)
        except ValueError:
            continue
        result = await db.execute(select(Alert).where(Alert.id == aid))
        alert = result.scalar_one_or_none()
        if alert:
            link = InvestigationAlert(investigation_id=inv.id, alert_id=aid)
            db.add(link)
            # Update alert status
            alert.status = "investigating"

    await db.flush()
    await record_audit_event(
        db,
        action=AuditAction.investigation_created,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="investigation",
        target_id=str(inv.id),
    )

    # Reload with relationships
    result2 = await db.execute(
        select(Investigation)
        .where(Investigation.id == inv.id)
        .options(
            selectinload(Investigation.investigation_alerts),
            selectinload(Investigation.findings),
        )
    )
    inv = result2.scalar_one()
    return InvestigationRead.from_orm(inv)


@router.get("/{investigation_id}", response_model=InvestigationRead, summary="Get investigation")
async def get_investigation(
    investigation_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> InvestigationRead:
    try:
        iid = uuid.UUID(investigation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid investigation ID")

    result = await db.execute(
        select(Investigation)
        .where(Investigation.id == iid)
        .options(
            selectinload(Investigation.investigation_alerts),
            selectinload(Investigation.findings),
        )
    )
    inv = result.scalar_one_or_none()
    if inv is None:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return InvestigationRead.from_orm(inv)


@router.get(
    "/{investigation_id}/graph",
    response_model=EvidenceGraph,
    summary="Get evidence graph for an investigation",
)
async def get_investigation_graph(
    investigation_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> EvidenceGraph:
    """Return the evidence graph (nodes + edges) for React Flow rendering."""
    try:
        iid = uuid.UUID(investigation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid investigation ID")

    # Get all entity relationships scoped to this investigation
    rel_result = await db.execute(
        select(EntityRelationship)
        .where(EntityRelationship.investigation_id == iid)
        .options(
            selectinload(EntityRelationship.source_entity),
            selectinload(EntityRelationship.target_entity),
        )
    )
    relationships = rel_result.scalars().all()

    # Build node + edge sets
    nodes_dict: dict[str, GraphNode] = {}
    edges: list[GraphEdge] = []

    for rel in relationships:
        src = rel.source_entity
        tgt = rel.target_entity

        if str(src.id) not in nodes_dict:
            nodes_dict[str(src.id)] = GraphNode(
                id=str(src.id),
                type=src.entity_type.value,
                label=src.display_name or src.value,
                data={
                    "entity_type": src.entity_type.value,
                    "value": src.value,
                    "risk_score": src.risk_score,
                    "is_malicious": src.is_malicious,
                },
            )
        if str(tgt.id) not in nodes_dict:
            nodes_dict[str(tgt.id)] = GraphNode(
                id=str(tgt.id),
                type=tgt.entity_type.value,
                label=tgt.display_name or tgt.value,
                data={
                    "entity_type": tgt.entity_type.value,
                    "value": tgt.value,
                    "risk_score": tgt.risk_score,
                    "is_malicious": tgt.is_malicious,
                },
            )

        edges.append(
            GraphEdge(
                id=str(rel.id),
                source=str(src.id),
                target=str(tgt.id),
                label=rel.relationship_type.value.replace("_", " ").title(),
            )
        )

    return EvidenceGraph(nodes=list(nodes_dict.values()), edges=edges)


@router.post(
    "/{investigation_id}/findings",
    response_model=FindingRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a finding to an investigation",
)
async def create_finding(
    investigation_id: str,
    payload: FindingCreate,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> FindingRead:
    """Create an analyst finding backed by evidence.

    A finding is a documented analytical conclusion. It must have a
    description and confidence level. Supporting evidence is linked by ID.
    """
    try:
        iid = uuid.UUID(investigation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid investigation ID")

    result = await db.execute(select(Investigation).where(Investigation.id == iid))
    inv = result.scalar_one_or_none()
    if inv is None:
        raise HTTPException(status_code=404, detail="Investigation not found")

    # Evidence-backed validation
    valid_event_ids: list[str] = []
    if payload.supporting_event_ids:
        for eid_str in payload.supporting_event_ids:
            try:
                eid_uuid = uuid.UUID(eid_str)
                evt = (await db.execute(select(Event).where(Event.id == eid_uuid))).scalar_one_or_none()
                if evt:
                    valid_event_ids.append(str(evt.id))
            except ValueError:
                continue

    if not valid_event_ids and not payload.justification:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Findings must either be backed by valid supporting event telemetry or include an explicit justification.",
        )

    finding = Finding(
        investigation_id=iid,
        created_by_id=current_user.id,
        title=payload.title,
        description=payload.description,
        confidence=payload.confidence,
        mitre_techniques=payload.mitre_techniques,
        mitre_tactics=payload.mitre_tactics,
        supporting_event_ids=valid_event_ids,
        supporting_entity_ids=payload.supporting_entity_ids,
        response_recommendations=payload.response_recommendations,
        extra_metadata={"justification": payload.justification} if payload.justification else {},
    )

    db.add(finding)
    await db.flush()

    await record_audit_event(
        db,
        action=AuditAction.finding_created,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="finding",
        target_id=str(finding.id),
        metadata={"investigation_id": investigation_id},
    )

    return FindingRead.from_orm(finding)


@router.get(
    "/{investigation_id}/findings",
    response_model=list[FindingRead],
    summary="List findings for an investigation",
)
async def list_findings(
    investigation_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[FindingRead]:
    try:
        iid = uuid.UUID(investigation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid investigation ID")

    result = await db.execute(
        select(Finding).where(Finding.investigation_id == iid).order_by(Finding.created_at.desc())
    )
    return [FindingRead.from_orm(f) for f in result.scalars()]
