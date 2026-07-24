# InsightFace Service

FastAPI service untuk ekstraksi embedding wajah. Jalankan lokal:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
AI_MOCK_MODE=true AI_SERVICE_TOKEN=dev-token uvicorn app.main:app --reload
```

Endpoint utama:

- `GET /health`
- `POST /embedding`
- `POST /match`

Semua endpoint inferensi memerlukan header `X-Service-Token`.
