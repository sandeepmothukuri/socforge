"""Agents router — trigger controlled AI triage, investigation, and detection generation."""

from __future__ import annotations

import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from socforge.agents.workflows import AIAgentOrchestrator
from socforge.auth.dependencies import CurrentAnalyst, CurrentUser
from socforge.database import get_db
from socforge.models.operations import AgentRun, AuditAction
from socforge.services.audit import record_audit_event

router = APIRouter(prefix="/agents", tags=["AI Agents"])


class TriageRequest(BaseModel):
    alert_id: str


class DetectionGenRequest(BaseModel):
    finding_id: str
    title: str
    description: str
    rule_language: str = "sigma"


class AgentRunRead(BaseModel):
    id: str
    agent_type: str
    status: str
    target_type: str | None
    target_id: str | None
    output: dict[str, Any] | None
    tool_calls: list[dict[str, Any]]


@router.post("/triage", summary="Run AI triage agent on alert")
async def triage_alert(
    req: TriageRequest,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, Any]:
    orchestrator = AIAgentOrchestrator(db, actor_id=current_user.id)
    result = await orchestrator.run_triage_agent(req.alert_id)
    await record_audit_event(
        db,
        action=AuditAction.ai_run_started,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="alert",
        target_id=req.alert_id,
        metadata={"agent_type": "triage_agent"},
    )
    return result


@router.post("/detect", summary="Run Detection Engineer agent to formulate rule candidate")
async def generate_detection(
    req: DetectionGenRequest,
    current_user: CurrentAnalyst,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, Any]:
    orchestrator = AIAgentOrchestrator(db, actor_id=current_user.id)
    result = await orchestrator.run_detection_engineer_agent(
        finding_id=req.finding_id,
        title=req.title,
        description=req.description,
        language=req.rule_language,
    )
    await record_audit_event(
        db,
        action=AuditAction.ai_run_started,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        target_type="finding",
        target_id=req.finding_id,
        metadata={"agent_type": "detection_engineer", "language": req.rule_language},
    )
    return result


@router.get("/runs", response_model=list[dict[str, Any]], summary="List AI agent runs and tool audit logs")
async def list_agent_runs(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[dict[str, Any]]:
    q = select(AgentRun).options(selectinload(AgentRun.tool_calls)).order_by(AgentRun.created_at.desc()).limit(50)
    runs = (await db.execute(q)).scalars().all()
    return [
        {
            "id": str(r.id),
            "agent_type": r.agent_type,
            "status": r.status.value,
            "target_type": r.target_type,
            "target_id": str(r.target_id) if r.target_id else None,
            "output": r.output,
            "tool_calls_count": len(r.tool_calls),
            "created_at": str(r.created_at),
        }
        for r in runs
    ]
