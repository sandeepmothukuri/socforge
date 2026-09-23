"""Telemetry Normalization Engine for SOCForge.

Ingests heterogeneous security telemetry from Sysmon, Wazuh, Zeek, and generic sources,
validating and mapping fields into standard SOCForge Alert schemas with MITRE ATT&CK alignment.
"""

from __future__ import annotations

import abc
import json
import re
from typing import Any

from socforge.models.alert import AlertSeverity
from socforge.routers.alerts import AlertCreate


class BaseNormalizer(abc.ABC):
    """Abstract base class for telemetry log normalizers."""

    @abc.abstractmethod
    def can_normalize(self, raw_data: dict[str, Any]) -> bool:
        """Return True if this normalizer can parse the given raw event."""
        pass

    @abc.abstractmethod
    def normalize(self, raw_data: dict[str, Any]) -> AlertCreate:
        """Parse raw telemetry dictionary into a standardized AlertCreate schema."""
        pass


class SysmonNormalizer(BaseNormalizer):
    """Normalizes Microsoft Windows Sysmon XML/JSON telemetry into SOCForge alerts."""

    EVENT_MAPPING = {
        1: ("Process Create", AlertSeverity.medium, ["T1059.001"], ["execution"]),
        3: ("Network Connection", AlertSeverity.low, ["T1071.001"], ["command_and_control"]),
        7: ("Image Loaded", AlertSeverity.informational, ["T1574.002"], ["persistence"]),
        8: ("CreateRemoteThread", AlertSeverity.high, ["T1055.001"], ["defense_evasion", "privilege_escalation"]),
        10: ("ProcessAccess", AlertSeverity.high, ["T1003.001"], ["credential_access"]),
        11: ("File Create", AlertSeverity.low, ["T1105"], ["command_and_control"]),
        13: ("RegistryEvent (Value Set)", AlertSeverity.medium, ["T1547.001"], ["persistence"]),
        22: ("DNSEvent", AlertSeverity.informational, ["T1071.004"], ["command_and_control"]),
    }

    def can_normalize(self, raw_data: dict[str, Any]) -> bool:
        # Check for Sysmon indicators
        if "Event" in raw_data and isinstance(raw_data["Event"], dict):
            provider = raw_data["Event"].get("System", {}).get("Provider", {}).get("@Name", "")
            return "sysmon" in provider.lower()
        if "EventID" in raw_data or "event_id" in raw_data:
            return raw_data.get("source", "").lower() in ["sysmon", "microsoft-windows-sysmon"] or "UtcTime" in raw_data
        return False

    def normalize(self, raw_data: dict[str, Any]) -> AlertCreate:
        # Extract flat or nested event data
        event_data = raw_data.get("EventData", raw_data)
        system_data = raw_data.get("Event", {}).get("System", {})
        if "EventData" in raw_data.get("Event", {}):
            event_data = raw_data["Event"]["EventData"]

        try:
            event_id = int(system_data.get("EventID", raw_data.get("EventID", raw_data.get("event_id", 1))))
        except (ValueError, TypeError):
            event_id = 1

        name, def_sev, default_techs, default_tactics = self.EVENT_MAPPING.get(
            event_id, ("Sysmon Telemetry Event", AlertSeverity.medium, [], [])
        )

        image = event_data.get("Image", event_data.get("image", ""))
        command_line = event_data.get("CommandLine", event_data.get("command_line", ""))
        user = event_data.get("User", event_data.get("user", ""))
        computer = system_data.get("Computer", raw_data.get("Computer", raw_data.get("host", "")))
        src_ip = event_data.get("SourceIp", event_data.get("source_ip", None))
        dst_ip = event_data.get("DestinationIp", event_data.get("destination_ip", None))
        hashes = event_data.get("Hashes", event_data.get("hashes", ""))

        # Extract primary SHA256 or MD5 hash if available
        file_hash = None
        if hashes:
            match = re.search(r"SHA256=([A-Fa-f0-9]{64})", str(hashes))
            if match:
                file_hash = match.group(1)
            else:
                match = re.search(r"MD5=([A-Fa-f0-9]{32})", str(hashes))
                file_hash = match.group(1) if match else str(hashes)[:128]

        # Check for known high-risk command lines
        severity = def_sev
        title = f"Sysmon EID {event_id} ({name}) on {computer or 'Endpoint'}"
        if "mimikatz" in str(command_line).lower() or "lsass" in str(command_line).lower():
            severity = AlertSeverity.critical
            title = f"CRITICAL: LSASS / Mimikatz Activity Detected via Sysmon on {computer}"
        elif "downloadstring" in str(command_line).lower() or "enc" in str(command_line).lower():
            severity = AlertSeverity.high
            title = f"HIGH: Suspicious PowerShell Cradle on {computer}"

        return AlertCreate(
            source="sysmon",
            title=title,
            description=f"Sysmon Event ID {event_id}: {name}. Process: {image or 'N/A'}",
            severity=severity,
            source_host=computer or None,
            username=user or None,
            process_name=image.split("\\")[-1] if image else None,
            process_command_line=command_line or None,
            source_ip=src_ip,
            destination_ip=dst_ip,
            file_hash=file_hash,
            mitre_techniques=default_techs,
            mitre_tactics=default_tactics,
            raw_event=raw_data,
            metadata={"sysmon_event_id": event_id, "computer_name": computer},
        )


