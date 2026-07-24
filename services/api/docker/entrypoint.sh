#!/usr/bin/env bash
set -euo pipefail
cd /var/www/html

mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true

if [[ ! -f vendor/autoload.php ]]; then
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

if [[ "${RUN_MIGRATIONS:-false}" == "true" ]]; then
  until php -r '$h=getenv("DB_HOST")?:"postgres"; $p=(int)(getenv("DB_PORT")?:5432); $s=@fsockopen($h,$p,$e,$m,2); exit($s?0:1);'; do
    sleep 2
  done
  php artisan migrate --force
fi

if [[ "${RUN_SEEDERS:-false}" == "true" ]]; then
  php artisan db:seed --force
fi

php artisan storage:link >/dev/null 2>&1 || true
php artisan config:clear >/dev/null 2>&1 || true
exec "$@"
