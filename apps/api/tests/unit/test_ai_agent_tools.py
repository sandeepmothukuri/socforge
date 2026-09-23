"""Unit tests for Controlled Agent Tool Registry and Guardrails."""

import uuid

import pytest

from socforge.agents.tools import ControlledToolRegistry
from socforge.database import AsyncSessionLocal
from socforge.models.investigation import Investigation


@pytest.mark.asyncio
async def test_agent_tool_registry_get_alert_invalid_uuid():
    async with AsyncSessionLocal() as db:
        run_id = uuid.uuid4()
        registry = ControlledToolRegistry(db, agent_run_id=run_id)

        # Non-UUID string should gracefully fail without crashing
        res = await registry.get_alert("invalid-uuid-string")
        assert res.success is False
        assert "badly formed hexadecimal UUID string" in res.error or "not a valid UUID" in res.error or "Invalid" in res.error or res.error is not None


@pytest.mark.asyncio
async def test_agent_tool_registry_get_alert_not_found():
    async with AsyncSessionLocal() as db:
        run_id = uuid.uuid4()
        registry = ControlledToolRegistry(db, agent_run_id=run_id)

        missing_id = str(uuid.uuid4())
        res = await registry.get_alert(missing_id)
        assert res.success is False
        assert res.error == "Alert not found"


@pytest.mark.asyncio
async def test_agent_tool_registry_search_events():
    async with AsyncSessionLocal() as db:
        run_id = uuid.uuid4()
        registry = ControlledToolRegistry(db, agent_run_id=run_id)

        res = await registry.search_events("mimikatz", limit=5)
        assert res.success is True
        assert isinstance(res.data, list)


@pytest.mark.asyncio
async def test_agent_tool_registry_create_finding():
    async with AsyncSessionLocal() as db:
        # Create an investigation to attach finding to
        inv = Investigation(
            title="Agent Testing Investigation",
            severity="medium",
        )
        db.add(inv)
        await db.flush()

        run_id = uuid.uuid4()
        registry = ControlledToolRegistry(db, agent_run_id=run_id)

        res = await registry.create_finding(
            investigation_id=str(inv.id),
            title="Automated Agent Threat Finding",
            description="Identified lateral movement attempt via WMI execution.",
            confidence="high",
            mitre_techniques=["T1047"],
        )

        assert res.success is True
        assert res.data["title"] == "[AI] Automated Agent Threat Finding"
        await db.rollback()