class WazuhNormalizer(BaseNormalizer):
    """Normalizes Wazuh agent and manager alert JSON records."""

    def can_normalize(self, raw_data: dict[str, Any]) -> bool:
        return "rule" in raw_data and ("agent" in raw_data or "decoder" in raw_data or "manager" in raw_data)

    def normalize(self, raw_data: dict[str, Any]) -> AlertCreate:
        rule = raw_data.get("rule", {})
        rule_id = str(rule.get("id", "wazuh-rule"))
        rule_desc = rule.get("description", "Wazuh Security Alert")
        rule_level = rule.get("level", 5)

        # Map Wazuh rule level (0-15) to AlertSeverity
        if rule_level >= 12:
            severity = AlertSeverity.critical
        elif rule_level >= 8:
            severity = AlertSeverity.high
        elif rule_level >= 5:
            severity = AlertSeverity.medium
        elif rule_level >= 3:
            severity = AlertSeverity.low
        else:
            severity = AlertSeverity.informational

        agent = raw_data.get("agent", {})
        agent_name = agent.get("name", "")
        agent_ip = agent.get("ip", None)

        data = raw_data.get("data", {})
        src_ip = data.get("srcip", data.get("src_ip", None))
        dst_ip = data.get("dstip", data.get("dst_ip", None))
        src_user = data.get("srcuser", data.get("username", None))

        mitre = rule.get("mitre", {})
        mitre_techs = mitre.get("id", [])
        if isinstance(mitre_techs, str):
            mitre_techs = [mitre_techs]
        mitre_tactics = mitre.get("tactic", [])
        if isinstance(mitre_tactics, str):
            mitre_tactics = [mitre_tactics]

        return AlertCreate(
            source="wazuh",
            title=f"Wazuh Alert [{rule_id}]: {rule_desc}",
            description=raw_data.get("full_log", rule_desc),
            severity=severity,
            source_host=agent_name or None,
            source_ip=src_ip or agent_ip,
            destination_ip=dst_ip,
            username=src_user or None,
            mitre_techniques=mitre_techs,
            mitre_tactics=mitre_tactics,
            raw_event=raw_data,
            metadata={"wazuh_rule_id": rule_id, "wazuh_rule_level": rule_level, "agent_id": agent.get("id")},
        )


