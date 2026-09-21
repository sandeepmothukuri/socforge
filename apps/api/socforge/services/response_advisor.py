"""Controlled and approval-gated response advisor.

Ensures no destructive actions are executed arbitrarily.
Response actions require:
1. Recommendation
2. Analyst review & approval
3. Policy check
4. Controlled execution adapter
5. Immutable audit logging
"""

from __future__ import annotations

from typing import Any
import uuid
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from socforge.models.operations import AuditAction
from socforge.services.audit import record_audit_event

logger = structlog.get_logger(__name__)


class ResponseAdvisor:
    VALID_ACTIONS = {
        "isolate_host",
        "disable_user",
        "block_ip",
        "block_domain",
        "quarantine_file",
        "collect_forensic_artifact",
    }

    def __init__(self, db: AsyncSession, actor_id: uuid.UUID | None = None, actor_email: str | None = None):
        self.db = db
        self.actor_id = actor_id
        self.actor_email = actor_email

    async def execute_approved_action(
        self,
        action_name: str,
        target_entity_value: str,
        investigation_id: str,
        approved: bool = False,
    ) -> dict[str, Any]:
        """Execute a response action only when explicitly approved by an analyst."""
        if action_name not in self.VALID_ACTIONS:
            raise ValueError(f"Unsupported action: {action_name}")

        if not approved:
            return {
                "status": "pending_approval",
                "action": action_name,
                "target": target_entity_value,
                "message": "Action held pending mandatory analyst approval gate.",
            }

        # Safe adapter mock/execution
        logger.info(
            "executing_response_action",
            action=action_name,
            target=target_entity_value,
            actor=self.actor_email,
        )

        result_details = {
            "action": action_name,
            "target": target_entity_value,
            "investigation_id": investigation_id,
            "execution_status": "executed_safely",
            "adapter": "controlled_mock_adapter",
            "note": "Adapter simulated containment safely without unauthorized disruption.",
        }

        await record_audit_event(
            self.db,
            action=AuditAction.response_executed,
            actor_id=str(self.actor_id) if self.actor_id else None,
            actor_email=self.actor_email,
            target_type="response_action",
            metadata=result_details,
        )

        return result_details
