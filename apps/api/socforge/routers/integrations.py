"""Integrations router — manage and test SIEM/EDR connectors."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from socforge.auth.dependencies import CurrentAdminUser, CurrentUser
from socforge.database import get_db
from socforge.integrations.sentinel import SentinelIntegration
from socforge.integrations.splunk import SplunkIntegration
from socforge.integrations.wazuh import WazuhIntegration
from socforge.models.operations import Integration

router = APIRouter(prefix="/integrations", tags=["Integrations"])

CONNECTOR_REGISTRY = {
    "wazuh": WazuhIntegration,
    "sentinel": SentinelIntegration,
    "splunk": SplunkIntegration,
}


class IntegrationRead(BaseModel):
    id: str | None
    name: str
    display_name: str
    integration_type: str
    enabled: bool
    capabilities: list[str]
    last_health_status: str | None
    last_health_check_at: datetime | None


class IntegrationTestResponse(BaseModel):
    name: str
    status: str
    details: dict[str, Any]


@router.get("", response_model=list[IntegrationRead], summary="List available integrations")
async def list_integrations(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[IntegrationRead]:
    db_integrations = (await db.execute(select(Integration))).scalars().all()
    db_by_name = {i.name: i for i in db_integrations}

    results: list[IntegrationRead] = []
    for name, connector_cls in CONNECTOR_REGISTRY.items():
        existing = db_by_name.get(name)
        results.append(
            IntegrationRead(
                id=str(existing.id) if existing else None,
                name=name,
                display_name=connector_cls.display_name,
                integration_type=name,
                enabled=existing.enabled if existing else (name == "wazuh"),
                capabilities=connector_cls.capabilities,
                last_health_status=existing.last_health_status if existing else "ready",
                last_health_check_at=existing.last_health_check_at if existing else None,
            )
        )
    return results


@router.post("/{name}/health", response_model=IntegrationTestResponse, summary="Test connector health")
async def check_integration_health(
    name: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> IntegrationTestResponse:
    if name not in CONNECTOR_REGISTRY:
        raise HTTPException(status_code=404, detail="Integration not found")

    connector_cls = CONNECTOR_REGISTRY[name]
    connector = connector_cls()
    health_result = await connector.health_check()

    # Update database record if exists
    db_int = (
        await db.execute(select(Integration).where(Integration.name == name))
    ).scalar_one_or_none()
    if db_int:
        db_int.last_health_check_at = datetime.now(timezone.utc)
        db_int.last_health_status = health_result.get("status", "unknown")
        db_int.last_error = health_result.get("error")

    return IntegrationTestResponse(
        name=name,
        status=health_result.get("status", "unknown"),
        details=health_result,
    )