class ZeekNormalizer(BaseNormalizer):
    """Normalizes Zeek network security monitoring logs (conn, dns, http, ssl)."""

    def can_normalize(self, raw_data: dict[str, Any]) -> bool:
        return "_path" in raw_data or ("id.orig_h" in raw_data and "id.resp_h" in raw_data)

    def normalize(self, raw_data: dict[str, Any]) -> AlertCreate:
        log_type = raw_data.get("_path", "conn")
        src_ip = raw_data.get("id.orig_h", raw_data.get("source_ip"))
        dst_ip = raw_data.get("id.resp_h", raw_data.get("destination_ip"))
        proto = raw_data.get("proto", "tcp")
        service = raw_data.get("service", log_type)

        domain = raw_data.get("query", raw_data.get("host"))
        uri = raw_data.get("uri")
        full_url = f"http://{domain}{uri}" if (domain and uri) else None

        severity = AlertSeverity.low
        techniques = ["T1071.001"]
        tactics = ["command_and_control"]

        if log_type == "dns":
            title = f"Zeek DNS Query: {domain or 'unknown'}"
            description = f"DNS query from {src_ip} -> {dst_ip} for domain {domain}"
            techniques = ["T1071.004"]
        elif log_type == "http":
            title = f"Zeek HTTP Request: {domain or dst_ip}"
            description = f"HTTP request {raw_data.get('method', 'GET')} to {full_url or domain}"
        else:
            title = f"Zeek Network Connection: {src_ip} -> {dst_ip} ({service or proto})"
            description = f"Network session observed duration={raw_data.get('duration', '0')}s proto={proto}"

        return AlertCreate(
            source=f"zeek.{log_type}",
            title=title,
            description=description,
            severity=severity,
            source_ip=src_ip,
            destination_ip=dst_ip,
            domain=domain,
            url=full_url,
            mitre_techniques=techniques,
            mitre_tactics=tactics,
            raw_event=raw_data,
            metadata={"zeek_log_type": log_type, "proto": proto, "service": service},
        )


class NormalizationEngine:
    """Dispatches raw event payloads to appropriate normalizers."""

    def __init__(self):
        self.normalizers: list[BaseNormalizer] = [
            SysmonNormalizer(),
            WazuhNormalizer(),
            ZeekNormalizer(),
        ]

    def normalize_event(self, raw_event: dict[str, Any] | str, source_hint: str | None = None) -> AlertCreate:
        if isinstance(raw_event, str):
            try:
                data = json.loads(raw_event)
            except json.JSONDecodeError:
                # Treat as generic raw message
                return AlertCreate(
                    source=source_hint or "generic_syslog",
                    title="Unstructured Security Log Message",
                    description=raw_event,
                    severity=AlertSeverity.medium,
                    raw_event={"message": raw_event},
                )
        else:
            data = raw_event

        for normalizer in self.normalizers:
            if normalizer.can_normalize(data):
                return normalizer.normalize(data)

        # Fallback generic mapping
        return AlertCreate(
            source=source_hint or data.get("source", "generic_edr"),
            title=data.get("title", data.get("message", "Normalized Security Event")),
            description=data.get("description", str(data)),
            severity=AlertSeverity(data.get("severity", "medium")),
            source_ip=data.get("source_ip", data.get("src_ip")),
            destination_ip=data.get("destination_ip", data.get("dst_ip")),
            source_host=data.get("source_host", data.get("host")),
            username=data.get("username", data.get("user")),
            process_name=data.get("process_name", data.get("process")),
            process_command_line=data.get("process_command_line", data.get("cmdline")),
            file_hash=data.get("file_hash", data.get("hash")),
            domain=data.get("domain"),
            url=data.get("url"),
            mitre_techniques=data.get("mitre_techniques", []),
            mitre_tactics=data.get("mitre_tactics", []),
            raw_event=data,
        )

    def batch_normalize(self, raw_events: list[dict[str, Any] | str]) -> list[AlertCreate]:
        return [self.normalize_event(event) for event in raw_events]
