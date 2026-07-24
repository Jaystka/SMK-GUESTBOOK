# API Ringkas

Base URL: `/api/v1`

## Public

- `GET /health`
- `POST /face/identify`
- `POST /visitors`
- `POST /visits`
- `GET /employees/options`
- `GET /visitors/search?phone=...`

Endpoint public memiliki rate limit dan validasi gambar.

## Authentication

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Gunakan header `Authorization: Bearer <token>`.

## Admin

- `GET /dashboard/today`
- `GET /visitors`
- `GET /visitors/{id}`
- `PATCH /visitors/{id}`
- `DELETE /visitors/{id}`
- `GET /visits`
- `PATCH /visits/{id}/checkout`
- `GET /employees`
- `POST /employees`
- `PATCH /employees/{id}`
- `DELETE /employees/{id}`
- `GET /reports/visits.csv`
- `GET /audit-logs`

Dokumentasi OpenAPI layanan AI tersedia pada `/docs` di port AI.
