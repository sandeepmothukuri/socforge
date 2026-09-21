# Changelog

All notable changes to SOCForge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-21

### Added
- **Core Platform Architecture**: FastAPI 0.115 backend with async SQLAlchemy 2.0 and Pydantic v2 schemas.
- **Relational Evidence Graph**: PostgreSQL tables `entities` and `entity_relationships` linking users, hosts, IPs, processes, domains, and MITRE ATT&CK techniques.
- **Interactive Web Console**: Next.js 14 App Router application with Tailwind CSS and Lucide icons across 10 dedicated routes.
- **Investigation Centerpiece Workspace**: Interactive SVG/Canvas Evidence Graph visualizer with entity inspector and dual-gated response advisor.
- **Detection Engineering Studio**: Multi-format rule catalog (Sigma, Splunk SPL, Microsoft Sentinel KQL), live syntax validator, and peer approval workflow.
- **Threat Hunting Workspace**: Hypothesis-driven hunting cases with query builder and observation-to-finding promotion.
- **Controlled AI Augmentation Sandbox**: OpenAI-compatible, Ollama, and offline deterministic providers operating strictly inside `ControlledToolRegistry` with zero arbitrary shell access.
- **Connector Adapters**: Working Wazuh SIEM adapter, Microsoft Sentinel connector, and Splunk integration.
- **Automated Test Suite**: Unit tests covering authentication, password hashing, API keys, and detection rule syntax validation.
- **Docker Compose Stack**: One-command local deployment for API, Web, PostgreSQL, Redis, and Worker.
- **CLI Utility**: `socforge` command-line tool built with Typer and Rich.
