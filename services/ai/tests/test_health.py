import base64

import cv2
import numpy as np
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app, get_engine

client = TestClient(app)


def image_base64() -> str:
    image = np.zeros((64, 64, 3), dtype=np.uint8)
    ok, encoded = cv2.imencode(".jpg", image)
    assert ok
    return base64.b64encode(encoded.tobytes()).decode()


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_embedding_requires_token():
    response = client.post("/embedding", json={"image": image_base64()})
    assert response.status_code == 401


def test_mock_embedding_has_512_dimensions():
    get_engine.cache_clear()
    settings = get_settings()
    response = client.post(
        "/embedding",
        headers={"X-Service-Token": settings.service_token},
        json={"image": image_base64()},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["dimensions"] == 512
    assert len(body["embedding"]) == 512
