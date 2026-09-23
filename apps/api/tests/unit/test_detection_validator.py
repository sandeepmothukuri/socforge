"""Unit tests for detection rule syntax validator."""

import pytest
from socforge.models.detection import RuleLanguage
from socforge.services.detection_validator import validate_rule

VALID_SIGMA_RULE = """title: PowerShell Download Cradle
id: 11111111-2222-3333-4444-555555555555
status: test
description: Detects suspicious PowerShell download cradle
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        Image|endswith: '\\powershell.exe'
        CommandLine|contains:
            - 'DownloadString'
            - 'DownloadFile'
    condition: selection
level: high
tags:
    - attack.execution
    - attack.t1059.001
"""

INVALID_SIGMA_RULE = """title: Bad Rule
description: Missing logsource and detection
"""


def test_valid_sigma_validation():
    result = validate_rule(RuleLanguage.sigma, VALID_SIGMA_RULE)
    assert result.syntax_valid is True
    assert len(result.errors) == 0


def test_invalid_sigma_validation():
    result = validate_rule(RuleLanguage.sigma, INVALID_SIGMA_RULE)
    assert result.syntax_valid is False
    assert any("logsource" in e for e in result.errors)
    assert any("detection" in e for e in result.errors)


def test_spl_validation():
    spl = 'index=windows EventCode=4688 Image="*powershell.exe" | stats count by AccountName'
    result = validate_rule(RuleLanguage.spl, spl)
    assert result.syntax_valid is True

    bad_spl = 'index=windows EventCode=4688 Image="*powershell.exe | delete'
    result_bad = validate_rule(RuleLanguage.spl, bad_spl)
    assert result_bad.syntax_valid is False
    assert any("dangerous" in e.lower() or "quote" in e.lower() for e in result_bad.errors)


def test_kql_validation():
    kql = """SecurityEvent
| where EventID == 4688
| where NewProcessName has "powershell.exe"
| summarize count() by Account
"""
    result = validate_rule(RuleLanguage.kql, kql)
    assert result.syntax_valid is True


def test_compound_sigma_conditions():
    compound_rule = """title: Compound Rule
id: 22222222-3333-4444-5555-666666666666
status: test
description: Test compound condition
logsource:
    category: process_creation
    product: windows
detection:
    selection_tools:
        Image|contains: 'mimikatz.exe'
    selection_cmdline:
        CommandLine|contains: 'sekurlsa'
    condition: selection_tools and selection_cmdline
level: critical
"""
    result = validate_rule(RuleLanguage.sigma, compound_rule)
    assert result.syntax_valid is True
    assert len(result.errors) == 0
