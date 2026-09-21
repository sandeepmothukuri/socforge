"""Base integration classes and registry."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class BaseIntegration(ABC):
    """Abstract base class for security telemetry and SIEM integrations."""

    name: str = "base"
    display_name: str = "Base Connector"
    capabilities: list[str] = []

    def __init__(self, config: dict[str, Any] | None = None):
        self.config = config or {}

    @abstractmethod
    async def health_check(self) -> dict[str, Any]:
        """Test connectivity and report health."""
        pass

    @abstractmethod
    async def search_events(self, query: str, limit: int = 50) -> list[dict[str, Any]]:
        """Search raw telemetry in source system."""
        pass

    @abstractmethod
    async def get_alert(self, alert_id: str) -> dict[str, Any] | None:
        """Fetch alert by external ID."""
        pass
