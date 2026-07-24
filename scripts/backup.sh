#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p backups
set -a; source .env; set +a
stamp="$(date +%Y%m%d-%H%M%S)"
out="backups/guestbook-${stamp}.sql.gz"
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$out"
printf 'Database backup created: %s\n' "$out"
