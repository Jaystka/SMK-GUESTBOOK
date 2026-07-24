from pydantic import BaseModel, Field, field_validator


class ImageRequest(BaseModel):
    image: str = Field(min_length=16, description="Base64 string or data URL")


class QualityMetrics(BaseModel):
    blur_score: float
    face_width: int
    face_height: int
    detection_score: float


class EmbeddingResponse(BaseModel):
    embedding: list[float]
    dimensions: int = 512
    model_version: str
    face_count: int
    quality: QualityMetrics


class Candidate(BaseModel):
    id: str
    embedding: list[float]

    @field_validator("embedding")
    @classmethod
    def validate_dimension(cls, value: list[float]) -> list[float]:
        if len(value) != 512:
            raise ValueError("candidate embedding must contain 512 values")
        return value


class MatchRequest(ImageRequest):
    candidates: list[Candidate] = Field(default_factory=list, max_length=1000)
    threshold: float = Field(default=0.48, ge=-1, le=1)


class MatchResponse(BaseModel):
    matched: bool
    candidate_id: str | None
    score: float | None
    model_version: str
