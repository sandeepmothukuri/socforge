# SOCForge

> **Evidence-Driven Security Operations Platform for Investigation, Threat Hunting, and Detection Engineering**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Python: 3.12](https://img.shields.io/badge/Python-3.12-brightgreen.svg)](https://www.python.org/)
[![FastAPI: 0.115](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js: 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![PostgreSQL: 16](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Docker Compose](https://img.shields.io/badge/Deploy-Docker_Compose-blue.svg)](docker-compose.yml)

**Author**: [Sandeep Mothukuri](https://github.com/sandeepmothukuri)  
**Website**: [https://cybertechnology.in](https://cybertechnology.in)

---

## 1. What is SOCForge?

SOCForge is a vendor-neutral security operations engineering platform that transforms security telemetry into **authoritative evidence graphs**, **investigation findings**, **validated detection rules (Sigma, SPL, KQL)**, and **human-gated response decisions**.

Traditional security operations platforms act as passive alert viewers or unindexed log searchers. SOCForge closes the operational gap between triage, investigation, and detection engineering:

`mermaid
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
        VAL --> REP["Baseline Telemetry Replay & Precision Testing"]
        REP --> APP["Analyst Peer Review & Approval Gating"]
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
`

---

## 2. Platform Architecture

`mermaid
graph TB
    subgraph Clients ["Presentation Tier"]
        WEB["Next.js 14 Web Application\n(Tailwind CSS, Canvas Graph, SSE)"]
        CLI["SOCForge Typer CLI\n(Rich Formatting, Headless Triage)"]
    end

    subgraph Gateway ["Application Gateway & Security"]
        FASTAPI["FastAPI 0.115 Async REST API\n(JWT Authentication, Role Hierarchy RBAC)"]
    end

    subgraph CoreServices ["Application & Domain Services"]
        AUTH["Auth & Identity\n(Bcrypt, API Keys sf_...)"]
        GRAPH["Evidence Graph Engine\n(Deduplicated Entities & Typed Edges)"]
        VALIDATOR["Detection Rule Validator\n(Sigma Parser, SPL, KQL Grammar)"]
        AGENT["Controlled Agent Sandbox\n(Pydantic Tools, LLM / Offline Fallback)"]
        RESPONSE["Response Policy Gate\n(Analyst Authorization Signature)"]
    end

    subgraph DataTier ["Persistence & Messaging Tier"]
        PG[("PostgreSQL 16\nRelational Schema\nEntities, Relationships,\nAlerts, Detections, Audits")]
        REDIS[("Redis 7\nQueue Broker & Cache")]
        WORKER["Celery 5 Worker\nAsync Ingestion & Rule Testing"]
    end

    subgraph Connectors ["Vendor Adapters"]
        WAZUH["Wazuh SIEM API"]
        SENTINEL["Microsoft Sentinel KQL"]
        SPLUNK["Splunk REST API"]
    end

    WEB -->|HTTP / JSON| FASTAPI
    CLI -->|HTTP / JSON| FASTAPI

    FASTAPI --> AUTH
    FASTAPI --> GRAPH
    FASTAPI --> VALIDATOR
    FASTAPI --> AGENT
    FASTAPI --> RESPONSE

    GRAPH --> PG
    AUTH --> PG
    RESPONSE --> PG
    FASTAPI --> REDIS
    REDIS --> WORKER
    WORKER --> PG

    AGENT --> Connectors
    RESPONSE --> Connectors
`

---

## 3. UI & Feature Showcase

### Security Operations Command Console
Real-time operational overview featuring live alert posture, active investigations, queued detection rules, and the human response gate status.
![SOCForge Dashboard](docs/assets/socforge_dashboard.png)

---

### Authoritative Evidence Graph & Investigation Studio
Interactive relational graph canvas correlating users, hosts, processes, and MITRE ATT&CK techniques with live entity inspectors and one-click detection formulation.
![SOCForge Investigation Graph](docs/assets/socforge_investigations.png)

---

### Detection Engineering Studio
Closed-loop detection repository supporting Sigma, Splunk SPL, and Sentinel KQL with multi-format syntax validation and peer review workflows.
![SOCForge Detection Studio](docs/assets/socforge_detections.png)

---

### Security Connectors & Integrations Hub
Vendor-neutral adapters connecting external SIEM, EDR, and log analytics platforms into SOCForge normalized schemas with live connectivity diagnostics.
![SOCForge Integrations Hub](docs/assets/socforge_integrations.png)

---

## 4. Key Capabilities

- **Authoritative Evidence Graph**: PostgreSQL-persisted entity relationships connecting alerts, users, hosts, IPs, processes, files, and MITRE ATT&CK techniques.
- **Closed Detection Lifecycle**: Derive Sigma, Splunk SPL, or Microsoft Sentinel KQL directly from findings; validate grammar; test against baseline datasets; measure precision/recall.
- **Controlled AI Augmentation**: AI agents (Triage, Investigation, Detection Engineer) operate only through strictly typed and audited Pydantic tools. **Zero arbitrary command execution or unconstrained shell access.**
- **Safe Response Advisor**: Containment recommendations (isolate_host, disable_user, lock_ip) are dual-gated behind human-in-the-loop analyst review and policy validation.
- **Deterministic Offline Mode**: Full system functions without cloud dependencies using deterministic rule generators and offline heuristics.
- **Full-Stack & CLI**: Responsive Next.js 14 console and full-featured terminal CLI (socforge).

---

## 5. Quick Start (One Command)

`ash
git clone https://github.com/sandeepmothukuri/SOCForge.git
cd SOCForge
cp .env.example .env
docker compose up -d
`

### Access Endpoints:
- **Web Console**: [http://localhost:3000](http://localhost:3000)
- **API Engine**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Probe**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 6. Deterministic Demo Mode

Experience the complete end-to-end investigation and detection workflow immediately with realistic synthetic SOC telemetry:

`ash
# Seed demo dataset
docker compose exec api python -m socforge.seed

# Or use the SOCForge CLI
socforge demo
`

This loads:
1. **Sysmon Event 10**: LSASS memory dumping telemetry.
2. **Active Investigation**: Correlated 5-node Evidence Graph (svc_backup -> DC-PRIMARY-01 -> powershell.exe -> T1003.001).
3. **Analyst Finding**: Formulated MITRE technique attribution.
4. **Detection Rule**: Approved Sigma rule candidate for LSASS process access.

---

## 7. Security & Threat Model

See [docs/security/threat-model.md](docs/security/threat-model.md) for full threat boundaries, prompt injection mitigations, and RBAC implementation details.

---

## 8. License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
