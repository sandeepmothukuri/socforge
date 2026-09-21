"""Wazuh integration adapter — connects to Wazuh SIEM API.

Provides real API interaction with a live Wazuh manager or sandbox.
Capabilities: health_check, search_events, get_alert, get_agent_status.
"""

from __future__ import annotations

import base64
from typing import Any

import httpx
import structlog

from socforge.integrations.base import BaseIntegration

logger = structlog.get_logger(__name__)


class WazuhIntegration(BaseIntegration):
    name = "wazuh"
    display_name = "Wazuh SIEM / EDR"
    capabilities = [
        "health_check",
        "search_events",
        "get_alert",
        "get_agent_status",
        "ingest_alerts",
    ]

    def __init__(self, config: dict[str, Any] | None = None):
        super().__init__(config)
        self.base_url = self.config.get("api_url", "https://localhost:55000").rstrip("/")
        self.username = self.config.get("username", "wazuh-wui")
        self.password = self.config.get("password", "wazuh-wui")
        self.verify_ssl = self.config.get("verify_ssl", False)
        self._token: str | None = None

    async def _authenticate(self) -> str:
        """Authenticate with Wazuh API and acquire JWT."""
        auth_str = f"{self.username}:{self.password}"
        b64_auth = base64.b64encode(auth_str.encode()).decode()
        headers = {"Authorization": f"Basic {b64_auth}"}

        async with httpx.AsyncClient(verify=self.verify_ssl, timeout=10.0) as client:
            resp = await client.post(
                f"{self.base_url}/security/user/authenticate",
                headers=headers,
            )
            if resp.status_code != 200:
                raise ConnectionError(f"Wazuh auth failed: HTTP {resp.status_code} {resp.text}")
            data = resp.json()
            self._token = data.get("data", {}).get("token")
            return self._token

    async def health_check(self) -> dict[str, Any]:
        """Verify Wazuh manager status."""
        try:
            token = await self._authenticate()
            headers = {"Authorization": f"Bearer {token}"}
            async with httpx.AsyncClient(verify=self.verify_ssl, timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/manager/info", headers=headers)
                if resp.status_code == 200:
                    data = resp.json().get("data", {})
                    return {
                        "status": "healthy",
                        "connected": True,
                        "manager_name": data.get("name"),
                        "version": data.get("version"),
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
        """Query agent events from Wazuh API."""
        token = await self._authenticate()
        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(verify=self.verify_ssl, timeout=15.0) as client:
            params = {"q": query, "limit": limit}
            resp = await client.get(f"{self.base_url}/syscheck", headers=headers, params=params)
            if resp.status_code == 200:
                return resp.json().get("data", {}).get("affected_items", [])
            return []

    async def get_alert(self, alert_id: str) -> dict[str, Any] | None:
        """Fetch alert by ID (or rule ID)."""
        token = await self._authenticate()
        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(verify=self.verify_ssl, timeout=10.0) as client:
            resp = await client.get(
                f"{self.base_url}/rules",
                headers=headers,
                params={"rule_ids": alert_id},
            )
            if resp.status_code == 200:
                items = resp.json().get("data", {}).get("affected_items", [])
                return items[0] if items else None
            return None
