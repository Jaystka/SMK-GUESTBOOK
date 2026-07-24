#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${BASE_URL:-http://localhost:${NGINX_HTTP_PORT:-8080}}"
AI_URL="${AI_URL:-http://localhost:${AI_PORT:-8001}}"

curl -fsS "$BASE_URL/healthz" >/dev/null
curl -fsS "$BASE_URL/api/v1/health" | grep -q 'ok'
curl -fsS "$AI_URL/health" | grep -q 'ok'
printf 'Smoke tests passed for %s\n' "$BASE_URL"
