"""Comprehensive demo data seeder for SOCForge enterprise showcase.
Populates PostgreSQL with realistic Alerts, Incidents, Entities, Investigations, Findings, and Detections.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta

import structlog
from sqlalchemy import select

from socforge.database import AsyncSessionLocal
from socforge.models.alert import Entity, EntityType
from socforge.models.investigation import (
    Finding,
    FindingConfidence,
    Investigation,
    InvestigationStatus,
)
from socforge.models.operations import Incident, IncidentSeverity, IncidentStatus, Workspace

logger = structlog.get_logger(__name__)


async def seed_full_demo():
    async with AsyncSessionLocal() as db:
        # Get default workspace
        workspace = (
            await db.execute(select(Workspace).where(Workspace.slug == "default"))
        ).scalar_one_or_none()
        if not workspace:
            workspace = Workspace(
                name="Default SOC Operations",
                slug="default",
                description="Primary workspace for SOC operations",
                is_active=True,
            )
            db.add(workspace)
            await db.flush()

        ws_id = workspace.id

        # ── 1. Seed Incidents ──────────────────────────────────────────────────────────
        incidents_data = [
            {
                "title": "Active Mimikatz Credential Theft & Kerberos TGT Ticket Pass-the-Hash Campaign",
                "description": "Multi-stage intrusion chain originating on WKSTN-FIN-04 via malicious macro, escalating to SRV-DC01 with LSASS memory dump and Kerberos silver ticket issuance.",
                "severity": IncidentSeverity.critical,
                "status": IncidentStatus.open,
                "affected_systems": ["SRV-DC01", "WKSTN-FIN-04", "SRV-FILE-02"],
                "affected_users": ["corp\\admin", "corp\\jdoe", "corp\\svc_backup"],
                "mitre_techniques": ["T1003.001", "T1550.002", "T1078.002", "T1059.001"],
            },
            {
                "title": "Volt Typhoon Critical Edge Infrastructure Infiltration & Living-Off-the-Land Discovery",
                "description": "State-sponsored cyber actor exploiting perimeter appliance vulnerability. Executing native Windows binaries (wmic, netstat, ntdsutil) without malware binaries dropped to disk.",
                "severity": IncidentSeverity.critical,
                "status": IncidentStatus.open,
                "affected_systems": ["FW-EDGE-01", "SRV-CORE-ROUTER", "SRV-K8S-INGRESS"],
                "affected_users": ["root", "admin", "cisco"],
                "mitre_techniques": ["T1190", "T1082", "T1049", "T1003.003"],
            },
            {
                "title": "Cobalt Strike Malleable C2 Beaconing over Encrypted HTTPS Traffic",
                "description": "Persistent asynchronous beaconing detected from finance department workstation to high-risk bulletproof hosting IP in AS49210 with randomized jitter.",
                "severity": IncidentSeverity.high,
                "status": IncidentStatus.contained,
                "affected_systems": ["WKSTN-FIN-02", "PROXY-EDGE-01"],
                "affected_users": ["corp\\asmith"],
                "mitre_techniques": ["T1071.001", "T1057", "T1573.002"],
            },
            {
                "title": "Automated Low-and-Slow Password Spraying against Decoy Active Directory SPN",
                "description": "Rotated cloud proxy egress spraying top enterprise passwords against 4,200 domain accounts at 1 attempt/minute to bypass lockouts.",
                "severity": IncidentSeverity.high,
                "status": IncidentStatus.open,
                "affected_systems": ["SRV-DC02", "ADFS-PROXY-01"],
                "affected_users": ["corp\\finance_pool", "corp\\sales_pool"],
                "mitre_techniques": ["T1110.003", "T1078.004"],
            },
            {
                "title": "AWS CloudTrail Root Console Login without Hardware MFA Authentication",
                "description": "Root account credential utilized from non-standard geographic location with IAM policy alteration and CloudTrail logging deletion attempt.",
                "severity": IncidentSeverity.critical,
                "status": IncidentStatus.open,
                "affected_systems": ["AWS-PROD-VPC-EAST", "IAM-ROOT-ACCOUNT"],
                "affected_users": ["aws:root", "cloud-admin-breakglass"],
                "mitre_techniques": ["T1078.004", "T1562.001", "T1098"],
            },
            {
                "title": "Volume Shadow Copy Deletion & Double-Extortion Ransomware Precursor",
                "description": "Execution of vssadmin delete shadows /all /quiet followed by high-entropy file writes across network share storage pools.",
                "severity": IncidentSeverity.critical,
                "status": IncidentStatus.contained,
                "affected_systems": ["NAS-STOR-01", "SRV-DATA-POOL"],
                "affected_users": ["corp\\backup_operator"],
                "mitre_techniques": ["T1490", "T1486", "T1083"],
            },
        ]

        for inc in incidents_data:
            existing = (
                await db.execute(select(Incident).where(Incident.title == inc["title"]))
            ).scalar_one_or_none()
            if not existing:
                db.add(
                    Incident(
                        workspace_id=ws_id,
                        title=inc["title"],
                        description=inc["description"],
                        severity=inc["severity"],
                        status=inc["status"],
                        affected_systems=inc["affected_systems"],
                        affected_users=inc["affected_users"],
                        mitre_techniques=inc["mitre_techniques"],
                        opened_at=datetime.now(UTC) - timedelta(hours=2),
                    )
                )

        # ── 2. Seed Entities & Assets ────────────────────────────────────────────────
        entities_data = [
            (
                EntityType.host,
                "SRV-DC01.corp.internal",
                "Primary Active Directory Domain Controller",
                88.5,
                True,
                420,
            ),
            (
                EntityType.host,
                "SRV-DC02.corp.internal",
                "Secondary Replica Domain Controller",
                25.0,
                False,
                180,
            ),
            (
                EntityType.host,
                "WKSTN-FIN-04.corp.internal",
                "Finance Executive Workstation",
                94.0,
                True,
                340,
            ),
            (
                EntityType.host,
                "FW-EDGE-01.dmz.internal",
                "Perimeter Edge Palo Alto Firewall",
                72.0,
                False,
                890,
            ),
            (
                EntityType.host,
                "SRV-K8S-INGRESS.prod.internal",
                "Kubernetes Production Ingress Controller",
                45.0,
                False,
                2100,
            ),
            (EntityType.user, "corp\\admin", "Enterprise Domain Administrator", 92.0, True, 680),
            (
                EntityType.user,
                "corp\\jdoe",
                "Finance Department Lead (Compromised User)",
                84.0,
                True,
                195,
            ),
            (EntityType.user, "corp\\asmith", "Corporate Controller Account", 65.0, False, 95),
            (EntityType.user, "aws:root", "AWS Master Organization Root Identity", 98.0, True, 14),
            (
                EntityType.ip_address,
                "185.220.101.45",
                "Tor Exit Relay / C2 Bulletproof Proxy",
                96.0,
                True,
                1850,
            ),
            (
                EntityType.ip_address,
                "112.90.44.18",
                "Volt Typhoon Edge Infrastructure Scanner",
                91.0,
                True,
                740,
            ),
            (
                EntityType.ip_address,
                "175.45.176.8",
                "Pyongyang Lazarus Group Fast-Flux C2",
                99.0,
                True,
                310,
            ),
            (
                EntityType.ip_address,
                "194.26.29.112",
                "Sandworm St. Petersburg Pivot VPS",
                95.0,
                True,
                520,
            ),
            (
                EntityType.ip_address,
                "10.0.1.10",
                "Internal Active Directory Subnet Gateway",
                15.0,
                False,
                8400,
            ),
            (
                EntityType.ip_address,
                "10.0.4.45",
                "Internal Corporate Workstation IP (DHCP)",
                30.0,
                False,
                920,
            ),
            (
                EntityType.domain,
                "update-auth-telemetry.com",
                "Cobalt Strike Malleable C2 Domain",
                97.0,
                True,
                2400,
            ),
            (
                EntityType.domain,
                "cdn-fastly-sync.net",
                "Phishing Landing Page Infrastructure",
                89.0,
                True,
                1100,
            ),
            (
                EntityType.domain,
                "corp.internal",
                "Authoritative Corporate Active Directory DNS",
                10.0,
                False,
                34500,
            ),
            (
                EntityType.hash,
                "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "Mimikatz.x64.standalone.exe (SHA-256)",
                99.0,
                True,
                38,
            ),
            (
                EntityType.hash,
                "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
                "CobaltStrike.Beacon.DLL (SHA-256)",
                98.0,
                True,
                85,
            ),
            (
                EntityType.hash,
                "c2f42a9b3a6e87f8f115bc56d98124efb54637b8b201a4e5f7267104868205b3",
                "Sysinternals ProcDump Signed Binary",
                45.0,
                False,
                12,
            ),
        ]

        for etype, val, dname, rscore, is_mal, ecount in entities_data:
            existing = (
                await db.execute(select(Entity).where(Entity.value == val))
            ).scalar_one_or_none()
            if not existing:
                db.add(
                    Entity(
                        entity_type=etype,
                        value=val,
                        display_name=dname,
                        risk_score=rscore,
                        is_malicious=is_mal,
                        event_count=ecount,
                        first_seen_at=datetime.now(UTC) - timedelta(days=7),
                        last_seen_at=datetime.now(UTC) - timedelta(minutes=5),
                        enrichment={
                            "virustotal_positives": 48 if is_mal else 0,
                            "abuse_ipdb_score": 95 if is_mal else 0,
                            "threat_actor": "APT29 / Volt Typhoon"
                            if is_mal
                            else "Corporate Internal",
                        },
                    )
                )

        # ── 3. Seed Investigation with Findings ──────────────────────────────────────
        inv_title = "Active DC01 Mimikatz Credential Dumping & Lateral Pivot"
        existing_inv = (
            await db.execute(select(Investigation).where(Investigation.title == inv_title))
        ).scalar_one_or_none()

        if not existing_inv:
            inv = Investigation(
                title=inv_title,
                description="Cross-correlation of LSASS process access telemetry, Kerberos silver ticket minting, and lateral access into SRV-DC01.",
                severity="critical",
                status=InvestigationStatus.in_progress,
                risk_score=96.0,
                mitre_techniques=["T1003.001", "T1550.002", "T1078.002"],
                mitre_tactics=["credential_access", "lateral_movement"],
            )
            db.add(inv)
            await db.flush()

            # Attach evidence findings
            findings_data = [
                (
                    "Confirmed LSASS Memory Access via SeDebugPrivilege",
                    "Process mimikatz.exe requested PROCESS_VM_READ against lsass.exe on domain controller SRV-DC01.",
                    FindingConfidence.confirmed,
                    ["T1003.001"],
                    ["credential_access"],
                    ["isolate_host", "revoke_session"],
                ),
                (
                    "Anomalous Kerberos Silver Ticket Service Session Injection",
                    "Ticket granting request forged with RC4-HMAC encryption bypassing domain controller authentication log.",
                    FindingConfidence.high,
                    ["T1550.002"],
                    ["lateral_movement"],
                    ["reset_krbtgt_password", "purge_kerberos_tickets"],
                ),
                (
                    "Asynchronous Cobalt Strike Malleable C2 Beaconing to 185.220.101.45",
                    "Outbound TLS 1.3 heartbeat beaconing observed at 60s intervals with 15% jitter to RedRelay hosting provider.",
                    FindingConfidence.confirmed,
                    ["T1071.001"],
                    ["command_and_control"],
                    ["block_ip_perimeter", "quarantine_host"],
                ),
            ]

            for f_title, f_desc, f_conf, f_tech, f_tact, f_recs in findings_data:
                db.add(
                    Finding(
                        investigation_id=inv.id,
                        title=f_title,
                        description=f_desc,
                        confidence=f_conf,
                        mitre_techniques=f_tech,
                        mitre_tactics=f_tact,
                        response_recommendations=f_recs,
                        extra_metadata={
                            "justification": "Evidence verified from kernel ETW telemetry, network flow PCAP, and Windows event log 4688."
                        },
                    )
                )

        await db.commit()
        logger.info("seed_full_demo_completed")


if __name__ == "__main__":
    asyncio.run(seed_full_demo())
