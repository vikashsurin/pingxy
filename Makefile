.PHONY: dev prod stop stop-dev stop-prod clean logs help migrate migrate-generate studio shell-backend shell-postgres ps reset rebuild

# Colors for better readability
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
RESET  := \033[0m

help:
	@echo "$(GREEN)Available commands:$(RESET)"
	@echo "  $(YELLOW)make dev$(RESET)              - Start development environment"
	@echo "  $(YELLOW)make prod$(RESET)             - Start production environment"
	@echo "  $(YELLOW)make stop-dev$(RESET)         - Stop development containers"
	@echo "  $(YELLOW)make stop-prod$(RESET)        - Stop production containers"
	@echo "  $(YELLOW)make logs$(RESET)             - View all logs (dev)"
	@echo "  $(YELLOW)make logs-backend$(RESET)     - View backend logs only"
	@echo "  $(YELLOW)make logs-migration$(RESET)   - View migration logs"
	@echo "  $(YELLOW)make migrate$(RESET)          - Run migrations manually (dev)"
	@echo "  $(YELLOW)make migrate-generate$(RESET) - Generate new migration files"
	@echo "  $(YELLOW)make studio$(RESET)           - Open Drizzle Studio"
	@echo "  $(YELLOW)make shell-backend$(RESET)    - Open shell in backend container"
	@echo "  $(YELLOW)make shell-postgres$(RESET)   - Open PostgreSQL shell"
	@echo "  $(YELLOW)make rebuild$(RESET)          - Rebuild and restart (dev)"
	@echo "  $(YELLOW)make reset$(RESET)            - Reset database (deletes all data)"
	@echo "  $(YELLOW)make clean$(RESET)            - Remove everything"
	@echo "  $(YELLOW)make ps$(RESET)               - Show running containers"

# Development: use docker-compose.dev.yml
dev:
	@echo "$(GREEN)🚀 Starting development environment...$(RESET)"
	docker compose -f docker-compose.dev.yml up --build -d
	@echo "$(GREEN)✅ Development environment started!$(RESET)"
	@echo "$(YELLOW)📊 View logs with: make logs$(RESET)"

# Production: use docker-compose.yml
prod:
	@echo "$(GREEN)🚀 Starting production environment...$(RESET)"
	docker compose -f docker-compose.yml up -d --build
	@echo "$(GREEN)✅ Production environment started!$(RESET)"

# Stop development
stop-dev:
	@echo "$(YELLOW)🛑 Stopping development containers...$(RESET)"
	docker compose -f docker-compose.dev.yml down
	@echo "$(GREEN)✅ Development containers stopped!$(RESET)"

# Stop production
stop-prod:
	@echo "$(YELLOW)🛑 Stopping production containers...$(RESET)"
	docker compose -f docker-compose.yml down
	@echo "$(GREEN)✅ Production containers stopped!$(RESET)"

# Stop both (safeguard)
stop: stop-dev stop-prod

# Logs for all services (dev)
logs:
	docker compose -f docker-compose.dev.yml logs -f

# Backend logs only
logs-backend:
	docker compose -f docker-compose.dev.yml logs -f backend

# Migration logs
logs-migration:
	docker compose -f docker-compose.dev.yml logs migration

# Frontend logs
logs-frontend:
	docker compose -f docker-compose.dev.yml logs -f frontend

# Postgres logs
logs-postgres:
	docker compose -f docker-compose.dev.yml logs -f postgres

# Nginx logs
logs-nginx:
	docker compose -f docker-compose.dev.yml logs -f nginx

# Run migrations manually (dev)
migrate:
	@echo "$(GREEN)🔄 Running database migrations...$(RESET)"
	docker compose -f docker-compose.dev.yml run --rm migration
	@echo "$(GREEN)✅ Migrations complete!$(RESET)"

# Generate new migration files
migrate-generate:
	@echo "$(GREEN)📝 Generating migration files...$(RESET)"
	docker compose -f docker-compose.dev.yml run --rm migration bun run db:generate
	@echo "$(GREEN)✅ Migration files generated in ./drizzle$(RESET)"

# Open Drizzle Studio (database GUI)
studio:
	@echo "$(GREEN)🎨 Opening Drizzle Studio...$(RESET)"
	# docker compose -f docker-compose.dev.yml exec backend bun run db:studio
	 cd apps/backend && bunx drizzle-kit studio

# Shell access to backend container (dev)
shell-backend:
	@echo "$(GREEN)🐚 Opening shell in backend container...$(RESET)"
	docker compose -f docker-compose.dev.yml exec backend sh

# PostgreSQL shell access (dev)
shell-postgres:
	@echo "$(GREEN)🐚 Opening PostgreSQL shell...$(RESET)"
	docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d pingxy

# Show running containers (dev)
ps:
	@echo "$(GREEN)Development containers:$(RESET)"
	docker compose -f docker-compose.dev.yml ps
	@echo ""
	@echo "$(GREEN)Production containers:$(RESET)"
	docker compose -f docker-compose.yml ps

# Rebuild everything without cache (dev)
rebuild:
	@echo "$(YELLOW)🔨 Rebuilding development services...$(RESET)"
	docker compose -f docker-compose.dev.yml down
	docker compose -f docker-compose.dev.yml build --no-cache
	docker compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✅ Rebuild complete!$(RESET)"

# Rebuild production
rebuild-prod:
	@echo "$(YELLOW)🔨 Rebuilding production services...$(RESET)"
	docker compose -f docker-compose.yml down
	docker compose -f docker-compose.yml build --no-cache
	docker compose -f docker-compose.yml up -d
	@echo "$(GREEN)✅ Production rebuild complete!$(RESET)"

# Reset database (deletes all data) - dev
reset:
	@echo "$(RED)⚠️  WARNING: This will delete all development database data!$(RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(YELLOW)🗑️  Removing volumes...$(RESET)"; \
		docker compose -f docker-compose.dev.yml down -v; \
		echo "$(GREEN)🚀 Starting fresh...$(RESET)"; \
		docker compose -f docker-compose.dev.yml up -d --build; \
		echo "$(GREEN)✅ Database reset complete!$(RESET)"; \
	else \
		echo "$(YELLOW)Cancelled.$(RESET)"; \
	fi

# Clean everything (containers, volumes, images)
clean:
	@echo "$(RED)⚠️  WARNING: This will remove all containers, volumes, and images!$(RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(YELLOW)🧹 Cleaning everything...$(RESET)"; \
		docker compose -f docker-compose.dev.yml down -v --rmi all 2>/dev/null || true; \
		docker compose -f docker-compose.yml down -v --rmi all 2>/dev/null || true; \
		echo "$(GREEN)✅ Cleanup complete!$(RESET)"; \
	else \
		echo "$(YELLOW)Cancelled.$(RESET)"; \
	fi

# Restart just one service (dev)
restart-backend:
	@echo "$(YELLOW)🔄 Restarting backend...$(RESET)"
	docker compose -f docker-compose.dev.yml restart backend

restart-frontend:
	@echo "$(YELLOW)🔄 Restarting frontend...$(RESET)"
	docker compose -f docker-compose.dev.yml restart frontend

restart-nginx:
	@echo "$(YELLOW)🔄 Restarting nginx...$(RESET)"
	docker compose -f docker-compose.dev.yml restart nginx

# Check which environment is running
status:
	@echo "$(GREEN)Checking environment status...$(RESET)"
	@echo ""
	@if docker compose -f docker-compose.dev.yml ps | grep -q "Up"; then \
		echo "$(GREEN)✅ Development environment is running$(RESET)"; \
		docker compose -f docker-compose.dev.yml ps; \
	else \
		echo "$(YELLOW)⚠️  Development environment is not running$(RESET)"; \
	fi
	@echo ""
	@if docker compose -f docker-compose.yml ps | grep -q "Up"; then \
		echo "$(GREEN)✅ Production environment is running$(RESET)"; \
		docker compose -f docker-compose.yml ps; \
	else \
		echo "$(YELLOW)⚠️  Production environment is not running$(RESET)"; \
	fi
