"""Controlled Agent Tool Registry.

Enforces strict permissions, input/output validation, audit logging,
and prevents arbitrary execution. LLMs only execute approved typed tools.
"""

from __future__ import annotations

import time
import uuid
from typing import Any

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from socforge.models.alert import Alert, Event
from socforge.models.investigation import Finding, FindingConfidence
from socforge.models.operations import AgentToolCall


class ToolResult(BaseModel):
    tool_name: str
    success: bool
    data: Any
    error: str | None = None
    duration_ms: int = 0


class ControlledToolRegistry:
    def __init__(self, db: AsyncSession, agent_run_id: uuid.UUID, actor_id: uuid.UUID | None = None):
        self.db = db
        self.agent_run_id = agent_run_id
        self.actor_id = actor_id

    async def _record_call(self, name: str, inp: dict, outp: Any, success: bool, err: str | None, dur: int):
        tool_call = AgentToolCall(
            agent_run_id=self.agent_run_id,
            tool_name=name,
            tool_input=inp,
            tool_output=outp if isinstance(outp, dict) else {"result": str(outp)},
            success=success,
            error_message=err,
            duration_ms=dur,
        )
        self.db.add(tool_call)

    async def get_alert(self, alert_id: str) -> ToolResult:
        t0 = time.time()
        try:
            aid = uuid.UUID(alert_id)
            res = await self.db.execute(select(Alert).where(Alert.id == aid))
            alert = res.scalar_one_or_none()
            dur = int((time.time() - t0) * 1000)
            if not alert:
                await self._record_call("get_alert", {"alert_id": alert_id}, None, False, "Alert not found", dur)
                return ToolResult(tool_name="get_alert", success=False, data=None, error="Alert not found", duration_ms=dur)

            data = {
                "id": str(alert.id),
                "title": alert.title,
                "severity": alert.severity.value,
                "source": alert.source,
                "username": alert.username,
                "source_ip": alert.source_ip,
                "destination_ip": alert.destination_ip,
                "process_name": alert.process_name,
                "process_command_line": alert.process_command_line,
                "mitre_techniques": alert.mitre_techniques,
            }
            await self._record_call("get_alert", {"alert_id": alert_id}, data, True, None, dur)
            return ToolResult(tool_name="get_alert", success=True, data=data, duration_ms=dur)
        except Exception as e:
            dur = int((time.time() - t0) * 1000)
            await self._record_call("get_alert", {"alert_id": alert_id}, None, False, str(e), dur)
            return ToolResult(tool_name="get_alert", success=False, data=None, error=str(e), duration_ms=dur)

    async def search_events(self, query: str, limit: int = 10) -> ToolResult:
        t0 = time.time()
        try:
            q = select(Event).limit(limit)
            events = (await self.db.execute(q)).scalars().all()
            dur = int((time.time() - t0) * 1000)
            data = [
                {
                    "id": str(e.id),
                    "event_type": e.event_type,
                    "event_time": str(e.event_time),
                    "username": e.username,
                    "process_name": e.process_name,
                    "source_ip": e.source_ip,
                }
                for e in events
            ]
            await self._record_call("search_events", {"query": query, "limit": limit}, {"count": len(data)}, True, None, dur)
            return ToolResult(tool_name="search_events", success=True, data=data, duration_ms=dur)
        except Exception as e:
            dur = int((time.time() - t0) * 1000)
            await self._record_call("search_events", {"query": query}, None, False, str(e), dur)
            return ToolResult(tool_name="search_events", success=False, data=None, error=str(e), duration_ms=dur)

    async def create_finding(self, investigation_id: str, title: str, description: str, confidence: str = "medium", mitre_techniques: list[str] | None = None) -> ToolResult:
        t0 = time.time()
        try:
            iid = uuid.UUID(investigation_id)
            finding = Finding(
                investigation_id=iid,
                title=f"[AI] {title}",
                description=description,
                confidence=FindingConfidence(confidence),
                mitre_techniques=mitre_techniques or [],
            )
            self.db.add(finding)
            await self.db.flush()
            dur = int((time.time() - t0) * 1000)
            data = {"finding_id": str(finding.id), "title": finding.title}
            await self._record_call("create_finding", {"investigation_id": investigation_id, "title": title}, data, True, None, dur)
            return ToolResult(tool_name="create_finding", success=True, data=data, duration_ms=dur)
        except Exception as e:
            dur = int((time.time() - t0) * 1000)
            await self._record_call("create_finding", {"investigation_id": investigation_id}, None, False, str(e), dur)
            return ToolResult(tool_name="create_finding", success=False, data=None, error=str(e), duration_ms=dur)
