"""Events router — normalized event search and ingestion."""

from __future__ import annotations

from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from socforge.auth.dependencies import CurrentUser
from socforge.database import get_db
from socforge.models.alert import Event

router = APIRouter(prefix="/events", tags=["Events"])


class EventRead(BaseModel):
    id: str
    alert_id: str | None
    source: str
    event_type: str
    event_time: datetime
    severity: str | None
    username: str | None
    source_ip: str | None
    destination_ip: str | None
    source_host: str | None
    destination_host: str | None
    process_name: str | None
    process_command_line: str | None
    file_hash: str | None
    domain: str | None
    url: str | None
    raw_event: dict[str, Any] | None
    metadata: dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm(cls, ev: Event) -> EventRead:
        return cls(
            id=str(ev.id),
            alert_id=str(ev.alert_id) if ev.alert_id else None,
            source=ev.source,
            event_type=ev.event_type,
            event_time=ev.event_time,
            severity=ev.severity,
            username=ev.username,
            source_ip=ev.source_ip,
            destination_ip=ev.destination_ip,
            source_host=ev.source_host,
            destination_host=ev.destination_host,
            process_name=ev.process_name,
            process_command_line=ev.process_command_line,
            file_hash=ev.file_hash,
            domain=ev.domain,
            url=ev.url,
            raw_event=ev.raw_event,
            metadata=ev.extra_metadata or {},
            created_at=ev.created_at,
        )


class EventListResponse(BaseModel):
    items: list[EventRead]
    total: int
    page: int
    page_size: int


class EventSearchRequest(BaseModel):
    query: str | None = None
    source: str | None = None
    event_type: str | None = None
    username: str | None = None
    ip: str | None = None
    host: str | None = None
    hash: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=50, ge=1, le=500)


@router.get("", response_model=EventListResponse, summary="List recent events")
async def list_events(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    source: str | None = None,
    event_type: str | None = None,
) -> EventListResponse:
    q = select(Event)
    if source:
        q = q.where(Event.source == source)
    if event_type:
        q = q.where(Event.event_type == event_type)
    count_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(count_q)).scalar_one()

    q = q.order_by(Event.event_time.desc()).offset((page - 1) * page_size).limit(page_size)
    events = (await db.execute(q)).scalars().all()
    return EventListResponse(
        items=[EventRead.from_orm(e) for e in events],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/search", response_model=EventListResponse, summary="Structured search on events")
async def search_events(
    req: EventSearchRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> EventListResponse:
    q = select(Event)
    if req.source:
        q = q.where(Event.source == req.source)
    if req.event_type:
        q = q.where(Event.event_type == req.event_type)
    if req.username:
        q = q.where(Event.username.ilike(f"%{req.username}%"))
    if req.ip:
        q = q.where(or_(Event.source_ip == req.ip, Event.destination_ip == req.ip))
    if req.host:
        q = q.where(or_(Event.source_host == req.host, Event.destination_host == req.host))
    if req.hash:
        q = q.where(Event.file_hash == req.hash)
    if req.start_time:
        q = q.where(Event.event_time >= req.start_time)
    if req.end_time:
        q = q.where(Event.event_time <= req.end_time)
    if req.query:
        search_pattern = f"%{req.query}%"
        q = q.where(
            or_(
                Event.process_command_line.ilike(search_pattern),
                Event.process_name.ilike(search_pattern),
                Event.domain.ilike(search_pattern),
                Event.url.ilike(search_pattern),
            )
        )

    count_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(count_q)).scalar_one()

    q = (
        q.order_by(Event.event_time.desc())
        .offset((req.page - 1) * req.page_size)
        .limit(req.page_size)
    )
    events = (await db.execute(q)).scalars().all()
    return EventListResponse(
        items=[EventRead.from_orm(e) for e in events],
        total=total,
        page=req.page,
        page_size=req.page_size,
    )
