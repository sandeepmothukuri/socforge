"""Unit tests for the detection replay engine.

These tests verify that replay_detection() returns real, computed metrics
based on rule content vs the labeled dataset — NOT hardcoded values.
"""

from __future__ import annotations

import json
import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest

from socforge.models.detection import RuleLanguage
from socforge.services.detection_replay import (
    ReplayResult,
    _evaluate,
    _sigma_matcher,
    _spl_matcher,
    _kql_matcher,
    replay_detection,
)


# ── Fixtures ────────────────────────────────────────────────────────────────────

MINIMAL_DATASET = [
    {
        "id": "t001",
        "malicious": True,
        "event_type": "process_creation",
        "source": "endpoint",
        "process_name": "mimikatz.exe",
        "process_command_line": "mimikatz.exe privilege::debug",
        "username": "SYSTEM",
        "source_host": "SRV-DC01",
    },
    {
        "id": "t002",
        "malicious": True,
        "event_type": "process_creation",
        "source": "endpoint",
        "process_name": "powershell.exe",
        "process_command_line": "powershell.exe -EncodedCommand ABC123",
        "username": "jsmith",
        "source_host": "WKSTN-001",
    },
    {
        "id": "t003",
        "malicious": False,
        "event_type": "process_creation",
        "source": "endpoint",
        "process_name": "notepad.exe",
        "process_command_line": "notepad.exe C:\\Docs\\report.txt",
        "username": "jdoe",
        "source_host": "WKSTN-022",
    },
    {
        "id": "t004",
        "malicious": False,
        "event_type": "network_connection",
        "source": "firewall",
        "domain": "www.google.com",
        "process_name": "chrome.exe",
        "source_host": "WKSTN-021",
    },
]


# ── Dataset Loading ─────────────────────────────────────────────────────────────────


def test_replay_detection_unknown_dataset_returns_error():
    """Requesting a nonexistent dataset returns an error result, not a crash."""
    result = replay_detection(
        rule_language=RuleLanguage.sigma,
        rule_content="title: test\nstatus: test\nlogsource:\n  product: windows\ndetection:\n  selection:\n    Image: mimikatz.exe\n  condition: selection",
        dataset_name="nonexistent-dataset-xyz",
    )
    assert result.error is not None
    assert result.total_events == 0
    assert result.precision == 0.0
    assert result.recall == 0.0


def test_replay_detection_with_temp_dataset(tmp_path: Path):
    """Replay engine loads a real dataset file and computes real metrics."""
    dataset = {"name": "test-ds", "schema_version": 1, "events": MINIMAL_DATASET}
    ds_file = tmp_path / "test-ds.json"
    ds_file.write_text(json.dumps(dataset))

    # Rule that matches mimikatz.exe
    sigma_rule = """title: Mimikatz Execution
status: test
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    Image|contains: mimikatz
  condition: selection
falsepositives:
  - Authorized red team activity
"""

    import socforge.services.detection_replay as dr_module

    original_dir = dr_module._DATASET_DIR
    try:
        dr_module._DATASET_DIR = tmp_path
        result = replay_detection(
            rule_language=RuleLanguage.sigma,
            rule_content=sigma_rule,
            dataset_name="test-ds",
        )
    finally:
        dr_module._DATASET_DIR = original_dir

    # Dataset has 2 malicious, 2 benign
    assert result.total_events == 4
    assert result.expected_true_positives == 2
    assert result.expected_true_negatives == 2
    # mimikatz rule should match exactly t001
    assert result.true_positives == 1
    assert result.false_negatives == 1  # powershell event missed
    assert result.false_positives == 0
    assert result.true_negatives == 2
    assert result.matched_events == 1
    # Precision = 1/1 = 1.0, Recall = 1/2 = 0.5
    assert result.precision == 1.0
    assert result.recall == 0.5
    assert result.error is None


# ── Sigma Matcher ──────────────────────────────────────────────────────────────────


def test_sigma_matcher_contains_modifier():
    """Field|contains modifier matches substring in event field."""
    rule = """title: Test
status: test
logsource:
  product: windows
detection:
  selection:
    Image|contains: mimikatz
  condition: selection
"""
    matcher = _sigma_matcher(rule)
    assert matcher({"process_name": "mimikatz.exe", "malicious": True}) is True
    assert matcher({"process_name": "notepad.exe", "malicious": False}) is False


