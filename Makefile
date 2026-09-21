.PHONY: help up down logs restart test test-api test-cli demo lint clean

help:
	@echo "SOCForge Development and Operational Commands:"
	@echo "  make up          Start full SOCForge stack via Docker Compose"
	@echo "  make down        Stop all running containers"
	@echo "  make logs        Tail logs of all services"
	@echo "  make demo        Seed synthetic SOC dataset and evidence graph"
	@echo "  make test        Run API and CLI unit test suites"
	@echo "  make lint        Run Ruff and format checks"

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

demo:
	docker compose exec api python -m socforge.seed

test:
	cd apps/api && pytest tests/unit -v

lint:
	cd apps/api && ruff check .

clean:
	docker compose down -v
