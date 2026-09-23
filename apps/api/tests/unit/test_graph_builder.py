"""Unit tests for Investigation Evidence Graph Builder and Timeline Reconstruction."""

import uuid
from datetime import UTC, datetime

from socforge.investigations.graph_builder import InvestigationGraphBuilder
from socforge.models.alert import Alert, AlertSeverity, AlertStatus


def test_investigation_graph_builder_entities_and_edges():
    alert1 = Alert(
        id=uuid.uuid4(),
        title="Mimikatz Execution on DC01",
        source="sysmon",
        severity=AlertSeverity.critical,
        status=AlertStatus.investigating,
        username="CORP\\admin",
        source_host="CORP-DC01",
        process_name="mimikatz.exe",
        process_command_line="mimikatz.exe sekurlsa::logonpasswords",
        source_ip="10.0.1.50",
        destination_ip="10.0.2.10",
        mitre_techniques=["T1003.001"],
        created_at=datetime.now(UTC),
    )

    graph = InvestigationGraphBuilder.extract_graph([alert1])
    assert "nodes" in graph
    assert "edges" in graph

    node_types = {n["type"] for n in graph["nodes"]}
    assert "alert" in node_types
    assert "user" in node_types
    assert "host" in node_types
    assert "process" in node_types
    assert "ip_address" in node_types
    assert "technique" in node_types

    edge_types = {e["type"] for e in graph["edges"]}
    assert "INVOLVES_USER" in edge_types
    assert "TARGETS_HOST" in edge_types
    assert "EXECUTED" in edge_types
    assert "COMMUNICATED_WITH" in edge_types
    assert "USES_TECHNIQUE" in edge_types


def test_timeline_reconstruction():
    t1 = datetime(2026, 9, 23, 10, 0, 0, tzinfo=UTC)
    t2 = datetime(2026, 9, 23, 10, 15, 0, tzinfo=UTC)

    alert1 = Alert(
        id=uuid.uuid4(),
        title="Initial Reconnaissance",
        source="zeek",
        severity=AlertSeverity.low,
        created_at=t1,
    )
    alert2 = Alert(
        id=uuid.uuid4(),
        title="Credential Access",
        source="edr",
        severity=AlertSeverity.critical,
        created_at=t2,
    )

    timeline = InvestigationGraphBuilder.build_timeline([alert2, alert1])
    assert len(timeline) == 2
    # Verify chronological order
    assert timeline[0]["title"] == "Initial Reconnaissance"
    assert timeline[1]["title"] == "Credential Access"
