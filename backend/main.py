from fastapi import FastAPI, File, Form, UploadFile

from constants import (
    CUSTOM_SIMILARITY_THRESHOLD,
    HOUSEHOLD_OBJECTS,
    MIN_CUSTOM_IMAGES,
)
from custom_similarity import (
    average_embeddings,
    cosine_similarity,
    extract_embedding,
    is_custom_match,
)
from general_classifier import predict_general, validate_general_request
from preprocessing import build_custom_registration_variants, preprocess_image, read_image_upload
from schemas import (
    CustomObjectsResponse,
    CustomPredictionResponse,
    CustomRegisterResponse,
    GeneralPredictionResponse,
    HealthResponse,
    RootResponse,
)
from storage import (
    ensure_storage_dirs,
    list_custom_objects,
    load_custom_embedding,
    save_custom_object,
    validate_object_id,
)


app = FastAPI(title="AI Object Recognition Alarm App Backend")


@app.on_event("startup")
def startup_event() -> None:
    ensure_storage_dirs()


@app.get("/", response_model=RootResponse)
def root():
    return {
        "message": "AI Object Recognition Alarm App Backend",
        "status": "running",
    }


@app.get("/health", response_model=HealthResponse)
def health():
    return {"status": "ok", "model": "loaded"}


@app.get("/objects/general", response_model=list[str])
def get_general_objects():
    return HOUSEHOLD_OBJECTS


@app.post("/predict/general", response_model=GeneralPredictionResponse)
async def predict_general_endpoint(
    file: UploadFile = File(...),
    target_object: str = Form(...),
    model_name: str = Form("resnet"),
):
    target_object = target_object.strip().lower()
    model_name = model_name.strip().lower()
    validate_general_request(target_object, model_name)

    image = await read_image_upload(file)
    image_tensor = preprocess_image(image, model_name)
    return predict_general(image_tensor, target_object, model_name)


@app.post("/custom/register", response_model=CustomRegisterResponse)
async def register_custom_object(
    object_id: str = Form(...),
    files: list[UploadFile] = File(...),
):
    object_id = object_id.strip()
    validate_object_id(object_id)

    if len(files) < MIN_CUSTOM_IMAGES:
        return_error = (
            f"At least {MIN_CUSTOM_IMAGES} images are required for custom object registration."
        )
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail=return_error)

    embeddings = []
    for upload in files:
        image = await read_image_upload(upload)
        for image_variant in build_custom_registration_variants(image):
            image_tensor = preprocess_image(image_variant, "resnet")
            embeddings.append(extract_embedding(image_tensor))

    averaged_embedding = average_embeddings(embeddings)
    save_custom_object(object_id, averaged_embedding, len(files))

    return {
        "object_id": object_id,
        "num_images": len(files),
        "status": "registered",
    }


@app.post("/predict/custom", response_model=CustomPredictionResponse)
async def predict_custom_endpoint(
    object_id: str = Form(...),
    file: UploadFile = File(...),
):
    object_id = object_id.strip()
    validate_object_id(object_id)

    stored_embedding = load_custom_embedding(object_id)
    image = await read_image_upload(file)
    image_tensor = preprocess_image(image, "resnet")
    input_embedding = extract_embedding(image_tensor)
    similarity = cosine_similarity(input_embedding, stored_embedding)

    return {
        "mode": "custom",
        "object_id": object_id,
        "similarity": similarity,
        "threshold": CUSTOM_SIMILARITY_THRESHOLD,
        "success": is_custom_match(similarity),
    }


@app.get("/objects/custom", response_model=CustomObjectsResponse)
def get_custom_objects():
    return {"objects": list_custom_objects()}
