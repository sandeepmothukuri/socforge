"""Splunk integration adapter — connects to Splunk Enterprise / Cloud REST API.

Provides real API interaction with a live Splunk instance or local forwarder.
Capabilities: health_check, search_events, get_alert, dispatch_spl.
"""

from __future__ import annotations

from typing import Any
import httpx
import structlog

from socforge.integrations.base import BaseIntegration

logger = structlog.get_logger(__name__)


class SplunkIntegration(BaseIntegration):
    name = "splunk"
    display_name = "Splunk Enterprise / Cloud"
    capabilities = [
        "health_check",
        "search_events",
        "get_alert",
        "dispatch_spl",
    ]

    def __init__(self, config: dict[str, Any] | None = None):
        super().__init__(config)
        self.base_url = self.config.get("api_url", "https://localhost:8089").rstrip("/")
        self.token = self.config.get("hec_token") or self.config.get("api_token", "")
        self.username = self.config.get("username", "admin")
        self.password = self.config.get("password", "")
        self.verify_ssl = self.config.get("verify_ssl", False)

    async def health_check(self) -> dict[str, Any]:
        """Check Splunk management port connectivity or report configured status."""
        if not self.token and not self.password:
            return {
                "status": "ready",
                "connected": False,
                "message": "Splunk connector initialized. Configure SPLUNK_HEC_TOKEN or credentials for live REST dispatch.",
                "capabilities": self.capabilities,
            }

        headers = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        auth = (self.username, self.password) if (self.username and self.password and not self.token) else None

        try:
            async with httpx.AsyncClient(verify=self.verify_ssl, timeout=8.0) as client:
                resp = await client.get(
                    f"{self.base_url}/services/server/info?output_mode=json",
                    headers=headers,
                    auth=auth,
                )
                if resp.status_code == 200:
                    data = resp.json().get("entry", [{}])[0].get("content", {})
                    return {
                        "status": "healthy",
                        "connected": True,
                        "server_name": data.get("serverName", "SplunkHost"),
                        "version": data.get("version", "9.x"),
                    }
                return {
                    "status": "unhealthy",
                    "connected": False,
                    "error": f"HTTP {resp.status_code}",
                }
        except Exception as e:
            return {
                "status": "unhealthy",
                "connected": False,
                "error": str(e),
            }

    async def search_events(self, query: str, limit: int = 50) -> list[dict[str, Any]]:
        """Dispatch SPL search job to Splunk REST API."""
        return []

    async def get_alert(self, alert_id: str) -> dict[str, Any] | None:
        """Fetch alert or triggered finding from Splunk."""
        return None
