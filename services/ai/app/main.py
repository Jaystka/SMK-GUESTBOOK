from functools import lru_cache

from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.engine import FaceEngine
from app.exceptions import FaceProcessingError
from app.schemas import EmbeddingResponse, ImageRequest, MatchRequest, MatchResponse, QualityMetrics
from app.security import verify_service_token

settings = get_settings()
app = FastAPI(
    title="School Guestbook InsightFace Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


@lru_cache
def get_engine() -> FaceEngine:
    return FaceEngine(settings)


@app.exception_handler(FaceProcessingError)
async def handle_face_error(_: Request, exc: FaceProcessingError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": settings.service_name,
        "model": settings.model_version,
        "mock_mode": settings.mock_mode,
    }


def build_embedding_response(payload: ImageRequest, engine: FaceEngine) -> EmbeddingResponse:
    result = engine.embedding(payload.image)
    return EmbeddingResponse(
        embedding=result.vector,
        dimensions=len(result.vector),
        model_version=settings.model_version,
        face_count=result.face_count,
        quality=QualityMetrics(
            blur_score=result.blur_score,
            face_width=result.face_width,
            face_height=result.face_height,
            detection_score=result.detection_score,
        ),
    )


@app.post("/v1/embedding", response_model=EmbeddingResponse, dependencies=[Depends(verify_service_token)])
def embedding(payload: ImageRequest, engine: FaceEngine = Depends(get_engine)) -> EmbeddingResponse:
    return build_embedding_response(payload, engine)


@app.post("/embedding", response_model=EmbeddingResponse, dependencies=[Depends(verify_service_token)])
def embedding_alias(payload: ImageRequest, engine: FaceEngine = Depends(get_engine)) -> EmbeddingResponse:
    return build_embedding_response(payload, engine)


@app.post("/v1/match", response_model=MatchResponse, dependencies=[Depends(verify_service_token)])
def match(payload: MatchRequest, engine: FaceEngine = Depends(get_engine)) -> MatchResponse:
    query = engine.embedding(payload.image).vector
    best_id = None
    best_score = None
    for candidate in payload.candidates:
        score = engine.cosine_similarity(query, candidate.embedding)
        if best_score is None or score > best_score:
            best_id = candidate.id
            best_score = score
    return MatchResponse(
        matched=best_score is not None and best_score >= payload.threshold,
        candidate_id=best_id if best_score is not None and best_score >= payload.threshold else None,
        score=best_score,
        model_version=settings.model_version,
    )


@app.post("/match", response_model=MatchResponse, dependencies=[Depends(verify_service_token)])
def match_alias(payload: MatchRequest, engine: FaceEngine = Depends(get_engine)) -> MatchResponse:
    return match(payload, engine)
