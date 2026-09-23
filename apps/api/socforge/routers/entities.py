"""Entities router — entity search, detail, related entity graph pivots."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from socforge.auth.dependencies import CurrentUser
from socforge.database import get_db
from socforge.models.alert import Entity, EntityRelationship, EntityType

router = APIRouter(prefix="/entities", tags=["Entities"])


class EntityRead(BaseModel):
    id: str
    entity_type: str
    value: str
    display_name: str | None
    first_seen_at: datetime
    last_seen_at: datetime
    event_count: int
    risk_score: float | None
    is_malicious: bool
    enrichment: dict[str, Any]
    metadata: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm(cls, entity: Entity) -> EntityRead:
        return cls(
            id=str(entity.id),
            entity_type=entity.entity_type.value,
            value=entity.value,
            display_name=entity.display_name,
            first_seen_at=entity.first_seen_at,
            last_seen_at=entity.last_seen_at,
            event_count=entity.event_count,
            risk_score=entity.risk_score,
            is_malicious=entity.is_malicious,
            enrichment=entity.enrichment or {},
            metadata=entity.extra_metadata or {},
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )


class RelatedEntity(BaseModel):
    relationship_id: str
    relationship_type: str
    direction: str  # outbound | inbound
    entity: EntityRead
    supporting_event_ids: list[str]


class EntityDetailWithRelations(BaseModel):
    entity: EntityRead
    related_entities: list[RelatedEntity]


@router.get("", response_model=list[EntityRead], summary="List and search entities")
async def list_entities(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    entity_type: EntityType | None = None,
    search: str | None = None,
    is_malicious: bool | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
) -> list[EntityRead]:
    query = select(Entity)
    if entity_type:
        query = query.where(Entity.entity_type == entity_type)
    if is_malicious is not None:
        query = query.where(Entity.is_malicious == is_malicious)
    if search:
        query = query.where(
            or_(
                Entity.value.ilike(f"%{search}%"),
                Entity.display_name.ilike(f"%{search}%"),
            )
        )
    query = query.order_by(Entity.last_seen_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    return [EntityRead.from_orm(e) for e in result.scalars()]


@router.get("/{entity_id}", response_model=EntityDetailWithRelations, summary="Get entity and graph neighbors")
async def get_entity(
    entity_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> EntityDetailWithRelations:
    try:
        eid = uuid.UUID(entity_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid entity ID")

    result = await db.execute(select(Entity).where(Entity.id == eid))
    entity = result.scalar_one_or_none()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")

    # Fetch outbound relationships
    out_res = await db.execute(
        select(EntityRelationship)
        .where(EntityRelationship.source_entity_id == eid)
        .options(selectinload(EntityRelationship.target_entity))
    )
    # Fetch inbound relationships
    in_res = await db.execute(
        select(EntityRelationship)
        .where(EntityRelationship.target_entity_id == eid)
        .options(selectinload(EntityRelationship.source_entity))
    )

    related: list[RelatedEntity] = []
    for rel in out_res.scalars():
        related.append(
            RelatedEntity(
                relationship_id=str(rel.id),
                relationship_type=rel.relationship_type.value,
                direction="outbound",
                entity=EntityRead.from_orm(rel.target_entity),
                supporting_event_ids=rel.supporting_event_ids or [],
            )
        )
    for rel in in_res.scalars():
        related.append(
            RelatedEntity(
                relationship_id=str(rel.id),
                relationship_type=rel.relationship_type.value,
                direction="inbound",
                entity=EntityRead.from_orm(rel.source_entity),
                supporting_event_ids=rel.supporting_event_ids or [],
            )
        )

    return EntityDetailWithRelations(
        entity=EntityRead.from_orm(entity),
        related_entities=related,
    )
