SHELL := /bin/bash

.PHONY: help env up down build logs ps migrate seed fresh test smoke lint backup restore

help:
	@echo "Targets: env up down build logs ps migrate seed fresh test smoke lint backup restore"

env:
	@test -f .env || cp .env.example .env
	@echo "Environment ready. Review .env before production use."

up: env
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build --no-cache

logs:
	docker compose logs -f --tail=200

ps:
	docker compose ps

migrate:
	docker compose exec api php artisan migrate --force

seed:
	docker compose exec api php artisan db:seed --force

fresh:
	docker compose exec api php artisan migrate:fresh --seed --force

test:
	docker compose exec api php artisan test
	docker compose exec insightface-service pytest -q

dev-test:
	cd apps/frontend && npm run lint && npm run typecheck

smoke:
	./scripts/smoke-test.sh

lint:
	find services/api -name '*.php' -not -path '*/vendor/*' -print0 | xargs -0 -n1 php -l
	python3 -m compileall services/ai/app

backup:
	./scripts/backup.sh

restore:
	@test -n "$(FILE)" || (echo "Usage: make restore FILE=backups/backup.sql.gz" && exit 1)
	./scripts/restore.sh "$(FILE)"
