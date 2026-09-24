# SOCForge CI Repair Mission — Baseline Audit Report

**Date**: 2026-09-23  
**Repository**: `https://github.com/sandeepmothukuri/socforge`  
**Primary Maintainer**: Sandeep Mothukuri `<sandeep.mothukuris@gmail.com>`  
**Starting Commit**: `505c20a8764a85ba46a066bc6e6f1f4a9b231926`  
**Target**: Resolve all current CI failures, eliminate Ruff lint/format errors, repair Mypy type-checking defects, harden database/async boundaries, and establish green, reproducible CI pipeline.

---

## 1. System & Environment Baseline

- **Python Version**: 3.12.14
- **Node.js Version**: 20.20.2 (Runner), 24.14.1 (Host)
- **Database Engine**: PostgreSQL 16 (Alpine)
- **Cache/Broker Engine**: Redis 7 (Alpine)
- **Task Worker**: Celery 5.4.0 (4 registered tasks online)
- **Test Framework**: pytest 9.1.1, pytest-asyncio 1.4.0, pytest-cov 7.1.0
- **Linter & Formatter**: Ruff 0.8.4
- **Type Checker**: Mypy 1.13.0 with `pydantic.mypy` plugin

---

## 2. CI Workflow Analysis (`.github/workflows/ci.yml`)

The GitHub Actions workflow contains 3 jobs:
1. `api-checks`:
   - `ruff check socforge tests` (Failing: 237 errors)
   - `ruff format --check socforge tests` (Failing: 42 files unformatted)
   - `mypy socforge --ignore-missing-imports --no-error-summary` (Marked `continue-on-error: true`: 41 errors)
   - Alembic migration upgrade & idempotence checks
   - Unit tests (`pytest tests/unit`)
   - Integration tests (`pytest tests/integration`)
   - Security tests (`pytest tests/security`)
   - CLI verification (`python -m socforge_cli.main --help`)
2. `web-checks`:
   - `npm ci`
   - `npx tsc --noEmit` (Marked `continue-on-error: true`)
   - `npx eslint src` (Marked `continue-on-error: true`)
   - `npm run build`
3. `docker-builds`:
   - Build API image (`Dockerfile.api`)
   - Build Web image (`Dockerfile.web`)
   - Verify non-root execution (`USER_ID != 0`)

---

## 3. Ruff Lint & Format Baseline

### Total Lint Errors: 237

| Rule Code | Rule Description | Count | Example Occurrences |
|---|---|---|---|
| **F401** | Unused import | 62 | `tempfile`, `pytest`, `InvestigationAlert` |
| **UP017** | Use `datetime.UTC` alias | 29 | `datetime.timezone.utc` in models/routers |
| **UP037** | Remove quoted type annotation | 24 | `'Workspace'`, `'User'` with `from __future__ import annotations` |
| **TC001** | Move first-party import to `TYPE_CHECKING` | 24 | Type-only models in services/routers |
| **B904** | Use `raise ... from err` / `from None` | 21 | Exception chaining in routers/normalizers |
| **UP042** | Replace `(str, Enum)` with `StrEnum` | 19 | Enum declarations in models/schemas |
| **TC002** | Move third-party import to `TYPE_CHECKING` | 18 | `AsyncSession` in services/routers |
| **I001** | Unsorted or unorganized imports | 11 | `test_detection_replay.py`, `response_advisor.py` |
| **RUF012** | Mutable default value on class attribute | 10 | Class attributes initialized with `set` or `dict` |
| **TC003** | Move stdlib import to `TYPE_CHECKING` | 7 | `uuid`, `Path` in type-only contexts |
| **SIM102** | Collapsible nested `if` statements | 3 | Nested conditionals in normalizers |
| **N806** | Variable in function should be lowercase | 2 | Upper-case local variables |
| **RUF022** | Unsorted `__all__` list | 2 | Dunder `__all__` in init modules |
| **E741** | Ambiguous variable name (`l`) | 1 | List comprehension in `detection_validator.py` |
| **UP035** | Deprecated import from `typing` | 1 | Deprecated type constructs |
| **B008** | Do not perform function call in argument defaults | 1 | Function calls in defaults |
| **E402** | Module level import not at top of file | 1 | Delayed imports |
| **F811** | Redefined while unused | 1 | Variable redefined in scope |

### Format Check:
- **42 files** require formatting to pass `ruff format --check socforge tests`.

---

## 4. Mypy Type Checker Baseline

### Total Type Errors: 41 in 12 files

1. **Pydantic v2 `from_attributes=True` ORM mode warnings (26 errors)**:
   - `InvestigationRead`, `FindingRead`, `IncidentRead`, `HuntRead`, `EventRead`, `EntityRead`, `DetectionRead`, `AuditEventRead`, `ResponseActionRead`, `WorkspaceRead`.
2. **Abstract Class Instantiation (1 error)**:
   - `Cannot instantiate abstract class "BaseIntegration" with abstract attributes "get_alert", "health_check" and "search_events"` in `routers/integrations.py:190`.
3. **Repository Base Attribute Error (1 error)**:
   - `"type[ModelT]" has no attribute "id"` in `repositories/base.py:35`.
4. **Wazuh Integration Incompatible Argument (1 error)**:
   - `Argument "params" to "get" of "AsyncClient" has incompatible type "dict[str, object]"` in `integrations/wazuh.py:89`.
5. **Health Router Return Type Mismatch (1 error)**:
   - `Incompatible return value type (got "PlainTextResponse", expected "str")` in `routers/health.py:111`.
6. **Incident Model Attribute Mismatches (7 errors)**:
   - `executive_summary`, `technical_summary`, `timeline`, `affected_systems`, `affected_users`, `investigation_id`, `assigned_to_id` in `routers/incidents.py`.
7. **Agent Router Return Types and Attributes (4 errors)**:
   - Incompatible return value types (`TriageResult` vs `dict[str, Any]`), `AgentRun.output` attribute missing in `routers/agents.py`.

---

## 5. Test Suite & Database Baseline

- **Automated Tests**: 66 passed, 0 failed in 14.35s (**100% pass rate**).
- **Alembic Database Migration**: Head at revision `0002` (`0002_finding_evidence_tables`).
- **Running Services**: All 5 Docker Compose services healthy and responsive.
