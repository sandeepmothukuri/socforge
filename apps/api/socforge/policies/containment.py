"""Containment and Four-Eyes Authorization Policies.

Enforces strict separation of duties, role-based approval gating,
critical infrastructure asset protection, and containment action timeouts.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from enum import StrEnum
from typing import TYPE_CHECKING

from socforge.models.operations import ResponseAction, ResponseActionType

if TYPE_CHECKING:
    from socforge.models.user import User


class PolicyDecisionCode(StrEnum):
    ALLOWED = "ALLOWED"
    DENIED_SELF_APPROVAL = "DENIED_SELF_APPROVAL"
    DENIED_INSUFFICIENT_PRIVILEGES = "DENIED_INSUFFICIENT_PRIVILEGES"
    DENIED_CRITICAL_ASSET_PROTECTED = "DENIED_CRITICAL_ASSET_PROTECTED"
    DENIED_EXPIRED = "DENIED_EXPIRED"


@dataclass
class PolicyDecision:
    allowed: bool
    decision_code: PolicyDecisionCode
    reason: str
    required_role: str = "Incident Commander"


class FourEyesPolicyEngine:
    """Evaluates Four-Eyes separation of duties and authorization thresholds for containment actions."""

    # High-impact containment actions requiring Incident Commander or Administrator
    HIGH_IMPACT_ACTIONS = {
        ResponseActionType.isolate_host,
        ResponseActionType.disable_user,
        ResponseActionType.kill_process,
    }

    # Medium-impact containment actions
    MEDIUM_IMPACT_ACTIONS = {
        ResponseActionType.block_ip,
        ResponseActionType.block_domain,
        ResponseActionType.revoke_session,
        ResponseActionType.quarantine_file,
    }

    # Low-impact restoration actions
    LOW_IMPACT_ACTIONS = {
        ResponseActionType.unisolate_host,
        ResponseActionType.unblock_ip,
    }

    # Protected entity substrings (Domain controllers, identity infrastructure)
    CRITICAL_ASSET_PATTERNS = ["-dc-", "dc01", "dc02", "domain_controller", "kdc", "ca-root", "prod-db"]

    APPROVAL_TIMEOUT_SECONDS = 7200  # 2 hours

    @classmethod
    def is_critical_asset(cls, target_value: str) -> bool:
        lower = target_value.lower()
        return any(pat in lower for pat in cls.CRITICAL_ASSET_PATTERNS)

    @classmethod
    def is_action_expired(cls, action: ResponseAction) -> bool:
        if not action.created_at:
            return False
        delta = datetime.now(UTC) - action.created_at
        return delta.total_seconds() > cls.APPROVAL_TIMEOUT_SECONDS

    @classmethod
    def evaluate_approval(
        cls,
        action: ResponseAction,
        approver: User,
        approver_role_name: str,
        break_glass: bool = False,
    ) -> PolicyDecision:
        """Evaluate if an approver has the legal authority and separation of duties to approve a response action."""

        # 1. Action expiration check
        if cls.is_action_expired(action):
            return PolicyDecision(
                allowed=False,
                decision_code=PolicyDecisionCode.DENIED_EXPIRED,
                reason="Containment action has expired and cannot be approved. A new action must be requested.",
            )

        # 2. Strict Separation of Duties: requester cannot approve their own action
        if action.requested_by_id and action.requested_by_id == approver.id:
            return PolicyDecision(
                allowed=False,
                decision_code=PolicyDecisionCode.DENIED_SELF_APPROVAL,
                reason="Four-Eyes Violation: Requester cannot approve their own containment action.",
            )

        # 3. Critical Asset Safeguard
        if cls.is_critical_asset(action.target_entity_value) and action.action_type in cls.HIGH_IMPACT_ACTIONS:
            if not (approver.is_superuser or approver_role_name == "Administrator"):
                return PolicyDecision(
                    allowed=False,
                    decision_code=PolicyDecisionCode.DENIED_CRITICAL_ASSET_PROTECTED,
                    reason=f"Target '{action.target_entity_value}' is a designated critical infrastructure asset. Isolating requires Administrator authorization.",
                    required_role="Administrator",
                )
            if not break_glass and "break-glass" not in (action.justification or "").lower():
                return PolicyDecision(
                    allowed=False,
                    decision_code=PolicyDecisionCode.DENIED_CRITICAL_ASSET_PROTECTED,
                    reason="Containment against critical infrastructure requires explicit break-glass confirmation in justification.",
                    required_role="Administrator",
                )

        # 4. Role Hierarchy Thresholds
        if action.action_type in cls.HIGH_IMPACT_ACTIONS and not (
            approver.is_superuser or approver_role_name in ["Incident Commander", "Administrator"]
        ):
            return PolicyDecision(
                allowed=False,
                decision_code=PolicyDecisionCode.DENIED_INSUFFICIENT_PRIVILEGES,
                reason="High-impact containment actions require Incident Commander or Administrator privileges.",
                required_role="Incident Commander",
            )

        if action.action_type in cls.MEDIUM_IMPACT_ACTIONS and not (
            approver.is_superuser or approver_role_name in ["Incident Commander", "Administrator", "SOC Analyst"]
        ):
            return PolicyDecision(
                allowed=False,
                decision_code=PolicyDecisionCode.DENIED_INSUFFICIENT_PRIVILEGES,
                reason="Action requires operational analyst privileges.",
                required_role="SOC Analyst",
            )

        return PolicyDecision(
            allowed=True,
            decision_code=PolicyDecisionCode.ALLOWED,
            reason="Policy satisfied: Four-Eyes separation of duties and role authorization verified.",
        )
