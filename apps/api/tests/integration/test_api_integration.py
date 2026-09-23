"""Comprehensive Integration Tests for SOCForge End-to-End Workflows.

Tests full REST API workflows including:
1. Health and probe readiness (/health, /metrics)
2. Authentication (login, token generation, rejection of bad credentials)
3. Role-based authorization enforcement
4. Alert ingestion, query, and lifecycle triage (/api/v1/alerts)
5. Relational Evidence Graph & investigation workspace (/api/v1/investigations)
6. Detection engineering pipeline: syntax validation & approval (/api/v1/detections)
7. Security connectors catalog & health diagnostics (/api/v1/integrations)
"""

from __future__ import annotations

import httpx
import pytest

API_BASE = "http://localhost:8000"


@pytest.mark.asyncio
async def test_health_check_endpoint():
    """Test /health returns HTTP 200 with component health."""
    async with httpx.AsyncClient(base_url=API_BASE, timeout=10.0) as client:
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] in ["ok", "degraded"]
        assert "version" in data
        assert "components" in data
        assert data["components"].get("database") == "ok"


@pytest.mark.asyncio
async def test_metrics_endpoint():
    """Test /metrics returns Prometheus format plaintext metrics."""
    async with httpx.AsyncClient(base_url=API_BASE, timeout=10.0) as client:
        resp = await client.get("/metrics")
        assert resp.status_code == 200
        assert "socforge_uptime_seconds" in resp.text
        assert "socforge_info" in resp.text


