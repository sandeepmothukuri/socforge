"""Unit tests for Detection Rule Compiler and Translation Engine."""

import pytest

from socforge.detection.compiler import DetectionCompiler

SAMPLE_SIGMA = """
title: Test LSASS Memory Dumping
id: 11111111-2222-3333-4444-555555555555
status: test
description: Test detection rule for LSASS dump
tags:
  - attack.credential_access
  - attack.t1003.001
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|contains: mimikatz.exe
    CommandLine|contains: sekurlsa
  condition: selection
"""


def test_parse_sigma():
    parsed = DetectionCompiler.parse_sigma(SAMPLE_SIGMA)
    assert parsed["title"] == "Test LSASS Memory Dumping"
    assert parsed["id"] == "11111111-2222-3333-4444-555555555555"

    with pytest.raises(ValueError):
        DetectionCompiler.parse_sigma("not: valid: yaml: [")


def test_extract_mitre():
    tags = ["attack.credential_access", "attack.t1003.001", "attack.t1059.001", "custom.rule"]
    techniques = DetectionCompiler.extract_mitre_techniques(tags)
    assert "T1003.001" in techniques
    assert "T1059.001" in techniques

    tactics = DetectionCompiler.extract_mitre_tactics(tags)
    assert "credential_access" in tactics


def test_sigma_to_spl():
    spl = DetectionCompiler.sigma_to_spl(SAMPLE_SIGMA)
    assert "index=*" in spl
    assert "sourcetype=\"WinEventLog:Security\"" in spl
    assert 'NewProcessName="*mimikatz.exe*"' in spl
    assert 'CommandLine="*sekurlsa*"' in spl


def test_sigma_to_kql():
    kql = DetectionCompiler.sigma_to_kql(SAMPLE_SIGMA)
    assert "DeviceProcessEvents" in kql
    assert "FileName contains 'mimikatz.exe'" in kql
    assert "ProcessCommandLine contains 'sekurlsa'" in kql
