#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

if grep -q '^APP_KEY=$' .env; then
  key="base64:$(openssl rand -base64 32 | tr -d '\n')"
  sed -i.bak "s|^APP_KEY=$|APP_KEY=$key|" .env && rm -f .env.bak
fi

printf 'Starting baseline services...\n'
docker compose up -d --build
printf 'Application: http://localhost:%s\n' "${NGINX_HTTP_PORT:-8080}"
printf 'MinIO console: http://localhost:%s\n' "${MINIO_CONSOLE_PORT:-9001}"
