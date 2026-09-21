# Threat Model — SOCForge Platform

## 1. System Overview
SOCForge is a security operations platform that processes untrusted telemetry, coordinates investigations, executes detection validation, and manages approval-gated response decisions.

## 2. Threat Boundaries & Assets
- **Untrusted External Telemetry**: Alert logs, filenames, command lines, HTTP URLs, DNS queries.
- **Authoritative Evidence Store**: PostgreSQL database storing entity relationships, audit logs, and detections.
- **Analytical & AI Core**: Local LLM (Ollama) or external API (OpenAI/vLLM) and deterministic reasoning engines.
- **Infrastructure Connectors**: Wazuh, Sentinel, Splunk, EDR containment adapters.

## 3. Threat Categories & Mitigations

### 3.1 Prompt Injection via Malicious Telemetry
- **Threat**: Attackers embed prompt injection payloads inside usernames, process command lines, or alert summaries to trick AI triage agents into unauthorized conclusions or tool calls.
- **Mitigation**:
  - LLMs have **zero direct access to bash, shell, or host execution**.
  - All AI actions operate through a `ControlledToolRegistry` with strictly typed Pydantic input/output schemas.
  - Telemetry is treated as untrusted data inputs, isolated from system prompt instructions.
  - Model outputs are validated against Pydantic schemas before persistence.

### 3.2 Unauthorized Destructive Actions
- **Threat**: Automated systems or rogue analysts accidentally isolate domain controllers or trigger service denial.
- **Mitigation**:
  - **Human-in-the-Loop Approval Gate**: High-impact containment actions (`isolate_host`, `disable_user`, `block_ip`) cannot be executed autonomously by agents.
  - Actions require dual-confirmation and policy validation.
  - Default deployment uses safe mock adapters.

### 3.3 Data Exfiltration & Secret Leakage
- **Threat**: API keys, SIEM credentials, or connection tokens leaking through logs or API responses.
- **Mitigation**:
  - All sensitive configuration entries are filtered from structured logger context.
  - Secrets are never committed to version control (`.env.example` contains only placeholders).
  - API keys are hashed with SHA-256 upon generation; only prefix `sf_...` is queryable.

### 3.4 Cross-Tenant / Unauthorized Access
- **Threat**: Analysts accessing unauthorized investigations or tampering with detection rules.
- **Mitigation**:
  - Role-Based Access Control (RBAC) enforced on every API route via FastAPI dependencies (`CurrentAnalyst`, `CurrentDetectionEngineer`, `CurrentAdminUser`).
  - Immutable append-only audit trail (`audit_events` table) logs every authentication, ingestion, validation, and approval event.
