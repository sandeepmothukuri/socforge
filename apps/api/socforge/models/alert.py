"""SQLAlchemy models — Alerts, Events, Entities, Entity Relationships."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from socforge.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _new_uuid() -> uuid.UUID:
    return uuid.uuid4()


class AlertStatus(str, PyEnum):
    new = "new"
    triaged = "triaged"
    investigating = "investigating"
    resolved = "resolved"
    false_positive = "false_positive"
    closed = "closed"


class AlertSeverity(str, PyEnum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"
    informational = "informational"


class EntityType(str, PyEnum):
    alert = "alert"
    event = "event"
    user = "user"
    host = "host"
    ip_address = "ip_address"
    domain = "domain"
    url = "url"
    hash = "hash"
    process = "process"
    file = "file"
    technique = "technique"
    tactic = "tactic"
    finding = "finding"
    detection = "detection"
    incident = "incident"
    response_action = "response_action"


class RelationshipType(str, PyEnum):
    alert_contains_event = "ALERT_CONTAINS_EVENT"
    event_involves_user = "EVENT_INVOLVES_USER"
    event_source_ip = "EVENT_SOURCE_IP"
    event_target_host = "EVENT_TARGET_HOST"
    event_target_ip = "EVENT_TARGET_IP"
    process_executed_file = "PROCESS_EXECUTED_FILE"
    process_ran_on_host = "PROCESS_RAN_ON_HOST"
    host_connected_to_ip = "HOST_CONNECTED_TO_IP"
    host_connected_to_domain = "HOST_CONNECTED_TO_DOMAIN"
    hash_seen_on_host = "HASH_SEEN_ON_HOST"
    hash_seen_in_process = "HASH_SEEN_IN_PROCESS"
    finding_supported_by_event = "FINDING_SUPPORTED_BY_EVENT"
    finding_maps_to_technique = "FINDING_MAPS_TO_TECHNIQUE"
    finding_involves_entity = "FINDING_INVOLVES_ENTITY"
    detection_derived_from_finding = "DETECTION_DERIVED_FROM_FINDING"
    incident_contains_alert = "INCIDENT_CONTAINS_ALERT"
    response_action_targets_entity = "RESPONSE_ACTION_TARGETS_ENTITY"
    ip_resolves_to_domain = "IP_RESOLVES_TO_DOMAIN"
    user_authenticated_to_host = "USER_AUTHENTICATED_TO_HOST"
    user_ran_process = "USER_RAN_PROCESS"


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    external_id: Mapped[str | None] = mapped_column(String(256), index=True)
    source: Mapped[str] = mapped_column(String(128), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    severity: Mapped[AlertSeverity] = mapped_column(
        Enum(AlertSeverity, name="alert_severity"), nullable=False, default=AlertSeverity.medium
    )
    status: Mapped[AlertStatus] = mapped_column(
        Enum(AlertStatus, name="alert_status"), nullable=False, default=AlertStatus.new
    )
    risk_score: Mapped[float | None] = mapped_column(Float, default=0.0)

    # Normalized fields
    event_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    source_ip: Mapped[str | None] = mapped_column(String(45))
    destination_ip: Mapped[str | None] = mapped_column(String(45))
    source_host: Mapped[str | None] = mapped_column(String(256))
    destination_host: Mapped[str | None] = mapped_column(String(256))
    username: Mapped[str | None] = mapped_column(String(256))
    process_name: Mapped[str | None] = mapped_column(String(256))
    process_command_line: Mapped[str | None] = mapped_column(Text)
    file_hash: Mapped[str | None] = mapped_column(String(128))
    domain: Mapped[str | None] = mapped_column(String(256))
    url: Mapped[str | None] = mapped_column(Text)

    # MITRE ATT&CK
    mitre_techniques: Mapped[list[str] | None] = mapped_column(JSONB, default=list)
    mitre_tactics: Mapped[list[str] | None] = mapped_column(JSONB, default=list)

    # Raw event data
    raw_event: Mapped[dict | None] = mapped_column(JSONB)
    extra_metadata: Mapped[dict | None] = mapped_column(JSONB, default=dict)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )
    ingested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    # Relationships
    events: Mapped[list["Event"]] = relationship("Event", back_populates="alert")
    investigation_alerts: Mapped[list["InvestigationAlert"]] = relationship(
        "InvestigationAlert", back_populates="alert"
    )

    __table_args__ = (
        Index("ix_alerts_severity_status", "severity", "status"),
        Index("ix_alerts_source", "source"),
        Index("ix_alerts_event_time", "event_time"),
    )

    def __repr__(self) -> str:
        return f"<Alert {self.id} [{self.severity}] {self.title[:40]}>"


class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    alert_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("alerts.id", ondelete="SET NULL"), index=True
    )
    source: Mapped[str] = mapped_column(String(128), nullable=False)
    event_type: Mapped[str] = mapped_column(String(128), nullable=False)
    event_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    severity: Mapped[str | None] = mapped_column(String(32))

    # Normalized entity fields
    username: Mapped[str | None] = mapped_column(String(256))
    source_ip: Mapped[str | None] = mapped_column(String(45))
    destination_ip: Mapped[str | None] = mapped_column(String(45))
    source_host: Mapped[str | None] = mapped_column(String(256))
    destination_host: Mapped[str | None] = mapped_column(String(256))
    process_name: Mapped[str | None] = mapped_column(String(256))
    process_command_line: Mapped[str | None] = mapped_column(Text)
    file_hash: Mapped[str | None] = mapped_column(String(128))
    domain: Mapped[str | None] = mapped_column(String(256))
    url: Mapped[str | None] = mapped_column(Text)

    raw_event: Mapped[dict | None] = mapped_column(JSONB)
    extra_metadata: Mapped[dict | None] = mapped_column(JSONB, default=dict)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    alert: Mapped[Alert | None] = relationship("Alert", back_populates="events")

    __table_args__ = (
        Index("ix_events_event_time", "event_time"),
        Index("ix_events_source", "source"),
        Index("ix_events_event_type", "event_type"),
        Index("ix_events_username", "username"),
        Index("ix_events_source_ip", "source_ip"),
    )


class Entity(Base):
    """Normalized entity extracted from alerts and events.

    Each distinct security entity (user, host, IP, etc.) gets one row.
    Relationships between entities are tracked in EntityRelationship.
    """

    __tablename__ = "entities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    entity_type: Mapped[EntityType] = mapped_column(
        Enum(EntityType, name="entity_type"), nullable=False
    )
    # Canonical identifier for this entity (e.g. IP address, username, hash value)
    value: Mapped[str] = mapped_column(String(512), nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(512))

    # First/last seen timestamps
    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    # Event count for this entity
    event_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Risk indicators
    risk_score: Mapped[float | None] = mapped_column(Float, default=0.0)
    is_malicious: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Enrichment data (threat intel lookups, etc.)
    enrichment: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    extra_metadata: Mapped[dict | None] = mapped_column(JSONB, default=dict)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    # Relationships
    outbound_relationships: Mapped[list["EntityRelationship"]] = relationship(
        "EntityRelationship",
        foreign_keys="EntityRelationship.source_entity_id",
        back_populates="source_entity",
    )
    inbound_relationships: Mapped[list["EntityRelationship"]] = relationship(
        "EntityRelationship",
        foreign_keys="EntityRelationship.target_entity_id",
        back_populates="target_entity",
    )

    __table_args__ = (
        Index("ix_entities_type_value", "entity_type", "value", unique=True),
        Index("ix_entities_risk_score", "risk_score"),
    )

    def __repr__(self) -> str:
        return f"<Entity {self.entity_type}:{self.value}>"


class EntityRelationship(Base):
    """Typed, directed relationship between two entities.

    This table IS the evidence graph. Every relationship records:
    - what two entities are connected
    - how they are connected (relationship_type)
    - when the relationship was observed
    - which investigation created/observed it
    - supporting event evidence
    """

    __tablename__ = "entity_relationships"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    source_entity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False
    )
    target_entity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False
    )
    relationship_type: Mapped[RelationshipType] = mapped_column(
        Enum(RelationshipType, name="relationship_type"), nullable=False
    )
    investigation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("investigations.id", ondelete="SET NULL"), index=True
    )

    # Supporting evidence (event IDs that support this relationship)
    supporting_event_ids: Mapped[list[str] | None] = mapped_column(JSONB, default=list)
    extra_metadata: Mapped[dict | None] = mapped_column(JSONB, default=dict)

    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    source_entity: Mapped[Entity] = relationship(
        "Entity",
        foreign_keys=[source_entity_id],
        back_populates="outbound_relationships",
    )
    target_entity: Mapped[Entity] = relationship(
        "Entity",
        foreign_keys=[target_entity_id],
        back_populates="inbound_relationships",
    )

    __table_args__ = (
        Index(
            "ix_entity_rel_source_target_type",
            "source_entity_id",
            "target_entity_id",
            "relationship_type",
            unique=True,
        ),
        Index("ix_entity_rel_target", "target_entity_id"),
    )


# Circular reference resolved below
from socforge.models.investigation import Investigation, InvestigationAlert  # noqa: E402, F401
