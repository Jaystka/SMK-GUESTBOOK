#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
file="${1:?Provide .sql or .sql.gz backup file}"
set -a; source .env; set +a
case "$file" in
  *.gz) gzip -dc "$file" | docker compose exec -T postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB" ;;
  *) cat "$file" | docker compose exec -T postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB" ;;
esac
printf 'Restore completed from %s\n' "$file"
