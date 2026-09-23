"""Detection Rules Compiler and Translation Engine.

Provides utilities to parse Sigma YAML rules and compile them into equivalent
Splunk SPL and Microsoft Sentinel KQL query strings with MITRE ATT&CK extraction.
"""

from __future__ import annotations

import re
from typing import Any

import yaml


class DetectionCompiler:
    """Compiles and translates detection rules between Sigma, SPL, and KQL."""

    @classmethod
    def parse_sigma(cls, yaml_content: str) -> dict[str, Any]:
        """Safely parse Sigma YAML rule content."""
        try:
            parsed = yaml.safe_load(yaml_content)
            if not isinstance(parsed, dict):
                raise ValueError("Sigma rule content must be a valid YAML mapping")
            return parsed
        except yaml.YAMLError as exc:
            raise ValueError(f"YAML parsing error: {exc}") from exc

    @classmethod
    def extract_mitre_techniques(cls, tags: list[str] | None) -> list[str]:
        """Extract uppercase MITRE ATT&CK technique IDs (e.g. T1003.001) from tags."""
        if not tags:
            return []
        techniques = []
        for tag in tags:
            match = re.search(r"t\d{4}(?:\.\d{3})?", tag, re.IGNORECASE)
            if match:
                techniques.append(match.group(0).upper())
        return list(dict.fromkeys(techniques))

    @classmethod
    def extract_mitre_tactics(cls, tags: list[str] | None) -> list[str]:
        """Extract MITRE ATT&CK tactic names from tags."""
        if not tags:
            return []
        tactics = []
        known_tactics = [
            "initial-access",
            "execution",
            "persistence",
            "privilege-escalation",
            "defense-evasion",
            "credential-access",
            "discovery",
            "lateral-movement",
            "collection",
            "command-and-control",
            "exfiltration",
            "impact",
        ]
        for tag in tags:
            tag_clean = tag.lower().replace("attack.", "").replace("_", "-")
            if tag_clean in known_tactics:
                tactics.append(tag_clean.replace("-", "_"))
        return list(dict.fromkeys(tactics))

    @classmethod
    def sigma_to_spl(cls, yaml_content: str) -> str:
        """Translate basic Sigma rule into equivalent Splunk SPL query."""
        parsed = cls.parse_sigma(yaml_content)
        detection = parsed.get("detection", {})
        logsource = parsed.get("logsource", {})

        # Determine index / sourcetype
        category = logsource.get("category", "")
        logsource.get("product", "")
        index_clause = "index=*"
        if category == "process_creation":
            index_clause += ' sourcetype="WinEventLog:Security" EventCode=4688'
        elif category == "network_connection":
            index_clause += (
                ' sourcetype="XmlWinEventLog:Microsoft-Windows-Sysmon/Operational" EventCode=3'
            )

        predicates: list[str] = []
        for key, val in detection.items():
            if key in ["condition", "timeframe"]:
                continue
            if isinstance(val, dict):
                for field_def, field_val in val.items():
                    field_parts = field_def.split("|")
                    field_name = field_parts[0]
                    modifier = field_parts[1] if len(field_parts) > 1 else ""

                    spl_field = {
                        "Image": "NewProcessName",
                        "CommandLine": "CommandLine",
                        "User": "AccountName",
                        "SourceIp": "SourceIp",
                        "DestinationIp": "DestinationIp",
                    }.get(field_name, field_name)

                    if isinstance(field_val, list):
                        or_clauses = []
                        for item in field_val:
                            if modifier == "contains":
                                or_clauses.append(f"*{item}*")
                            else:
                                or_clauses.append(f'"{item}"')
                        predicates.append(f"({spl_field} IN ({', '.join(or_clauses)}))")
                    else:
                        if modifier == "contains":
                            predicates.append(f'{spl_field}="*{field_val}*"')
                        elif modifier == "endswith":
                            predicates.append(f'{spl_field}="*{field_val}"')
                        elif modifier == "startswith":
                            predicates.append(f'{spl_field}="{field_val}*"')
                        else:
                            predicates.append(f'{spl_field}="{field_val}"')

        condition = " ".join(predicates) if predicates else "*"
        return f"{index_clause} {condition} | table _time, host, AccountName, NewProcessName, CommandLine"

    @classmethod
    def sigma_to_kql(cls, yaml_content: str) -> str:
        """Translate basic Sigma rule into Microsoft Sentinel / Defender KQL query."""
        parsed = cls.parse_sigma(yaml_content)
        detection = parsed.get("detection", {})
        logsource = parsed.get("logsource", {})

        category = logsource.get("category", "")
        table = "DeviceProcessEvents"
        if category == "network_connection":
            table = "DeviceNetworkEvents"
        elif category == "file_event":
            table = "DeviceFileEvents"

        predicates: list[str] = []
        for key, val in detection.items():
            if key in ["condition", "timeframe"]:
                continue
            if isinstance(val, dict):
                for field_def, field_val in val.items():
                    field_parts = field_def.split("|")
                    field_name = field_parts[0]
                    modifier = field_parts[1] if len(field_parts) > 1 else ""

                    kql_field = {
                        "Image": "FileName",
                        "CommandLine": "ProcessCommandLine",
                        "User": "AccountName",
                        "SourceIp": "LocalIP",
                        "DestinationIp": "RemoteIP",
                    }.get(field_name, field_name)

                    if isinstance(field_val, list):
                        items_str = ", ".join(f"'{item}'" for item in field_val)
                        if modifier == "contains":
                            predicates.append(f"{kql_field} has_any ({items_str})")
                        else:
                            predicates.append(f"{kql_field} in~ ({items_str})")
                    else:
                        if modifier == "contains":
                            predicates.append(f"{kql_field} contains '{field_val}'")
                        elif modifier == "endswith":
                            predicates.append(f"{kql_field} endswith '{field_val}'")
                        elif modifier == "startswith":
                            predicates.append(f"{kql_field} startswith '{field_val}'")
                        else:
                            predicates.append(f"{kql_field} =~ '{field_val}'")

        filter_clause = " and ".join(predicates) if predicates else "true"
        return f"{table}\n| where {filter_clause}\n| project Timestamp, DeviceName, AccountName, FileName, ProcessCommandLine"
