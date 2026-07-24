#!/usr/bin/env bash
set -euo pipefail
minio_password="$(openssl rand -hex 24)"
printf 'APP_KEY=base64:%s\n' "$(openssl rand -base64 32 | tr -d '\n')"
printf 'POSTGRES_PASSWORD=%s\n' "$(openssl rand -hex 24)"
printf 'MINIO_ROOT_PASSWORD=%s\n' "$minio_password"
printf 'AWS_SECRET_ACCESS_KEY=%s\n' "$minio_password"
printf 'AI_SERVICE_TOKEN=%s\n' "$(openssl rand -hex 32)"
printf 'PHONE_HASH_KEY=%s\n' "$(openssl rand -hex 32)"
printf 'DEFAULT_ADMIN_PASSWORD=%s\n' "$(openssl rand -base64 18 | tr -d '\n')"
