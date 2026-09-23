"""Investigation Evidence Graph and Timeline Reconstruction Engine.

Automates entity extraction, relationship correlation, and timeline sequencing
from security alerts and investigation findings.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from socforge.models.alert import Alert


class InvestigationGraphBuilder:
    """Builds node-and-edge evidence graph structures from alert telemetry."""

    @classmethod
    def extract_graph(cls, alerts: list[Alert]) -> dict[str, list[dict[str, Any]]]:
        """Extract typed entities and relationship edges from a collection of alerts."""
        nodes: dict[str, dict[str, Any]] = {}
        edges: list[dict[str, Any]] = []

        def add_node(node_id: str, label: str, node_type: str, props: dict[str, Any] | None = None):
            if node_id not in nodes:
                nodes[node_id] = {
                    "id": node_id,
                    "label": label,
                    "type": node_type,
                    "properties": props or {},
                }

        for alert in alerts:
            alert_id = str(alert.id)
            add_node(f"alert:{alert_id}", alert.title, "alert", {"severity": alert.severity.value, "source": alert.source})

            # User
            if alert.username:
                user_id = f"user:{alert.username}"
                add_node(user_id, alert.username, "user", {"username": alert.username})
                edges.append({
                    "id": f"edge:{alert_id}:{user_id}",
                    "source": f"alert:{alert_id}",
                    "target": user_id,
                    "type": "INVOLVES_USER",
                    "label": "involves user",
                })

            # Host
            host = alert.source_host or alert.destination_host
            if host:
                host_id = f"host:{host}"
                add_node(host_id, host, "host", {"hostname": host})
                edges.append({
                    "id": f"edge:{alert_id}:{host_id}",
                    "source": f"alert:{alert_id}",
                    "target": host_id,
                    "type": "TARGETS_HOST",
                    "label": "targets host",
                })

            # Process
            if alert.process_name:
                proc_id = f"proc:{alert.process_name}"
                add_node(proc_id, alert.process_name, "process", {"command_line": alert.process_command_line})
                if alert.username:
                    edges.append({
                        "id": f"edge:user:{alert.username}:{proc_id}",
                        "source": f"user:{alert.username}",
                        "target": proc_id,
                        "type": "EXECUTED",
                        "label": "executed",
                    })

            # Network IPs
            if alert.source_ip and alert.destination_ip:
                src_id = f"ip:{alert.source_ip}"
                dst_id = f"ip:{alert.destination_ip}"
                add_node(src_id, alert.source_ip, "ip_address", {"ip": alert.source_ip})
                add_node(dst_id, alert.destination_ip, "ip_address", {"ip": alert.destination_ip})
                edges.append({
                    "id": f"edge:{src_id}:{dst_id}",
                    "source": src_id,
                    "target": dst_id,
                    "type": "COMMUNICATED_WITH",
                    "label": "communicated with",
                })

            # MITRE Techniques
            for tech in (alert.mitre_techniques or []):
                tech_id = f"tech:{tech}"
                add_node(tech_id, tech, "technique", {"technique_id": tech})
                edges.append({
                    "id": f"edge:{alert_id}:{tech_id}",
                    "source": f"alert:{alert_id}",
                    "target": tech_id,
                    "type": "USES_TECHNIQUE",
                    "label": "maps to",
                })

        return {
            "nodes": list(nodes.values()),
            "edges": edges,
        }

    @classmethod
    def build_timeline(cls, alerts: list[Alert]) -> list[dict[str, Any]]:
        """Construct a chronologically sorted activity timeline from alerts."""
        events = []
        for alert in alerts:
            ts = alert.event_time or alert.created_at
            events.append({
                "alert_id": str(alert.id),
                "timestamp": ts.isoformat() if ts else "",
                "title": alert.title,
                "severity": alert.severity.value,
                "source": alert.source,
                "actor": alert.username or "SYSTEM",
                "host": alert.source_host or alert.destination_host or "UNKNOWN",
                "summary": f"{alert.source}: {alert.title} (Severity: {alert.severity.value})",
            })
        return sorted(events, key=lambda x: x["timestamp"])
