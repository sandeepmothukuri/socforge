# Contributing to SOCForge

Thank you for your interest in contributing to SOCForge!

## Code of Conduct
Please be respectful, professional, and collaborative in all communications and reviews.

---

## Development Setup

### 1. Prerequisites
- Python 3.12+
- Node.js 20+
- Docker & Docker Compose

### 2. Local Environment
```bash
git clone https://github.com/sandeepmothukuri/SOCForge.git
cd SOCForge
cp .env.example .env
docker compose up -d
```

### 3. Running Tests
```bash
# Inside running api container:
docker compose exec api pytest tests/unit -v

# Or locally:
cd apps/api
pytest tests/unit -v
```

---

## Contribution Workflow
1. Fork the repository and create your branch from `main`.
2. Ensure any new API endpoints are typed and covered by unit tests.
3. Validate detection rules using `apps/api/socforge/services/detection_validator.py`.
4. Run code formatting (`ruff check .` for Python, `npm run lint` for Next.js).
5. Open a Pull Request with a clear explanation of your feature or bugfix.