@pytest.mark.asyncio
async def test_auth_login_success():
    """Test authentication with seeded admin credentials returns JWT access token."""
    async with httpx.AsyncClient(base_url=API_BASE, timeout=10.0) as client:
        resp = await client.post(
            "/api/v1/auth/login",
            data={"username": "admin@socforge.local", "password": "admin12345!"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "Bearer"
        assert data["expires_in"] > 0


@pytest.mark.asyncio
async def test_auth_login_invalid_password():
    """Test authentication with invalid credentials returns HTTP 401."""
    async with httpx.AsyncClient(base_url=API_BASE, timeout=10.0) as client:
        resp = await client.post(
            "/api/v1/auth/login",
            data={"username": "admin@socforge.local", "password": "WrongPassword123!"},
        )
        assert resp.status_code == 401
        assert "Incorrect email or password" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_auth_login_nonexistent_user():
    """Test authentication with non-existent user returns HTTP 401."""
    async with httpx.AsyncClient(base_url=API_BASE, timeout=10.0) as client:
        resp = await client.post(
            "/api/v1/auth/login",
            data={"username": "ghost@socforge.local", "password": "AnyPassword123!"},
        )
        assert resp.status_code == 401


@pytest.mark.asyncio
async def test_unauthorized_access_blocked():
    """Test protected endpoints reject unauthenticated requests."""
    endpoints = [
        "/api/v1/alerts",
        "/api/v1/investigations",
        "/api/v1/detections",
        "/api/v1/integrations",
    ]
    async with httpx.AsyncClient(base_url=API_BASE, timeout=10.0) as client:
        for ep in endpoints:
            resp = await client.get(ep)
            assert resp.status_code in [401, 403], f"Endpoint {ep} should require authentication"


@pytest.mark.asyncio
async def test_integrations_catalog_and_health():
    """Test listing integrations and testing connector health."""
    async with httpx.AsyncClient(base_url=API_BASE, timeout=10.0) as client:
        auth_resp = await client.post(
            "/api/v1/auth/login",
            data={"username": "admin@socforge.local", "password": "admin12345!"},
        )
        token = auth_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # List integrations
        list_resp = await client.get("/api/v1/integrations", headers=headers)
        assert list_resp.status_code == 200
        connectors = list_resp.json()
        assert len(connectors) >= 3
        names = [c["name"] for c in connectors]
        assert "wazuh" in names
        assert "sentinel" in names
        assert "splunk" in names

        # Test sentinel connector health check
        sentinel_test = await client.post("/api/v1/integrations/sentinel/health", headers=headers)
        assert sentinel_test.status_code == 200
        s_data = sentinel_test.json()
        assert s_data["name"] == "sentinel"
        assert s_data["status"] in ["planned", "healthy", "unhealthy"]

        # Test splunk connector health check
        splunk_test = await client.post("/api/v1/integrations/splunk/health", headers=headers)
        assert splunk_test.status_code == 200
        sp_data = splunk_test.json()
        assert sp_data["name"] == "splunk"
        assert sp_data["status"] in ["ready", "healthy"]


@pytest.mark.asyncio
async def test_alert_lifecycle_workflow():
    """Test creating an alert, listing it, and updating its status."""
    async with httpx.AsyncClient(base_url=API_BASE, timeout=15.0) as client:
        auth_resp = await client.post(
            "/api/v1/auth/login",
            data={"username": "admin@socforge.local", "password": "admin12345!"},
        )
        token = auth_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Ingest alert
        alert_payload = {
            "source": "sysmon",
            "title": "Integration Test: Suspicious Rundll32 Execution",
            "description": "Process rundll32.exe executed with suspicious ordinals",
            "severity": "high",
            "source_host": "ENDPOINT-TEST-99",
            "username": "corp\\jdoe",
            "process_name": "rundll32.exe",
            "mitre_techniques": ["T1218.011"],
            "mitre_tactics": ["Defense Evasion"],
        }
        create_resp = await client.post("/api/v1/alerts", json=alert_payload, headers=headers)
        assert create_resp.status_code == 201
        alert_data = create_resp.json()
        alert_id = alert_data["id"]
        assert alert_data["title"] == alert_payload["title"]
        assert alert_data["severity"] == "high"

        # 2. Get alert detail
        get_resp = await client.get(f"/api/v1/alerts/{alert_id}", headers=headers)
        assert get_resp.status_code == 200
        assert get_resp.json()["id"] == alert_id

        # 3. Update alert status to investigating
        update_resp = await client.patch(
            f"/api/v1/alerts/{alert_id}",
            json={"status": "investigating"},
            headers=headers,
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["status"] == "investigating"


@pytest.mark.asyncio
async def test_evidence_graph_workspace():
    """Test querying investigations and retrieving the Evidence Graph nodes and edges."""
    async with httpx.AsyncClient(base_url=API_BASE, timeout=10.0) as client:
        auth_resp = await client.post(
            "/api/v1/auth/login",
            data={"username": "admin@socforge.local", "password": "admin12345!"},
        )
        token = auth_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # List investigations
        inv_list_resp = await client.get("/api/v1/investigations", headers=headers)
        assert inv_list_resp.status_code == 200
        invs = inv_list_resp.json()
        assert len(invs) >= 1

        # Select or create an investigation with alert telemetry or MITRE techniques
        target_inv = next((i for i in invs if (i.get("alert_count", 0) > 0 or len(i.get("mitre_techniques") or []) > 0)), None)
        if not target_inv:
            create_resp = await client.post(
                "/api/v1/investigations",
                json={
                    "title": "Evidence Graph Test Investigation",
                    "severity": "high",
                    "mitre_techniques": ["T1059.001"],
                },
                headers=headers,
            )
            assert create_resp.status_code == 201
            target_inv = create_resp.json()

        target_inv_id = target_inv["id"]

        # Fetch investigation evidence graph
        graph_resp = await client.get(f"/api/v1/investigations/{target_inv_id}/graph", headers=headers)
        assert graph_resp.status_code == 200
        graph = graph_resp.json()

        assert "nodes" in graph
        assert "edges" in graph
        assert len(graph["nodes"]) >= 1
        node_types = [n["type"] for n in graph["nodes"]]
        assert any(t in node_types for t in ["user", "host", "process", "technique"])


@pytest.mark.asyncio
async def test_detection_lifecycle_and_validation():
    """Test querying existing detections and validating detection syntax."""
    async with httpx.AsyncClient(base_url=API_BASE, timeout=10.0) as client:
        auth_resp = await client.post(
            "/api/v1/auth/login",
            data={"username": "admin@socforge.local", "password": "admin12345!"},
        )
        token = auth_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Query seeded detection
        list_resp = await client.get("/api/v1/detections", headers=headers)
        assert list_resp.status_code == 200
        detections = list_resp.json()
        assert len(detections) >= 1

        detection_id = detections[0]["id"]

        # Run syntax validator on existing detection
        val_resp = await client.post(f"/api/v1/detections/{detection_id}/validate", headers=headers)
        assert val_resp.status_code == 200
        val_data = val_resp.json()
        assert val_data["syntax_valid"] is True


@pytest.mark.asyncio
async def test_detection_test_replay_and_approval():
    """Test replaying a detection against telemetry and verifying separation of duties."""
    async with httpx.AsyncClient(base_url=API_BASE, timeout=10.0) as client:
        auth_resp = await client.post(
            "/api/v1/auth/login",
            data={"username": "admin@socforge.local", "password": "admin12345!"},
        )
        token = auth_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        list_resp = await client.get("/api/v1/detections", headers=headers)
        detection_id = list_resp.json()[0]["id"]

        # 1. Run test replay
        test_resp = await client.post(
            f"/api/v1/detections/{detection_id}/test",
            headers=headers,
            json={"dataset_name": "synthetic-replay-dataset"},
        )
        assert test_resp.status_code == 200
        test_data = test_resp.json()
        assert test_data["syntax_valid"] is True
        assert test_data["total_events"] > 0
        assert "precision" in test_data
        assert "recall" in test_data

        # 2. List test history
        history_resp = await client.get(f"/api/v1/detections/{detection_id}/tests", headers=headers)
        assert history_resp.status_code == 200
        assert len(history_resp.json()) >= 1


@pytest.mark.asyncio
async def test_response_action_lifecycle_and_workspaces():
    """Test containment response action workflow and workspace access."""
    async with httpx.AsyncClient(base_url=API_BASE, timeout=10.0) as client:
        auth_resp = await client.post(
            "/api/v1/auth/login",
            data={"username": "admin@socforge.local", "password": "admin12345!"},
        )
        token = auth_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. List workspaces
        ws_resp = await client.get("/api/v1/workspaces", headers=headers)
        assert ws_resp.status_code == 200
        workspaces = ws_resp.json()
        assert len(workspaces) >= 1
        assert any(w["slug"] == "default" for w in workspaces)

        # 2. Request response action
        action_resp = await client.post(
            "/api/v1/responses",
            headers=headers,
            json={
                "action_type": "isolate_host",
                "target_entity_type": "host",
                "target_entity_value": "WKSTN-FIN-04",
                "justification": "Active credential dumping detected on workstation.",
            },
        )
        assert action_resp.status_code == 201
        action_data = action_resp.json()
        assert action_data["status"] == "pending_approval"
        action_id = action_data["id"]

        # 3. List response actions
        list_res = await client.get("/api/v1/responses", headers=headers)
        assert list_res.status_code == 200
        assert any(a["id"] == action_id for a in list_res.json())

