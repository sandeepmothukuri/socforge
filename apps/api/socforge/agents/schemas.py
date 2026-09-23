"""Typed Pydantic output schemas for SOCForge AI agents.

All agent methods return one of these typed schemas rather than raw dicts.
This provides contract validation, IDE autocompletion, and API contract clarity.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class TriageResult(BaseModel):
    """Output of the Triage Agent — structured alert assessment."""

    summary: str = Field(description="Concise natural-language summary of the alert")
    severity_recommendation: str = Field(
        description="Recommended severity: critical, high, medium, low, informational"
    )
    mitre_techniques: list[str] = Field(
        default_factory=list,
        description="MITRE ATT&CK technique IDs observed (e.g. T1059.001)",
    )
    mitre_tactics: list[str] = Field(
        default_factory=list,
        description="MITRE ATT&CK tactic names observed",
    )
    confidence: str = Field(description="Confidence in the assessment: high, medium, low")
    recommended_pivots: list[str] = Field(
        default_factory=list,
        description="Recommended investigation pivot queries or data sources",
    )
    false_positive_indicators: list[str] = Field(
        default_factory=list,
        description="Indicators that suggest this may be a false positive",
    )
    raw_output: str | None = Field(
        default=None,
        description="Raw AI output if structured parsing failed",
    )


class FindingProposal(BaseModel):
    """A proposed investigation finding with supporting evidence references."""

    title: str
    description: str
    confidence: str = Field(description="confirmed, high, medium, low, speculative")
    supporting_event_ids: list[str] = Field(default_factory=list)
    mitre_techniques: list[str] = Field(default_factory=list)
    mitre_tactics: list[str] = Field(default_factory=list)
    response_recommendations: list[str] = Field(default_factory=list)


class InvestigationResult(BaseModel):
    """Output of the Investigation Agent."""

    summary: str
    proposed_findings: list[FindingProposal] = Field(default_factory=list)
    timeline_summary: str | None = None
    attack_path: list[str] = Field(
        default_factory=list,
        description="Ordered list of attacker steps inferred from evidence",
    )
    recommended_response_actions: list[str] = Field(default_factory=list)
    confidence: str = "medium"
    raw_output: str | None = None


class DetectionProposal(BaseModel):
    """A generated detection rule candidate."""

    language: str = Field(description="sigma, spl, or kql")
    rule_name: str
    rule_content: str = Field(description="Full rule text")
    description: str | None = None
    mitre_techniques: list[str] = Field(default_factory=list)
    mitre_tactics: list[str] = Field(default_factory=list)
    data_sources: list[str] = Field(default_factory=list)
    false_positive_notes: str | None = None
    finding_id: str | None = None
    raw_output: str | None = None


class ThreatHuntResult(BaseModel):
    """Output of the Threat Hunt Agent."""

    hypothesis_assessment: str = Field(
        description="Evaluation of the hunt hypothesis: confirmed, likely, unlikely, inconclusive"
    )
    findings_summary: str
    evidence_of_compromise: bool = Field(
        description="True if the hunt found credible indicators of compromise"
    )
    iocs_identified: list[str] = Field(
        default_factory=list,
        description="Indicators of compromise identified during the hunt",
    )
    recommended_detections: list[str] = Field(
        default_factory=list,
        description="Detection rule titles recommended as a result of this hunt",
    )
    suggested_queries: list[str] = Field(
        default_factory=list,
        description="Follow-up hunting queries to run",
    )
    confidence: str = "medium"
    raw_output: str | None = None


class ReportResult(BaseModel):
    """Output of the Report Generation Agent."""

    title: str
    executive_summary: str
    technical_details: str
    timeline: list[str] = Field(default_factory=list)
    iocs: list[str] = Field(default_factory=list)
    mitre_techniques: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    severity: str = "medium"
    generated_at: datetime | None = None
    raw_output: str | None = None
