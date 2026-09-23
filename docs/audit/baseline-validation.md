# SOCForge — Baseline Validation & Defect Capture Report

**Date**: 2026-09-24  
**Repository**: [https://github.com/sandeepmothukuri/socforge](https://github.com/sandeepmothukuri/socforge)  
**Maintainer**: Sandeep Mothukuri `<sandeepmothukuri12@gmail.com>`  
**Objective**: Record exact baseline validation results, reproducing and documenting all initial defects before repair.

---

## 1. Initial State & Defect Register

| Defect ID | Severity | Component | Root Cause | Initial Failure Mode |
|---|---|---|---|---|
| **DEF-01** | **High** | API Ruff Linting | Modern Python 3.12 syntax deviations (`UP042`, `RUF012`, `B904`, `B008`, `TC001-3`) | 237 errors across 18 rules |
| **DEF-02** | **Medium** | API Code Formatting | 42 Python source files unformatted | `ruff format --check` failed on 42 files |
| **DEF-03** | **High** | API Mypy Type Checking | Missing SQLAlchemy columns on `Incident`, missing `ConfigDict(from_attributes=True)` on read schemas, abstract connector type mismatch | 41 errors across 12 files |
| **DEF-04** | **Critical** | Authentication / Dependency Resolution | `AsyncSession` moved to `TYPE_CHECKING` in `dependencies.py` causing runtime `get_type_hints` `NameError` and query parameter misinterpretation | HTTP 422 Unprocessable Entity on `/api/v1/workspaces` |
| **DEF-05** | **Medium** | Configuration Enum Normalization | `APP_ENV=test` and `AI_PROVIDER=mock` passed in CI while `Settings` lacked normalization aliases | Pydantic validation error on startup |
| **DEF-06** | **Medium** | Web Frontend ESLint Configuration | Missing `.eslintrc.json` and missing `eslint` devDependencies in `apps/web` | `next lint` prompted interactively; unescaped entity JSX errors |
| **DEF-07** | **High** | CI Pipeline Quality Gates | `continue-on-error: true` applied on Mypy and ESLint steps in `.github/workflows/ci.yml` | Regressions masked in CI builds |

---

## 2. Baseline Command Executions & Diagnostic Logs

### A. Ruff Check Baseline
```bash
$ ruff check socforge tests
Found 237 errors across 18 rules.
```

### B. Mypy Baseline
```bash
$ mypy socforge --ignore-missing-imports
Found 41 errors in 12 files.
```

### C. Workspace Isolation Test Baseline (HTTP 422)
```bash
$ pytest tests/security/test_workspace_isolation.py -vv -s
FAILED: assert 422 == 200
Response: {"detail":[{"type":"missing","loc":["query","db"],"msg":"Field required","input":null}]}
```

### D. ESLint Baseline
```bash
$ npx eslint src --ext .ts,.tsx --max-warnings 0
Error: ESLint couldn't find an eslint.config.* file or .eslintrc.json.
```
