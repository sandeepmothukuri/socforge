"""Audit and Response Actions routers."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from socforge.auth.dependencies import CurrentAnalyst, CurrentIncidentCommander, CurrentUser
from socforge.database import get_db
from socforge.models.operations import (
    AuditAction,
    AuditEvent,
    ResponseAction,
    ResponseActionStatus,
    ResponseActionType,
    Workspace,
)
from socforge.response.adapters import ResponseDispatcher
from socforge.services.audit import record_audit_event

router = APIRouter(prefix="/audit", tags=["Audit Log"])


# ── Schemas ──────────────────────────────────────────────────────────────────


class AuditEventRead(BaseModel):
    id: str
    action: str
    actor_id: str | None
    actor_email: str | None
    target_type: str | None
    target_id: str | None
    metadata: dict | None
    occurred_at: datetime

    @classmethod
    def from_orm(cls, a: AuditEvent) -> "AuditEventRead":
        return cls(
            id=str(a.id),
            action=a.action.value,
            actor_id=a.actor_id,
            actor_email=a.actor_email,
            target_type=a.target_type,
            target_id=a.target_id,
            metadata=a.extra_metadata or {},
            occurred_at=a.occurred_at,
        )


# ── Endpoints ────────────────────────────────────────────────────────────────


@router.get("", response_model=list[AuditEventRead], summary="Query audit trail")
async def list_audit_events(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    action: AuditAction | None = None,
    target_type: str | None = None,
    actor_email: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
) -> list[AuditEventRead]:
    """Query the immutable audit log."""
    query = select(AuditEvent)
    if action:
        query = query.where(AuditEvent.action == action)
    if target_type:
        query = query.where(AuditEvent.target_type == target_type)
    if actor_email:
        query = query.where(AuditEvent.actor_email == actor_email)

    query = query.order_by(AuditEvent.occurred_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    return [AuditEventRead.from_orm(e) for e in result.scalars()]


# ── Response Actions Router ──────────────────────────────────────────────────

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
    def from_orm(cls, r: ResponseAction) -> "ResponseActionRead":
        return cls(
            id=str(r.id),
            action_type=r.action_type.value,
            status=r.status.value,
            target_entity_type=r.target_entity_type,
            target_entity_value=r.target_entity_value,
            justification=r.justification,
            investigation_id=str(r.investigation_id) if r.investigation_id else None,
            incident_id=str(r.incident_id) if r.incident_id else None,
            requested_by_id=str(r.requested_by_id) if r.requested_by_id else None,
            approved_by_id=str(r.approved_by_id) if r.approved_by_id else None,
            approved_at=r.approved_at,
            execution_result=r.execution_result,
            error_message=r.error_message,
            created_at=r.created_at,
            updated_at=r.updated_at,
        )


@responses_router.get("", response_model=list[ResponseActionRead], summary="List containment response actions")
async def list_response_actions(
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
        raise HTTPException(
            status_code=403,
            detail="Separation of duties violation: Requester cannot approve their own containment action.",
        )

    # Dispatch to containment adapter (MockResponseAdapter returns clearly labeled SIMULATED execution)
    dispatcher = ResponseDispatcher()
    execution_result = await dispatcher.dispatch(action)

    action.status = ResponseActionStatus.completed
    action.approved_by_id = current_user.id
    action.approved_at = datetime.now(timezone.utc)
    action.execution_result = execution_result

    await record_audit_event(
        db,
        action=AuditAction.response_approved,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="response_action",
        target_id=action_id,
        metadata={
            "mode": execution_result.get("mode", "SIMULATED"),
            "action_type": action.action_type.value,
            "target": action.target_entity_value,
        },
    )

    await record_audit_event(
        db,
        action=AuditAction.response_executed,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="response_action",
        target_id=action_id,
        metadata=execution_result,
    )

    return ResponseActionRead.from_orm(action)


# ── Workspaces Router ────────────────────────────────────────────────────────

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
    workspaces = (await db.execute(select(Workspace).where(Workspace.is_active.is_(True)))).scalars().all()
    return [WorkspaceRead.from_orm(w) for w in workspaces]
