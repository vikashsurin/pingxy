# --- Variables ---
# Default to development if no env is specified
ENV  ?= dev
FILE := docker-compose.$(ENV).yml

# Handle the case where production uses the standard 'docker-compose.yml'
ifeq ($(ENV), prod)
  FILE := docker-compose.yml
endif

# Common Docker command prefix
DC := docker compose -f $(FILE)

# Colors
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
RESET  := \033[0m

# --- Primary Commands ---

.PHONY: up down restart logs ps clean

# Start environment (Usage: make up | make up ENV=prod)
up:
	@echo "$(GREEN)🚀 Starting $(ENV) environment...$(RESET)"
	$(DC) up -d --build

# Stop environment
down:
	@echo "$(YELLOW)🛑 Stopping $(ENV) containers...$(RESET)"
	$(DC) down

restart:
	$(DC) restart $(s)

# View logs
logs:
	$(DC) logs -f

logs-frontend:
	$(DC) logs -f frontend

logs-backend:
	$(DC) logs -f backend

ps:
	$(DC) ps

# --- Database & Tools ---

.PHONY: migrate studio shell-db

migrate:
	$(DC) run --rm migration $(cmd)

migrate-gen:
	$(DC) run --rm migration bun run db:generate

studio:
	cd apps/backend && bunx drizzle-kit studio

shell-backend:
	$(DC) exec backend sh

shell-db:
	$(DC) exec postgres psql -U postgres -d pingxy

# --- Maintenance ---

clean:
	@echo "$(RED)⚠️  Removing all containers, volumes, and images...$(RESET)"
	$(DC) down -v --rmi all

reset:
	@echo "$(RED)⚠️  Resetting database...$(RESET)"
	$(DC) down -v
	$(DC) up -d --build

rm-db:
	@echo "$(RED)🛑 Removing drizzle migrations...$(RESET)"
	rm -rf apps/backend/drizzle

	@echo "$(RED)🛑 Removing postgres volumes... $(ENV) $(RESET)"
	docker volume rm pingxy_postgres_data_dev
