"""Controlled AI Investigation and Detection workflows."""

from __future__ import annotations

import json
import time
import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from socforge.agents.providers import get_ai_provider
from socforge.agents.tools import ControlledToolRegistry
from socforge.models.operations import AgentRun, AgentRunStatus


class AIAgentOrchestrator:
    def __init__(self, db: AsyncSession, actor_id: uuid.UUID | None = None):
        self.db = db
        self.actor_id = actor_id
        self.provider = get_ai_provider()

    async def run_triage_agent(self, alert_id: str) -> dict[str, Any]:
        """Triage an incoming alert, recommend severity, likely techniques, and pivots."""
        run = AgentRun(
            agent_type="triage_agent",
            status=AgentRunStatus.running,
            input_context={"alert_id": alert_id},
            target_type="alert",
            target_id=uuid.UUID(alert_id),
            started_at=time.time(),
        )
        self.db.add(run)
        await self.db.flush()

        registry = ControlledToolRegistry(self.db, run.id, self.actor_id)
        alert_info = await registry.get_alert(alert_id)

        prompt = f"Analyze security alert telemetry:\n{json.dumps(alert_info.data)}"
        system = (
            "You are a Senior SOC Detection & Triage Specialist. Analyze the provided alert JSON and return a JSON object with: "
            "summary, severity_recommendation, mitre_techniques, confidence, and recommended_pivots. "
            "Never execute shell commands or invent facts."
        )

        response_text = await self.provider.generate_response(system, prompt)

        try:
            parsed = json.loads(response_text)
        except Exception:
            parsed = {"raw_output": response_text}

        run.status = AgentRunStatus.completed
        run.output = parsed
        await self.db.flush()
        return parsed

    async def run_detection_engineer_agent(self, finding_id: str, title: str, description: str, language: str = "sigma") -> dict[str, Any]:
        """Generate Sigma/SPL/KQL detection candidate from an evidence-backed finding."""
        run = AgentRun(
            agent_type="detection_engineer",
            status=AgentRunStatus.running,
            input_context={"finding_id": finding_id, "language": language},
            target_type="finding",
            target_id=uuid.UUID(finding_id) if finding_id else None,
            started_at=time.time(),
        )
        self.db.add(run)
        await self.db.flush()

        system = (
            f"You are a Principal Detection Engineer. Formulate a high-fidelity {language.upper()} rule from the analyst finding. "
            "Include proper title, logsource, detection logic with selections, and false-positive caveats. "
            "Output strictly valid YAML for Sigma or valid query strings for SPL/KQL."
        )
        prompt = f"Finding: {title}\nDetails: {description}\nGenerate {language} rule candidate."

        response_text = await self.provider.generate_response(system, prompt)

        output = {
            "language": language,
            "generated_rule": response_text,
            "finding_id": finding_id,
        }
        run.status = AgentRunStatus.completed
        run.output = output
        await self.db.flush()
        return output
