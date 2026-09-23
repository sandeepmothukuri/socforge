"""Asynchronous Repository Pattern for SOCForge Data Access.

Decouples database persistence and query generation from HTTP endpoints,
enabling clean architectural boundaries and testability.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, TypeVar

from sqlalchemy import func, select

from socforge.database import Base
from socforge.models.alert import Alert, AlertSeverity, AlertStatus
from socforge.models.detection import Detection
from socforge.models.investigation import Finding, Investigation

if TYPE_CHECKING:
    import uuid
    from collections.abc import Sequence

    from sqlalchemy.ext.asyncio import AsyncSession

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository[ModelT: Base]:
    """Generic async repository base class."""

    primary_key_attribute: str = "id"

    def __init__(self, db: AsyncSession, model: type[ModelT]):
        self.db = db
        self.model = model

    async def get_by_id(self, item_id: uuid.UUID) -> ModelT | None:
        pk_col = getattr(self.model, self.primary_key_attribute)
        result = await self.db.execute(select(self.model).where(pk_col == item_id))
        return result.scalar_one_or_none()

    async def list_all(self, limit: int = 100, offset: int = 0) -> Sequence[ModelT]:
        result = await self.db.execute(select(self.model).limit(limit).offset(offset))
        return result.scalars().all()

    async def add(self, entity: ModelT) -> ModelT:
        self.db.add(entity)
        await self.db.flush()
        return entity


class AlertRepository(BaseRepository[Alert]):
    """Specialized repository for security alert querying and persistence."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Alert)

    async def query_alerts(
        self,
        severity: AlertSeverity | None = None,
        status: AlertStatus | None = None,
        source: str | None = None,
        limit: int = 25,
        offset: int = 0,
    ) -> tuple[Sequence[Alert], int]:
        q = select(Alert)
        if severity:
            q = q.where(Alert.severity == severity)
        if status:
            q = q.where(Alert.status == status)
        if source:
            q = q.where(Alert.source == source)

        count_q = select(func.count()).select_from(q.subquery())
        total = (await self.db.execute(count_q)).scalar_one()

        items = (
            (await self.db.execute(q.order_by(Alert.created_at.desc()).limit(limit).offset(offset)))
            .scalars()
            .all()
        )
        return items, total


class InvestigationRepository(BaseRepository[Investigation]):
    """Specialized repository for security investigations and findings."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Investigation)

    async def list_by_workspace(
        self,
        workspace_id: uuid.UUID | None = None,
        limit: int = 25,
        offset: int = 0,
    ) -> Sequence[Investigation]:
        q = select(Investigation)
        if workspace_id:
            q = q.where(Investigation.workspace_id == workspace_id)
        q = q.order_by(Investigation.created_at.desc()).limit(limit).offset(offset)
        return (await self.db.execute(q)).scalars().all()

    async def add_finding(self, finding: Finding) -> Finding:
        self.db.add(finding)
        await self.db.flush()
        return finding


class DetectionRepository(BaseRepository[Detection]):
    """Specialized repository for detection engineering rules."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Detection)

    async def list_active(self) -> Sequence[Detection]:
        q = select(Detection).order_by(Detection.created_at.desc())
        return (await self.db.execute(q)).scalars().all()
