"""Unit tests for SOCForge Asynchronous Repositories."""

import uuid

import pytest

from socforge.database import AsyncSessionLocal
from socforge.models.alert import Alert, AlertSeverity, AlertStatus
from socforge.models.detection import Detection, RuleLanguage, ValidationState
from socforge.models.investigation import (
    Finding,
    FindingConfidence,
    Investigation,
    InvestigationStatus,
)
from socforge.models.operations import Workspace
from socforge.repositories.base import (
    AlertRepository,
    DetectionRepository,
    InvestigationRepository,
)


@pytest.mark.asyncio
async def test_alert_repository_operations():
    """Verify AlertRepository pagination, creation, and filtering."""
    async with AsyncSessionLocal() as session:
        repo = AlertRepository(session)

        # Test alert creation via repository
        unique_title = f"Test Alert {uuid.uuid4().hex[:8]}"
        alert = Alert(
            title=unique_title,
            description="Testing Alert Repository",
            severity=AlertSeverity.high,
            status=AlertStatus.new,
            source="unit_test_repo",
        )
        saved = await repo.add(alert)
        assert saved.id is not None
        assert saved.title == unique_title

        # Test get_by_id
        fetched = await repo.get_by_id(saved.id)
        assert fetched is not None
        assert fetched.id == saved.id
        assert fetched.severity == AlertSeverity.high

        # Test query_alerts with filters
        items, total = await repo.query_alerts(
            severity=AlertSeverity.high,
            source="unit_test_repo",
            limit=10,
            offset=0,
        )
        assert total >= 1
        assert any(a.id == saved.id for a in items)

        # Test query_alerts with mismatch filter
        items_low, _total_low = await repo.query_alerts(
            severity=AlertSeverity.low,
            source="unit_test_repo",
        )
        assert not any(a.id == saved.id for a in items_low)


@pytest.mark.asyncio
async def test_investigation_repository_operations():
    """Verify InvestigationRepository operations and findings persistence."""
    async with AsyncSessionLocal() as session:
        repo = InvestigationRepository(session)

        # Create a workspace to satisfy foreign key
        ws = Workspace(
            name=f"Repo Workspace {uuid.uuid4().hex[:6]}",
            slug=f"ws-{uuid.uuid4().hex[:6]}",
            is_active=True,
        )
        session.add(ws)
        await session.flush()

        inv_title = f"Investigation Repo Test {uuid.uuid4().hex[:8]}"
        inv = Investigation(
            title=inv_title,
            status=InvestigationStatus.open,
            severity="high",
            workspace_id=ws.id,
        )
        saved_inv = await repo.add(inv)
        assert saved_inv.id is not None

        # Test list_by_workspace
        ws_invs = await repo.list_by_workspace(workspace_id=ws.id)
        assert len(ws_invs) >= 1
        assert any(i.id == saved_inv.id for i in ws_invs)

        # Test add_finding via repository
        finding = Finding(
            investigation_id=saved_inv.id,
            title="Evidence finding in repo test",
            description="Detailed evidence description proving lateral movement",
            confidence=FindingConfidence.high,
            mitre_techniques=["T1003.001"],
            mitre_tactics=["credential-access"],
        )
        saved_finding = await repo.add_finding(finding)
        assert saved_finding.id is not None
        assert saved_finding.investigation_id == saved_inv.id


@pytest.mark.asyncio
async def test_detection_repository_operations():
    """Verify DetectionRepository creation and active listing."""
    async with AsyncSessionLocal() as session:
        repo = DetectionRepository(session)

        unique_name = f"Repo Rule {uuid.uuid4().hex[:8]}"
        detection = Detection(
            name=unique_name,
            rule_language=RuleLanguage.sigma,
            rule_content="title: Test Rule\nlogsource:\n  category: process_creation",
            validation_state=ValidationState.approved,
        )
        saved = await repo.add(detection)
        assert saved.id is not None

        # Test list_active
        active_rules = await repo.list_active()
        assert len(active_rules) >= 1
        assert any(d.id == saved.id for d in active_rules)
