"""SQLAlchemy models — Investigations, Findings, Evidence."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from socforge.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _new_uuid() -> uuid.UUID:
    return uuid.uuid4()


class InvestigationStatus(str, PyEnum):
    open = "open"
    in_progress = "in_progress"
    pending_review = "pending_review"
    closed = "closed"
    archived = "archived"


class FindingConfidence(str, PyEnum):
    confirmed = "confirmed"
    high = "high"
    medium = "medium"
    low = "low"
    speculative = "speculative"


class Investigation(Base):
    __tablename__ = "investigations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[InvestigationStatus] = mapped_column(
        Enum(InvestigationStatus, name="investigation_status"),
        nullable=False,
        default=InvestigationStatus.open,
    )
    severity: Mapped[str | None] = mapped_column(String(32))
    risk_score: Mapped[float | None] = mapped_column(Float, default=0.0)

    # Assigned analyst
    assigned_to_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )

    # MITRE ATT&CK
    mitre_techniques: Mapped[list[str] | None] = mapped_column(JSONB, default=list)
    mitre_tactics: Mapped[list[str] | None] = mapped_column(JSONB, default=list)

    # Investigation notes (structured)
    notes: Mapped[str | None] = mapped_column(Text)
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

    # Relationships
    investigation_alerts: Mapped[list["InvestigationAlert"]] = relationship(
        "InvestigationAlert", back_populates="investigation"
    )
    findings: Mapped[list["Finding"]] = relationship("Finding", back_populates="investigation")

    __table_args__ = (
        Index("ix_investigations_status", "status"),
        Index("ix_investigations_assigned_to", "assigned_to_id"),
    )

    def __repr__(self) -> str:
        return f"<Investigation {self.id} [{self.status}] {self.title[:40]}>"


class InvestigationAlert(Base):
    """Join table linking alerts to investigations."""

    __tablename__ = "investigation_alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    investigation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("investigations.id", ondelete="CASCADE"),
        nullable=False,
    )
    alert_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("alerts.id", ondelete="CASCADE"),
        nullable=False,
    )
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    investigation: Mapped[Investigation] = relationship(
        "Investigation", back_populates="investigation_alerts"
    )
    alert: Mapped["Alert"] = relationship("Alert", back_populates="investigation_alerts")

    __table_args__ = (
        Index(
            "ix_inv_alert_unique", "investigation_id", "alert_id", unique=True
        ),
    )


class Finding(Base):
    """An analyst conclusion backed by evidence.

    Every finding must be linked to at least one event and optionally
    to MITRE ATT&CK techniques. Findings are the bridge between
    raw telemetry and detection engineering.
    """

    __tablename__ = "findings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    investigation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )

    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[FindingConfidence] = mapped_column(
        Enum(FindingConfidence, name="finding_confidence"),
        nullable=False,
        default=FindingConfidence.medium,
    )

    # MITRE ATT&CK mappings
    mitre_techniques: Mapped[list[str] | None] = mapped_column(JSONB, default=list)
    mitre_tactics: Mapped[list[str] | None] = mapped_column(JSONB, default=list)

    # Supporting evidence: list of event IDs
    supporting_event_ids: Mapped[list[str] | None] = mapped_column(JSONB, default=list)
    # Supporting entities
    supporting_entity_ids: Mapped[list[str] | None] = mapped_column(JSONB, default=list)

    # Response recommendations
    response_recommendations: Mapped[list[str] | None] = mapped_column(JSONB, default=list)

    # Promoted to detection hypothesis?
    has_detection_hypothesis: Mapped[bool] = mapped_column(
        default=False, nullable=False
    )

    extra_metadata: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    investigation: Mapped[Investigation] = relationship("Investigation", back_populates="findings")

    __table_args__ = (
        Index("ix_findings_investigation", "investigation_id"),
        Index("ix_findings_confidence", "confidence"),
    )

    def __repr__(self) -> str:
        return f"<Finding {self.id} [{self.confidence}] {self.title[:40]}>"


# Resolve forward reference from alert.py
from socforge.models.alert import Alert  # noqa: E402, F401
