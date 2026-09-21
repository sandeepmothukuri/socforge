"""Detection replay engine — evaluates detection rules against a labeled telemetry dataset.

This service performs deterministic confusion-matrix evaluation:
  - Loads labeled events from a JSON dataset (malicious=True/False ground truth)
  - Matches each event against the rule using field-based heuristic matching
  - Computes TP / FP / FN / TN, precision, recall, F1
  - Returns matched event samples for analyst review

NO hardcoded metrics. All results are derived from actual rule content vs dataset.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from socforge.models.detection import RuleLanguage


def _find_dataset_dir() -> Path:
    """Dynamically locate the datasets directory in both host and container environments."""
    curr = Path(__file__).resolve().parent
    for _ in range(6):
        cand = curr / "datasets"
        if cand.exists() and cand.is_dir():
            return cand
        curr = curr.parent

    for fallback in [Path("/app/datasets"), Path("datasets")]:
        if fallback.exists():
            return fallback

    return Path("datasets")


_DATASET_DIR = _find_dataset_dir()
_BUILTIN_DATASET = "synthetic-soc-v1"


@dataclass
class ReplayResult:
    """Confusion-matrix result from replaying a detection rule against a dataset."""

    dataset_name: str
    total_events: int
    expected_true_positives: int   # ground truth malicious events in dataset
    expected_true_negatives: int   # ground truth benign events in dataset

    # Confusion matrix
    true_positives: int    # rule fired on a malicious event
    false_positives: int   # rule fired on a benign event
    false_negatives: int   # rule did NOT fire on a malicious event
    true_negatives: int    # rule did NOT fire on a benign event
    matched_events: int    # total events the rule fired on (TP + FP)

    precision: float
    recall: float
    f1: float

    matched_samples: list[dict] = field(default_factory=list)
    unmatched_expected_samples: list[dict] = field(default_factory=list)

    error: str | None = None


def replay_detection(
    rule_language: RuleLanguage,
    rule_content: str,
    dataset_name: str = _BUILTIN_DATASET,
) -> ReplayResult:
    """Replay a detection rule against a labeled dataset.

    Returns a populated ReplayResult with real confusion-matrix values.
    Falls back to an error result if the dataset cannot be loaded.
    """
    events, load_error = _load_dataset(dataset_name)
    if load_error or not events:
        return ReplayResult(
            dataset_name=dataset_name,
            total_events=0,
            expected_true_positives=0,
            expected_true_negatives=0,
            true_positives=0,
            false_positives=0,
            false_negatives=0,
            true_negatives=0,
            matched_events=0,
            precision=0.0,
            recall=0.0,
            f1=0.0,
            error=load_error or "Dataset is empty",
        )

    matcher = _build_matcher(rule_language, rule_content)
    return _evaluate(events, matcher, dataset_name)


# ── Dataset loading ──────────────────────────────────────────────────────────


def _load_dataset(name: str) -> tuple[list[dict], str | None]:
    """Load a labeled dataset by name.

    Searches: datasets/<name>.json relative to detected dataset directories.
    Returns (events, error_message). events is empty list on error.
    """
    candidates = [
        _DATASET_DIR / f"{name}.json",
        Path(f"/app/datasets/{name}.json"),
        Path(f"datasets/{name}.json"),
    ]
    for path in candidates:
        if path.exists():
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                return data.get("events", []), None
            except (json.JSONDecodeError, OSError) as exc:
                return [], f"Failed to parse dataset {name}: {exc}"
    return [], f"Dataset '{name}' not found. Available datasets: {_list_available()}"


def _list_available() -> list[str]:
    """List available dataset names."""
    if not _DATASET_DIR.exists():
        return []
    return [p.stem for p in _DATASET_DIR.glob("*.json")]


# ── Rule matching ────────────────────────────────────────────────────────────


def _build_matcher(language: RuleLanguage, rule_content: str):
    """Return a function (event: dict) -> bool that applies the rule to one event."""
    if language == RuleLanguage.sigma:
        return _sigma_matcher(rule_content)
    elif language == RuleLanguage.spl:
        return _spl_matcher(rule_content)
    elif language == RuleLanguage.kql:
        return _kql_matcher(rule_content)
    else:
        return lambda _: False


def _sigma_matcher(rule_content: str):
    """Build a field-based matcher from a Sigma rule."""
    import yaml

    try:
        parsed = yaml.safe_load(rule_content) or {}
    except Exception:
        return lambda _: False

    detection = parsed.get("detection", {})
    condition = detection.get("condition", "selection")

    selections: dict[str, Any] = {k: v for k, v in detection.items() if k != "condition"}

    def _match_selection(event: dict, sel: Any) -> bool:
        if isinstance(sel, list):
            return any(_match_selection(event, item) for item in sel)
        if isinstance(sel, dict):
            return all(_match_field(event, k, v) for k, v in sel.items())
        if isinstance(sel, str):
            return _keyword_in_event(event, sel)
        return False

    def _match_field(event: dict, field_expr: str, value: Any) -> bool:
        parts = field_expr.split("|")
        field_name = _sigma_field_to_event_field(parts[0])
        modifier = parts[1] if len(parts) > 1 else "exact"

        field_val = event.get(field_name)
        if field_val is None:
            for alias in _FIELD_ALIASES.get(field_name, []):
                field_val = event.get(alias)
                if field_val is not None:
                    break

        if field_val is None:
            return False

        field_str = str(field_val).lower()

        if isinstance(value, list):
            return any(_apply_modifier(field_str, str(v).lower(), modifier) for v in value)
        return _apply_modifier(field_str, str(value).lower(), modifier)

    def _apply_modifier(field_str: str, pattern: str, modifier: str) -> bool:
        pattern_clean = pattern.lstrip("*").rstrip("*")
        if modifier in ("contains", "all"):
            return pattern_clean in field_str
        elif modifier == "startswith":
            return field_str.startswith(pattern_clean)
        elif modifier == "endswith":
            return field_str.endswith(pattern_clean)
        elif modifier == "re":
            try:
                return bool(re.search(pattern, field_str, re.IGNORECASE))
            except re.error:
                return False
        elif modifier == "exact":
            if "*" in pattern or "?" in pattern:
                regex = re.escape(pattern).replace(r"\*", ".*").replace(r"\?", ".")
                return bool(re.search(regex, field_str, re.IGNORECASE))
            return field_str == pattern
        return field_str == pattern

    def _keyword_in_event(event: dict, keyword: str) -> bool:
        kw = keyword.lower()
        for v in event.values():
            if isinstance(v, str) and kw in v.lower():
                return True
            if isinstance(v, list) and any(kw in str(item).lower() for item in v):
                return True
        return False

    def matcher(event: dict) -> bool:
        cond = condition.lower().strip()
        if cond == "selection":
            sel = selections.get("selection")
            return sel is not None and _match_selection(event, sel)
        for name, sel in selections.items():
            if cond == name:
                return _match_selection(event, sel)
        return _eval_condition(cond, event, selections, _match_selection)

    return matcher


def _eval_condition(
    condition: str,
    event: dict,
    selections: dict,
    match_fn,
) -> bool:
    tokens = condition.split()
    truths = {name: match_fn(event, sel) for name, sel in selections.items()}
    result = None
    negate_next = False
    op = "and"
    for tok in tokens:
        if tok == "and":
            op = "and"
        elif tok == "or":
            op = "or"
        elif tok == "not":
            negate_next = True
        else:
            val = truths.get(tok, False)
            if negate_next:
                val = not val
                negate_next = False
            if result is None:
                result = val
            elif op == "and":
                result = result and val
            else:
                result = result or val
    return bool(result)


def _sigma_field_to_event_field(sigma_field: str) -> str:
    mapping = {
        "CommandLine": "process_command_line",
        "Image": "process_name",
        "ProcessName": "process_name",
        "ParentImage": "process_name",
        "User": "username",
        "UserName": "username",
        "DestinationIp": "destination_ip",
        "SourceIp": "source_ip",
        "src_ip": "source_ip",
        "dst_ip": "destination_ip",
        "Hostname": "source_host",
        "ComputerName": "source_host",
        "Workstation": "source_host",
        "Domain": "domain",
        "QueryName": "domain",
        "dns.question.name": "domain",
        "TargetFilename": "file_hash",
        "Hashes": "file_hash",
        "TargetObject": "process_command_line",
        "EventType": "event_type",
    }
    return mapping.get(sigma_field, sigma_field.lower())


_FIELD_ALIASES: dict[str, list[str]] = {
    "process_name": ["Image", "image"],
    "process_command_line": ["CommandLine", "commandline"],
    "username": ["User", "UserName"],
    "source_host": ["Hostname", "ComputerName"],
    "domain": ["QueryName", "dns.question.name"],
}


def _spl_matcher(rule_content: str):
    keywords: list[str] = []
    field_values: list[tuple[str, str]] = []

    for match in re.finditer(r'(\w+)=("[^"]+"|[^\s"]+)', rule_content):
        f, v = match.group(1), match.group(2).strip('"')
        field_values.append((f.lower(), v.lower()))

    for match in re.finditer(r'"([^"]+)"', rule_content):
        keywords.append(match.group(1).lower())

    for match in re.finditer(r'(?:search|where)\s+([\w]+)', rule_content, re.IGNORECASE):
        keywords.append(match.group(1).lower())

    def matcher(event: dict) -> bool:
        event_text = " ".join(str(v).lower() for v in event.values() if v is not None)
        for kw in keywords:
            if kw in event_text:
                return True
        for fname, fval in field_values:
            ev = str(event.get(fname, event.get(_sigma_field_to_event_field(fname), ""))).lower()
            if fval in ev:
                return True
        return False

    return matcher


def _kql_matcher(rule_content: str):
    keywords: list[str] = []
    field_values: list[tuple[str, str]] = []

    for match in re.finditer(
        r'(\w+)\s*(?:==|contains|startswith|endswith)\s*["\']([^"\']+)["\']',
        rule_content,
        re.IGNORECASE,
    ):
        field_values.append((match.group(1).lower(), match.group(2).lower()))

    for match in re.finditer(r'"([^"]+)"', rule_content):
        keywords.append(match.group(1).lower())

    def matcher(event: dict) -> bool:
        event_text = " ".join(str(v).lower() for v in event.values() if v is not None)
        for kw in keywords:
            if kw in event_text:
                return True
        for fname, fval in field_values:
            ev = str(event.get(fname, event.get(_sigma_field_to_event_field(fname), ""))).lower()
            if fval in ev:
                return True
        return False

    return matcher


# ── Evaluation ───────────────────────────────────────────────────────────────


def _evaluate(events: list[dict], matcher, dataset_name: str) -> ReplayResult:
    tp = fp = fn = tn = 0
    matched_samples: list[dict] = []
    unmatched_expected: list[dict] = []

    for event in events:
        is_malicious: bool = bool(event.get("malicious", False))
        matched: bool = matcher(event)

        if matched and is_malicious:
            tp += 1
            if len(matched_samples) < 5:
                matched_samples.append(_safe_sample(event))
        elif matched and not is_malicious:
            fp += 1
            if len(matched_samples) < 5:
                matched_samples.append(_safe_sample(event))
        elif not matched and is_malicious:
            fn += 1
            if len(unmatched_expected) < 5:
                unmatched_expected.append(_safe_sample(event))
        else:
            tn += 1

    total = len(events)
    matched_total = tp + fp
    expected_tp = sum(1 for e in events if e.get("malicious"))
    expected_tn = total - expected_tp

    precision = round(tp / matched_total, 4) if matched_total > 0 else 0.0
    recall = round(tp / expected_tp, 4) if expected_tp > 0 else 0.0
    f1 = round(
        2 * precision * recall / (precision + recall), 4
    ) if (precision + recall) > 0 else 0.0

    return ReplayResult(
        dataset_name=dataset_name,
        total_events=total,
        expected_true_positives=expected_tp,
        expected_true_negatives=expected_tn,
        true_positives=tp,
        false_positives=fp,
        false_negatives=fn,
        true_negatives=tn,
        matched_events=matched_total,
        precision=precision,
        recall=recall,
        f1=f1,
        matched_samples=matched_samples,
        unmatched_expected_samples=unmatched_expected,
    )


def _safe_sample(event: dict) -> dict:
    keys = [
        "id", "event_type", "source", "source_ip", "source_host",
        "username", "process_name", "process_command_line",
        "domain", "severity", "mitre_technique", "malicious",
    ]
    return {k: event.get(k) for k in keys if event.get(k) is not None}
