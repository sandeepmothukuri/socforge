"""SQLAlchemy models — Incidents, Agent Runs, Audit Events, Integrations."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from socforge.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _new_uuid() -> uuid.UUID:
    return uuid.uuid4()


class IncidentSeverity(str, PyEnum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class IncidentStatus(str, PyEnum):
    open = "open"
    contained = "contained"
    eradicated = "eradicated"
    recovered = "recovered"
    closed = "closed"


class AgentRunStatus(str, PyEnum):
    queued = "queued"
    running = "running"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class AuditAction(str, PyEnum):
    login = "LOGIN"
    logout = "LOGOUT"
    alert_created = "ALERT_CREATED"
    alert_updated = "ALERT_UPDATED"
    investigation_created = "INVESTIGATION_CREATED"
    investigation_updated = "INVESTIGATION_UPDATED"
    finding_created = "FINDING_CREATED"
    finding_updated = "FINDING_UPDATED"
    ai_run_started = "AI_RUN_STARTED"
    ai_run_completed = "AI_RUN_COMPLETED"
    ai_tool_executed = "AI_TOOL_EXECUTED"
    detection_created = "DETECTION_CREATED"
    detection_updated = "DETECTION_UPDATED"
    detection_validated = "DETECTION_VALIDATED"
    detection_approved = "DETECTION_APPROVED"
    detection_rejected = "DETECTION_REJECTED"
    detection_tested = "DETECTION_TESTED"
    hunt_created = "HUNT_CREATED"
    hunt_updated = "HUNT_UPDATED"
    incident_created = "INCIDENT_CREATED"
    incident_updated = "INCIDENT_UPDATED"
    response_requested = "RESPONSE_REQUESTED"
    response_approved = "RESPONSE_APPROVED"
    response_executed = "RESPONSE_EXECUTED"
    api_key_created = "API_KEY_CREATED"
    api_key_revoked = "API_KEY_REVOKED"
    user_created = "USER_CREATED"
    user_updated = "USER_UPDATED"
    config_changed = "CONFIG_CHANGED"


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    severity: Mapped[IncidentSeverity] = mapped_column(
        Enum(IncidentSeverity, name="incident_severity"),
        nullable=False,
        default=IncidentSeverity.medium,
    )
    status: Mapped[IncidentStatus] = mapped_column(
        Enum(IncidentStatus, name="incident_status"),
        nullable=False,
        default=IncidentStatus.open,
    )

    # Summary fields
    executive_summary: Mapped[str | None] = mapped_column(Text)
    technical_summary: Mapped[str | None] = mapped_column(Text)
    timeline: Mapped[list[dict] | None] = mapped_column(JSONB, default=list)
    affected_systems: Mapped[list[str] | None] = mapped_column(JSONB, default=list)
    affected_users: Mapped[list[str] | None] = mapped_column(JSONB, default=list)

    # Investigation links
    investigation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("investigations.id", ondelete="SET NULL")
    )

    # MITRE ATT&CK
    mitre_techniques: Mapped[list[str] | None] = mapped_column(JSONB, default=list)

    assigned_to_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )

    opened_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    __table_args__ = (
        Index("ix_incidents_status", "status"),
        Index("ix_incidents_severity", "severity"),
    )


class AgentRun(Base):
    """Records an AI agent execution with its tool calls and results."""

    __tablename__ = "agent_runs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    agent_type: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[AgentRunStatus] = mapped_column(
        Enum(AgentRunStatus, name="agent_run_status"),
        nullable=False,
        default=AgentRunStatus.queued,
    )

    # What this agent was given
    input_context: Mapped[dict | None] = mapped_column(JSONB)

    # Target object (investigation, alert, etc.)
    target_type: Mapped[str | None] = mapped_column(String(64))
    target_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))

    # AI provider info
    ai_provider: Mapped[str | None] = mapped_column(String(64))
    ai_model: Mapped[str | None] = mapped_column(String(128))

    # Results
    output: Mapped[dict | None] = mapped_column(JSONB)
    error_message: Mapped[str | None] = mapped_column(Text)

    # Timing
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    duration_ms: Mapped[int | None] = mapped_column(Integer)

    # Token usage (when available)
    prompt_tokens: Mapped[int | None] = mapped_column(Integer)
    completion_tokens: Mapped[int | None] = mapped_column(Integer)

    initiated_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    celery_task_id: Mapped[str | None] = mapped_column(String(256))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    tool_calls: Mapped[list["AgentToolCall"]] = relationship(
        "AgentToolCall", back_populates="agent_run"
    )

    __table_args__ = (
        Index("ix_agent_runs_status", "status"),
        Index("ix_agent_runs_target", "target_type", "target_id"),
    )


class AgentToolCall(Base):
    """Records a single tool call made by an AI agent."""

    __tablename__ = "agent_tool_calls"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    agent_run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False
    )
    tool_name: Mapped[str] = mapped_column(String(128), nullable=False)
    tool_input: Mapped[dict | None] = mapped_column(JSONB)
    tool_output: Mapped[dict | None] = mapped_column(JSONB)
    success: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    error_message: Mapped[str | None] = mapped_column(Text)
    duration_ms: Mapped[int | None] = mapped_column(Integer)
    called_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    agent_run: Mapped[AgentRun] = relationship("AgentRun", back_populates="tool_calls")

    __table_args__ = (Index("ix_agent_tool_calls_run", "agent_run_id"),)


class AuditEvent(Base):
    """Append-only audit log. Never updated, only inserted."""

    __tablename__ = "audit_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    action: Mapped[AuditAction] = mapped_column(
        Enum(AuditAction, name="audit_action"), nullable=False
    )

    # Who performed the action
    actor_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), index=True)
    actor_email: Mapped[str | None] = mapped_column(String(254))

    # What was affected
    target_type: Mapped[str | None] = mapped_column(String(64))
    target_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))

    # Result
    success: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    error_message: Mapped[str | None] = mapped_column(Text)

    # Context
    ip_address: Mapped[str | None] = mapped_column(String(45))
    user_agent: Mapped[str | None] = mapped_column(String(512))
    extra_metadata: Mapped[dict | None] = mapped_column(JSONB)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    __table_args__ = (
        Index("ix_audit_events_action", "action"),
        Index("ix_audit_events_actor", "actor_id"),
        Index("ix_audit_events_created_at", "created_at"),
        Index("ix_audit_events_target", "target_type", "target_id"),
    )


class Integration(Base):
    """Registered security data source / SIEM integration."""

    __tablename__ = "integrations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(256), nullable=False)
    integration_type: Mapped[str] = mapped_column(String(64), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Encrypted configuration (secrets redacted from logs)
    config: Mapped[dict | None] = mapped_column(JSONB, default=dict)

    # Capabilities this integration supports
    capabilities: Mapped[list[str] | None] = mapped_column(JSONB, default=list)

    last_health_check_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_health_status: Mapped[str | None] = mapped_column(String(32))
    last_error: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    __table_args__ = (Index("ix_integrations_type", "integration_type"),)


class Workspace(Base):
    """Multi-tenant or team boundary isolating security operations assets."""

    __tablename__ = "workspaces"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    settings: Mapped[dict | None] = mapped_column(JSONB, default=dict)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    __table_args__ = (Index("ix_workspaces_slug_active", "slug", "is_active"),)

    def __repr__(self) -> str:
        return f"<Workspace {self.slug} [{self.name}]>"


class ResponseActionStatus(str, PyEnum):
    pending_approval = "pending_approval"
    approved = "approved"
    rejected = "rejected"
    executing = "executing"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class ResponseActionType(str, PyEnum):
    isolate_host = "isolate_host"
    unisolate_host = "unisolate_host"
    block_ip = "block_ip"
    unblock_ip = "unblock_ip"
    block_domain = "block_domain"
    disable_user = "disable_user"
    revoke_session = "revoke_session"
    kill_process = "kill_process"
    quarantine_file = "quarantine_file"


class ResponseAction(Base):
    """A containment or mitigation action requiring authorized approval."""

    __tablename__ = "response_actions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    action_type: Mapped[ResponseActionType] = mapped_column(
        Enum(ResponseActionType, name="response_action_type"), nullable=False
    )
    status: Mapped[ResponseActionStatus] = mapped_column(
        Enum(ResponseActionStatus, name="response_action_status"),
        nullable=False,
        default=ResponseActionStatus.pending_approval,
    )

    # Target entity details
    target_entity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    target_entity_value: Mapped[str] = mapped_column(String(512), nullable=False)
    justification: Mapped[str] = mapped_column(Text, nullable=False)

    # Links
    investigation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("investigations.id", ondelete="SET NULL"), index=True
    )
    incident_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="SET NULL"), index=True
    )

    # Actor lifecycle
    requested_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    approved_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    execution_result: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    error_message: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    __table_args__ = (
        Index("ix_response_actions_status", "status"),
        Index("ix_response_actions_type", "action_type"),
    )

    def __repr__(self) -> str:
        return f"<ResponseAction {self.action_type} [{self.status}] on {self.target_entity_value}>"

