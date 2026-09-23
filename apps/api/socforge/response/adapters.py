"""Response action adapters and execution dispatcher.

Separates simulated containment actions from live infrastructure operations.
All simulated executions are explicitly tagged with status="SIMULATED" and
dry_run=True to ensure technical credibility and operational clarity.
"""

from __future__ import annotations

import abc
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from socforge.models.operations import ResponseAction


class BaseResponseAdapter(abc.ABC):
    """Abstract base class for containment response adapters."""

    @abc.abstractmethod
    async def execute(
        self,
        action: ResponseAction,
    ) -> dict[str, Any]:
        """Execute or simulate the containment action against the target entity."""
        pass


class MockResponseAdapter(BaseResponseAdapter):
    """Safe, deterministic simulated execution adapter.

    Clearly marks executions as SIMULATED so operators and auditors
    know no destructive changes occurred on live infrastructure.
    """

    async def execute(
        self,
        action: ResponseAction,
    ) -> dict[str, Any]:
        now = datetime.now(UTC).isoformat()
        action_type = (
            action.action_type.value
            if hasattr(action.action_type, "value")
            else str(action.action_type)
        )

        execution_plans = {
            "isolate_host": {
                "subsystem": "Endpoint Isolation (EDR Agent)",
                "command_simulated": f"agent_ctl --isolate-host --target {action.target_entity_value} --allow-dhcp-dns",
                "simulated_effect": f"Network traffic for {action.target_entity_value} restricted to SOC management subnet",
            },
            "unisolate_host": {
                "subsystem": "Endpoint Isolation (EDR Agent)",
                "command_simulated": f"agent_ctl --unisolate-host --target {action.target_entity_value}",
                "simulated_effect": f"Network access restored for {action.target_entity_value}",
            },
            "block_ip": {
                "subsystem": "Perimeter Firewall ACL",
                "command_simulated": f"iptables -A FORWARD -s {action.target_entity_value} -j DROP",
                "simulated_effect": f"Inbound and outbound packets for IP {action.target_entity_value} dropped with null route",
            },
            "unblock_ip": {
                "subsystem": "Perimeter Firewall ACL",
                "command_simulated": f"iptables -D FORWARD -s {action.target_entity_value} -j DROP",
                "simulated_effect": f"ACL rule dropped for IP {action.target_entity_value}",
            },
            "block_domain": {
                "subsystem": "DNS Sinkhole",
                "command_simulated": f"rpz-add-zone --domain {action.target_entity_value} --target 0.0.0.0",
                "simulated_effect": f"DNS queries for {action.target_entity_value} rerouted to local sinkhole",
            },
            "disable_user": {
                "subsystem": "Directory Service (Identity Provider)",
                "command_simulated": f"user_admin --disable --account {action.target_entity_value}",
                "simulated_effect": f"Account {action.target_entity_value} set to DISABLED; active Kerberos/OAuth tokens invalidated",
            },
            "revoke_session": {
                "subsystem": "Identity Provider Session Store",
                "command_simulated": f"session_ctl --revoke-all --principal {action.target_entity_value}",
                "simulated_effect": f"All active refresh tokens for {action.target_entity_value} purged from session cache",
            },
            "kill_process": {
                "subsystem": "Endpoint Process Manager",
                "command_simulated": f"kill -9 $(pgrep -f {action.target_entity_value})",
                "simulated_effect": f"SIGKILL sent to matching instances of {action.target_entity_value}",
            },
            "quarantine_file": {
                "subsystem": "Endpoint AV Engine",
                "command_simulated": f"av_agent --quarantine --path {action.target_entity_value}",
                "simulated_effect": f"File {action.target_entity_value} encrypted and moved to isolated quarantine vault",
            },
        }

        plan = execution_plans.get(
            action_type,
            {
                "subsystem": "Generic Containment Engine",
                "command_simulated": f"execute_action --action {action_type} --target {action.target_entity_value}",
                "simulated_effect": f"Action {action_type} simulated on {action.target_entity_value}",
            },
        )

        return {
            "status": "SIMULATED",
            "mode": "SIMULATED",
            "dry_run": True,
            "action": action_type,
            "target": action.target_entity_value,
            "target_type": action.target_entity_type,
            "justification": action.justification,
            "executed_at": now,
            "adapter": "MockResponseAdapter",
            "execution_plan": plan,
            "notice": "This containment action was simulated in sandbox mode. No live host or firewall was altered.",
        }


class ResponseDispatcher:
    """Dispatches approved response actions to the appropriate adapter."""

    def __init__(self, adapter: BaseResponseAdapter | None = None):
        self.adapter = adapter or MockResponseAdapter()

    async def dispatch(self, action: ResponseAction) -> dict[str, Any]:
        """Execute the response action through the configured adapter."""
        return await self.adapter.execute(action)
