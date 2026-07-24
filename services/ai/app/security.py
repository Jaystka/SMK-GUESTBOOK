import hmac

from fastapi import Header, HTTPException, status

from app.config import get_settings


def verify_service_token(x_service_token: str | None = Header(default=None)) -> None:
    expected = get_settings().service_token
    if not x_service_token or not hmac.compare_digest(x_service_token, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid service token")
