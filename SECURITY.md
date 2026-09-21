# Security Policy — SOCForge

## 1. Reporting Security Vulnerabilities

The SOCForge project takes the security of our platform and dependencies seriously. If you discover a vulnerability, please report it responsibly.

**Do NOT report security vulnerabilities through public GitHub issues.**

Instead, please send an email to:
- **Maintainer**: Sandeep Mothukuri
- **Security Contact**: `sandeepmothukuri@users.noreply.github.com`

Please include:
- A description of the vulnerability.
- Steps to reproduce or proof-of-concept exploit code.
- Affected components (API, Web, Worker, Database, Adapters).
- Potential impact.

You will receive an acknowledgment within 48 hours and regular updates regarding the remediation timeline.

---

## 2. Supported Versions

Only the latest release branch of SOCForge receives active security patches.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

---

## 3. Threat Model & Architecture Safeguards

SOCForge operates under explicit security guardrails detailed in [`docs/security/threat-model.md`](docs/security/threat-model.md):
- **Prompt Injection Defense**: Untrusted telemetry strings are isolated from system instructions. AI models have zero direct shell execution capability.
- **Human-in-the-Loop Gating**: High-impact actions (`isolate_host`, `disable_user`, `block_ip`) require human analyst authorization.
- **Append-Only Auditing**: Sensitive actions generate immutable records in the `audit_events` ledger.
- **Strict RBAC**: Enforced via FastAPI dependencies on all API endpoints.
