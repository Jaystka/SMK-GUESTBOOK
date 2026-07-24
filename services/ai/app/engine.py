from __future__ import annotations

import hashlib
import threading
from dataclasses import dataclass

import numpy as np

from app.config import Settings
from app.exceptions import FaceProcessingError
from app.image_utils import blur_score, decode_base64_image


@dataclass(frozen=True)
class EmbeddingResult:
    vector: list[float]
    face_count: int
    blur_score: float
    face_width: int
    face_height: int
    detection_score: float


class FaceEngine:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._app = None
        self._lock = threading.Lock()

    def _load(self):
        if self.settings.mock_mode:
            return None
        if self._app is not None:
            return self._app
        with self._lock:
            if self._app is None:
                from insightface.app import FaceAnalysis

                app = FaceAnalysis(
                    name=self.settings.model_name,
                    providers=self.settings.provider_list,
                    root="/models",
                )
                ctx_id = 0 if any("CUDA" in item for item in self.settings.provider_list) else -1
                app.prepare(
                    ctx_id=ctx_id,
                    det_size=(self.settings.detection_size, self.settings.detection_size),
                )
                self._app = app
        return self._app

    @staticmethod
    def _mock_vector(raw: bytes) -> list[float]:
        values: list[float] = []
        seed = hashlib.sha512(raw).digest()
        counter = 0
        while len(values) < 512:
            block = hashlib.sha512(seed + counter.to_bytes(4, "big")).digest()
            values.extend((byte / 127.5) - 1.0 for byte in block)
            counter += 1
        vector = np.asarray(values[:512], dtype=np.float32)
        vector /= max(float(np.linalg.norm(vector)), 1e-12)
        return vector.tolist()

    def embedding(self, image_value: str) -> EmbeddingResult:
        image, raw = decode_base64_image(image_value, self.settings.max_image_bytes)
        image_blur = blur_score(image)

        if self.settings.mock_mode:
            height, width = image.shape[:2]
            return EmbeddingResult(
                vector=self._mock_vector(raw),
                face_count=1,
                blur_score=image_blur,
                face_width=width,
                face_height=height,
                detection_score=1.0,
            )

        app = self._load()
        faces = app.get(image)
        if len(faces) == 0:
            raise FaceProcessingError("No face detected", "face_not_found")
        if len(faces) > 1:
            raise FaceProcessingError("More than one face detected", "multiple_faces")

        face = faces[0]
        x1, y1, x2, y2 = [int(value) for value in face.bbox]
        width = max(0, x2 - x1)
        height = max(0, y2 - y1)
        if min(width, height) < self.settings.min_face_size:
            raise FaceProcessingError("Detected face is too small", "face_too_small")

        vector = np.asarray(face.normed_embedding, dtype=np.float32)
        if vector.shape != (512,):
            raise FaceProcessingError("Unexpected embedding dimension", "invalid_embedding", 500)
        vector /= max(float(np.linalg.norm(vector)), 1e-12)

        return EmbeddingResult(
            vector=vector.tolist(),
            face_count=1,
            blur_score=image_blur,
            face_width=width,
            face_height=height,
            detection_score=float(face.det_score),
        )

    @staticmethod
    def cosine_similarity(left: list[float], right: list[float]) -> float:
        a = np.asarray(left, dtype=np.float32)
        b = np.asarray(right, dtype=np.float32)
        denominator = float(np.linalg.norm(a) * np.linalg.norm(b))
        if denominator <= 1e-12:
            return -1.0
        return float(np.dot(a, b) / denominator)
