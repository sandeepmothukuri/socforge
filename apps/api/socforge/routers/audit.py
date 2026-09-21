"""Audit router — search and inspect immutable audit trail."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from socforge.auth.dependencies import CurrentAdminUser, CurrentUser
from socforge.database import get_db
from socforge.models.operations import AuditAction, AuditEvent

router = APIRouter(prefix="/audit", tags=["Audit Log"])


class AuditEventRead(BaseModel):
    id: str
    action: str
    actor_id: str | None
    actor_email: str | None
    target_type: str | None
    target_id: str | None
    success: bool
    error_message: str | None
    ip_address: str | None
    metadata: dict[str, Any]
    created_at: datetime

    @classmethod
    def from_orm(cls, ev: AuditEvent) -> "AuditEventRead":
        return cls(
            id=str(ev.id),
            action=ev.action.value,
            actor_id=str(ev.actor_id) if ev.actor_id else None,
            actor_email=ev.actor_email,
            target_type=ev.target_type,
            target_id=str(ev.target_id) if ev.target_id else None,
            success=ev.success,
            error_message=ev.error_message,
            ip_address=ev.ip_address,
            metadata=ev.extra_metadata or {},
            created_at=ev.created_at,
        )


class AuditListResponse(BaseModel):
    items: list[AuditEventRead]
    total: int
    page: int
    page_size: int


@router.get("", response_model=AuditListResponse, summary="Query audit logs")
async def list_audit_events(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    action: AuditAction | None = None,
    actor_email: str | None = None,
    target_type: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
) -> AuditListResponse:
    q = select(AuditEvent)
    if action:
        q = q.where(AuditEvent.action == action)
    if actor_email:
        q = q.where(AuditEvent.actor_email.ilike(f"%{actor_email}%"))
    if target_type:
        q = q.where(AuditEvent.target_type == target_type)

    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()

    q = q.order_by(AuditEvent.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    events = (await db.execute(q)).scalars().all()

    return AuditListResponse(
        items=[AuditEventRead.from_orm(e) for e in events],
        total=total,
        page=page,
        page_size=page_size,
    )


# ── Response Actions Router ──────────────────────────────────────────────────

from socforge.auth.dependencies import CurrentIncidentCommander, CurrentAnalyst
from socforge.models.operations import ResponseAction, ResponseActionStatus, ResponseActionType
from fastapi import HTTPException, status

responses_router = APIRouter(prefix="/responses", tags=["Response Actions"])


class ResponseActionCreate(BaseModel):
    action_type: ResponseActionType
    target_entity_type: str
    target_entity_value: str
    justification: str
    investigation_id: str | None = None
    incident_id: str | None = None


class ResponseActionRead(BaseModel):
    id: str
    action_type: str
    status: str
    target_entity_type: str
    target_entity_value: str
    justification: str
    investigation_id: str | None
    incident_id: str | None
    requested_by_id: str | None
    approved_by_id: str | None
    approved_at: datetime | None
    execution_result: dict | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm(cls, a: ResponseAction) -> "ResponseActionRead":
        return cls(
            id=str(a.id),
            action_type=a.action_type.value,
            status=a.status.value,
            target_entity_type=a.target_entity_type,
            target_entity_value=a.target_entity_value,
            justification=a.justification,
            investigation_id=str(a.investigation_id) if a.investigation_id else None,
            incident_id=str(a.incident_id) if a.incident_id else None,
            requested_by_id=str(a.requested_by_id) if a.requested_by_id else None,
            approved_by_id=str(a.approved_by_id) if a.approved_by_id else None,
            approved_at=a.approved_at,
            execution_result=a.execution_result or {},
            error_message=a.error_message,
            created_at=a.created_at,
            updated_at=a.updated_at,
        )


@responses_router.get("", response_model=list[ResponseActionRead], summary="List response actions")
async def list_responses(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    status: ResponseActionStatus | None = None,
) -> list[ResponseActionRead]:
    q = select(ResponseAction)
    if status:
        q = q.where(ResponseAction.status == status)
    q = q.order_by(ResponseAction.created_at.desc())
    res = await db.execute(q)
    return [ResponseActionRead.from_orm(r) for r in res.scalars()]


@responses_router.post("", response_model=ResponseActionRead, status_code=status.HTTP_201_CREATED, summary="Request containment response action")
async def request_response_action(
    payload: ResponseActionCreate,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ResponseActionRead:
    inv_id = uuid.UUID(payload.investigation_id) if payload.investigation_id else None
    inc_id = uuid.UUID(payload.incident_id) if payload.incident_id else None

    action = ResponseAction(
        action_type=payload.action_type,
        status=ResponseActionStatus.pending_approval,
        target_entity_type=payload.target_entity_type,
        target_entity_value=payload.target_entity_value,
        justification=payload.justification,
        investigation_id=inv_id,
        incident_id=inc_id,
        requested_by_id=current_user.id,
    )
    db.add(action)
    await db.flush()

    from socforge.services.audit import record_audit_event
    await record_audit_event(
        db,
        action=AuditAction.response_requested,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="response_action",
        target_id=str(action.id),
        metadata={"action_type": action.action_type.value, "target": action.target_entity_value},
    )

    return ResponseActionRead.from_orm(action)


@responses_router.post("/{action_id}/approve", response_model=ResponseActionRead, summary="Approve and execute response action")
async def approve_response_action(
    action_id: str,
    current_user: CurrentIncidentCommander,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ResponseActionRead:
    aid = uuid.UUID(action_id)
    action = (await db.execute(select(ResponseAction).where(ResponseAction.id == aid))).scalar_one_or_none()
    if not action:
        raise HTTPException(status_code=404, detail="Response action not found")

    if action.status != ResponseActionStatus.pending_approval:
        raise HTTPException(status_code=400, detail=f"Action cannot be approved in state {action.status.value}")

    # Enforce separation of duties: requester cannot approve
    if action.requested_by_id and action.requested_by_id == current_user.id:
        raise HTTPException(status_code=403, detail="Separation of duties violation: Requester cannot approve their own containment action.")

    action.status = ResponseActionStatus.completed
    action.approved_by_id = current_user.id
    action.approved_at = datetime.now(timezone.utc)
    action.execution_result = {
        "status": "success",
        "action": action.action_type.value,
        "target": action.target_entity_value,
        "detail": f"Successfully simulated execution of {action.action_type.value} against {action.target_entity_value}",
    }

    from socforge.services.audit import record_audit_event
    await record_audit_event(
        db,
        action=AuditAction.response_approved,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="response_action",
        target_id=action_id,
    )

    return ResponseActionRead.from_orm(action)


# ── Workspaces Router ────────────────────────────────────────────────────────

from socforge.models.operations import Workspace

workspaces_router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


class WorkspaceRead(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm(cls, w: Workspace) -> "WorkspaceRead":
        return cls(
            id=str(w.id),
            name=w.name,
            slug=w.slug,
            description=w.description,
            is_active=w.is_active,
            created_at=w.created_at,
            updated_at=w.updated_at,
        )


@workspaces_router.get("", response_model=list[WorkspaceRead], summary="List accessible workspaces")
async def list_workspaces(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[WorkspaceRead]:
    res = await db.execute(select(Workspace).where(Workspace.is_active == True).order_by(Workspace.name))
    return [WorkspaceRead.from_orm(w) for w in res.scalars()]

