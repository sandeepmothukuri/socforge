"""Unit tests for SOCForge Telemetry Normalization Engine."""

from socforge.models.alert import AlertSeverity
from socforge.normalization.engine import (
    NormalizationEngine,
    SysmonNormalizer,
    WazuhNormalizer,
    ZeekNormalizer,
)


def test_sysmon_normalizer_process_create():
    norm = SysmonNormalizer()
    raw = {
        "Event": {
            "System": {
                "Provider": {"@Name": "Microsoft-Windows-Sysmon"},
                "EventID": 1,
                "Computer": "WKSTN-FIN01",
            },
            "EventData": {
                "Image": r"C:\Windows\System32\cmd.exe",
                "CommandLine": r"cmd.exe /c whoami /all",
                "User": "FINANCE\\jsmith",
                "Hashes": "SHA256=1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF",
            },
        }
    }

    assert norm.can_normalize(raw) is True
    alert = norm.normalize(raw)
    assert alert.source == "sysmon"
    assert alert.severity == AlertSeverity.medium
    assert alert.source_host == "WKSTN-FIN01"
    assert alert.username == "FINANCE\\jsmith"
    assert alert.process_name == "cmd.exe"
    assert alert.file_hash == "1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF"
    assert "T1059.001" in alert.mitre_techniques


def test_sysmon_normalizer_mimikatz_critical_escalation():
    norm = SysmonNormalizer()
    raw = {
        "EventID": 1,
        "source": "sysmon",
        "Computer": "DC01.corp.local",
        "Image": r"C:\Temp\mimikatz.exe",
        "CommandLine": "mimikatz.exe privilege::debug sekurlsa::logonpasswords exit",
        "User": "SYSTEM",
    }
    assert norm.can_normalize(raw) is True
    alert = norm.normalize(raw)
    assert alert.severity == AlertSeverity.critical
    assert "Mimikatz" in alert.title


def test_wazuh_normalizer():
    norm = WazuhNormalizer()
    raw = {
        "rule": {
            "id": "5710",
            "level": 10,
            "description": "SSHD brute force attempt",
            "mitre": {"id": ["T1110.001"], "tactic": ["credential_access"]},
        },
        "agent": {"id": "001", "name": "web-prod-01", "ip": "10.0.1.20"},
        "data": {"srcip": "198.51.100.25", "srcuser": "root"},
        "full_log": "Failed password for root from 198.51.100.25 port 4421 ssh2",
    }
    assert norm.can_normalize(raw) is True
    alert = norm.normalize(raw)
    assert alert.source == "wazuh"
    assert alert.severity == AlertSeverity.high  # level 10 >= 8
    assert alert.source_host == "web-prod-01"
    assert alert.source_ip == "198.51.100.25"
    assert alert.username == "root"
    assert "T1110.001" in alert.mitre_techniques


def test_zeek_normalizer():
    norm = ZeekNormalizer()
    raw = {
        "_path": "dns",
        "id.orig_h": "10.0.1.55",
        "id.resp_h": "1.1.1.1",
        "query": "c2.attacker-infra.net",
        "proto": "udp",
    }
    assert norm.can_normalize(raw) is True
    alert = norm.normalize(raw)
    assert alert.source == "zeek.dns"
    assert alert.domain == "c2.attacker-infra.net"
    assert alert.source_ip == "10.0.1.55"
    assert alert.destination_ip == "1.1.1.1"
    assert "T1071.004" in alert.mitre_techniques


def test_normalization_engine_dispatch_and_batch():
    engine = NormalizationEngine()
    events = [
        {
            "EventID": 1,
            "source": "sysmon",
            "Computer": "HOST-01",
            "Image": r"C:\Windows\System32\powershell.exe",
            "CommandLine": "powershell.exe -enc aW5zdGFsbA==",
        },
        {
            "rule": {"id": "1002", "level": 14, "description": "Kernel exploit attempt"},
            "agent": {"name": "db-prod-01"},
        },
        '{"source": "custom_edr", "title": "Custom Alert", "severity": "medium"}',
    ]

    alerts = engine.batch_normalize(events)
    assert len(alerts) == 3
    assert alerts[0].source == "sysmon"
    assert alerts[0].severity == AlertSeverity.high
    assert alerts[1].source == "wazuh"
    assert alerts[1].severity == AlertSeverity.critical
    assert alerts[2].source == "custom_edr"
