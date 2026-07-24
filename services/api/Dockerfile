FROM composer:2 AS composer

FROM php:8.4-fpm-bookworm

ENV COMPOSER_ALLOW_SUPERUSER=1
WORKDIR /var/www/html

RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl unzip libpq-dev libicu-dev libzip-dev libonig-dev $PHPIZE_DEPS \
    && docker-php-ext-install -j$(nproc) pdo_pgsql bcmath pcntl intl mbstring zip opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer /usr/bin/composer /usr/bin/composer
COPY docker/php.ini /usr/local/etc/php/conf.d/guestbook.ini
COPY docker/www.conf /usr/local/etc/php-fpm.d/zz-guestbook.conf
COPY docker/entrypoint.sh /usr/local/bin/guestbook-entrypoint
COPY . /var/www/html

RUN chmod +x /usr/local/bin/guestbook-entrypoint \
    && mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
ENTRYPOINT ["guestbook-entrypoint"]
CMD ["php-fpm", "-F"]
