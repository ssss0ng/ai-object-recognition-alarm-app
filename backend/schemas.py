from pydantic import BaseModel


class RootResponse(BaseModel):
    message: str
    status: str


class HealthResponse(BaseModel):
    status: str
    model: str


class TopPrediction(BaseModel):
    label: str
    confidence: float


class GeneralPredictionResponse(BaseModel):
    mode: str
    target_object: str
    top_prediction: TopPrediction
    predicted_object: str
    confidence: float
    threshold: float
    matched_label: str | None = None
    matched_confidence: float | None = None
    matched_labels: list[str]
    top_predictions: list[TopPrediction]
    allowed_labels: list[str]
    success: bool


class CustomRegisterResponse(BaseModel):
    object_id: str
    num_images: int
    status: str


class CustomDeleteResponse(BaseModel):
    object_id: str
    status: str


class CustomPredictionResponse(BaseModel):
    mode: str
    object_id: str
    similarity: float
    threshold: float
    best_match_object_id: str | None = None
    best_match_similarity: float | None = None
    second_best_object_id: str | None = None
    second_best_similarity: float | None = None
    margin: float | None = None
    margin_threshold: float | None = None
    target_is_best: bool | None = None
    success: bool


class CustomObjectSummary(BaseModel):
    object_id: str
    num_images: int
    embedding_file: str
    metadata_file: str


class CustomObjectsResponse(BaseModel):
    objects: list[CustomObjectSummary]
