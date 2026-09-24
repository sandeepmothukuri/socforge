"""Initial schema — all SOCForge tables.

Revision ID: 0001
Revises: (none)
Create Date: 2026-01-01 00:00:00.000000

This migration creates all tables from scratch.
The application MUST run this migration before starting.
Do NOT use Base.metadata.create_all() — all schema changes go through Alembic.
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── ENUMS ───────────────────────────────────────────────────────────────────
    alert_severity = postgresql.ENUM(
        "critical", "high", "medium", "low", "informational",
        name="alert_severity", create_type=True,
    )
    alert_severity.create(op.get_bind(), checkfirst=True)

    alert_status = postgresql.ENUM(
        "new", "triaged", "investigating", "resolved", "false_positive", "closed",
        name="alert_status", create_type=True,
    )
    alert_status.create(op.get_bind(), checkfirst=True)

    entity_type = postgresql.ENUM(
        "alert", "event", "user", "host", "ip_address", "domain", "url",
        "hash", "process", "file", "technique", "tactic", "finding",
        "detection", "incident", "response_action",
        name="entity_type", create_type=True,
    )
    entity_type.create(op.get_bind(), checkfirst=True)

    relationship_type = postgresql.ENUM(
        "ALERT_CONTAINS_EVENT", "EVENT_INVOLVES_USER", "EVENT_SOURCE_IP",
        "EVENT_TARGET_HOST", "EVENT_TARGET_IP", "PROCESS_EXECUTED_FILE",
        "PROCESS_RAN_ON_HOST", "HOST_CONNECTED_TO_IP", "HOST_CONNECTED_TO_DOMAIN",
        "HASH_SEEN_ON_HOST", "HASH_SEEN_IN_PROCESS", "FINDING_SUPPORTED_BY_EVENT",
        "FINDING_MAPS_TO_TECHNIQUE", "FINDING_INVOLVES_ENTITY",
        "DETECTION_DERIVED_FROM_FINDING", "INCIDENT_CONTAINS_ALERT",
        "RESPONSE_ACTION_TARGETS_ENTITY", "IP_RESOLVES_TO_DOMAIN",
        "USER_AUTHENTICATED_TO_HOST", "USER_RAN_PROCESS",
        name="relationship_type", create_type=True,
    )
    relationship_type.create(op.get_bind(), checkfirst=True)

    investigation_status = postgresql.ENUM(
        "open", "in_progress", "pending_review", "closed", "archived",
        name="investigation_status", create_type=True,
    )
    investigation_status.create(op.get_bind(), checkfirst=True)

    finding_confidence = postgresql.ENUM(
        "confirmed", "high", "medium", "low", "speculative",
        name="finding_confidence", create_type=True,
    )
    finding_confidence.create(op.get_bind(), checkfirst=True)

    rule_language = postgresql.ENUM(
        "sigma", "spl", "kql",
        name="rule_language", create_type=True,
    )
    rule_language.create(op.get_bind(), checkfirst=True)

    validation_state = postgresql.ENUM(
        "pending", "syntax_valid", "syntax_error", "tested",
        "approved", "rejected", "deprecated",
        name="validation_state", create_type=True,
    )
    validation_state.create(op.get_bind(), checkfirst=True)

    incident_severity = postgresql.ENUM(
        "critical", "high", "medium", "low",
        name="incident_severity", create_type=True,
    )
    incident_severity.create(op.get_bind(), checkfirst=True)

    incident_status = postgresql.ENUM(
        "open", "contained", "eradicated", "recovered", "closed",
        name="incident_status", create_type=True,
    )
    incident_status.create(op.get_bind(), checkfirst=True)

    agent_run_status = postgresql.ENUM(
        "queued", "running", "completed", "failed", "cancelled",
        name="agent_run_status", create_type=True,
    )
    agent_run_status.create(op.get_bind(), checkfirst=True)

    audit_action = postgresql.ENUM(
        "LOGIN", "LOGOUT", "ALERT_CREATED", "ALERT_UPDATED",
        "INVESTIGATION_CREATED", "INVESTIGATION_UPDATED",
        "FINDING_CREATED", "FINDING_UPDATED",
        "AI_RUN_STARTED", "AI_RUN_COMPLETED", "AI_TOOL_EXECUTED",
        "DETECTION_CREATED", "DETECTION_UPDATED", "DETECTION_VALIDATED",
        "DETECTION_APPROVED", "DETECTION_REJECTED", "DETECTION_TESTED",
        "HUNT_CREATED", "HUNT_UPDATED",
        "INCIDENT_CREATED", "INCIDENT_UPDATED",
        "RESPONSE_REQUESTED", "RESPONSE_APPROVED", "RESPONSE_EXECUTED",
        "API_KEY_CREATED", "API_KEY_REVOKED",
        "USER_CREATED", "USER_UPDATED", "CONFIG_CHANGED",
        "WORKSPACE_CREATED", "WORKSPACE_MEMBER_ADDED", "WORKSPACE_MEMBER_REMOVED",
        name="audit_action", create_type=True,
    )
    audit_action.create(op.get_bind(), checkfirst=True)

    response_action_type = postgresql.ENUM(
        "isolate_host", "unisolate_host", "block_ip", "unblock_ip",
        "block_domain", "disable_user", "revoke_session",
        "kill_process", "quarantine_file",
        name="response_action_type", create_type=True,
    )
    response_action_type.create(op.get_bind(), checkfirst=True)

    response_action_status = postgresql.ENUM(
        "pending_approval", "approved", "rejected", "executing",
        "completed", "failed", "cancelled",
        name="response_action_status", create_type=True,
    )
    response_action_status.create(op.get_bind(), checkfirst=True)

    workspace_member_role = postgresql.ENUM(
        "owner", "admin", "analyst", "detection_engineer",
        "incident_commander", "viewer",
        name="workspace_member_role", create_type=True,
    )
    workspace_member_role.create(op.get_bind(), checkfirst=True)

    hunt_status = postgresql.ENUM(
        "open", "active", "completed", "archived",
        name="hunt_status", create_type=True,
    )
    hunt_status.create(op.get_bind(), checkfirst=True)

    # ── TABLES (in dependency order) ───────────────────────────────────────────────
    # roles (no FK dependencies)
    op.create_table(
        "roles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(64), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    # users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("full_name", sa.String(256), nullable=False),
        sa.Column("hashed_password", sa.String(256), nullable=False),
        sa.Column("role_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("roles.id"), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_superuser", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("last_login_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # user_sessions
    op.create_table(
        "user_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(256), nullable=False),
        sa.Column("ip_address", sa.String(45)),
        sa.Column("user_agent", sa.String(512)),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_sessions_token_hash", "user_sessions", ["token_hash"], unique=True)
    op.create_index("ix_user_sessions_user_id", "user_sessions", ["user_id"])

    # api_keys
    op.create_table(
        "api_keys",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("key_hash", sa.String(256), nullable=False),
        sa.Column("key_prefix", sa.String(16), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True)),
        sa.Column("last_used_at", sa.DateTime(timezone=True)),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_api_keys_key_hash", "api_keys", ["key_hash"], unique=True)
    op.create_index("ix_api_keys_user_id", "api_keys", ["user_id"])

    # workspaces
    op.create_table(
        "workspaces",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("slug", sa.String(64), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_workspaces_slug_active", "workspaces", ["slug", "is_active"])

    # workspace_memberships
    op.create_table(
        "workspace_memberships",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", postgresql.ENUM("owner","admin","analyst","detection_engineer","incident_commander","viewer", name="workspace_member_role", create_type=False), nullable=False, server_default="analyst"),
        sa.Column("added_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("added_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_workspace_memberships_unique", "workspace_memberships", ["workspace_id", "user_id"], unique=True)
    op.create_index("ix_workspace_memberships_workspace_id", "workspace_memberships", ["workspace_id"])
    op.create_index("ix_workspace_memberships_user", "workspace_memberships", ["user_id"])

    # alerts
    op.create_table(
        "alerts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("external_id", sa.String(256)),
        sa.Column("source", sa.String(128), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("severity", postgresql.ENUM("critical","high","medium","low","informational", name="alert_severity", create_type=False), nullable=False, server_default="medium"),
        sa.Column("status", postgresql.ENUM("new","triaged","investigating","resolved","false_positive","closed", name="alert_status", create_type=False), nullable=False, server_default="new"),
        sa.Column("risk_score", sa.Float(), server_default="0.0"),
        sa.Column("event_time", sa.DateTime(timezone=True)),
        sa.Column("source_ip", sa.String(45)),
        sa.Column("destination_ip", sa.String(45)),
        sa.Column("source_host", sa.String(256)),
        sa.Column("destination_host", sa.String(256)),
        sa.Column("username", sa.String(256)),
        sa.Column("process_name", sa.String(256)),
        sa.Column("process_command_line", sa.Text()),
        sa.Column("file_hash", sa.String(128)),
        sa.Column("domain", sa.String(256)),
        sa.Column("url", sa.Text()),
        sa.Column("mitre_techniques", postgresql.JSONB()),
        sa.Column("mitre_tactics", postgresql.JSONB()),
        sa.Column("raw_event", postgresql.JSONB()),
        sa.Column("extra_metadata", postgresql.JSONB()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("ingested_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_alerts_severity_status", "alerts", ["severity", "status"])
    op.create_index("ix_alerts_source", "alerts", ["source"])
    op.create_index("ix_alerts_event_time", "alerts", ["event_time"])
    op.create_index("ix_alerts_external_id", "alerts", ["external_id"])

    # events
    op.create_table(
        "events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("alert_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("alerts.id", ondelete="SET NULL")),
        sa.Column("source", sa.String(128), nullable=False),
        sa.Column("event_type", sa.String(128), nullable=False),
        sa.Column("event_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("severity", sa.String(32)),
        sa.Column("username", sa.String(256)),
        sa.Column("source_ip", sa.String(45)),
        sa.Column("destination_ip", sa.String(45)),
        sa.Column("source_host", sa.String(256)),
        sa.Column("destination_host", sa.String(256)),
        sa.Column("process_name", sa.String(256)),
        sa.Column("process_command_line", sa.Text()),
        sa.Column("file_hash", sa.String(128)),
        sa.Column("domain", sa.String(256)),
        sa.Column("url", sa.Text()),
        sa.Column("raw_event", postgresql.JSONB()),
        sa.Column("extra_metadata", postgresql.JSONB()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_events_event_time", "events", ["event_time"])
    op.create_index("ix_events_source", "events", ["source"])
    op.create_index("ix_events_event_type", "events", ["event_type"])
    op.create_index("ix_events_username", "events", ["username"])
    op.create_index("ix_events_source_ip", "events", ["source_ip"])
    op.create_index("ix_events_alert_id", "events", ["alert_id"])

    # entities
    op.create_table(
        "entities",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("entity_type", postgresql.ENUM("alert","event","user","host","ip_address","domain","url","hash","process","file","technique","tactic","finding","detection","incident","response_action", name="entity_type", create_type=False), nullable=False),
        sa.Column("value", sa.String(512), nullable=False),
        sa.Column("display_name", sa.String(512)),
        sa.Column("first_seen_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("event_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("risk_score", sa.Float(), server_default="0.0"),
        sa.Column("is_malicious", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("enrichment", postgresql.JSONB()),
        sa.Column("extra_metadata", postgresql.JSONB()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_entities_type_value", "entities", ["entity_type", "value"], unique=True)
    op.create_index("ix_entities_risk_score", "entities", ["risk_score"])

    # investigations
    op.create_table(
        "investigations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("status", postgresql.ENUM("open","in_progress","pending_review","closed","archived", name="investigation_status", create_type=False), nullable=False, server_default="open"),
        sa.Column("severity", sa.String(32)),
        sa.Column("risk_score", sa.Float(), server_default="0.0"),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="SET NULL")),
        sa.Column("assigned_to_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("mitre_techniques", postgresql.JSONB()),
        sa.Column("mitre_tactics", postgresql.JSONB()),
        sa.Column("notes", sa.Text()),
        sa.Column("extra_metadata", postgresql.JSONB()),
        sa.Column("opened_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("closed_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_investigations_status", "investigations", ["status"])
    op.create_index("ix_investigations_assigned_to", "investigations", ["assigned_to_id"])
    op.create_index("ix_investigations_workspace", "investigations", ["workspace_id"])

    # findings (after investigations)
    op.create_table(
        "findings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("investigation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("confidence", postgresql.ENUM("confirmed","high","medium","low","speculative", name="finding_confidence", create_type=False), nullable=False, server_default="medium"),
        sa.Column("mitre_techniques", postgresql.JSONB()),
        sa.Column("mitre_tactics", postgresql.JSONB()),
        sa.Column("supporting_event_ids", postgresql.JSONB()),
        sa.Column("supporting_entity_ids", postgresql.JSONB()),
        sa.Column("response_recommendations", postgresql.JSONB()),
        sa.Column("has_detection_hypothesis", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("extra_metadata", postgresql.JSONB()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_findings_investigation", "findings", ["investigation_id"])
    op.create_index("ix_findings_confidence", "findings", ["confidence"])

    # investigation_alerts (join table)
    op.create_table(
        "investigation_alerts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("investigation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("alert_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("added_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_inv_alert_unique", "investigation_alerts", ["investigation_id", "alert_id"], unique=True)

    # entity_relationships
    op.create_table(
        "entity_relationships",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_entity_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("entities.id", ondelete="CASCADE"), nullable=False),
        sa.Column("target_entity_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("entities.id", ondelete="CASCADE"), nullable=False),
        sa.Column("relationship_type", postgresql.ENUM("ALERT_CONTAINS_EVENT","EVENT_INVOLVES_USER","EVENT_SOURCE_IP","EVENT_TARGET_HOST","EVENT_TARGET_IP","PROCESS_EXECUTED_FILE","PROCESS_RAN_ON_HOST","HOST_CONNECTED_TO_IP","HOST_CONNECTED_TO_DOMAIN","HASH_SEEN_ON_HOST","HASH_SEEN_IN_PROCESS","FINDING_SUPPORTED_BY_EVENT","FINDING_MAPS_TO_TECHNIQUE","FINDING_INVOLVES_ENTITY","DETECTION_DERIVED_FROM_FINDING","INCIDENT_CONTAINS_ALERT","RESPONSE_ACTION_TARGETS_ENTITY","IP_RESOLVES_TO_DOMAIN","USER_AUTHENTICATED_TO_HOST","USER_RAN_PROCESS", name="relationship_type", create_type=False), nullable=False),
        sa.Column("investigation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("investigations.id", ondelete="SET NULL")),
        sa.Column("supporting_event_ids", postgresql.JSONB()),
        sa.Column("extra_metadata", postgresql.JSONB()),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_entity_rel_source_target_type", "entity_relationships", ["source_entity_id", "target_entity_id", "relationship_type"], unique=True)
    op.create_index("ix_entity_rel_target", "entity_relationships", ["target_entity_id"])
    op.create_index("ix_entity_rel_investigation", "entity_relationships", ["investigation_id"])

    # detections (after findings)
    op.create_table(
        "detections",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("finding_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("findings.id", ondelete="SET NULL")),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("rule_language", postgresql.ENUM("sigma","spl","kql", name="rule_language", create_type=False), nullable=False, server_default="sigma"),
        sa.Column("rule_content", sa.Text(), nullable=False),
        sa.Column("validation_state", postgresql.ENUM("pending","syntax_valid","syntax_error","tested","approved","rejected","deprecated", name="validation_state", create_type=False), nullable=False, server_default="pending"),
        sa.Column("validation_errors", postgresql.JSONB()),
        sa.Column("last_validated_at", sa.DateTime(timezone=True)),
        sa.Column("mitre_techniques", postgresql.JSONB()),
        sa.Column("mitre_tactics", postgresql.JSONB()),
        sa.Column("data_sources", postgresql.JSONB()),
        sa.Column("reviewed_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("approved_at", sa.DateTime(timezone=True)),
        sa.Column("false_positive_notes", sa.Text()),
        sa.Column("tags", postgresql.JSONB()),
        sa.Column("author_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_detections_validation_state", "detections", ["validation_state"])
    op.create_index("ix_detections_rule_language", "detections", ["rule_language"])

    # detection_versions
    op.create_table(
        "detection_versions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("detection_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("detections.id", ondelete="CASCADE"), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("rule_language", postgresql.ENUM("sigma","spl","kql", name="rule_language", create_type=False), nullable=False),
        sa.Column("rule_content", sa.Text(), nullable=False),
        sa.Column("change_summary", sa.Text()),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_detection_versions_detection_version", "detection_versions", ["detection_id", "version"], unique=True)

    # detection_test_runs
    op.create_table(
        "detection_test_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("detection_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("detections.id", ondelete="CASCADE"), nullable=False),
        sa.Column("detection_version", sa.Integer(), nullable=False),
        sa.Column("dataset_name", sa.String(256), nullable=False),
        sa.Column("total_events", sa.Integer(), server_default="0"),
        sa.Column("expected_true_positives", sa.Integer(), server_default="0"),
        sa.Column("expected_true_negatives", sa.Integer(), server_default="0"),
        sa.Column("matched_events", sa.Integer(), server_default="0"),
        sa.Column("true_positives", sa.Integer(), server_default="0"),
        sa.Column("false_positives", sa.Integer(), server_default="0"),
        sa.Column("false_negatives", sa.Integer(), server_default="0"),
        sa.Column("true_negatives", sa.Integer(), server_default="0"),
        sa.Column("precision", sa.Float()),
        sa.Column("recall", sa.Float()),
        sa.Column("syntax_valid", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("syntax_errors", postgresql.JSONB()),
        sa.Column("matched_samples", postgresql.JSONB()),
        sa.Column("unmatched_expected_samples", postgresql.JSONB()),
        sa.Column("ran_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column("duration_ms", sa.Integer()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_detection_test_runs_detection", "detection_test_runs", ["detection_id"])

    # incidents
    op.create_table(
        "incidents",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("severity", postgresql.ENUM("critical","high","medium","low", name="incident_severity", create_type=False), nullable=False, server_default="medium"),
        sa.Column("status", postgresql.ENUM("open","contained","eradicated","recovered","closed", name="incident_status", create_type=False), nullable=False, server_default="open"),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="SET NULL")),
        sa.Column("commander_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("assigned_to_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("investigation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("investigations.id", ondelete="SET NULL")),
        sa.Column("executive_summary", sa.Text()),
        sa.Column("technical_summary", sa.Text()),
        sa.Column("timeline", postgresql.JSONB()),
        sa.Column("affected_systems", postgresql.JSONB()),
        sa.Column("affected_users", postgresql.JSONB()),
        sa.Column("mitre_techniques", postgresql.JSONB()),
        sa.Column("mitre_tactics", postgresql.JSONB()),
        sa.Column("extra_metadata", postgresql.JSONB()),
        sa.Column("opened_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("closed_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_incidents_status", "incidents", ["status"])
    op.create_index("ix_incidents_severity", "incidents", ["severity"])
    op.create_index("ix_incidents_workspace", "incidents", ["workspace_id"])
    op.create_index("ix_incidents_commander", "incidents", ["commander_id"])

    # agent_runs
    op.create_table(
        "agent_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("agent_type", sa.String(64), nullable=False),
        sa.Column("status", postgresql.ENUM("queued","running","completed","failed","cancelled", name="agent_run_status", create_type=False), nullable=False, server_default="queued"),
        sa.Column("target_type", sa.String(64)),
        sa.Column("target_id", postgresql.UUID(as_uuid=True)),
        sa.Column("triggered_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("input_payload", postgresql.JSONB()),
        sa.Column("output_payload", postgresql.JSONB()),
        sa.Column("error_message", sa.Text()),
        sa.Column("tool_calls_log", postgresql.JSONB()),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_agent_runs_status", "agent_runs", ["status"])
    op.create_index("ix_agent_runs_target", "agent_runs", ["target_type", "target_id"])

    # agent_tool_calls
    op.create_table(
        "agent_tool_calls",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("agent_run_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("tool_name", sa.String(128), nullable=False),
        sa.Column("tool_input", postgresql.JSONB()),
        sa.Column("tool_output", postgresql.JSONB()),
        sa.Column("success", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("error_message", sa.Text()),
        sa.Column("duration_ms", sa.Integer()),
        sa.Column("called_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_agent_tool_calls_run", "agent_tool_calls", ["agent_run_id"])

    # audit_events
    op.create_table(
        "audit_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("action", postgresql.ENUM("LOGIN","LOGOUT","ALERT_CREATED","ALERT_UPDATED","INVESTIGATION_CREATED","INVESTIGATION_UPDATED","FINDING_CREATED","FINDING_UPDATED","AI_RUN_STARTED","AI_RUN_COMPLETED","AI_TOOL_EXECUTED","DETECTION_CREATED","DETECTION_UPDATED","DETECTION_VALIDATED","DETECTION_APPROVED","DETECTION_REJECTED","DETECTION_TESTED","HUNT_CREATED","HUNT_UPDATED","INCIDENT_CREATED","INCIDENT_UPDATED","RESPONSE_REQUESTED","RESPONSE_APPROVED","RESPONSE_EXECUTED","API_KEY_CREATED","API_KEY_REVOKED","USER_CREATED","USER_UPDATED","CONFIG_CHANGED","WORKSPACE_CREATED","WORKSPACE_MEMBER_ADDED","WORKSPACE_MEMBER_REMOVED", name="audit_action", create_type=False), nullable=False),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True)),
        sa.Column("actor_email", sa.String(256)),
        sa.Column("target_type", sa.String(64)),
        sa.Column("target_id", postgresql.UUID(as_uuid=True)),
        sa.Column("success", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("error_message", sa.Text()),
        sa.Column("ip_address", sa.String(45)),
        sa.Column("user_agent", sa.String(512)),
        sa.Column("metadata", postgresql.JSONB()),
        sa.Column("request_id", sa.String(128)),
        sa.Column("source_ip", sa.String(45)),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_events_action", "audit_events", ["action"])
    op.create_index("ix_audit_events_occurred_at", "audit_events", ["occurred_at"])
    op.create_index("ix_audit_events_actor_id", "audit_events", ["actor_id"])
    op.create_index("ix_audit_events_actor_email", "audit_events", ["actor_email"])
    op.create_index("ix_audit_events_target_id", "audit_events", ["target_id"])

    # integrations
    op.create_table(
        "integrations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("integration_type", sa.String(64), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("config", postgresql.JSONB()),
        sa.Column("encrypted_secrets", sa.Text()),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="SET NULL")),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("last_checked_at", sa.DateTime(timezone=True)),
        sa.Column("last_check_ok", sa.Boolean()),
        sa.Column("last_check_error", sa.Text()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_integrations_type", "integrations", ["integration_type"])
    op.create_index("ix_integrations_workspace", "integrations", ["workspace_id"])

    # hunts
    op.create_table(
        "hunts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("hypothesis", sa.Text(), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("status", postgresql.ENUM("open","active","completed","archived", name="hunt_status", create_type=False), nullable=False, server_default="open"),
        sa.Column("mitre_techniques", postgresql.JSONB()),
        sa.Column("assigned_to_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("extra_metadata", postgresql.JSONB()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_hunts_status", "hunts", ["status"])

    # hunt_queries
    op.create_table(
        "hunt_queries",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("hunt_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hunts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("query_text", sa.Text(), nullable=False),
        sa.Column("query_language", sa.String(32), nullable=False, server_default="lucene"),
        sa.Column("filters", postgresql.JSONB()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_hunt_queries_hunt_id", "hunt_queries", ["hunt_id"])

    # hunt_observations
    op.create_table(
        "hunt_observations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("hunt_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hunts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("supporting_event_ids", postgresql.JSONB()),
        sa.Column("entity_values", postgresql.JSONB()),
        sa.Column("promoted_to_finding_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("findings.id", ondelete="SET NULL")),
        sa.Column("extra_metadata", postgresql.JSONB()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_hunt_observations_hunt_id", "hunt_observations", ["hunt_id"])

    # response_actions
    op.create_table(
        "response_actions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("action_type", postgresql.ENUM("isolate_host","unisolate_host","block_ip","unblock_ip","block_domain","disable_user","revoke_session","kill_process","quarantine_file", name="response_action_type", create_type=False), nullable=False),
        sa.Column("status", postgresql.ENUM("pending_approval","approved","rejected","executing","completed","failed","cancelled", name="response_action_status", create_type=False), nullable=False, server_default="pending_approval"),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="SET NULL")),
        sa.Column("target_entity_type", sa.String(64), nullable=False),
        sa.Column("target_entity_value", sa.String(512), nullable=False),
        sa.Column("justification", sa.Text(), nullable=False),
        sa.Column("investigation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("investigations.id", ondelete="SET NULL")),
        sa.Column("incident_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("incidents.id", ondelete="SET NULL")),
        sa.Column("requested_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("approved_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("approved_at", sa.DateTime(timezone=True)),
        sa.Column("execution_result", postgresql.JSONB()),
        sa.Column("error_message", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_response_actions_status", "response_actions", ["status"])
    op.create_index("ix_response_actions_type", "response_actions", ["action_type"])
    op.create_index("ix_response_actions_workspace", "response_actions", ["workspace_id"])


def downgrade() -> None:
    """Drop all tables in reverse dependency order."""
    tables = [
        "response_actions",
        "hunt_observations",
        "hunt_queries",
        "hunts",
        "integrations",
        "audit_events",
        "agent_tool_calls",
        "agent_runs",
        "incidents",
        "detection_test_runs",
        "detection_versions",
        "detections",
        "entity_relationships",
        "investigation_alerts",
        "finding_entities",
        "finding_events",
        "findings",
        "investigations",
        "entities",
        "events",
        "alerts",
        "workspace_memberships",
        "workspaces",
        "api_keys",
        "user_sessions",
        "users",
        "roles",
    ]
    for table in tables:
        op.execute(sa.text(f"DROP TABLE IF EXISTS {table} CASCADE"))

    enums = [
        "hunt_status",
        "workspace_member_role",
        "response_action_status",
        "response_action_type",
        "audit_action",
        "agent_run_status",
        "incident_status",
        "incident_severity",
        "validation_state",
        "rule_language",
        "finding_confidence",
        "investigation_status",
        "relationship_type",
        "entity_type",
        "alert_status",
        "alert_severity",
    ]
    for enum_name in enums:
        op.execute(sa.text(f"DROP TYPE IF EXISTS {enum_name} CASCADE"))
