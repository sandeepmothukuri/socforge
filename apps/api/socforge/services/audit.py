"""Audit event service — centralized audit logging."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from socforge.models.operations import AuditAction, AuditEvent


async def record_audit_event(
    db: AsyncSession,
    action: AuditAction,
    actor_id: str | None = None,
    actor_email: str | None = None,
    target_type: str | None = None,
    target_id: str | None = None,
    success: bool = True,
    error_message: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Create and persist an audit event record.

    This function is intentionally simple and synchronous-within-async
    to ensure audit events are never silently dropped.
    """
    event = AuditEvent(
        action=action,
        actor_id=uuid.UUID(actor_id) if actor_id else None,
        actor_email=actor_email,
        target_type=target_type,
        target_id=uuid.UUID(target_id) if target_id else None,
        success=success,
        error_message=error_message,
        ip_address=ip_address,
        user_agent=user_agent,
        extra_metadata=metadata,
    )
    db.add(event)
    # Note: do not commit here — caller controls the transaction
    return event
