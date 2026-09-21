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
