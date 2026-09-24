# SOCForge — Initial Technical Audit & Architecture Review

**Audit Date**: September 23, 2026  
**Repository**: [https://github.com/sandeepmothukuri/socforge](https://github.com/sandeepmothukuri/socforge)  
**Project Owner & Maintainer**: Sandeep Mothukuri (<sandeep.mothukuris@gmail.com>)  
**Auditor**: Principal Security Engineer & AI Architecture Lead  
**Current Engineering Readiness Score**: **68 / 100**  
**Target Readiness Score**: **95 / 100**

---

## 1. Executive Summary

SOCForge is designed as an evidence-driven security operations and detection engineering platform combining alert ingestion, graph-correlated investigations, four-eyes response gating, detection validation (Sigma/SPL/KQL), and controlled AI agent workflows.

An exhaustive initial audit of the codebase, runtime stack, API contracts, CLI utilities, background workers, and automated test coverage was conducted. The platform exhibits strong conceptual architecture and high-quality frontend dashboards, but suffers from several critical implementation defects, missing core packages, stubbed directories, multi-tenancy information leaks, CLI crashes, and insufficient automated test coverage (38% baseline statement coverage).

This report documents the baseline state of the repository, details all identified defects with exact code references, scores the system across six rigorous engineering pillars, and establishes the blueprint to reach a defensible **95/100** engineering readiness.

---

## 2. Engineering Readiness Scorecard

| Category | Weight | Baseline Score | Target Score | Primary Deficiencies Identified |
| :--- | :---: | :---: | :---: | :--- |
| **1. Architecture & Modularity** | 20 | 14 / 20 | 19 / 20 | 5 empty stubbed packages (`policies/`, `repositories/`, `normalization/`, `detection/`, `investigations/`). |
| **2. Security & Multi-Tenancy** | 20 | 13 / 20 | 19 / 20 | Workspace information leak in `audit.py`, lack of workspace boundary filtering in `investigations.py`, unhandled exception in response dispatcher. |
| **3. Detection Engineering** | 15 | 8 / 15 | 15 / 15 | `detections/sigma/`, `detections/spl/`, `detections/kql/`, `detections/test-cases/` contain only `.gitkeep`. Rules only existed in initial DB seed. |
| **4. Code Quality & CLI** | 15 | 9 / 15 | 14 / 15 | CLI crashes on `list_alerts()` (`TypeError: string indices must be integers`), CLI auto-login fails with HTTP 422, Celery `jobs/` directory empty. |
| **5. Testing & Verification** | 20 | 9 / 20 | 19 / 20 | 38% statement coverage due to external-only HTTP tests, no unit tests for normalization/policies/tools/CLI, root test directories empty. |
| **6. DevSecOps & CI/CD** | 10 | 6 / 10 | 9 / 10 | CI driver mismatch for Alembic (`psycopg2` vs `asyncpg`), missing automated CLI execution in CI. |
| **Total Readiness Score** | **100** | **68 / 100** | **95 / 100** | **Defensible Engineering Excellence Target** |

---

## 3. Detailed Component Inventory & Findings

### 3.1 Backend API (`apps/api/socforge`)
- **FastAPI Application (`main.py`)**: Well-structured lifespan events with database initialization, seed checks, CORS middleware, OpenTelemetry instrumentation, and route registrations.
- **Empty Packages**:
  - `socforge/policies/`: Contained only `__init__.py`. Intended for Four-Eyes separation of duties and containment gating.
  - `socforge/repositories/`: Contained only `__init__.py`. Intended for decoupled data access patterns.
  - `socforge/normalization/`: Contained only `__init__.py`. Lacked normalizers for Sysmon, Wazuh, and Zeek.
  - `socforge/detection/`: Contained only `__init__.py`. Lacked compilation/translation tools between Sigma, SPL, and KQL.
  - `socforge/investigations/`: Contained only `__init__.py`. Lacked standalone graph builder and timeline generators.
- **Security & Authorization Issues**:
  - `apps/api/socforge/routers/audit.py` (`list_workspaces`): Returned all active workspaces in the database across all tenants without verifying `WorkspaceMembership`.
  - `apps/api/socforge/routers/investigations.py` (`list_investigations`, `get_investigation`): Lacked tenant-isolation filters, allowing any authenticated user to inspect investigations belonging to other workspaces.
  - `apps/api/socforge/routers/audit.py` (`approve_response_action`): `ResponseDispatcher.dispatch()` execution lacked robust try/except wrapping. If an adapter threw an exception, the response action remained stuck in `pending_approval` without a `failed` audit record.

### 3.2 CLI Tool (`apps/cli/socforge_cli`)
- **Breaking Defect #1**: In `apps/cli/socforge_cli/main.py:61-69`, `list_alerts()` parsed `resp.json()` directly as a list. The backend endpoint `GET /alerts` returns a pydantic `AlertListResponse` dict (`{"items": [...], "total": 3, "page": 1, "page_size": 25}`). Iterating over the dict returned string keys, crashing on `a["id"]` with `TypeError: string indices must be integers`.
- **Breaking Defect #2**: In `apps/cli/socforge_cli/main.py:182`, the `demo` command submitted credentials via JSON: `client.post(login_url, json={"email": admin_email, "password": admin_pwd})`. The FastAPI auth endpoint uses `OAuth2PasswordRequestForm`, which strictly requires `application/x-www-form-urlencoded` form data with `username` and `password`. The request failed with HTTP 422 Unprocessable Entity, causing the demo script to skip authentication.

### 3.3 Detection Engineering Content (`detections/`)
- `detections/sigma/`: Empty placeholder (`.gitkeep`).
- `detections/spl/`: Empty placeholder (`.gitkeep`).
- `detections/kql/`: Empty placeholder (`.gitkeep`).
- `detections/test-cases/`: Empty placeholder (`.gitkeep`).
- While detection validation and replay services were implemented in `apps/api/socforge/services/`, the repository lacked tangible rule artifacts in standard detection engineering formats.

### 3.4 Background Workers (`workers/`)
- `workers/celery_app.py`: Defined a basic Celery application with Redis broker, but only implemented a trivial `ping` task.
- `workers/jobs/`: Completely empty directory with no real background tasks for log ingestion, automated rule replay, or action expiration.

### 3.5 Automated Test Coverage (`apps/api/tests/`)
- Baseline test run executed 32 tests successfully in 8.73s.
- However, baseline statement coverage was only **38%** (1,088 lines hit out of 2,849 statements; 1,761 missed).
- All router modules (`routers/alerts.py`, `routers/investigations.py`, `routers/detections.py`, `routers/audit.py`, `routers/integrations.py`) reported **0% coverage** because existing integration tests made network requests to `http://localhost:8000` rather than running against an in-process ASGI test transport.
- Root test directories (`tests/e2e/`, `tests/integration/`, `tests/security/`, `tests/unit/`) were empty placeholders.

### 3.6 DevSecOps & CI/CD (`.github/workflows/ci.yml`)
- CI workflow configured PostgreSQL and Redis services, but in `ci.yml:13`, `ALEMBIC_DATABASE_URL` was specified as `postgresql+psycopg2://...`, while `apps/api/alembic/env.py` exclusively called `async_engine_from_config` (which requires an async driver such as `asyncpg`).
- CI integration tests attempted to connect to `http://localhost:8000` without running an API server, causing network connection failures unless run against an in-process ASGI app.

---

## 4. Remediation Roadmap

To elevate SOCForge to an undeniable **95/100** score:
1. **Fix CLI Defects**: Repair `main.py` dict parsing for alerts and form-data formatting for auto-login.
2. **Harden Multi-Tenancy & Authorization**: Scope workspace queries to user memberships, enforce workspace boundaries on investigations and alerts, and wrap response dispatching with failure handling.
3. **Implement Core Packages**:
   - `socforge/normalization/`: Production Sysmon, Wazuh, Zeek normalizers and central engine.
   - `socforge/policies/`: Four-Eyes containment policy engine and critical asset protection.
   - `socforge/detection/`: Sigma compiler and SPL/KQL translation engine.
   - `socforge/investigations/`: Graph builder and timeline reconstruction engine.
   - `socforge/repositories/`: Asynchronous repository layer for clean architecture.
4. **Deploy Real Detection Rules**: Add production-grade Sigma, SPL, and KQL rules for 5 core MITRE ATT&CK techniques with synthetic test telemetry.
5. **Implement Real Celery Workers**: Build background jobs for telemetry batch ingestion, detection replay, and response action expiration.
6. **Expand Automated Testing**: Implement in-process ASGI integration testing, unit tests for all new packages, AI tool guardrail tests, security/multi-tenancy tests, and CLI tests to achieve >85% statement coverage.
7. **Harden CI/CD & Build Infrastructure**: Make Alembic driver handling dual-compatible (sync/async) and verify non-root container execution.
8. **Produce Final Engineering Excellence Report**: Generate comprehensive evidence-backed audit report documenting all verified metrics.