def test_sigma_matcher_list_or():
    """Selection with a list of values applies OR logic."""
    rule = """title: Test
status: test
logsource:
  product: windows
detection:
  selection:
    process_name:
      - mimikatz.exe
      - procdump.exe
  condition: selection
"""
    matcher = _sigma_matcher(rule)
    assert matcher({"process_name": "mimikatz.exe"}) is True
    assert matcher({"process_name": "procdump.exe"}) is True
    assert matcher({"process_name": "notepad.exe"}) is False


def test_sigma_matcher_commandline():
    """CommandLine field maps to process_command_line in normalized events."""
    rule = """title: Test
status: test
logsource:
  product: windows
detection:
  selection:
    CommandLine|contains: "-EncodedCommand"
  condition: selection
"""
    matcher = _sigma_matcher(rule)
    assert matcher({"process_command_line": "powershell.exe -EncodedCommand ABC"}) is True
    assert matcher({"process_command_line": "powershell.exe -File cleanup.ps1"}) is False


def test_sigma_matcher_invalid_yaml_returns_no_match():
    """Invalid YAML rule content should not crash — matcher returns False for all events."""
    matcher = _sigma_matcher(": invalid: yaml: content: [[[")
    assert matcher({"process_name": "mimikatz.exe"}) is False


# ── SPL Matcher ────────────────────────────────────────────────────────────────────


def test_spl_matcher_keyword():
    """SPL matcher finds quoted keyword in any event field."""
    matcher = _spl_matcher('index=main "mimikatz" | stats count')
    assert matcher({"process_name": "mimikatz.exe", "source": "endpoint"}) is True
    assert matcher({"process_name": "notepad.exe", "source": "endpoint"}) is False


def test_spl_matcher_field_value():
    """SPL field=value pairs match against normalized event fields."""
    matcher = _spl_matcher('process_name="mimikatz.exe" | head 10')
    assert matcher({"process_name": "mimikatz.exe"}) is True
    assert matcher({"process_name": "notepad.exe"}) is False


# ── KQL Matcher ────────────────────────────────────────────────────────────────────


def test_kql_matcher_contains():
    """KQL matcher handles field contains 'value' syntax."""
    matcher = _kql_matcher('process_name contains "mimikatz"')
    assert matcher({"process_name": "mimikatz.exe"}) is True
    assert matcher({"process_name": "notepad.exe"}) is False


def test_kql_matcher_equals():
    """KQL matcher handles field == 'value' syntax."""
    matcher = _kql_matcher('username == "SYSTEM"')
    assert matcher({"username": "SYSTEM"}) is True
    assert matcher({"username": "jdoe"}) is False


# ── Confusion Matrix ─────────────────────────────────────────────────────────────────


def test_evaluate_perfect_detection():
    """A rule that matches all malicious and no benign events scores precision=1, recall=1."""
    # Matcher: always True for malicious, False for benign
    result = _evaluate(
        events=MINIMAL_DATASET,
        matcher=lambda e: e.get("malicious", False),
        dataset_name="test",
    )
    assert result.true_positives == 2
    assert result.false_positives == 0
    assert result.false_negatives == 0
    assert result.true_negatives == 2
    assert result.precision == 1.0
    assert result.recall == 1.0
    assert result.f1 == 1.0


def test_evaluate_no_matches():
    """A rule that matches nothing has precision=0, recall=0, F1=0."""
    result = _evaluate(
        events=MINIMAL_DATASET,
        matcher=lambda _: False,
        dataset_name="test",
    )
    assert result.true_positives == 0
    assert result.false_positives == 0
    assert result.false_negatives == 2
    assert result.true_negatives == 2
    assert result.precision == 0.0
    assert result.recall == 0.0
    assert result.f1 == 0.0


def test_evaluate_noisy_rule():
    """A rule that fires on everything has low precision but recall=1."""
    result = _evaluate(
        events=MINIMAL_DATASET,
        matcher=lambda _: True,
        dataset_name="test",
    )
    # 2 TP + 2 FP = 4 matched
    assert result.true_positives == 2
    assert result.false_positives == 2
    assert result.false_negatives == 0
    assert result.true_negatives == 0
    assert result.precision == 0.5
    assert result.recall == 1.0
    # F1 = 2 * 0.5 * 1.0 / 1.5 = 0.6667
    assert abs(result.f1 - 0.6667) < 0.001
