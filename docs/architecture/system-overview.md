# SOCForge Architecture & Engineering Specification

## High-Level Architecture
SOCForge is designed as a modular, API-first security operations engineering platform.

```
                    ┌────────────────────────┐
                    │      Clients / UI      │
                    │ Next.js 14 Web / CLI   │
                    └───────────┬────────────┘
                                │ HTTP / REST (OpenAPI 3.1)
                    ┌───────────▼────────────┐
                    │   FastAPI API Engine   │
                    │  Auth, RBAC & Routers  │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼────────┐      ┌───────▼────────┐      ┌───────▼────────┐
│ Evidence Graph │      │ Detection Pipe │      │ AI Agent Layer │
│  (PostgreSQL)  │      │(Sigma/SPL/KQL) │      │(Ollama/OpenAI) │
└───────┬────────┘      └───────┬────────┘      └───────┬────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │  Controlled Connectors │
                    │ Wazuh / Sentinel / EDR │
                    └────────────────────────┘
```

## Core Subsystems

### 1. Evidence Graph Engine
Unlike basic SIEM viewers that treat events as flat log rows, SOCForge builds a directed graph of typed entities (`User`, `Host`, `IP`, `Process`, `File`, `Technique`) connected by explicit semantic relationships (`PROCESS_EXECUTED_FILE`, `USER_AUTHENTICATED_TO_HOST`). The relationships are authoritatively stored in PostgreSQL (`entity_relationships`), enabling instant pivoting during triage.

### 2. Detection Engineering Loop
Closes the loop from investigation findings to production-ready detections:
1. **Analyst Finding**: Formulated and linked to supporting events.
2. **Detection Hypothesis**: Mapped to MITRE ATT&CK techniques.
3. **Multi-Format Generation**: Synthesized into Sigma, Splunk SPL, or Microsoft Sentinel KQL.
4. **Automated Validation**: Syntax and structure checked against formal schemas.
5. **Replay Testing**: Tested against malicious and benign datasets with precision/recall reporting.
6. **Peer Approval**: Senior detection engineers approve rules for deployment.

### 3. Controlled AI Augmentation
AI is treated as an advisory subsystem. LLMs operate within a sandbox restricted to `ControlledToolRegistry` methods. Every tool execution is tracked with duration, input parameters, output data, and an immutable entry in the `audit_events` ledger.
