"""SQLAlchemy models — Incidents, Agent Runs, Audit Events, Integrations, Workspaces."""

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
    workspace_created = "WORKSPACE_CREATED"
    workspace_member_added = "WORKSPACE_MEMBER_ADDED"
    workspace_member_removed = "WORKSPACE_MEMBER_REMOVED"


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    severity: Mapped[IncidentSeverity] = mapped_column(
        Enum(IncidentSeverity, name="incident_severity"), nullable=False, default=IncidentSeverity.medium
    )
    status: Mapped[IncidentStatus] = mapped_column(
        Enum(IncidentStatus, name="incident_status"), nullable=False, default=IncidentStatus.open
    )

    # Workspace scoping
    workspace_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="SET NULL"), index=True
    )

    commander_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )

    mitre_techniques: Mapped[list[str] | None] = mapped_column(JSONB, default=list)
    mitre_tactics: Mapped[list[str] | None] = mapped_column(JSONB, default=list)
    extra_metadata: Mapped[dict | None] = mapped_column(JSONB, default=dict)

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
        Index("ix_incidents_workspace", "workspace_id"),
    )

    def __repr__(self) -> str:
        return f"<Incident {self.id} [{self.severity}] {self.title[:40]}>"


class AgentRun(Base):
    """Record of a single AI agent invocation."""

    __tablename__ = "agent_runs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    agent_type: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[AgentRunStatus] = mapped_column(
        Enum(AgentRunStatus, name="agent_run_status"),
        nullable=False,
        default=AgentRunStatus.queued,
    )

    # Polymorphic target: alert, investigation, hunt, etc.
    target_type: Mapped[str | None] = mapped_column(String(64))
    target_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))

    triggered_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )

    # Result storage
    input_payload: Mapped[dict | None] = mapped_column(JSONB)
    output_payload: Mapped[dict | None] = mapped_column(JSONB)
    error_message: Mapped[str | None] = mapped_column(Text)
    tool_calls_log: Mapped[list[dict] | None] = mapped_column(JSONB, default=list)

    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    tool_calls: Mapped[list["AgentToolCall"]] = relationship(
        "AgentToolCall", back_populates="agent_run", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_agent_runs_status", "status"),
        Index("ix_agent_runs_target", "target_type", "target_id"),
    )

    def __repr__(self) -> str:
        return f"<AgentRun {self.agent_type} [{self.status}]>"


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
    """Immutable audit trail for every sensitive action in SOCForge.

    Records WHO did WHAT to WHICH resource and WHEN.
    Records are write-once — never updated or deleted.
    """

    __tablename__ = "audit_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    action: Mapped[AuditAction] = mapped_column(
        Enum(AuditAction, name="audit_action"), nullable=False
    )
    actor_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), index=True)
    actor_email: Mapped[str | None] = mapped_column(String(256), index=True)

    target_type: Mapped[str | None] = mapped_column(String(64))
    target_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), index=True)

    # Context & Results
    success: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    error_message: Mapped[str | None] = mapped_column(Text)
    ip_address: Mapped[str | None] = mapped_column(String(45))
    user_agent: Mapped[str | None] = mapped_column(String(512))

    # Mapped to 'metadata' column in database while avoiding reserved name collision in DeclarativeBase
    extra_metadata: Mapped[dict | None] = mapped_column("metadata", JSONB, default=dict)

    request_id: Mapped[str | None] = mapped_column(String(128))
    source_ip: Mapped[str | None] = mapped_column(String(45))

    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False, index=True
    )

    __table_args__ = (
        Index("ix_audit_events_action", "action"),
        Index("ix_audit_events_occurred_at", "occurred_at"),
    )

    def __repr__(self) -> str:
        return f"<AuditEvent {self.action} by {self.actor_email} at {self.occurred_at}>"


class Integration(Base):
    """External tool integration configuration.

    Secrets are stored encrypted (key: encrypted_secret_blob).
    Plain text credentials must NEVER be stored in this table.
    """

    __tablename__ = "integrations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    integration_type: Mapped[str] = mapped_column(String(64), nullable=False)  # e.g. "splunk", "elastic"
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Configuration (non-secret fields: host, port, index, etc.)
    config: Mapped[dict | None] = mapped_column(JSONB, default=dict)

    # Encrypted secret blob (AES-256-GCM encrypted JSON of secret fields)
    encrypted_secrets: Mapped[str | None] = mapped_column(Text)

    workspace_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="SET NULL"), index=True
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )
    last_checked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_check_ok: Mapped[bool | None] = mapped_column(Boolean)
    last_check_error: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        Index("ix_integrations_type", "integration_type"),
        Index("ix_integrations_workspace", "workspace_id"),
    )

    def __repr__(self) -> str:
        return f"<Integration {self.name} [{self.integration_type}]>"


class Workspace(Base):
    """Workspace — a multi-tenant isolation boundary for SOCForge.

    All security resources (alerts, investigations, detections, incidents,
    hunts, response actions) are scoped to a workspace.
    Members are tracked via WorkspaceMembership.
    """

    __tablename__ = "workspaces"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    slug: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    owner_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    members: Mapped[list["WorkspaceMembership"]] = relationship(
        "WorkspaceMembership", back_populates="workspace", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("ix_workspaces_slug_active", "slug", "is_active"),)

    def __repr__(self) -> str:
        return f"<Workspace {self.slug} [{self.name}]>"


class WorkspaceMemberRole(str, PyEnum):
    owner = "owner"
    admin = "admin"
    analyst = "analyst"
    detection_engineer = "detection_engineer"
    incident_commander = "incident_commander"
    viewer = "viewer"


class WorkspaceMembership(Base):
    """User membership in a workspace with a role.

    This is the authoritative record of who can access which workspace.
    Every workspace-scoped API query must JOIN on this table.
    """

    __tablename__ = "workspace_memberships"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[WorkspaceMemberRole] = mapped_column(
        Enum(WorkspaceMemberRole, name="workspace_member_role"),
        nullable=False,
        default=WorkspaceMemberRole.analyst,
    )
    added_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    workspace: Mapped[Workspace] = relationship("Workspace", back_populates="members")

    __table_args__ = (
        Index("ix_workspace_memberships_unique", "workspace_id", "user_id", unique=True),
        Index("ix_workspace_memberships_user", "user_id"),
    )

    def __repr__(self) -> str:
        return f"<WorkspaceMembership user={self.user_id} workspace={self.workspace_id} role={self.role}>"


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
    """A containment or mitigation action requiring authorized approval.

    Implements four-eyes principle: the requester cannot approve their own action.
    Execution is SIMULATED unless a real connector is configured.
    """

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

    # Workspace scoping
    workspace_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="SET NULL"), index=True
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
        Index("ix_response_actions_workspace", "workspace_id"),
    )

    def __repr__(self) -> str:
        return f"<ResponseAction {self.action_type} [{self.status}] on {self.target_entity_value}>"
