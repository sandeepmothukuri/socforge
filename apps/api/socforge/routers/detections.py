"""Detections router — create, validate, test, approve, version history."""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from socforge.auth.dependencies import CurrentAnalyst, CurrentDetectionEngineer, CurrentUser
from socforge.database import get_db
from socforge.models.detection import (
    Detection,
    DetectionTestRun,
    DetectionVersion,
    RuleLanguage,
    ValidationState,
)
from socforge.models.operations import AuditAction
from socforge.services.audit import record_audit_event
from socforge.services.detection_validator import validate_rule

router = APIRouter(prefix="/detections", tags=["Detections"])


# ── Schemas ─────────────────────────────────────────────────────────────────


class DetectionCreate(BaseModel):
    name: str = Field(..., max_length=256)
    description: str | None = None
    rule_language: RuleLanguage = RuleLanguage.sigma
    rule_content: str = Field(..., min_length=10)
    finding_id: str | None = None
    mitre_techniques: list[str] = Field(default_factory=list)
    mitre_tactics: list[str] = Field(default_factory=list)
    data_sources: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)


class DetectionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    rule_content: str | None = None
    mitre_techniques: list[str] | None = None
    mitre_tactics: list[str] | None = None
    false_positive_notes: str | None = None
    change_summary: str | None = None


class DetectionRead(BaseModel):
    id: str
    name: str
    description: str | None
    version: int
    rule_language: str
    rule_content: str
    validation_state: str
    validation_errors: list[str]
    mitre_techniques: list[str]
    mitre_tactics: list[str]
    data_sources: list[str]
    tags: list[str]
    false_positive_notes: str | None
    finding_id: str | None
    approved_at: datetime | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm(cls, d: Detection) -> "DetectionRead":
        return cls(
            id=str(d.id),
            name=d.name,
            description=d.description,
            version=d.version,
            rule_language=d.rule_language.value,
            rule_content=d.rule_content,
            validation_state=d.validation_state.value,
            validation_errors=d.validation_errors or [],
            mitre_techniques=d.mitre_techniques or [],
            mitre_tactics=d.mitre_tactics or [],
            data_sources=d.data_sources or [],
            tags=d.tags or [],
            false_positive_notes=d.false_positive_notes,
            finding_id=str(d.finding_id) if d.finding_id else None,
            approved_at=d.approved_at,
            created_at=d.created_at,
            updated_at=d.updated_at,
        )


class ValidationResult(BaseModel):
    syntax_valid: bool
    errors: list[str]
    warnings: list[str]
    rule_language: str
    validated_at: datetime


class TestRunRequest(BaseModel):
    dataset_name: str = Field(default="synthetic-soc-v1")
    events: list[dict[str, Any]] | None = None  # Inline events (alternative to dataset name)


class TestRunResult(BaseModel):
    id: str
    detection_id: str
    detection_version: int
    dataset_name: str
    total_events: int
    matched_events: int
    true_positives: int
    false_positives: int
    false_negatives: int
    true_negatives: int
    precision: float | None
    recall: float | None
    syntax_valid: bool
    syntax_errors: list[str]
    started_at: datetime
    completed_at: datetime | None
    duration_ms: int | None


# ── Endpoints ────────────────────────────────────────────────────────────────


@router.get("", response_model=list[DetectionRead], summary="List detections")
async def list_detections(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    rule_language: RuleLanguage | None = None,
    validation_state: ValidationState | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
) -> list[DetectionRead]:
    query = select(Detection)
    if rule_language:
        query = query.where(Detection.rule_language == rule_language)
    if validation_state:
        query = query.where(Detection.validation_state == validation_state)
    query = query.order_by(Detection.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    return [DetectionRead.from_orm(d) for d in result.scalars()]


@router.post(
    "",
    response_model=DetectionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create detection",
)
async def create_detection(
    payload: DetectionCreate,
    current_user: CurrentDetectionEngineer,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DetectionRead:
    finding_id = None
    if payload.finding_id:
        try:
            finding_id = uuid.UUID(payload.finding_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid finding_id")

    detection = Detection(
        name=payload.name,
        description=payload.description,
        rule_language=payload.rule_language,
        rule_content=payload.rule_content,
        finding_id=finding_id,
        mitre_techniques=payload.mitre_techniques,
        mitre_tactics=payload.mitre_tactics,
        data_sources=payload.data_sources,
        tags=payload.tags,
        author_id=current_user.id,
    )
    db.add(detection)
    await db.flush()

    # Create initial version snapshot
    version = DetectionVersion(
        detection_id=detection.id,
        version=1,
        rule_language=payload.rule_language,
        rule_content=payload.rule_content,
        change_summary="Initial version",
        created_by_id=current_user.id,
    )
    db.add(version)

    await record_audit_event(
        db,
        action=AuditAction.detection_created,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="detection",
        target_id=str(detection.id),
    )

    return DetectionRead.from_orm(detection)


@router.get("/{detection_id}", response_model=DetectionRead, summary="Get detection")
async def get_detection(
    detection_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DetectionRead:
    try:
        did = uuid.UUID(detection_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid detection ID")

    result = await db.execute(select(Detection).where(Detection.id == did))
    detection = result.scalar_one_or_none()
    if detection is None:
        raise HTTPException(status_code=404, detail="Detection not found")
    return DetectionRead.from_orm(detection)


@router.post(
    "/{detection_id}/validate",
    response_model=ValidationResult,
    summary="Validate detection rule syntax",
)
async def validate_detection(
    detection_id: str,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ValidationResult:
    """Run syntax validation on the detection rule."""
    try:
        did = uuid.UUID(detection_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid detection ID")

    result = await db.execute(select(Detection).where(Detection.id == did))
    detection = result.scalar_one_or_none()
    if detection is None:
        raise HTTPException(status_code=404, detail="Detection not found")

    validation = validate_rule(detection.rule_language, detection.rule_content)

    # Update detection state
    detection.validation_errors = validation.errors
    detection.last_validated_at = datetime.now(timezone.utc)
    if validation.syntax_valid:
        if detection.validation_state == ValidationState.pending:
            detection.validation_state = ValidationState.syntax_valid
    else:
        detection.validation_state = ValidationState.syntax_error

    await record_audit_event(
        db,
        action=AuditAction.detection_validated,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="detection",
        target_id=detection_id,
        metadata={"syntax_valid": validation.syntax_valid, "error_count": len(validation.errors)},
    )

    return ValidationResult(
        syntax_valid=validation.syntax_valid,
        errors=validation.errors,
        warnings=validation.warnings,
        rule_language=detection.rule_language.value,
        validated_at=datetime.now(timezone.utc),
    )


@router.post(
    "/{detection_id}/approve",
    response_model=DetectionRead,
    summary="Approve a detection for production use",
)
async def approve_detection(
    detection_id: str,
    current_user: CurrentDetectionEngineer,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DetectionRead:
    try:
        did = uuid.UUID(detection_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid detection ID")

    result = await db.execute(select(Detection).where(Detection.id == did))
    detection = result.scalar_one_or_none()
    if detection is None:
        raise HTTPException(status_code=404, detail="Detection not found")

    if detection.validation_state not in (
        ValidationState.syntax_valid,
        ValidationState.tested,
    ):
        raise HTTPException(
            status_code=400,
            detail="Detection must pass syntax validation before approval",
        )

    detection.validation_state = ValidationState.approved
    detection.reviewed_by_id = current_user.id
    detection.approved_at = datetime.now(timezone.utc)

    await record_audit_event(
        db,
        action=AuditAction.detection_approved,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="detection",
        target_id=detection_id,
    )

    return DetectionRead.from_orm(detection)
