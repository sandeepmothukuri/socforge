# SOCForge System Architecture

## 1. Overview
SOCForge is a vendor-neutral, evidence-driven security operations engineering platform. Its primary goal is to convert telemetry into evidence-backed investigations, detection hypotheses, validated detection rules, and controlled response actions.

---

## 2. Architecture Diagram

```
                              ┌───────────────────────────────────┐
                              │            Clients / UI           │
                              │  Next.js 14 Web  │  Typer CLI     │
                              └─────────────────┬─────────────────┘
                                                │ HTTP / REST
                              ┌─────────────────▼─────────────────┐
                              │        FastAPI API Engine         │
                              │   Auth, RBAC, Routers, Lifespan   │
                              └─────────────────┬─────────────────┘
                                                │
       ┌────────────────────────┬───────────────┴───────────────┬────────────────────────┐
       │                        │                               │                        │
┌──────▼──────────────┐  ┌──────▼──────────────┐  ┌─────────────▼───────┐  ┌─────────────▼───────┐
│   Evidence Graph    │  │ Detection Pipeline  │  │   AI Agent Layer    │  │ Response Advisor    │
│  PostgreSQL Schema  │  │   Sigma, SPL, KQL   │  │  Controlled Tools   │  │ Dual-Gated Approval │
└──────┬──────────────┘  └──────┬──────────────┘  └─────────────┬───────┘  └─────────────┬───────┘
       │                        │                               │                        │
       └────────────────────────┼───────────────────────────────┴────────────────────────┘
                                │
                      ┌─────────▼─────────┐
                      │    Integrations   │
                      │ Wazuh / Sentinel  │
                      └───────────────────┘
```

---

## 3. Subsystem Breakdown

### 3.1 Relational Evidence Graph
Unlike document SIEM stores that treat logs as unindexed text, SOCForge builds a directed graph of typed entities (`User`, `Host`, `IP`, `Process`, `File`, `Domain`, `Technique`) and semantic relationships (`AUTHENTICATED_TO`, `RAN_PROCESS`, `CONNECTED_TO`, `MAPS_TO`).
- **Storage**: Persisted authoritatively in PostgreSQL tables: `entities` and `entity_relationships`.
- **Deduplication**: Unique indexing on `(entity_type, value)`.
- **Pivoting**: Sub-second graph traversal from any entity to its neighbors.

### 3.2 Detection Engineering Lifecycle
1. **Hypothesis Formulation**: Derived from investigation findings.
2. **Multi-Format Compilation**: Formulated in Sigma (YAML), Splunk SPL, or Microsoft Sentinel KQL.
3. **Syntax Validation**: Checked against grammar standards via `services/detection_validator.py`.
4. **Peer Approval**: Rules transition from `pending` -> `syntax_valid` -> `tested` -> `approved`.

### 3.3 Controlled AI Augmentation
AI agents (Triage, Detection Engineer) run within a secure sandbox:
- **Provider Abstraction**: OpenAI-compatible, native Ollama, or deterministic offline fallback.
- **Controlled Tool Registry**: Agents execute only typed Pydantic tools (`get_alert`, `search_events`, `create_finding`). No shell or direct execution.
- **Audit Logging**: Every tool call records duration, inputs, outputs, and success status.

### 3.4 Safe Response Framework
Containment actions (`isolate_host`, `disable_user`, `block_ip`) are never executed autonomously:
- Require explicit analyst authorization via a dual-gated modal.
- Safe mock adapters simulate execution for training without service disruption.
- Full immutable trail written to the `audit_events` ledger.
