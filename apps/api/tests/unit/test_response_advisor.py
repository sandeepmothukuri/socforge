"""Unit tests for ResponseAdvisor service."""

import uuid

import pytest

from socforge.database import AsyncSessionLocal
from socforge.services.response_advisor import ResponseAdvisor


@pytest.mark.asyncio
async def test_response_advisor_approval_gate():
    """Verify that ResponseAdvisor rejects unapproved actions and executes approved ones."""
    async with AsyncSessionLocal() as db:
        advisor = ResponseAdvisor(db, actor_id=uuid.uuid4(), actor_email="analyst@socforge.local")
        inv_id = str(uuid.uuid4())

        # 1. Action unapproved -> holds in pending_approval
        unapproved = await advisor.execute_approved_action(
            action_name="isolate_host",
            target_entity_value="WKSTN-FIN01",
            investigation_id=inv_id,
            approved=False,
        )
        assert unapproved["status"] == "pending_approval"
        assert "pending mandatory analyst approval" in unapproved["message"]

        # 2. Action approved -> executes safely and creates audit log
        approved = await advisor.execute_approved_action(
            action_name="isolate_host",
            target_entity_value="WKSTN-FIN01",
            investigation_id=inv_id,
            approved=True,
        )
        assert approved["execution_status"] == "executed_safely"
        assert approved["adapter"] == "controlled_mock_adapter"

        # 3. Invalid action name -> raises ValueError
        with pytest.raises(ValueError, match="Unsupported action"):
            await advisor.execute_approved_action(
                action_name="reboot_nuclear_reactor",
                target_entity_value="target",
                investigation_id=inv_id,
                approved=True,
            )
