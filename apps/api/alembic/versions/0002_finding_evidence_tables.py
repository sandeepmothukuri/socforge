"""Add finding_events and finding_entities association tables.

Revision ID: 0002
Revises: 0001
Create Date: 2026-01-02 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # finding_events
    op.create_table(
        "finding_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("finding_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("findings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_finding_events_unique", "finding_events", ["finding_id", "event_id"], unique=True)
    op.create_index("ix_finding_events_finding", "finding_events", ["finding_id"])
    op.create_index("ix_finding_events_event", "finding_events", ["event_id"])

    # finding_entities
    op.create_table(
        "finding_entities",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("finding_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("findings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("entities.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_finding_entities_unique", "finding_entities", ["finding_id", "entity_id"], unique=True)
    op.create_index("ix_finding_entities_finding", "finding_entities", ["finding_id"])
    op.create_index("ix_finding_entities_entity", "finding_entities", ["entity_id"])


def downgrade() -> None:
    op.drop_table("finding_entities")
    op.drop_table("finding_events")
