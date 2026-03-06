.PHONY: help dev prod down logs migrate seed generate test clean

# ─── Help ───────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  NovaPay - Available Commands"
	@echo "  ─────────────────────────────────────────"
	@echo "  make dev          Start dev infra (postgres, redis, kong)"
	@echo "  make prod         Build and start full stack"
	@echo "  make down         Stop all containers"
	@echo "  make logs         Tail all logs"
	@echo "  make migrate      Run DB migrations for all services"
	@echo "  make seed         Seed DB with test data"
	@echo "  make generate     Generate Prisma clients"
	@echo "  make clean        Remove all containers + volumes"
	@echo ""

# ─── Dev ────────────────────────────────────────────────────────────────────
dev:
	docker compose -f docker-compose.dev.yml up -d
	@echo "✓ Dev infra started (postgres :5432, redis :6379, kong :8000)"

dev-down:
	docker compose -f docker-compose.dev.yml down

# ─── Prod ───────────────────────────────────────────────────────────────────
prod:
	docker compose -f docker-compose.prod.yml up --build -d
	@echo "✓ Full stack started → http://localhost"

prod-down:
	docker compose -f docker-compose.prod.yml down

down:
	docker compose -f docker-compose.dev.yml down 2>/dev/null || true
	docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# ─── Logs ───────────────────────────────────────────────────────────────────
logs:
	docker compose -f docker-compose.prod.yml logs -f

logs-auth:
	docker compose -f docker-compose.prod.yml logs -f auth-service

logs-account:
	docker compose -f docker-compose.prod.yml logs -f account-service

logs-transaction:
	docker compose -f docker-compose.prod.yml logs -f transaction-service

logs-notification:
	docker compose -f docker-compose.prod.yml logs -f notification-service

# ─── Database ───────────────────────────────────────────────────────────────
migrate:
	@echo "Running migrations..."
	cd services/auth-service && npx prisma migrate deploy
	cd services/account-service && npx prisma migrate deploy
	cd services/transaction-service && npx prisma migrate deploy
	cd services/notification-service && npx prisma migrate deploy
	@echo "✓ All migrations applied"

seed:
	@echo "Seeding database..."
	cd services/auth-service && npx tsx prisma/seed.ts
	cd services/account-service && npx tsx prisma/seed.ts
	@echo "✓ Database seeded"

generate:
	@echo "Generating Prisma clients..."
	cd services/auth-service && npx prisma generate
	cd services/account-service && npx prisma generate
	cd services/transaction-service && npx prisma generate
	cd services/notification-service && npx prisma generate
	@echo "✓ Prisma clients generated"

# ─── Dev Services ────────────────────────────────────────────────────────────
dev-auth:
	cd services/auth-service && npm run dev

dev-account:
	cd services/account-service && npm run dev

dev-transaction:
	cd services/transaction-service && npm run dev

dev-notification:
	cd services/notification-service && npm run dev

dev-frontend:
	cd frontend && npm run dev

# ─── Clean ──────────────────────────────────────────────────────────────────
clean:
	docker compose -f docker-compose.dev.yml down -v 2>/dev/null || true
	docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true
	docker system prune -f
	@echo "✓ Cleaned up"
