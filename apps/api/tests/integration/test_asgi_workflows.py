"""In-Process ASGI Integration Tests for Complete SOCForge End-to-End Workflows.

Tests full REST API workflows using in-process ASGITransport(app=app) to enable
self-contained CI execution and complete pytest-cov coverage measurement.
"""

from __future__ import annotations

import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from socforge.database import AsyncSessionLocal
from socforge.main import app
from socforge.models.operations import (
    ResponseAction,
    ResponseActionStatus,
    ResponseActionType,
)


@pytest.mark.asyncio
async def test_asgi_health_and_metrics():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] in ["ok", "degraded"]
        assert "components" in data

        resp_metrics = await client.get("/metrics")
        assert resp_metrics.status_code == 200
        assert "socforge_uptime_seconds" in resp_metrics.text


@pytest.mark.asyncio
async def test_asgi_complete_secops_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Login with seeded admin credentials
        login_resp = await client.post(
            "/api/v1/auth/login",
            data={"username": "admin@socforge.local", "password": "admin12345!"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Query workspaces
        ws_resp = await client.get("/api/v1/workspaces", headers=headers)
        assert ws_resp.status_code == 200
        workspaces = ws_resp.json()
        assert len(workspaces) >= 1
        workspace_id = workspaces[0]["id"]

        # 3. Ingest a security alert
        alert_payload = {
            "source": "sysmon",
            "title": "ASGI Workflow: Mimikatz LSASS Dump Detected",
            "description": "Suspicious process mimikatz requested PROCESS_VM_READ against lsass.exe.",
            "severity": "critical",
            "source_host": "SRV-DC01",
            "username": "SYSTEM",
            "process_name": "mimikatz.exe",
            "process_command_line": "mimikatz.exe privilege::debug sekurlsa::logonpasswords exit",
            "source_ip": "10.0.1.15",
            "destination_ip": "10.0.1.200",
            "mitre_techniques": ["T1003.001"],
            "mitre_tactics": ["credential_access"],
        }
        alert_resp = await client.post("/api/v1/alerts", json=alert_payload, headers=headers)
        assert alert_resp.status_code == 201
        alert_data = alert_resp.json()
        alert_id = alert_data["id"]
        assert alert_data["title"] == alert_payload["title"]

        # 4. List alerts with filters
        alerts_list_resp = await client.get("/api/v1/alerts?severity=critical", headers=headers)
        assert alerts_list_resp.status_code == 200
        assert alerts_list_resp.json()["total"] >= 1

        # 5. Create an investigation
        inv_payload = {
            "title": "Investigate DC01 Memory Dump Anomaly",
            "description": "Correlating endpoint process execution and LSASS credential theft.",
            "severity": "critical",
            "workspace_id": workspace_id,
            "alert_ids": [alert_id],
            "mitre_techniques": ["T1003.001"],
            "mitre_tactics": ["credential_access"],
        }
        inv_resp = await client.post("/api/v1/investigations", json=inv_payload, headers=headers)
        assert inv_resp.status_code == 201
        inv_data = inv_resp.json()
        inv_id = inv_data["id"]

        # 6. Retrieve investigation evidence graph
        graph_resp = await client.get(f"/api/v1/investigations/{inv_id}/graph", headers=headers)
        assert graph_resp.status_code == 200
        graph_data = graph_resp.json()
        assert "nodes" in graph_data
        assert "edges" in graph_data
        assert len(graph_data["nodes"]) >= 1

        # 7. Add an evidence-backed finding
        finding_payload = {
            "title": "Confirmed LSASS Memory Extraction",
            "description": "SeDebugPrivilege used to dump credentials to disk.",
            "confidence": "confirmed",
            "mitre_techniques": ["T1003.001"],
            "mitre_tactics": ["credential_access"],
            "supporting_event_ids": [],
            "justification": "Evidence verified from host telemetry and memory dump access patterns.",
            "response_recommendations": ["isolate_host", "revoke_session"],
        }
        finding_resp = await client.post(
            f"/api/v1/investigations/{inv_id}/findings",
            json=finding_payload,
            headers=headers,
        )
        assert finding_resp.status_code == 201
        finding_id = finding_resp.json()["id"]

        # 8. Create, validate, and test a detection rule
        sigma_rule = """title: ASGI Test LSASS Dump
id: aabbccdd-1122-3344-5566-778899aabbcc
status: test
description: Detects mimikatz lsass dump
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|contains: mimikatz
  condition: selection
"""
        det_payload = {
            "name": "ASGI LSASS Rule",
            "description": "Detects LSASS dump",
            "rule_language": "sigma",
            "rule_content": sigma_rule,
            "mitre_techniques": ["T1003.001"],
            "mitre_tactics": ["credential_access"],
            "finding_id": finding_id,
        }
        det_resp = await client.post("/api/v1/detections", json=det_payload, headers=headers)
        assert det_resp.status_code == 201
        det_id = det_resp.json()["id"]

        # Validate detection rule
        val_resp = await client.post(f"/api/v1/detections/{det_id}/validate", headers=headers)
        assert val_resp.status_code == 200
        assert val_resp.json()["syntax_valid"] is True

        # Test replay detection rule against synthetic dataset
        test_resp = await client.post(
            f"/api/v1/detections/{det_id}/test",
            json={"dataset_name": "synthetic-soc-v1"},
            headers=headers,
        )
        assert test_resp.status_code == 200
        assert test_resp.json()["total_events"] > 0

        # 9. Query security integrations catalog
        int_resp = await client.get("/api/v1/integrations", headers=headers)
        assert int_resp.status_code == 200
        assert len(int_resp.json()) >= 1

        # 10. Four-Eyes Containment Action & Approval
        # Create a response action in pending_approval
        action_id = str(uuid.uuid4())
        async with AsyncSessionLocal() as db:
            action = ResponseAction(
                id=uuid.UUID(action_id),
                action_type=ResponseActionType.isolate_host,
                target_entity_type="host",
                target_entity_value="WKSTN-INFECTED01",
                status=ResponseActionStatus.pending_approval,
                justification="Automated quarantine for malicious LSASS memory dump",
            )
            db.add(action)
            await db.commit()

        # Approve the response action
        appr_resp = await client.post(f"/api/v1/responses/{action_id}/approve", headers=headers)
        assert appr_resp.status_code == 200
        action_res = appr_resp.json()
        assert action_res["status"] == "completed"
        assert action_res["execution_result"]["mode"] == "SIMULATED"
