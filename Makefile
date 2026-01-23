.PHONY: dev build stop clean logs

# Start the dev environment with hot-reload
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Start in production mode (compiled/optimized)
prod:
	docker compose up -d --build

# Stop all containers
stop:
	docker compose down

# View logs for all services
logs:
	docker compose logs -f

# Nuclear option: remove all containers, volumes, and images to start fresh
clean:
	docker compose down -v --rmi all