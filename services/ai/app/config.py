from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    service_name: str = "insightface-service"
    service_token: str = "change-me-ai-token"
    model_name: str = "buffalo_l"
    model_version: str = "buffalo_l"
    mock_mode: bool = True
    detection_size: int = 640
    min_face_size: int = 80
    max_image_bytes: int = 8 * 1024 * 1024
    providers: str = "CPUExecutionProvider"

    model_config = SettingsConfigDict(env_prefix="AI_", case_sensitive=False)

    @property
    def provider_list(self) -> list[str]:
        return [item.strip() for item in self.providers.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
