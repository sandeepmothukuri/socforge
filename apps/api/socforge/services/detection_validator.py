"""Detection rule validator — syntax checking for Sigma, SPL, KQL.

This module validates rule syntax without executing rules against real infrastructure.
Validation is structural/syntactic only. Semantic correctness requires test execution.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

import yaml

from socforge.models.detection import RuleLanguage


@dataclass
class ValidationOutput:
    syntax_valid: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def validate_rule(language: RuleLanguage, content: str) -> ValidationOutput:
    """Validate rule syntax. Returns structured errors and warnings."""
    if language == RuleLanguage.sigma:
        return _validate_sigma(content)
    elif language == RuleLanguage.spl:
        return _validate_spl(content)
    elif language == RuleLanguage.kql:
        return _validate_kql(content)
    else:
        return ValidationOutput(
            syntax_valid=False, errors=[f"Unsupported rule language: {language}"]
        )


def _validate_sigma(content: str) -> ValidationOutput:
    """Validate Sigma rule YAML structure."""
    errors: list[str] = []
    warnings: list[str] = []

    if not content.strip():
        return ValidationOutput(syntax_valid=False, errors=["Rule content is empty"])

    # Parse YAML
    try:
        parsed = yaml.safe_load(content)
    except yaml.YAMLError as e:
        return ValidationOutput(syntax_valid=False, errors=[f"YAML parse error: {e}"])

    if not isinstance(parsed, dict):
        return ValidationOutput(syntax_valid=False, errors=["Sigma rule must be a YAML dictionary"])

    # Required fields
    required = ["title", "status", "logsource", "detection"]
    for field_name in required:
        if field_name not in parsed:
            errors.append(f"Missing required field: '{field_name}'")

    # Title validation
    title = parsed.get("title", "")
    if isinstance(title, str):
        if len(title) < 5:
            warnings.append("Title is very short — consider a more descriptive title")
        if len(title) > 256:
            errors.append("Title exceeds 256 characters")

    # Status validation
    valid_statuses = {"stable", "test", "experimental", "deprecated", "unsupported"}
    status = parsed.get("status")
    if status and status not in valid_statuses:
        warnings.append(
            f"Status '{status}' is not a standard Sigma status. Expected one of: {', '.join(sorted(valid_statuses))}"
        )

    # Logsource validation
    logsource = parsed.get("logsource")
    if logsource and not isinstance(logsource, dict):
        errors.append("'logsource' must be a dictionary")
    elif isinstance(logsource, dict) and not any(
        k in logsource for k in ("category", "product", "service")
    ):
        warnings.append("'logsource' should specify at least 'category', 'product', or 'service'")

    # Detection validation
    detection = parsed.get("detection")
    if detection is not None:
        if not isinstance(detection, dict):
            errors.append("'detection' must be a dictionary")
        else:
            if "condition" not in detection:
                errors.append("'detection' must contain a 'condition' field")
            else:
                condition = detection["condition"]
                # Check that condition references defined selections
                selections = [k for k in detection if k != "condition"]
                if isinstance(condition, str):
                    sigma_keywords = {"and", "or", "not", "all", "of", "1", "them", "by"}
                    referenced = re.findall(r"\b([a-zA-Z_][a-zA-Z0-9_]*)\b", condition)
                    for ref in referenced:
                        if ref.lower() in sigma_keywords:
                            continue
                        if ref not in selections and not any(s.startswith(ref) for s in selections):
                            errors.append(f"Condition references undefined selection: '{ref}'")

    # Level validation
    valid_levels = {"critical", "high", "medium", "low", "informational"}
    level = parsed.get("level")
    if level and level not in valid_levels:
        warnings.append(
            f"Level '{level}' is not standard. Expected: {', '.join(sorted(valid_levels))}"
        )

    # MITRE tags
    tags = parsed.get("tags", [])
    if tags and isinstance(tags, list):
        for tag in tags:
            if not isinstance(tag, str):
                warnings.append(f"Tag must be a string, got: {type(tag).__name__}")

    return ValidationOutput(
        syntax_valid=len(errors) == 0,
        errors=errors,
        warnings=warnings,
    )


def _validate_spl(content: str) -> ValidationOutput:
    """Basic SPL (Splunk Processing Language) validation."""
    errors: list[str] = []
    warnings: list[str] = []

    if not content.strip():
        return ValidationOutput(syntax_valid=False, errors=["Rule content is empty"])

    # Check for basic SPL structure
    stripped = content.strip()

    # SPL should start with a search command or have pipe operations
    common_commands = [
        "search",
        "index=",
        "source=",
        "sourcetype=",
        "|",
        "tstats",
        "datamodel",
        "tag=",
        "eventtype=",
    ]
    has_command = any(stripped.startswith(cmd) or f" {cmd}" in stripped for cmd in common_commands)

    if not has_command and not stripped.startswith("|"):
        warnings.append("SPL does not appear to start with a recognized search command")

    # Check for unmatched brackets
    if stripped.count("[") != stripped.count("]"):
        errors.append("Unmatched square brackets in SPL query")
    if stripped.count("(") != stripped.count(")"):
        errors.append("Unmatched parentheses in SPL query")
    if stripped.count('"') % 2 != 0:
        errors.append("Unmatched double quotes in SPL query")

    # Check for dangerous commands that should not appear in detection rules
    dangerous = ["delete", "rest", "sendemail", "outputlookup"]
    for cmd in dangerous:
        if re.search(rf"\|\s*{cmd}\b", stripped, re.IGNORECASE):
            errors.append(f"Potentially dangerous SPL command found: '{cmd}'")

    return ValidationOutput(
        syntax_valid=len(errors) == 0,
        errors=errors,
        warnings=warnings,
    )


def _validate_kql(content: str) -> ValidationOutput:
    """Basic KQL (Kusto Query Language) validation."""
    errors: list[str] = []
    warnings: list[str] = []

    if not content.strip():
        return ValidationOutput(syntax_valid=False, errors=["Rule content is empty"])

    stripped = content.strip()

    # Check for unmatched brackets/parens
    if stripped.count("(") != stripped.count(")"):
        errors.append("Unmatched parentheses in KQL query")
    if stripped.count("[") != stripped.count("]"):
        errors.append("Unmatched square brackets in KQL query")
    if stripped.count('"') % 2 != 0:
        errors.append("Unmatched double quotes in KQL query")

    # KQL typically starts with a table name
    lines = [line.strip() for line in stripped.splitlines() if line.strip()]
    if lines:
        first_line = lines[0]
        # Should be a table name or let statement
        if not re.match(r"^[A-Za-z][A-Za-z0-9_]*|^let\s+", first_line):
            warnings.append("KQL query should start with a table name or 'let' statement")

    # Check for pipe operators
    if "|" not in stripped:
        warnings.append("KQL query has no pipe operators — may be incomplete")

    # Common KQL operators
    valid_operators = [
        "where",
        "project",
        "extend",
        "summarize",
        "count",
        "limit",
        "order by",
        "sort by",
        "join",
        "union",
        "distinct",
        "mv-expand",
        "parse",
        "extract",
        "render",
        "let",
        "search",
        "find",
    ]

    # Check for at least one KQL operator
    has_operator = any(op in stripped.lower() for op in valid_operators)
    if "|" in stripped and not has_operator:
        warnings.append("No recognized KQL operators found after pipe")

    return ValidationOutput(
        syntax_valid=len(errors) == 0,
        errors=errors,
        warnings=warnings,
    )
