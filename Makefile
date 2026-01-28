.PHONY: dev prod stop clean logs help

help:
	@echo "Available commands:"
	@echo "  make dev   - Start development environment"
	@echo "  make prod  - Start production environment"
	@echo "  make stop  - Stop all containers"
	@echo "  make logs  - View logs"
	@echo "  make clean - Remove everything"

# Development: merge base + dev overrides
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Production: use base file only
prod:
	docker compose up -d --build

# Stop (handle both dev and prod)
stop:
	docker compose down

# Logs for dev
logs:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Clean everything
clean:
	docker compose down -v --rmi all
