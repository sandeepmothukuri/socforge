# SOCForge — Complete Repository Inventory & Architectural Breakdown

**Date**: 2026-09-24  
**Repository**: [https://github.com/sandeepmothukuri/socforge](https://github.com/sandeepmothukuri/socforge)  
**Primary Maintainer**: Sandeep Mothukuri `<sandeep.mothukuris@gmail.com>`  
**Scope**: Full codebase audit across Backend (FastAPI), Frontend (Next.js), CLI, Workers, Deployments, Migrations, and Tests.

---

## 1. System Inventory Matrix

| Component | Location | Responsibility & Tech Stack | Runtime Entrypoint | Test Suite Coverage | Risk & Security Boundary |
|---|---|---|---|---|---|
| **API Server** | `apps/api/socforge` | Core REST API, RBAC, Multi-tenancy, Detection Engine, Graph Builder (FastAPI, SQLAlchemy, Pydantic v2, Alembic) | `uvicorn socforge.main:app` (`port 8000`) | 72% coverage across 68 automated tests | Enforces JWT/API-key auth, workspace isolation, dual-gate response approval |
| **Frontend Web App** | `apps/web` | Analyst UI, Evidence Graph visualizer, Detection Studio, Replay Engine, Response Advisor (Next.js 14, React 18, Tailwind CSS, Lucide) | `next start` (`port 3000`) | 14 static/dynamic pages compiled cleanly, ESLint & TypeScript clean | Presentation layer; all authorization strictly server-enforced |
| **CLI Client** | `apps/cli/socforge_cli` | Incident Commander & Analyst terminal workflows, deterministic demo runner, rule linting (Click, Rich, httpx) | `python -m socforge_cli.main` (`socforge`) | CLI unit test suite (`tests/unit/test_cli.py`) | Communicates over authenticated HTTP REST endpoints |
| **Async Task Worker** | `deployments/docker/Dockerfile.worker` | Background detection replay, bulk log normalization, long-running telemetry sweeps (Celery 5.4, Redis 7) | `celery -A workers.celery_app worker` | Worker tasks tested via replay service suites | Sandboxed task execution with transactional DB commits |
| **Database & Migrations** | `apps/api/alembic` & PostgreSQL | Schema management, historical audit log, multi-tenant workspace isolation (PostgreSQL 16, AsyncPG, Alembic) | `alembic upgrade head` | Migration idempotence verified (`0001` -> `0002 (head)`) | Foreign keys, cascading constraints, unique indexes |
| **Detection Rules & Catalog** | `detections/` (`sigma/`, `spl/`, `kql/`) | Enterprise detection rules across Sigma, Splunk SPL, Microsoft Sentinel KQL (MITRE ATT&CK T1003, T1059, T1547, T1136, T1071) | Detection Compiler & Replay Engine | Replay test suite (`test_detection_replay.py`, `test_detection_validator.py`) | Strict AST parsing; rejects malformed YAML and unapproved logic |
| **Synthetic Datasets** | `datasets/synthetic/` | Benchmark telemetry sets for rule validation and replay accuracy benchmarking (APT, Ransomware, Insider, ATT&CK) | Replay dataset loader | Replay engine precision/recall benchmark tests | Synthetic offline testing; zero PII / sensitive company telemetry |
| **Container & CI/CD** | `deployments/` & `.github/workflows` | Multi-stage Docker builds (non-root UID 10001), automated CI pipeline, strict quality gates | GitHub Actions runner / Docker Compose | All 3 CI jobs (`api-checks`, `web-checks`, `docker-builds`) strict | Enforces zero quality bypasses; strict lint/typecheck/build gates |

---

## 2. Directory Structure Map

```text
socforge/
├── .github/
│   └── workflows/
│       └── ci.yml                     # Strict blocking CI pipeline (Ruff, Mypy, Migrations, Tests, TS, ESLint, Docker)
├── apps/
│   ├── api/
│   │   ├── alembic/                   # Database migration versions (0001_initial, 0002_add_incident_fields)
│   │   ├── socforge/                  # FastAPI Application Source
│   │   │   ├── agents/                # AI Provider abstraction & controlled tool registry
│   │   │   ├── auth/                  # JWT, API key hashing, RBAC, and workspace dependency resolution
│   │   │   ├── detection/             # Sigma to SPL/KQL transpiler and validator
│   │   │   ├── integrations/          # Splunk, Sentinel, Wazuh SIEM connectors
│   │   │   ├── investigations/        # Evidence Graph Builder & entity relationship model
│   │   │   ├── models/                # SQLAlchemy ORM declarative models
│   │   │   ├── normalization/         # Telemetry normalizers (Sysmon, Wazuh, Zeek)
│   │   │   ├── policies/              # Four-Eyes containment policy engine
│   │   │   ├── repositories/          # Generic async repository pattern
│   │   │   ├── response/              # Dual-gated response action dispatcher
│   │   │   ├── routers/               # FastAPI modular APIRouters
│   │   │   └── services/              # Detection replay, validation, and audit recording
│   │   ├── tests/                     # 68 comprehensive unit, integration, security tests
│   │   └── pyproject.toml             # Build configuration, Ruff, Mypy, and Pytest settings
│   ├── cli/
│   │   └── socforge_cli/              # Analyst CLI client with demo mode
│   └── web/
│       ├── src/                       # Next.js 14 App Router, UI components, SVG visualizer
│       ├── .eslintrc.json             # Next.js core web vitals linting config
│       ├── package.json               # Frontend dependencies and scripts
│       └── tsconfig.json              # Strict TypeScript configuration
├── datasets/
│   └── synthetic/                     # Realistic adversary telemetry datasets
├── detections/
│   ├── kql/                           # Microsoft Sentinel detection queries
│   ├── sigma/                         # Generic Sigma rule catalog
│   ├── spl/                           # Splunk SPL detection queries
│   └── test-cases/                    # Unit telemetry event batches
├── deployments/
│   ├── docker/                        # Non-root Dockerfiles (API, Web, Worker)
│   └── docker-compose.yml             # Local orchestrated multi-container deployment
└── docs/
    ├── audit/                         # Audit baseline, repair reports, validation records
    └── security/                      # Threat modeling and authorization architecture
```
