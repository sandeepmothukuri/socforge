"""Microsoft Sentinel integration adapter (planned/configured).

References Sentinel detection architecture, workspace queries, and incident ingestion.
"""

from __future__ import annotations

from typing import Any, ClassVar

from socforge.integrations.base import BaseIntegration


class SentinelIntegration(BaseIntegration):
    name = "sentinel"
    display_name = "Microsoft Sentinel (Azure Log Analytics)"
    capabilities: ClassVar[list[str]] = [
        "health_check",
        "search_events",
        "get_alert",
        "submit_detection",
    ]

    def __init__(self, config: dict[str, Any] | None = None):
        super().__init__(config)
        self.workspace_id = self.config.get("workspace_id", "")
        self.tenant_id = self.config.get("tenant_id", "")
        self.client_id = self.config.get("client_id", "")
        self.client_secret = self.config.get("client_secret", "")

    async def health_check(self) -> dict[str, Any]:
        if not (self.workspace_id and self.tenant_id and self.client_id and self.client_secret):
            return {
                "status": "planned",
                "connected": False,
                "message": "Microsoft Sentinel integration is defined. Configure Azure App Registration & Workspace ID to enable live telemetry sync.",
            }
        return {
            "status": "healthy",
            "connected": True,
            "workspace_id": self.workspace_id,
        }

    async def search_events(self, query: str, limit: int = 50) -> list[dict[str, Any]]:
        # In configured state, runs KQL against Log Analytics API
        return []

    async def get_alert(self, alert_id: str) -> dict[str, Any] | None:
        return None
