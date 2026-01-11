.PHONY: help install build dev test clean db-up db-down db-migrate docker-build docker-up docker-down

help: ## Show this help message
	@echo 'MITRA-AI Development Commands:'
	@echo ''
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "Installing backend dependencies..."
	cd server && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

build: ## Build all projects
	@echo "Building backend..."
	cd server && npm run build
	@echo "Building frontend..."
	cd frontend && npm run build

dev: ## Start all development servers
	@echo "Starting PostgreSQL..."
	docker-compose up -d postgres
	@echo "Starting backend..."
	cd server && npm run start:dev
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:3001"

dev-frontend: ## Start only frontend dev server
	cd frontend && npm run dev

dev-backend: ## Start only backend dev server
	cd server && npm run start:dev

test: ## Run all tests
	cd server && npm test
	cd frontend && npm test

clean: ## Clean all build artifacts
	@echo "Cleaning backend..."
	cd server && rm -rf dist
	@echo "Cleaning frontend..."
	cd frontend && rm -rf .next

db-up: ## Start PostgreSQL database
	docker-compose up -d postgres
	@echo "Database started: postgresql://postgres:postgres@localhost:5432/mitra_ai"

db-down: ## Stop PostgreSQL database
	docker-compose down
	@echo "Database stopped"

db-migrate: ## Run database migrations
	cd server && npx prisma migrate dev
	cd server && npx prisma generate

db-studio: ## Open Prisma Studio
	cd server && npx prisma studio

docker-build: ## Build Docker images
	docker-compose build

docker-up: ## Start all Docker containers
	docker-compose up -d
	@echo "Services started"

docker-down: ## Stop all Docker containers
	docker-compose down
	@echo "Services stopped"

docker-logs: ## View Docker logs
	docker-compose logs -f

format: ## Format all code
	cd server && npx prettier --write "src/**/*.ts"
	cd frontend && npx prettier --write "src/**/*.{ts,tsx}"

lint: ## Lint all code
	cd server && npm run lint
	cd frontend && npm run lint

seed: ## Seed database with sample data
	cd server && npx prisma db seed
