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
    predicted_object: str
    confidence: float
    threshold: float
    matched_labels: list[str]
    top_predictions: list[TopPrediction]
    success: bool


class CustomRegisterResponse(BaseModel):
    object_id: str
    num_images: int
    status: str


class CustomPredictionResponse(BaseModel):
    mode: str
    object_id: str
    similarity: float
    threshold: float
    success: bool


class CustomObjectSummary(BaseModel):
    object_id: str
    num_images: int
    embedding_file: str
    metadata_file: str


class CustomObjectsResponse(BaseModel):
    objects: list[CustomObjectSummary]
