"""Integrations router — manage and test SIEM/EDR connectors."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from socforge.auth.dependencies import CurrentAdminUser, CurrentUser
from socforge.auth.security import decrypt_secret, encrypt_secret
from socforge.database import get_db
from socforge.integrations.sentinel import SentinelIntegration
from socforge.integrations.splunk import SplunkIntegration
from socforge.integrations.wazuh import WazuhIntegration
from socforge.models.operations import AuditAction, Integration
from socforge.services.audit import record_audit_event

router = APIRouter(prefix="/integrations", tags=["Integrations"])

CONNECTOR_REGISTRY: dict[str, type[WazuhIntegration | SentinelIntegration | SplunkIntegration]] = {
    "wazuh": WazuhIntegration,
    "sentinel": SentinelIntegration,
    "splunk": SplunkIntegration,
}


class IntegrationConfigureRequest(BaseModel):
    is_active: bool = True
    config: dict[str, Any] = Field(default_factory=dict)
    secrets: dict[str, str] = Field(
        default_factory=dict,
        description="Sensitive credentials (API keys, tokens, passwords) to be encrypted with AES-256 before storage",
    )


class IntegrationRead(BaseModel):
    id: str | None
    name: str
    display_name: str
    integration_type: str
    is_active: bool
    capabilities: list[str]
    config: dict[str, Any]
    last_check_ok: bool | None
    last_checked_at: datetime | None
    last_check_error: str | None


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
        # Never return secrets in the config payload
        safe_config = dict(existing.config or {}) if existing else {}
        for secret_key in ("password", "api_key", "secret", "token", "client_secret"):
            safe_config.pop(secret_key, None)

        results.append(
            IntegrationRead(
                id=str(existing.id) if existing else None,
                name=name,
                display_name=connector_cls.display_name,
                integration_type=name,
                is_active=existing.is_active if existing else (name == "wazuh"),
                capabilities=connector_cls.capabilities,
                config=safe_config,
                last_check_ok=existing.last_check_ok if existing else None,
                last_checked_at=existing.last_checked_at if existing else None,
                last_check_error=existing.last_check_error if existing else None,
            )
        )
    return results


@router.put(
    "/{name}", response_model=IntegrationRead, summary="Configure connector and encrypt secrets"
)
async def configure_integration(
    name: str,
    payload: IntegrationConfigureRequest,
    current_user: CurrentAdminUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> IntegrationRead:
    if name not in CONNECTOR_REGISTRY:
        raise HTTPException(status_code=404, detail="Integration not found")

    connector_cls = CONNECTOR_REGISTRY[name]
    existing = (
        await db.execute(select(Integration).where(Integration.name == name))
    ).scalar_one_or_none()

    # Encrypt secrets blob if provided
    encrypted_blob = None
    if payload.secrets:
        encrypted_blob = encrypt_secret(json.dumps(payload.secrets))

    if existing:
        existing.is_active = payload.is_active
        existing.config = payload.config
        if encrypted_blob:
            existing.encrypted_secrets = encrypted_blob
    else:
        existing = Integration(
            name=name,
            integration_type=name,
            is_active=payload.is_active,
            config=payload.config,
            encrypted_secrets=encrypted_blob,
            created_by_id=current_user.id,
        )
        db.add(existing)

    await record_audit_event(
        db,
        action=AuditAction.config_changed,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="integration",
        target_id=name,
        metadata={"is_active": payload.is_active, "keys_configured": list(payload.config.keys())},
    )

    await db.flush()

    safe_config = dict(existing.config or {})
    for secret_key in ("password", "api_key", "secret", "token", "client_secret"):
        safe_config.pop(secret_key, None)

    return IntegrationRead(
        id=str(existing.id),
        name=name,
        display_name=connector_cls.display_name,
        integration_type=name,
        is_active=existing.is_active,
        capabilities=connector_cls.capabilities,
        config=safe_config,
        last_check_ok=existing.last_check_ok,
        last_checked_at=existing.last_checked_at,
        last_check_error=existing.last_check_error,
    )


@router.post(
    "/{name}/health", response_model=IntegrationTestResponse, summary="Test connector health"
)
async def check_integration_health(
    name: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> IntegrationTestResponse:
    if name not in CONNECTOR_REGISTRY:
        raise HTTPException(status_code=404, detail="Integration not found")

    connector_cls = CONNECTOR_REGISTRY[name]

    # Load integration config and decrypt stored secrets to pass to the connector
    db_int = (
        await db.execute(select(Integration).where(Integration.name == name))
    ).scalar_one_or_none()

    effective_config: dict[str, Any] = {}
    if db_int and db_int.config:
        effective_config.update(db_int.config)

    if db_int and db_int.encrypted_secrets:
        decrypted_json = decrypt_secret(db_int.encrypted_secrets)
        if decrypted_json:
            try:
                decrypted_dict = json.loads(decrypted_json)
                effective_config.update(decrypted_dict)
            except Exception:
                pass

    # Instantiate connector with real configuration and decrypted credentials
    connector = connector_cls(config=effective_config)
    health_result = await connector.health_check()

    # Update database record with health telemetry
    is_ok = health_result.get("status") in ("healthy", "ready", "ok")
    if db_int:
        db_int.last_checked_at = datetime.now(UTC)
        db_int.last_check_ok = is_ok
        db_int.last_check_error = health_result.get("error")
        await db.flush()

    return IntegrationTestResponse(
        name=name,
        status="healthy" if is_ok else "unhealthy",
        details=health_result,
    )
