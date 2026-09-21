# SOCForge

> **Evidence-Driven Security Operations for Investigation, Threat Hunting, and Detection Engineering**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Python: 3.12](https://img.shields.io/badge/Python-3.12-brightgreen.svg)](https://www.python.org/)
[![Next.js: 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Docker Compose](https://img.shields.io/badge/Deploy-Docker_Compose-blue.svg)](docker-compose.yml)

**Author**: [Sandeep Mothukuri](https://github.com/sandeepmothukuri)  
**Website**: [https://cybertechnology.in](https://cybertechnology.in)

---

## 1. What is SOCForge?

SOCForge is a vendor-neutral security operations engineering platform that transforms security telemetry into **evidence-backed investigations**, **detection hypotheses**, **validated detection rules (Sigma, SPL, KQL)**, and **auditable response decisions**.

Traditional security operations platforms act as passive alert viewers. SOCForge connects investigation with detection engineering:

```
TELEMETRY
  └── NORMALIZATION
        └── INVESTIGATION
              └── EVIDENCE GRAPH
                    └── ANALYST FINDINGS
                          └── DETECTION HYPOTHESIS
                                └── DETECTION GENERATION (Sigma / SPL / KQL)
                                      └── VALIDATION & REPLAY TESTING
                                            └── ANALYST APPROVAL
                                                  └── CONTROLLED RESPONSE
```

---

## 2. Key Capabilities

- **Authoritative Evidence Graph**: PostgreSQL-persisted entity relationships connecting alerts, users, hosts, IPs, processes, files, and MITRE ATT&CK techniques.
- **Closed Detection Lifecycle**: Derive Sigma, Splunk SPL, or Microsoft Sentinel KQL from findings; validate syntax; test against baseline datasets; measure precision/recall.
- **Controlled AI Augmentation**: AI agents (Triage, Investigation, Detection Engineer) operate only through strictly typed and audited tools. **No arbitrary command execution or unconstrained shell access.**
- **Safe Response Advisor**: Containment recommendations (`isolate_host`, `disable_user`, `block_ip`) are gated behind human-in-the-loop analyst review and policy validation.
- **Offline & Self-Hostable**: Works without cloud dependencies. Includes a deterministic offline reasoning engine and native Ollama integration.
- **Full-Stack & CLI-Accessible**: Features a responsive Next.js 14 console and a rich terminal CLI (`socforge`).

---

## 3. Quick Start (One Command)

```bash
git clone https://github.com/sandeepmothukuri/SOCForge.git
cd SOCForge
cp .env.example .env
docker compose up -d
```

### Access Endpoints:
- **Web Console**: [http://localhost:3000](http://localhost:3000)
- **API Engine**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Probe**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 4. Deterministic Demo Mode

Experience the complete end-to-end investigation and detection workflow immediately with realistic synthetic SOC telemetry:

```bash
# Via CLI
socforge demo

# Or run the seed script directly
docker compose exec api python -m socforge.seed
```

This loads:
1. Sysmon Event 10 LSASS memory dumping attack telemetry.
2. An active investigation with a correlated 5-node Evidence Graph.
3. An analyst finding linked to MITRE technique `T1003.001`.
4. A validated and approved Sigma detection rule candidate.

---

## 5. Security & Threat Model

See [docs/security/threat-model.md](docs/security/threat-model.md) for full threat boundaries, prompt injection mitigations, and RBAC implementation details.

---

## 6. License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
