"""Controlled AI Investigation and Detection workflows."""

from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

from socforge.agents.providers import get_ai_provider
from socforge.agents.schemas import (
    DetectionProposal,
    InvestigationResult,
    ThreatHuntResult,
    TriageResult,
)
from socforge.agents.tools import ControlledToolRegistry
from socforge.models.operations import AgentRun, AgentRunStatus


class AIAgentOrchestrator:
    def __init__(self, db: AsyncSession, actor_id: uuid.UUID | None = None):
        self.db = db
        self.actor_id = actor_id
        self.provider = get_ai_provider()

    async def run_triage_agent(self, alert_id: str) -> TriageResult:
        """Triage an incoming alert, recommend severity, likely techniques, and pivots."""
        run = AgentRun(
            agent_type="triage_agent",
            status=AgentRunStatus.running,
            target_type="alert",
            target_id=uuid.UUID(alert_id),
            started_at=datetime.now(UTC),
        )
        self.db.add(run)
        await self.db.flush()

        registry = ControlledToolRegistry(self.db, run.id, self.actor_id)
        alert_info = await registry.get_alert(alert_id)

        prompt = f"Analyze security alert telemetry:\n{json.dumps(alert_info.data)}"
        system = (
            "You are a Senior SOC Detection & Triage Specialist. Analyze the provided alert JSON "
            "and return a JSON object with keys: summary (str), severity_recommendation (str: "
            "critical/high/medium/low/informational), mitre_techniques (list[str]), mitre_tactics "
            "(list[str]), confidence (str: high/medium/low), recommended_pivots (list[str]), "
            "false_positive_indicators (list[str]). Never execute shell commands or invent facts."
        )

        response_text = await self.provider.generate_response(system, prompt)

        try:
            parsed = json.loads(response_text)
            result = TriageResult(**parsed)
        except Exception:
            result = TriageResult(
                summary="AI response could not be parsed.",
                severity_recommendation="medium",
                confidence="low",
                raw_output=response_text,
            )

        run.status = AgentRunStatus.completed
        run.output_payload = result.model_dump()
        run.completed_at = datetime.now(UTC)
        await self.db.flush()
        return result

    async def run_investigation_agent(
        self,
        investigation_id: str,
        title: str,
        description: str,
    ) -> InvestigationResult:
        """Deep-dive investigation: propose findings, timeline, and response actions."""
        run = AgentRun(
            agent_type="investigation_agent",
            status=AgentRunStatus.running,
            target_type="investigation",
            target_id=uuid.UUID(investigation_id) if investigation_id else None,
            started_at=datetime.now(UTC),
        )
        self.db.add(run)
        await self.db.flush()

        system = (
            "You are a Senior Threat Intelligence Analyst. Analyze the investigation context and "
            "return a JSON object with keys: summary (str), proposed_findings (list of "
            "{title, description, confidence, supporting_event_ids, mitre_techniques, "
            "mitre_tactics, response_recommendations}), timeline_summary (str), "
            "attack_path (list[str]), recommended_response_actions (list[str]), "
            "confidence (str). Never fabricate evidence or make up event IDs."
        )
        prompt = f"Investigation title: {title}\nDescription: {description}\n\nAnalyze and propose findings."

        response_text = await self.provider.generate_response(system, prompt)

        try:
            parsed = json.loads(response_text)
            result = InvestigationResult(**parsed)
        except Exception:
            result = InvestigationResult(
                summary="AI response could not be parsed.",
                confidence="low",
                raw_output=response_text,
            )

        run.status = AgentRunStatus.completed
        run.output_payload = result.model_dump()
        run.completed_at = datetime.now(UTC)
        await self.db.flush()
        return result

    async def run_detection_engineer_agent(
        self,
        finding_id: str,
        title: str,
        description: str,
        language: str = "sigma",
    ) -> DetectionProposal:
        """Generate a Sigma/SPL/KQL detection rule candidate from an evidence-backed finding."""
        run = AgentRun(
            agent_type="detection_engineer",
            status=AgentRunStatus.running,
            target_type="finding",
            target_id=uuid.UUID(finding_id) if finding_id else None,
            started_at=datetime.now(UTC),
        )
        self.db.add(run)
        await self.db.flush()

        system = (
            f"You are a Principal Detection Engineer. Formulate a high-fidelity {language.upper()} "
            "rule from the analyst finding. Return a JSON object with keys: language (str), "
            "rule_name (str), rule_content (str - the full rule text), description (str), "
            "mitre_techniques (list[str]), mitre_tactics (list[str]), data_sources (list[str]), "
            "false_positive_notes (str). Output strictly valid rule content."
        )
        prompt = f"Finding: {title}\nDetails: {description}\nGenerate {language} rule candidate."

        response_text = await self.provider.generate_response(system, prompt)

        try:
            parsed = json.loads(response_text)
            result = DetectionProposal(**parsed)
        except Exception:
            result = DetectionProposal(
                language=language,
                rule_name=title[:100],
                rule_content=response_text,
                finding_id=finding_id,
                raw_output=response_text,
            )

        output_dict = result.model_dump()
        run.status = AgentRunStatus.completed
        run.output_payload = output_dict
        run.completed_at = datetime.now(UTC)
        await self.db.flush()
        return result

    async def run_hunt_agent(
        self,
        hunt_id: str,
        hypothesis: str,
        data_sources: list[str],
    ) -> ThreatHuntResult:
        """Generate threat hunting queries and assess the hypothesis."""
        run = AgentRun(
            agent_type="threat_hunt_agent",
            status=AgentRunStatus.running,
            target_type="hunt",
            target_id=uuid.UUID(hunt_id) if hunt_id else None,
            started_at=datetime.now(UTC),
        )
        self.db.add(run)
        await self.db.flush()

        system = (
            "You are a Threat Hunter. Evaluate the hunting hypothesis and return a JSON object "
            "with keys: hypothesis_assessment (str: confirmed/likely/unlikely/inconclusive), "
            "findings_summary (str), evidence_of_compromise (bool), iocs_identified (list[str]), "
            "recommended_detections (list[str]), suggested_queries (list[str]), confidence (str)."
        )
        prompt = (
            f"Hypothesis: {hypothesis}\n"
            f"Available data sources: {', '.join(data_sources)}\n\nAssess and generate hunt guidance."
        )

        response_text = await self.provider.generate_response(system, prompt)

        try:
            parsed = json.loads(response_text)
            result = ThreatHuntResult(**parsed)
        except Exception:
            result = ThreatHuntResult(
                hypothesis_assessment="inconclusive",
                findings_summary="AI response could not be parsed.",
                evidence_of_compromise=False,
                confidence="low",
                raw_output=response_text,
            )

        run.status = AgentRunStatus.completed
        run.output_payload = result.model_dump()
        run.completed_at = datetime.now(UTC)
        await self.db.flush()
        return result
