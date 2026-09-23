"""Investigations router — create, triage, findings, evidence graph."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status as http_status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from socforge.auth.dependencies import CurrentAnalyst, CurrentUser
from socforge.database import get_db
from socforge.models.alert import Entity, EntityRelationship, Event
from socforge.models.investigation import (
    Finding,
    FindingConfidence,
    FindingEntity,
    FindingEvent,
    Investigation,
    InvestigationAlert,
    InvestigationStatus,
)
from socforge.models.operations import AuditAction, WorkspaceMembership
from socforge.services.audit import record_audit_event

router = APIRouter(prefix="/investigations", tags=["Investigations"])


# ── Schemas ──────────────────────────────────────────────────────────────────


class InvestigationCreate(BaseModel):
    title: str = Field(..., max_length=512)
    description: str | None = None
    severity: str | None = "medium"
    workspace_id: str | None = None
    alert_ids: list[str] = Field(default_factory=list)
    mitre_techniques: list[str] = Field(default_factory=list)
    mitre_tactics: list[str] = Field(default_factory=list)


class InvestigationUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: InvestigationStatus | None = None
    severity: str | None = None
    notes: str | None = None


class FindingCreate(BaseModel):
    title: str = Field(..., max_length=512)
    description: str = Field(..., min_length=10)
    confidence: FindingConfidence = FindingConfidence.medium
    mitre_techniques: list[str] = Field(default_factory=list)
    mitre_tactics: list[str] = Field(default_factory=list)
    supporting_event_ids: list[str] = Field(default_factory=list)
    supporting_entity_ids: list[str] = Field(default_factory=list)
    response_recommendations: list[str] = Field(default_factory=list)
    justification: str | None = Field(
        default=None, description="Analytical justification if no direct event IDs are linked"
    )


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

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm(cls, f: Finding) -> FindingRead:
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
        )


class InvestigationRead(BaseModel):
    id: str
    title: str
    description: str | None
    status: str
    severity: str | None
    risk_score: float | None
    workspace_id: str | None = None
    assigned_to_id: str | None
    created_by_id: str | None
    mitre_techniques: list[str]
    mitre_tactics: list[str]
    opened_at: datetime
    closed_at: datetime | None
    created_at: datetime
    updated_at: datetime
    alert_count: int = 0
    finding_count: int = 0

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm(
        cls,
        inv: Investigation,
        alert_count: int = 0,
        finding_count: int = 0,
    ) -> InvestigationRead:
        return cls(
            id=str(inv.id),
            title=inv.title,
            description=inv.description,
            status=inv.status.value,
            severity=inv.severity,
            risk_score=inv.risk_score,
            workspace_id=str(inv.workspace_id) if inv.workspace_id else None,
            assigned_to_id=str(inv.assigned_to_id) if inv.assigned_to_id else None,
            created_by_id=str(inv.created_by_id) if inv.created_by_id else None,
            mitre_techniques=inv.mitre_techniques or [],
            mitre_tactics=inv.mitre_tactics or [],
            opened_at=inv.opened_at,
            closed_at=inv.closed_at,
            created_at=inv.created_at,
            updated_at=inv.updated_at,
            alert_count=alert_count,
            finding_count=finding_count,
        )


class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    risk_score: float = 0.0
    properties: dict = Field(default_factory=dict)


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    relationship: str
    evidence_count: int = 0


class EvidenceGraph(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


# ── Endpoints ────────────────────────────────────────────────────────────────


@router.get("", response_model=list[InvestigationRead], summary="List investigations")
async def list_investigations(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    status: InvestigationStatus | None = None,
    workspace_id: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
) -> list[InvestigationRead]:
    query = select(Investigation).options(
        selectinload(Investigation.investigation_alerts),
        selectinload(Investigation.findings),
    )
    if status:
        query = query.where(Investigation.status == status)

    if not current_user.is_superuser:
        user_ws_ids = (
            (
                await db.execute(
                    select(WorkspaceMembership.workspace_id).where(
                        WorkspaceMembership.user_id == current_user.id
                    )
                )
            )
            .scalars()
            .all()
        )
        if workspace_id:
            try:
                wid = uuid.UUID(workspace_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid workspace ID") from None
            if wid not in user_ws_ids:
                raise HTTPException(
                    status_code=http_status.HTTP_403_FORBIDDEN,
                    detail="Access denied to requested workspace",
                )
            query = query.where(Investigation.workspace_id == wid)
        else:
            query = query.where(
                (Investigation.workspace_id.in_(user_ws_ids))
                | (Investigation.workspace_id.is_(None))
            )
    elif workspace_id:
        try:
            wid = uuid.UUID(workspace_id)
            query = query.where(Investigation.workspace_id == wid)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid workspace ID") from None

    query = query.order_by(Investigation.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    invs = result.scalars().all()
    return [
        InvestigationRead.from_orm(
            inv,
            alert_count=len(inv.investigation_alerts),
            finding_count=len(inv.findings),
        )
        for inv in invs
    ]


@router.post(
    "",
    response_model=InvestigationRead,
    status_code=http_status.HTTP_201_CREATED,
    summary="Create investigation",
)
async def create_investigation(
    payload: InvestigationCreate,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> InvestigationRead:
    target_ws_id: uuid.UUID | None = None
    if payload.workspace_id:
        try:
            target_ws_id = uuid.UUID(payload.workspace_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid workspace ID") from None
        if not current_user.is_superuser:
            mem = (
                await db.execute(
                    select(WorkspaceMembership).where(
                        WorkspaceMembership.workspace_id == target_ws_id,
                        WorkspaceMembership.user_id == current_user.id,
                    )
                )
            ).scalar_one_or_none()
            if not mem:
                raise HTTPException(
                    status_code=http_status.HTTP_403_FORBIDDEN,
                    detail="Cannot create investigation in a workspace you do not belong to",
                )
    else:
        first_mem = (
            await db.execute(
                select(WorkspaceMembership.workspace_id)
                .where(WorkspaceMembership.user_id == current_user.id)
                .limit(1)
            )
        ).scalar_one_or_none()
        target_ws_id = first_mem

    inv = Investigation(
        title=payload.title,
        description=payload.description,
        severity=payload.severity,
        workspace_id=target_ws_id,
        mitre_techniques=payload.mitre_techniques,
        mitre_tactics=payload.mitre_tactics,
        created_by_id=current_user.id,
        assigned_to_id=current_user.id,
    )
    db.add(inv)
    await db.flush()

    for alert_id_str in payload.alert_ids:
        try:
            aid = uuid.UUID(alert_id_str)
            db.add(InvestigationAlert(investigation_id=inv.id, alert_id=aid))
        except ValueError:
            continue

    await record_audit_event(
        db,
        action=AuditAction.investigation_created,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="investigation",
        target_id=str(inv.id),
        metadata={
            "alert_count": len(payload.alert_ids),
            "workspace_id": str(target_ws_id) if target_ws_id else None,
        },
    )
    await db.commit()
    await db.refresh(inv)

    return InvestigationRead.from_orm(inv, alert_count=len(payload.alert_ids))


@router.get("/{investigation_id}", response_model=InvestigationRead, summary="Get investigation")
async def get_investigation(
    investigation_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> InvestigationRead:
    try:
        iid = uuid.UUID(investigation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid investigation ID") from None

    result = await db.execute(
        select(Investigation)
        .options(
            selectinload(Investigation.investigation_alerts),
            selectinload(Investigation.findings),
        )
        .where(Investigation.id == iid)
    )
    inv = result.scalar_one_or_none()
    if inv is None:
        raise HTTPException(status_code=404, detail="Investigation not found")

    if inv.workspace_id and not current_user.is_superuser:
        mem = (
            await db.execute(
                select(WorkspaceMembership).where(
                    WorkspaceMembership.workspace_id == inv.workspace_id,
                    WorkspaceMembership.user_id == current_user.id,
                )
            )
        ).scalar_one_or_none()
        if not mem:
            raise HTTPException(
                status_code=http_status.HTTP_403_FORBIDDEN,
                detail="Access denied to this investigation's workspace",
            )

    return InvestigationRead.from_orm(
        inv,
        alert_count=len(inv.investigation_alerts),
        finding_count=len(inv.findings),
    )


@router.patch(
    "/{investigation_id}", response_model=InvestigationRead, summary="Update investigation"
)
async def update_investigation(
    investigation_id: str,
    payload: InvestigationUpdate,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> InvestigationRead:
    try:
        iid = uuid.UUID(investigation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid investigation ID") from None

    result = await db.execute(
        select(Investigation)
        .options(
            selectinload(Investigation.investigation_alerts),
            selectinload(Investigation.findings),
        )
        .where(Investigation.id == iid)
    )
    inv = result.scalar_one_or_none()
    if inv is None:
        raise HTTPException(status_code=404, detail="Investigation not found")

    if payload.title is not None:
        inv.title = payload.title
    if payload.description is not None:
        inv.description = payload.description
    if payload.severity is not None:
        inv.severity = payload.severity
    if payload.notes is not None:
        inv.notes = payload.notes
    if payload.status is not None:
        inv.status = payload.status
        if payload.status == InvestigationStatus.closed:
            inv.closed_at = datetime.now(UTC)

    inv.updated_at = datetime.now(UTC)

    await record_audit_event(
        db,
        action=AuditAction.investigation_updated,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="investigation",
        target_id=investigation_id,
        metadata={"status": inv.status.value},
    )

    return InvestigationRead.from_orm(
        inv,
        alert_count=len(inv.investigation_alerts),
        finding_count=len(inv.findings),
    )


@router.post(
    "/{investigation_id}/findings",
    response_model=FindingRead,
    status_code=http_status.HTTP_201_CREATED,
    summary="Create finding with evidence backing",
)
async def create_finding(
    investigation_id: str,
    payload: FindingCreate,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> FindingRead:
    """Create an analyst finding backed by evidence.

    A finding must be linked to at least one valid event or provide an explicit justification.
    Relational associations are recorded in finding_events and finding_entities.
    """
    try:
        iid = uuid.UUID(investigation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid investigation ID") from None

    result = await db.execute(select(Investigation).where(Investigation.id == iid))
    inv = result.scalar_one_or_none()
    if inv is None:
        raise HTTPException(status_code=404, detail="Investigation not found")

    # Validate and collect supporting event records
    valid_event_uuids: list[uuid.UUID] = []
    if payload.supporting_event_ids:
        for eid_str in payload.supporting_event_ids:
            try:
                eid_uuid = uuid.UUID(eid_str)
                evt = (
                    await db.execute(select(Event).where(Event.id == eid_uuid))
                ).scalar_one_or_none()
                if evt:
                    valid_event_uuids.append(evt.id)
            except ValueError:
                continue

    # Validate supporting entities
    valid_entity_uuids: list[uuid.UUID] = []
    if payload.supporting_entity_ids:
        for ent_str in payload.supporting_entity_ids:
            try:
                ent_uuid = uuid.UUID(ent_str)
                entity = (
                    await db.execute(select(Entity).where(Entity.id == ent_uuid))
                ).scalar_one_or_none()
                if entity:
                    valid_entity_uuids.append(entity.id)
            except ValueError:
                continue

    if not valid_event_uuids and not payload.justification:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Findings must either be backed by valid supporting event telemetry or include an explicit justification.",
        )

    valid_event_strs = [str(u) for u in valid_event_uuids]
    valid_entity_strs = [str(u) for u in valid_entity_uuids]

    finding = Finding(
        investigation_id=iid,
        created_by_id=current_user.id,
        title=payload.title,
        description=payload.description,
        confidence=payload.confidence,
        mitre_techniques=payload.mitre_techniques,
        mitre_tactics=payload.mitre_tactics,
        supporting_event_ids=valid_event_strs,
        supporting_entity_ids=valid_entity_strs,
        response_recommendations=payload.response_recommendations,
        extra_metadata={"justification": payload.justification} if payload.justification else {},
    )

    db.add(finding)
    await db.flush()

    # Populate relational association tables
    for eid in valid_event_uuids:
        db.add(FindingEvent(finding_id=finding.id, event_id=eid))
    for ent_id in valid_entity_uuids:
        db.add(FindingEntity(finding_id=finding.id, entity_id=ent_id))

    await record_audit_event(
        db,
        action=AuditAction.finding_created,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="finding",
        target_id=str(finding.id),
        metadata={"investigation_id": investigation_id, "evidence_count": len(valid_event_uuids)},
    )
    await db.commit()
    await db.refresh(finding)

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
        raise HTTPException(status_code=400, detail="Invalid investigation ID") from None

    result = await db.execute(
        select(Finding).where(Finding.investigation_id == iid).order_by(Finding.created_at.asc())
    )
    return [FindingRead.from_orm(f) for f in result.scalars()]


@router.get(
    "/{investigation_id}/graph",
    response_model=EvidenceGraph,
    summary="Get the evidence graph for an investigation",
)
async def get_evidence_graph(
    investigation_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> EvidenceGraph:
    """Build the typed evidence graph for this investigation."""
    try:
        iid = uuid.UUID(investigation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid investigation ID") from None

    # Verify investigation exists
    inv = (
        await db.execute(select(Investigation).where(Investigation.id == iid))
    ).scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    relationships_result = await db.execute(
        select(EntityRelationship)
        .options(
            selectinload(EntityRelationship.source_entity),
            selectinload(EntityRelationship.target_entity),
        )
        .where(EntityRelationship.investigation_id == iid)
    )
    rels = relationships_result.scalars().all()

    nodes_map: dict[str, GraphNode] = {}
    edges: list[GraphEdge] = []

    for rel in rels:
        src = rel.source_entity
        tgt = rel.target_entity

        if src and str(src.id) not in nodes_map:
            nodes_map[str(src.id)] = GraphNode(
                id=str(src.id),
                label=src.display_name or src.value,
                type=src.entity_type.value,
                risk_score=src.risk_score or 0.0,
                properties={"value": src.value},
            )

        if tgt and str(tgt.id) not in nodes_map:
            nodes_map[str(tgt.id)] = GraphNode(
                id=str(tgt.id),
                label=tgt.display_name or tgt.value,
                type=tgt.entity_type.value,
                risk_score=tgt.risk_score or 0.0,
                properties={"value": tgt.value},
            )

        edges.append(
            GraphEdge(
                id=str(rel.id),
                source=str(rel.source_entity_id),
                target=str(rel.target_entity_id),
                relationship=rel.relationship_type.value,
                evidence_count=len(rel.supporting_event_ids or []),
            )
        )

    # If no explicit EntityRelationships are bound directly to this investigation ID,
    # enrich the graph from the investigation's attached alerts, entities, and MITRE techniques
    if not nodes_map:
        ia_result = await db.execute(
            select(InvestigationAlert)
            .options(selectinload(InvestigationAlert.alert))
            .where(InvestigationAlert.investigation_id == iid)
        )
        for ia in ia_result.scalars().all():
            alert = ia.alert
            if not alert:
                continue

            user_node_id = None
            host_node_id = None
            proc_node_id = None

            if alert.username:
                user_node_id = f"user-{alert.username}"
                if user_node_id not in nodes_map:
                    nodes_map[user_node_id] = GraphNode(
                        id=user_node_id,
                        label=alert.username,
                        type="user",
                        risk_score=alert.risk_score or 0.5,
                        properties={"username": alert.username},
                    )

            if alert.source_host:
                host_node_id = f"host-{alert.source_host}"
                if host_node_id not in nodes_map:
                    nodes_map[host_node_id] = GraphNode(
                        id=host_node_id,
                        label=alert.source_host,
                        type="host",
                        risk_score=alert.risk_score or 0.5,
                        properties={"hostname": alert.source_host},
                    )

            if alert.process_name:
                proc_node_id = f"proc-{alert.process_name}"
                if proc_node_id not in nodes_map:
                    nodes_map[proc_node_id] = GraphNode(
                        id=proc_node_id,
                        label=alert.process_name,
                        type="process",
                        risk_score=alert.risk_score or 0.7,
                        properties={"process_name": alert.process_name},
                    )

            if user_node_id and host_node_id:
                edges.append(
                    GraphEdge(
                        id=f"edge-{user_node_id}-{host_node_id}",
                        source=user_node_id,
                        target=host_node_id,
                        relationship="USER_AUTHENTICATED_TO_HOST",
                        evidence_count=1,
                    )
                )

            if proc_node_id and host_node_id:
                edges.append(
                    GraphEdge(
                        id=f"edge-{proc_node_id}-{host_node_id}",
                        source=proc_node_id,
                        target=host_node_id,
                        relationship="PROCESS_RAN_ON_HOST",
                        evidence_count=1,
                    )
                )

        for tech in inv.mitre_techniques or []:
            tech_node_id = f"tech-{tech}"
            if tech_node_id not in nodes_map:
                nodes_map[tech_node_id] = GraphNode(
                    id=tech_node_id,
                    label=tech,
                    type="technique",
                    risk_score=inv.risk_score or 0.8,
                    properties={"technique": tech},
                )

    return EvidenceGraph(nodes=list(nodes_map.values()), edges=edges)
