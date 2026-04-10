-include .env
export

# --- Variables ---
# Default to development
ENV ?= dev

# Determine which file to use based on ENV
ifeq ($(ENV), prod)
  FILE := compose.yml
else
  FILE := compose.dev.yml
endif

# Common Docker command prefix - now this will dynamically follow $(FILE)
DC := docker compose -f $(FILE)

# Colors
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
RESET  := \033[0m

# --- Primary Commands ---

.PHONY: up stop restart logs ps clean dev prod

# Shortcuts to start specific environments
dev:
	@$(MAKE) up ENV=dev

prod:
	@$(MAKE) up ENV=prod

# The core "up" command that uses the dynamic $(FILE)
up:
	@echo "$(GREEN)🚀 Starting $(ENV) environment using $(FILE)...$(RESET)"
	$(DC) up -d --build

# Stop environment (Now correctly targets the right file)
stop:
	@echo "$(YELLOW)🛑 Stopping $(ENV) containers...$(RESET)"
	$(DC) down

restart:
	$(DC) restart

logs:
	$(DC) logs -f


logs frontend:
	$(DC) logs -f frontend

logs backend:
	$(DC) logs -f backend


ps:
	$(DC) ps

# --- Database & Tools ---

migrate:
	$(DC) run --rm migration

shell-db:
	# Use variables to avoid hardcoding "postgres" if ENV=prod uses different credentials
	$(DC) exec postgres psql -U $${DB_USER:-postgres} -d $${DB_NAME:-pingxy}

# --- Maintenance ---

clean:
	@echo "$(RED)⚠️  Removing $(ENV) containers, volumes, and images...$(RESET)"
	$(DC) down -v --rmi all

# Dangerous: This hits ALL docker volumes/images, not just this project
clear-docker-nuclear:
	@echo "$(RED)☢️  WARNING: Deleting ALL docker data on this machine...$(RESET)"
	docker system prune -a --volumes -f