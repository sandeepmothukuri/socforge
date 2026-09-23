<p align="center">
  <img
    src="docs/assets/socforge-banner.jpg"
    alt="SOCForge - Open Source Security Operations Platform"
    width="100%"
  />
</p>

<p align="center">
  <strong>Evidence-Driven Security Operations Platform for Investigation, Threat Hunting, and Detection Engineering</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License: Apache 2.0"></a>
  <img src="https://img.shields.io/badge/Python-3.12-brightgreen.svg" alt="Python 3.12">
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688.svg" alt="FastAPI 0.115">
  <img src="https://img.shields.io/badge/Next.js-14-black.svg" alt="Next.js 14">
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791.svg" alt="PostgreSQL 16">
  <img src="https://img.shields.io/badge/Deploy-Docker_Compose-blue.svg" alt="Docker Compose">
</p>

**Author**: [Sandeep Mothukuri](https://github.com/sandeepmothukuri)  
**Website**: [https://cybertechnology.in](https://cybertechnology.in)

---

## 1. What is SOCForge?

SOCForge is a vendor-neutral security operations engineering platform that transforms security telemetry into **authoritative evidence graphs**, **investigation findings**, **validated detection rules (Sigma, SPL, KQL)**, and **human-gated response decisions**.

Traditional security operations platforms act as passive alert viewers or unindexed log searchers. SOCForge closes the operational gap between triage, investigation, and detection engineering:

```mermaid
flowchart TD
    subgraph Ingestion ["1. Multi-Source Ingestion & Adapters"]
        T1["Wazuh SIEM / EDR"] --> N["Normalization Engine"]
        T2["Windows Sysmon"] --> N
        T3["Network Flow / Zeek"] --> N
        T4["Cloud Audit Logs"] --> N
    end

    subgraph CoreEngine ["2. SOCForge Core Engine (FastAPI + Celery)"]
        N --> EV["Authoritative Evidence Store\n(PostgreSQL: entities & entity_relationships)"]
        EV --> INV["Investigation Workspace\n& Interactive Graph Visualizer"]
        INV --> AI["Controlled AI Reasoning Engine\n(Sandboxed Typed Tools - No Shell)"]
    end

    subgraph DetectionLifecycle ["3. Closed Detection Engineering Loop"]
        INV --> HYP["Analyst Finding & Detection Hypothesis"]
        HYP --> RUL["Rule Formulator\n(Sigma YAML • Splunk SPL • Sentinel KQL)"]
        RUL --> VAL["Multi-Format Grammar Validator\n(services/detection_validator.py)"]
        VAL --> REP["Baseline Telemetry Replay & Precision Testing\n(services/detection_replay.py)"]
        REP --> APP["Analyst Peer Review & Approval Gating\n(Separation of Duties Enforced)"]
    end

    subgraph Execution ["4. Integrations & Response"]
        APP --> HUB["Connector Hub\n(Wazuh, Sentinel, Splunk)"]
        INV --> RESP["Human-in-the-Loop Response Advisor\n(Dual-Gated Host Isolation / Account Lockout)"]
        RESP --> AUD["Immutable Audit Ledger\n(audit_events)"]
    end

    style Ingestion fill:#0f172a,stroke:#3b82f6,stroke-width:1px,color:#f8fafc
    style CoreEngine fill:#0f172a,stroke:#10b981,stroke-width:1px,color:#f8fafc
    style DetectionLifecycle fill:#0f172a,stroke:#f59e0b,stroke-width:1px,color:#f8fafc
    style Execution fill:#0f172a,stroke:#8b5cf6,stroke-width:1px,color:#f8fafc
```

---

## 2. Platform Architecture

### Component & Dataflow Overview
The architecture is structured around strict separation of concerns, non-root isolated containers, an authoritative relational evidence store, and approval-gated containment workflows.

![SOCForge Architecture Diagram](docs/assets/socforge-architecture-diagram.png)

### High-Level Service Interaction
```mermaid
flowchart LR
    Browser["Browser Client"] --> Web["Next.js Web Console\n(:3000)"]
    Web --> API["FastAPI REST Engine\n(:8000)"]
    API --> Redis[("Redis 7 Broker\n(Internal)")]
    API --> PG[("PostgreSQL 16\n(Internal)")]
    Worker["Celery Worker"] --> Redis
    Worker --> PG

    style Browser fill:#0f172a,stroke:#3b82f6,color:#fff
    style Web fill:#0f172a,stroke:#3b82f6,color:#fff
    style API fill:#0f172a,stroke:#10b981,color:#fff
    style Worker fill:#0f172a,stroke:#f59e0b,color:#fff
    style Redis fill:#0f172a,stroke:#ef4444,color:#fff
    style PG fill:#0f172a,stroke:#6366f1,color:#fff
```

![SOCForge Component Interaction Flow](docs/assets/socforge-architecture-flow.png)

### Repository Directory Layout
```
socforge/
├── apps/
│   ├── api/
│   │   ├── socforge/
│   │   │   ├── auth/            # JWT, API keys, RBAC, workspace auth, secret encryption
│   │   │   ├── agents/          # Controlled AI agents, typed Pydantic contracts, tools
│   │   │   ├── integrations/    # SIEM/EDR connectors (Wazuh, Splunk, Sentinel)
│   │   │   ├── models/          # SQLAlchemy 2.0 async models
│   │   │   ├── routers/         # FastAPI endpoint routers (Alerts, Invs, Detections, etc.)
│   │   │   ├── schemas/         # Shared Pydantic validation schemas
│   │   │   ├── services/        # Replay engine, rule validators, audit logging
│   │   │   ├── policies/        # Response containment & approval policies
│   │   │   ├── repositories/    # Database query abstraction
│   │   │   ├── normalization/   # Telemetry normalizer
│   │   │   ├── detection/       # Rule formulation logic
│   │   │   ├── investigations/  # Evidence graph builders
│   │   │   ├── response/        # Response adapters & execution dispatcher
│   │   │   ├── config.py        # Settings with production credential validators
│   │   │   ├── database.py      # Async engine & session lifecycle
│   │   │   └── main.py          # FastAPI application factory
│   │   ├── alembic/             # Version-controlled database migrations
│   │   ├── tests/               # Unit and integration test suites
│   │   └── pyproject.toml
│   │
│   ├── web/                     # Next.js 14 Web Console
│   │   ├── src/
│   │   │   ├── app/             # App Router pages (Dashboard, Alerts, Invs, etc.)
│   │   │   ├── components/      # UI component library, AppShell, Graph visualizers
│   │   │   ├── lib/             # API client & data fetchers
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   └── types/           # TypeScript contracts
│   │   └── package.json
│   │
│   └── cli/                     # SOCForge Terminal CLI (Typer & Rich)
│
├── workers/                     # Celery background workers
├── detections/                  # Sigma, SPL, KQL detection rules & test cases
├── datasets/                    # Labeled telemetry datasets (synthetic-soc-v1.json)
├── deployments/                 # Hardened Dockerfiles (API & Web non-root)
└── docs/                        # Architecture, API, deployment, security guides
```

---

## 3. Operational Evidence & Platform Screenshot Gallery

All visual assets below represent empirical operational evidence captured directly from the live, production-configured SOCForge stack (PostgreSQL 16, Redis 7, Celery Worker, FastAPI REST backend, Next.js 14 console) running with active security telemetry and database state.

### Operational Evidence Matrix

| Area | Feature / Capability | Concrete Evidence Demonstrated | Screenshot Reference |
|---|---|---|---|
| **01. Security Command Center** | Multi-Source Operations Console | Real-time triage metrics, MTTD/MTTR indicators, 25 active alerts, 25 investigations, 16 rules, and MITRE ATT&CK coverage | [Section 3.1 &mdash; Dashboard Overview](#31-security-operations-command-center) |
| **02. Investigation Studio** | Evidence Graph & Case Management | Directed entity relationships (`User` → `Host` → `Process` → `Technique`), dynamic finding justification, risk score 94/100, response advisor | [Section 3.2 &mdash; Investigation Studio](#32-interactive-evidence-graph--investigation-studio) |
| **03. Attack Path Graph** | Process Lineage & Credential Dumping | Visual evidence of `mimikatz.exe` targeting `lsass.exe`, MITRE `T1003.001`, host `SRV-DC01`, directed causal edges | [Section 3.3 &mdash; Entity Graph Detail](#33-authoritative-entity-graph-detail) |
| **04. Alert Ledger** | Multi-Tenant Normalized Ingestion | Normalized alerts across Wazuh, Sysmon, and Zeek, severity classification, status workflows, and one-click case escalation | [Section 3.4 &mdash; Alerts Ledger](#34-operational-alerts-ledger--triage) |
| **05. Detection Studio** | Multi-Format Rule Lifecycle | Sigma YAML, Splunk SPL, and Sentinel KQL rule authoring, AST grammar validation, separation-of-duties review gating, confusion-matrix replay | [Section 3.5 &mdash; Detection Studio](#35-detection-engineering-studio) |
| **06. Containment Ledger** | Four-Eyes Incident Mitigation | Human-in-the-loop response approval gating, DC protection policies, simulated dry-run execution adapters, immutable audit trail | [Section 3.6 &mdash; Response Ledger](#36-dual-gated-response--containment-ledger) |
| **07. Integrations Hub** | Connector Ecosystem & Secret Vault | AES-256-GCM vault encryption, live connectivity diagnostics, and capability probing across Wazuh, Sentinel, and Splunk | [Section 3.7 &mdash; Integrations Hub](#37-security-connectors--integrations-hub) |
| **08. Command Palette** | Rapid Keyboard-Driven Triage | Fast keyboard navigation (`Ctrl+K` / `⌘K`) across entities, alerts, investigations, containment actions, and test suites | [Section 3.8 &mdash; Command Palette](#38-keyboard-first-soc-command-palette) |
| **09. Desktop Suite** | Standalone Windows Binaries | Native client guide for `SOCForge-Operations.exe` and `SOCForge-Window.exe` with local health probes and background sync | [Section 3.9 &mdash; Desktop Guide](#39-standalone-windows-desktop-operations-suite) |

---

### 3.1 Security Operations Command Center
High-density tactical operations dashboard tracking real-time triage metrics, MTTD/MTTR indicators, high-risk entity pivots, active investigations, and MITRE ATT&CK coverage matrix with quick-action telemetry feeds.
![SOCForge Dashboard Overview](docs/assets/socforge_dashboard.png)

---

### 3.2 Interactive Evidence Graph & Investigation Studio
Authoritative typed graph visualizer mapping directed entity relationships (`User` → `Host` → `Process` → `Domain` → `MITRE ATT&CK`) with supporting event backing, dynamic findings ledger, and controlled response advisor.
![SOCForge Investigation Studio](docs/assets/socforge_investigations.png)

---

### 3.3 Authoritative Entity Graph Detail
Detailed interactive attack path graph displaying lateral pivots, compromised process lineages (`mimikatz.exe` targeting `lsass.exe`), credential dumping techniques (`T1003.001`), and risk scoring (94/100).
![SOCForge Evidence Graph](docs/assets/socforge_graph.png)

---

### 3.4 Operational Alerts Ledger & Triage
Real-time telemetry ingestion ledger with multi-level severity classification, MITRE ATT&CK technique mapping, workspace filtering, and one-click escalation to active investigation cases.
![SOCForge Alerts Ledger](docs/assets/socforge_alerts.png)

---

### 3.5 Detection Engineering Studio
End-to-end lifecycle management for Sigma YAML, Splunk SPL, and Microsoft Sentinel KQL detection rules with AST grammar validation, separation-of-duties approval gating, and confusion-matrix replay testing against real telemetry datasets.
![SOCForge Detection Studio](docs/assets/socforge_detections.png)

---

### 3.6 Dual-Gated Response & Containment Ledger
Controlled incident mitigation console enforcing strict separation-of-duties approvals before executing host isolation or account disablement actions, backed by simulated execution adapters and an immutable audit trail.
![SOCForge Response Ledger](docs/assets/socforge_responses.png)

---

### 3.7 Security Connectors & Integrations Hub
Vendor-neutral telemetry adapters connecting external SIEM and EDR platforms (Wazuh, Splunk, Microsoft Sentinel) with live connectivity diagnostics, capability probing, and AES-256-GCM vault-encrypted credentials.
![SOCForge Integrations Hub](docs/assets/socforge_integrations.png)

---

### 3.8 Keyboard-First SOC Command Palette
Interactive quick pivot command palette enabling rapid keyboard-driven navigation (`Ctrl+K` / `⌘K`) across alerts, entities, investigations, containment workflows, and detection replay suites.
![SOCForge Command Palette](docs/assets/socforge_command_palette.png)

---

### 3.9 Standalone Windows Desktop Operations Suite
Native executable support (`SOCForge-Operations.exe` and `SOCForge-Window.exe`) providing an offline-capable, dedicated desktop security analyst experience with automated local health probes and background sync.
![SOCForge Desktop Guide](docs/assets/socforge_desktop.png)

---

### 3.10 Automated Test Suite Verification Evidence
All core domain models, policies, and pipelines are verified continuously with automated unit, integration, and security test suites (**65 tests, 0 failures, 100% pass rate**):

```text
============================= test session starts ==============================
platform linux -- Python 3.12.14, pytest-9.1.1, pluggy-1.6.0
collected 65 items

tests/integration/test_api_integration.py ............                   [ 18%]
tests/integration/test_asgi_workflows.py ..                              [ 21%]
tests/security/test_workspace_isolation.py .                             [ 23%]
tests/unit/test_agent_workflows.py .                                     [ 24%]
tests/unit/test_ai_agent_tools.py ....                                   [ 30%]
tests/unit/test_auth_security.py ...                                     [ 35%]
tests/unit/test_cli.py ....                                              [ 41%]
tests/unit/test_detection_compiler.py ....                               [ 47%]
tests/unit/test_detection_replay.py .............                        [ 67%]
tests/unit/test_detection_validator.py ....                              [ 73%]
tests/unit/test_graph_builder.py ..                                      [ 76%]
tests/unit/test_normalization.py .....                                   [ 84%]
tests/unit/test_policies.py .....                                        [ 92%]
tests/unit/test_repositories.py ...                                      [ 96%]
tests/unit/test_response_advisor.py .                                    [ 98%]
tests/unit/test_unit_forwarder.py .                                      [100%]

================================ tests coverage ================================
socforge/investigations/graph_builder.py      45      0   100%
socforge/services/response_advisor.py         23      0   100%
socforge/repositories/base.py                 56      3    95%
socforge/policies/containment.py              52      3    94%
socforge/normalization/engine.py             129     20    84%
socforge/agents/tools.py                      70      8    89%
socforge/models/* (all models)               688     15    98%
TOTAL                                       3710   1033    72%
======================= 65 passed, 2 warnings in 23.05s ========================
```

---

## 4. Capability Implementation Status

To ensure complete transparency and technical credibility, platform capabilities are classified into four explicit tiers:

| Tier | Capabilities |
|---|---|
| **Implemented (Verified in CI & Tests)** | • **Server-Side Workspace Isolation**: Multi-tenant database boundary via `WorkspaceMembership`, role-based access control, and workspace-scoped queries.<br>• **Relational Evidence Graph**: Entity relationships backed by PostgreSQL foreign keys and `finding_events` / `finding_entities` association tables.<br>• **Detection Replay Engine**: Real confusion-matrix evaluation against `synthetic-soc-v1.json` computing true TP, FP, FN, TN, Precision, Recall, and F1.<br>• **Separation of Duties**: Author cannot approve their own detection rule; requester cannot approve their own response action.<br>• **Typed AI Contracts**: Sandboxed AI agents returning strictly validated Pydantic schemas (`TriageResult`, `InvestigationResult`, `FindingProposal`, `DetectionProposal`, `ThreatHuntResult`, `ReportResult`).<br>• **Connector Secret Encryption**: In-database AES-256 (Fernet) encryption for SIEM/EDR API keys and passwords; secrets stripped from API responses.<br>• **Simulated Response Execution**: Containment actions execute via `MockResponseAdapter` clearly marked as `SIMULATED` with dry-run parameters.<br>• **Alembic Migrations**: All schema modifications managed exclusively through versioned migrations (`0001_initial_schema`, `0002_finding_evidence_tables`).<br>• **Non-Root Containers**: Docker builds for API and Web run under dedicated unprivileged users (`appuser` UID 1000, `nextjs` UID 1001). |
| **Supported (Integrated & Extensible)** | • **Wazuh SIEM / EDR**: Health checks, event querying, and active response via REST API.<br>• **Splunk Enterprise / Cloud**: HTTP Event Collector (HEC) ingestion and search API query translation.<br>• **Microsoft Sentinel**: Log Analytics workspace queries and incident correlation.<br>• **Custom Dataset Evaluation**: Detection testing accepts arbitrary labeled JSON telemetry datasets. |
| **Experimental** | • **Live AI Provider Integration**: Anthropic Claude, OpenAI, and local Ollama integrations for automated hypothesis drafting.<br>• **Automated Attack Path Inferences**: Graph traversal heuristics for lateral movement sequence generation. |
| **Planned** | • **STIX 2.1 / TAXII Feed Ingestion**: Ingest external threat intelligence IOCs directly into the entity repository.<br>• **Kubernetes Helm Charts**: Production deployment manifests for HA PostgreSQL and clustered Celery workers. |

---

## 5. Quick Start (One Command)

```bash
git clone https://github.com/sandeepmothukuri/socforge.git
cd socforge
cp .env.example .env
docker compose up -d
```

### Access Endpoints:
- **Web Console**: [http://localhost:3000](http://localhost:3000)
- **API Engine**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Probe**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 6. Deterministic Demo Workflow

Experience the complete end-to-end investigation and detection workflow immediately with realistic synthetic SOC telemetry via live API operations:

```bash
# Seed demo database
docker compose exec api python -m socforge.seed

# Run end-to-end demo workflow via the SOCForge CLI
socforge demo
```

The demo workflow executes real API calls:
1. Connects to the API and authenticates as the administrator.
2. Ingests a critical **Mimikatz LSASS process creation alert** mapped to `T1003.001`.
3. Creates an active **Investigation** linked to the alert.
4. Generates an evidence-backed **Finding** with explicit technical justification.
5. Formulates a **Sigma detection rule**, performs syntax validation, and runs the **Detection Replay Engine** against `synthetic-soc-v1.json` to compute precision and recall metrics.

---

## 7. Security & Threat Model

See [docs/security/threat-model.md](docs/security/threat-model.md) for full threat boundaries, prompt injection mitigations, and RBAC implementation details.

---

## 8. License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
