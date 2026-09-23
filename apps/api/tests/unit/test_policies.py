"""Unit tests for Containment & Four-Eyes Authorization Policies."""

import uuid
from datetime import UTC, datetime, timedelta

from socforge.models.operations import ResponseAction, ResponseActionStatus, ResponseActionType
from socforge.models.user import User
from socforge.policies.containment import (
    FourEyesPolicyEngine,
    PolicyDecisionCode,
)


def _make_action(
    action_type=ResponseActionType.isolate_host, target="host-01", requester_id=None, age_hours=0
):
    now = datetime.now(UTC) - timedelta(hours=age_hours)
    return ResponseAction(
        id=uuid.uuid4(),
        action_type=action_type,
        target_entity_type="host",
        target_entity_value=target,
        status=ResponseActionStatus.pending_approval,
        requested_by_id=requester_id or uuid.uuid4(),
        created_at=now,
        justification="Isolate host due to ransomware behavior",
    )


def _make_user(is_superuser=False):
    return User(
        id=uuid.uuid4(),
        email="analyst@socforge.local",
        full_name="SOC Analyst",
        is_active=True,
        is_superuser=is_superuser,
        role_id=uuid.uuid4(),
    )


def test_four_eyes_self_approval_denied():
    requester = _make_user()
    action = _make_action(requester_id=requester.id)

    decision = FourEyesPolicyEngine.evaluate_approval(
        action, approver=requester, approver_role_name="Incident Commander"
    )
    assert decision.allowed is False
    assert decision.decision_code == PolicyDecisionCode.DENIED_SELF_APPROVAL
    assert "Four-Eyes" in decision.reason


def test_high_impact_action_denied_for_soc_analyst():
    requester = _make_user()
    approver = _make_user()
    action = _make_action(action_type=ResponseActionType.isolate_host, requester_id=requester.id)

    decision = FourEyesPolicyEngine.evaluate_approval(
        action, approver=approver, approver_role_name="SOC Analyst"
    )
    assert decision.allowed is False
    assert decision.decision_code == PolicyDecisionCode.DENIED_INSUFFICIENT_PRIVILEGES


def test_high_impact_action_allowed_for_commander():
    requester = _make_user()
    approver = _make_user()
    action = _make_action(action_type=ResponseActionType.isolate_host, requester_id=requester.id)

    decision = FourEyesPolicyEngine.evaluate_approval(
        action, approver=approver, approver_role_name="Incident Commander"
    )
    assert decision.allowed is True
    assert decision.decision_code == PolicyDecisionCode.ALLOWED


def test_critical_asset_protection_requires_admin_and_break_glass():
    requester = _make_user()
    approver_cmd = _make_user()
    action = _make_action(
        action_type=ResponseActionType.isolate_host, target="CORP-DC01", requester_id=requester.id
    )

    # 1. Incident commander cannot isolate DC
    dec1 = FourEyesPolicyEngine.evaluate_approval(
        action, approver=approver_cmd, approver_role_name="Incident Commander"
    )
    assert dec1.allowed is False
    assert dec1.decision_code == PolicyDecisionCode.DENIED_CRITICAL_ASSET_PROTECTED

    # 2. Administrator without break-glass is denied
    approver_admin = _make_user()
    dec2 = FourEyesPolicyEngine.evaluate_approval(
        action, approver=approver_admin, approver_role_name="Administrator", break_glass=False
    )
    assert dec2.allowed is False
    assert dec2.decision_code == PolicyDecisionCode.DENIED_CRITICAL_ASSET_PROTECTED

    # 3. Administrator with break-glass is allowed
    dec3 = FourEyesPolicyEngine.evaluate_approval(
        action, approver=approver_admin, approver_role_name="Administrator", break_glass=True
    )
    assert dec3.allowed is True
    assert dec3.decision_code == PolicyDecisionCode.ALLOWED


def test_expired_action_denied():
    requester = _make_user()
    approver = _make_user()
    # 3 hours old (> 2 hours timeout)
    action = _make_action(requester_id=requester.id, age_hours=3)

    decision = FourEyesPolicyEngine.evaluate_approval(
        action, approver=approver, approver_role_name="Incident Commander"
    )
    assert decision.allowed is False
    assert decision.decision_code == PolicyDecisionCode.DENIED_EXPIRED
