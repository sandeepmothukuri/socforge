"""SQLAlchemy models — Detections, Detection Versions, Detection Tests."""

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


class RuleLanguage(str, PyEnum):
    sigma = "sigma"
    spl = "spl"
    kql = "kql"


class ValidationState(str, PyEnum):
    pending = "pending"
    syntax_valid = "syntax_valid"
    syntax_error = "syntax_error"
    tested = "tested"
    approved = "approved"
    rejected = "rejected"
    deprecated = "deprecated"


class Detection(Base):
    """A detection rule with versioning and validation lifecycle.

    A detection starts as a hypothesis derived from an investigation finding.
    It progresses through validation → testing → analyst approval before
    being considered production-ready.
    """

    __tablename__ = "detections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)

    # Source finding (optional — may be created independently)
    finding_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("findings.id", ondelete="SET NULL"), index=True
    )

    name: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    # Current version number
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Primary rule content
    rule_language: Mapped[RuleLanguage] = mapped_column(
        Enum(RuleLanguage, name="rule_language"), nullable=False, default=RuleLanguage.sigma
    )
    rule_content: Mapped[str] = mapped_column(Text, nullable=False)

    # Validation state
    validation_state: Mapped[ValidationState] = mapped_column(
        Enum(ValidationState, name="validation_state"),
        nullable=False,
        default=ValidationState.pending,
    )
    validation_errors: Mapped[list[str] | None] = mapped_column(JSONB, default=list)
    last_validated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # MITRE ATT&CK mappings
    mitre_techniques: Mapped[list[str] | None] = mapped_column(JSONB, default=list)
    mitre_tactics: Mapped[list[str] | None] = mapped_column(JSONB, default=list)

    # Data source requirements
    data_sources: Mapped[list[str] | None] = mapped_column(JSONB, default=list)

    # Review
    reviewed_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # False positive notes
    false_positive_notes: Mapped[str | None] = mapped_column(Text)

    # Tags
    tags: Mapped[list[str] | None] = mapped_column(JSONB, default=list)

    author_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    # Relationships
    versions: Mapped[list["DetectionVersion"]] = relationship(
        "DetectionVersion", back_populates="detection"
    )
    test_runs: Mapped[list["DetectionTestRun"]] = relationship(
        "DetectionTestRun", back_populates="detection"
    )

    __table_args__ = (
        Index("ix_detections_validation_state", "validation_state"),
        Index("ix_detections_rule_language", "rule_language"),
    )

    def __repr__(self) -> str:
        return f"<Detection {self.id} v{self.version} [{self.validation_state}] {self.name}>"


class DetectionVersion(Base):
    """Immutable snapshot of a detection at a specific version."""

    __tablename__ = "detection_versions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    detection_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("detections.id", ondelete="CASCADE"), nullable=False
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    rule_language: Mapped[RuleLanguage] = mapped_column(
        Enum(RuleLanguage, name="rule_language"), nullable=False
    )
    rule_content: Mapped[str] = mapped_column(Text, nullable=False)
    change_summary: Mapped[str | None] = mapped_column(Text)
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    detection: Mapped[Detection] = relationship("Detection", back_populates="versions")

    __table_args__ = (
        Index("ix_detection_versions_detection_version", "detection_id", "version", unique=True),
    )


class DetectionTestRun(Base):
    """Result of running a detection against a test dataset."""

    __tablename__ = "detection_test_runs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    detection_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("detections.id", ondelete="CASCADE"), nullable=False
    )
    detection_version: Mapped[int] = mapped_column(Integer, nullable=False)

    # Test dataset info
    dataset_name: Mapped[str] = mapped_column(String(256), nullable=False)
    total_events: Mapped[int] = mapped_column(Integer, default=0)
    expected_true_positives: Mapped[int] = mapped_column(Integer, default=0)
    expected_true_negatives: Mapped[int] = mapped_column(Integer, default=0)

    # Results
    matched_events: Mapped[int] = mapped_column(Integer, default=0)
    true_positives: Mapped[int] = mapped_column(Integer, default=0)
    false_positives: Mapped[int] = mapped_column(Integer, default=0)
    false_negatives: Mapped[int] = mapped_column(Integer, default=0)
    true_negatives: Mapped[int] = mapped_column(Integer, default=0)

    precision: Mapped[float | None] = mapped_column(Float)
    recall: Mapped[float | None] = mapped_column(Float)

    # Syntax validation result
    syntax_valid: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    syntax_errors: Mapped[list[str] | None] = mapped_column(JSONB, default=list)

    # Matched event samples
    matched_samples: Mapped[list[dict] | None] = mapped_column(JSONB, default=list)
    unmatched_expected_samples: Mapped[list[dict] | None] = mapped_column(JSONB, default=list)

    ran_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    duration_ms: Mapped[int | None] = mapped_column(Integer)

    detection: Mapped[Detection] = relationship("Detection", back_populates="test_runs")

    __table_args__ = (Index("ix_detection_test_runs_detection", "detection_id"),)
