"""SQLAlchemy models — Hunts, Hunt Queries, Hunt Observations."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from socforge.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _new_uuid() -> uuid.UUID:
    return uuid.uuid4()


class HuntStatus(str, PyEnum):
    open = "open"
    active = "active"
    completed = "completed"
    archived = "archived"


class Hunt(Base):
    __tablename__ = "hunts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    hypothesis: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[HuntStatus] = mapped_column(
        Enum(HuntStatus, name="hunt_status"), nullable=False, default=HuntStatus.open
    )

    # MITRE ATT&CK hypothesis basis
    mitre_techniques: Mapped[list[str] | None] = mapped_column(JSONB, default=list)

    assigned_to_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )

    extra_metadata: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    queries: Mapped[list["HuntQuery"]] = relationship("HuntQuery", back_populates="hunt")
    observations: Mapped[list["HuntObservation"]] = relationship(
        "HuntObservation", back_populates="hunt"
    )

    __table_args__ = (Index("ix_hunts_status", "status"),)


class HuntQuery(Base):
    __tablename__ = "hunt_queries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    hunt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hunts.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    query_text: Mapped[str] = mapped_column(Text, nullable=False)
    query_language: Mapped[str] = mapped_column(String(32), default="lucene")

    # Filters applied when executing
    filters: Mapped[dict | None] = mapped_column(JSONB, default=dict)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    hunt: Mapped[Hunt] = relationship("Hunt", back_populates="queries")


class HuntObservation(Base):
    """An observation made during a hunt that may be promoted to a finding."""

    __tablename__ = "hunt_observations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    hunt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hunts.id", ondelete="CASCADE"), nullable=False
    )

    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    supporting_event_ids: Mapped[list[str] | None] = mapped_column(JSONB, default=list)
    entity_values: Mapped[list[str] | None] = mapped_column(JSONB, default=list)

    # Promoted to finding?
    promoted_to_finding_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("findings.id", ondelete="SET NULL")
    )

    extra_metadata: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    hunt: Mapped[Hunt] = relationship("Hunt", back_populates="observations")
