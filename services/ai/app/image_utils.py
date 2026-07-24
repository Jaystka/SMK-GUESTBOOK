import base64
import binascii

import cv2
import numpy as np

from app.exceptions import FaceProcessingError


def decode_base64_image(value: str, max_bytes: int) -> tuple[np.ndarray, bytes]:
    payload = value.split(",", 1)[1] if value.startswith("data:") and "," in value else value
    try:
        raw = base64.b64decode(payload, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise FaceProcessingError("Image is not valid base64", "invalid_base64", 400) from exc

    if not raw:
        raise FaceProcessingError("Image is empty", "empty_image", 400)
    if len(raw) > max_bytes:
        raise FaceProcessingError("Image exceeds maximum size", "image_too_large", 413)

    array = np.frombuffer(raw, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise FaceProcessingError("Decoded data is not a supported image", "invalid_image", 415)
    return image, raw


def blur_score(image: np.ndarray) -> float:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())
