# SOCForge Security & Multi-Tenant Authorization Architecture

**Date**: 2026-09-24  
**Primary Maintainer**: Sandeep Mothukuri `<sandeep.mothukuris@gmail.com>`  
**Status**: ACTIVE SECURITY SPECIFICATION

---

## 1. Authentication & Token Architecture

SOCForge supports dual authentication paths:

1. **JSON Web Tokens (JWT)**:
   - Cryptographically signed using `HS256` with symmetric `SECRET_KEY` (minimum 32 characters enforced).
   - Standard access tokens carry explicit claims: `sub` (User UUID), `email`, and `type: "access"`.
   - Token expiration defaults to 60 minutes with configurable rotation.
2. **API Keys**:
   - High-entropy tokens prefixed with `sf_` for programmatic integration.
   - Keys are hashed with SHA-256 (`hash_token`) before database persistence. Raw API keys are never stored in plaintext.
   - Granular expiration dates and revocation flags (`revoked: bool`).

---

## 2. Role-Based Access Control (RBAC)

Hierarchical roles are evaluated strictly on the server:

```text
[Administrator] (Level 4)
      ▲
[Incident Commander] (Level 3)
      ▲
[Detection Engineer] (Level 2)
      ▲
[SOC Analyst] (Level 1)
      ▲
[Viewer] (Level 0)
```

- **Viewer**: Read-only inspection of alerts, evidence graphs, and detection rules.
- **SOC Analyst**: Triage alerts, conduct investigations, create findings, request response actions.
- **Detection Engineer**: Author, test, replay, and publish Sigma/SPL/KQL detection rules.
- **Incident Commander**: Declare incidents, approve containment actions, execute dual-gated playbooks.
- **Administrator**: User provisioning, workspace administration, integration secret management.

---

## 3. Multi-Tenant Workspace Isolation

- Every operational asset (`Alert`, `Investigation`, `Incident`, `Finding`, `EvidenceGraph`, `ResponseAction`) is scoped to a `workspace_id`.
- Non-superuser requests require explicit membership in `WorkspaceMembership` (`WorkspaceMemberRole`).
- Cross-tenant data access attempts are denied with `HTTP 403 Forbidden` or `HTTP 404 Not Found` to prevent metadata leakage.
- Verified by automated security test: `tests/security/test_workspace_isolation.py::test_workspace_isolation_and_cross_tenant_denial`.

---

## 4. Four-Eyes Containment & Critical Asset Protection

1. **Separation of Duties (Four-Eyes Principle)**:
   - The analyst who requests a response action (`isolate_host`, `block_ip`, `disable_user`) **cannot approve their own request**.
   - A distinct authorized Incident Commander or Administrator must approve the action.
2. **Action Expiry Windows**:
   - Pending containment actions expire automatically after 2 hours (120 minutes) if unapproved.
3. **Critical Asset Protection**:
   - Actions targeting domain controllers, key vaults, or critical infrastructure (e.g. hostnames matching `-dc-`, `-pki-`) require Administrator privilege and explicit break-glass justification.
4. **Immutable Audit Logging**:
   - Every approval, rejection, execution failure, and tool call is recorded in `AuditEvent` with actor ID, timestamp, target entity, and cryptographic audit payload.
