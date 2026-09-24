"""Database seed and demo data initialization.

NOTE: Alembic migrations manage schema. This script does NOT call
Base.metadata.create_all(). Run `alembic upgrade head` first.
"""

from __future__ import annotations

import asyncio

import structlog
from sqlalchemy import select

from socforge.auth.security import hash_password
from socforge.config import get_settings
from socforge.database import AsyncSessionLocal
from socforge.models.detection import Detection, RuleLanguage, ValidationState
from socforge.models.operations import Workspace, WorkspaceMemberRole, WorkspaceMembership
from socforge.models.user import Role, User

logger = structlog.get_logger(__name__)


async def seed_data():
    settings = get_settings()

    async with AsyncSessionLocal() as db:
        # 0. Seed Default Workspace
        default_workspace = (
            await db.execute(select(Workspace).where(Workspace.slug == "default"))
        ).scalar_one_or_none()
        if not default_workspace:
            default_workspace = Workspace(
                name="Default SOC Operations",
                slug="default",
                description="Primary workspace for SOC operations, detection engineering, and threat response.",
                is_active=True,
            )
            db.add(default_workspace)
            await db.flush()
            logger.info("created_default_workspace", slug="default")

        # 1. Seed Roles
        roles = [
            ("Administrator", "Full system and platform administration access"),
            ("Incident Commander", "Lead incident response and authorize containment actions"),
            ("Detection Engineer", "Create, test, validate, and manage detection rules"),
            ("SOC Analyst", "Triage alerts, conduct investigations, log findings"),
            ("Viewer", "Read-only visibility for compliance and executive auditing"),
        ]
        role_map: dict[str, Role] = {}
        for name, description in roles:
            existing = (
                await db.execute(select(Role).where(Role.name == name))
            ).scalar_one_or_none()
            if not existing:
                role_obj = Role(name=name, description=description)
                db.add(role_obj)
                await db.flush()
                role_map[name] = role_obj
                logger.info("created_role", name=name)
            else:
                role_map[name] = existing

        # 2. Seed Admin User
        admin_email = getattr(
            settings,
            "default_admin_email",
            getattr(settings, "first_admin_email", "admin@socforge.local"),
        )
        admin_password = "admin12345!"
        admin_role = role_map.get("Administrator")
        existing_admin = (
            await db.execute(select(User).where(User.email == admin_email))
        ).scalar_one_or_none()

        if not existing_admin and admin_role:
            admin = User(
                email=admin_email,
                hashed_password=hash_password(admin_password),
                full_name="SOCForge Administrator",
                role_id=admin_role.id,
                is_active=True,
                is_superuser=True,
            )
            db.add(admin)
            await db.flush()
            logger.info("created_admin_user", email=admin_email)

            # Add admin as workspace owner
            membership = WorkspaceMembership(
                workspace_id=default_workspace.id,
                user_id=admin.id,
                role=WorkspaceMemberRole.owner,
            )
            db.add(membership)
            await db.flush()
        elif existing_admin:
            existing_admin.hashed_password = hash_password(admin_password)
            existing_admin.is_active = True
            await db.flush()
            # Ensure workspace membership exists
            existing_mem = (
                await db.execute(
                    select(WorkspaceMembership).where(
                        WorkspaceMembership.workspace_id == default_workspace.id,
                        WorkspaceMembership.user_id == existing_admin.id,
                    )
                )
            ).scalar_one_or_none()
            if not existing_mem:
                db.add(
                    WorkspaceMembership(
                        workspace_id=default_workspace.id,
                        user_id=existing_admin.id,
                        role=WorkspaceMemberRole.owner,
                    )
                )
                await db.flush()

        # 3. Seed Default Detection Rule
        existing_det = (
            await db.execute(
                select(Detection).where(Detection.name == "Suspicious PowerShell Encoded Command")
            )
        ).scalar_one_or_none()
        if not existing_det:
            sample_rule = """title: Suspicious PowerShell Encoded Command
id: f3b1a87e-2f5a-4b9d-a46c-e4d0b1a2c3d4
status: experimental
description: Detects execution of PowerShell with encoded commands often used by attackers.
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        Image|endswith: '\\powershell.exe'
        CommandLine|contains:
            - '-enc'
            - '-encodedcommand'
    condition: selection
falsepositives:
    - Administrative automation scripts
level: high
tags:
    - attack.execution
    - attack.t1059.001
"""
            det = Detection(
                name="Suspicious PowerShell Encoded Command",
                description="Detects PowerShell encoded command execution.",
                rule_language=RuleLanguage.sigma,
                rule_content=sample_rule,
                validation_state=ValidationState.syntax_valid,
                mitre_techniques=["T1059.001"],
                mitre_tactics=["TA0002"],
                data_sources=["process_creation"],
                tags=["attack.execution"],
            )
            db.add(det)
            await db.flush()
            logger.info("created_sample_detection", name=det.name)

        await db.commit()
        logger.info("seed_data_complete")


if __name__ == "__main__":
    asyncio.run(seed_data())
