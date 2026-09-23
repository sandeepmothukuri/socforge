"""Unit tests for AIAgentOrchestrator workflows."""

import json
import uuid
from unittest.mock import AsyncMock

import pytest

from socforge.agents.workflows import AIAgentOrchestrator
from socforge.database import AsyncSessionLocal
from socforge.models.alert import Alert, AlertSeverity, AlertStatus
from socforge.models.investigation import Investigation, InvestigationStatus


@pytest.mark.asyncio
async def test_agent_orchestrator_workflows():
    async with AsyncSessionLocal() as db:
        # Create test alert
        alert = Alert(
            title="Orchestrator Test Alert",
            description="Testing AI agent workflow",
            severity=AlertSeverity.high,
            status=AlertStatus.new,
            source="test",
        )
        db.add(alert)

        # Create test investigation
        inv = Investigation(
            title="Orchestrator Test Investigation",
            status=InvestigationStatus.open,
            severity="high",
        )
        db.add(inv)
        await db.flush()

        orchestrator = AIAgentOrchestrator(db, actor_id=uuid.uuid4())

        # Mock provider
        mock_provider = AsyncMock()
        orchestrator.provider = mock_provider

        # 1. Test run_triage_agent with valid JSON response
        triage_mock_json = json.dumps({
            "summary": "Mimikatz credential dump detected",
            "severity_recommendation": "critical",
            "mitre_techniques": ["T1003.001"],
            "mitre_tactics": ["credential_access"],
            "confidence": "high",
            "recommended_pivots": ["check_event_id_4624", "isolate_host"],
            "false_positive_indicators": [],
        })
        mock_provider.generate_response.return_value = triage_mock_json
        triage_res = await orchestrator.run_triage_agent(str(alert.id))
        assert triage_res.severity_recommendation == "critical"
        assert "T1003.001" in triage_res.mitre_techniques

        # 2. Test run_triage_agent with fallback
        mock_provider.generate_response.return_value = "Unparseable LLM output"
        triage_fallback = await orchestrator.run_triage_agent(str(alert.id))
        assert triage_fallback.confidence == "low"
        assert triage_fallback.summary == "AI response could not be parsed."

        # 3. Test run_detection_engineer_agent
        det_mock_json = json.dumps({
            "rule_name": "Detect LSASS Memory Reading",
            "language": "sigma",
            "rule_content": "title: LSASS Read\nlogsource:\n  category: process_access",
            "mitre_techniques": ["T1003.001"],
            "mitre_tactics": ["credential_access"],
            "test_hypotheses": ["Inject mimikatz process into lsass"],
        })
        mock_provider.generate_response.return_value = det_mock_json
        det_res = await orchestrator.run_detection_engineer_agent(
            finding_id=str(uuid.uuid4()),
            title="LSASS Memory Read",
            description="Process accessed lsass.exe",
            language="sigma",
        )
        assert det_res.rule_name == "Detect LSASS Memory Reading"
        assert det_res.language == "sigma"

        # 4. Test run_hunt_agent
        hunt_mock_json = json.dumps({
            "hypothesis_assessment": "likely",
            "findings_summary": "Suspicious RDP persistence found across 3 hosts",
            "evidence_of_compromise": True,
            "iocs_identified": ["10.0.0.99"],
            "recommended_detections": ["Rule RDP New User"],
            "suggested_queries": ["index=wineventlog EventCode=4624 LogonType=10"],
            "confidence": "high",
        })
        mock_provider.generate_response.return_value = hunt_mock_json
        hunt_res = await orchestrator.run_hunt_agent(
            hunt_id=str(uuid.uuid4()),
            hypothesis="Attackers are maintaining persistence via RDP backdoors",
            data_sources=["sysmon", "wineventlog"],
        )
        assert hunt_res.hypothesis_assessment == "likely"
        assert hunt_res.evidence_of_compromise is True
