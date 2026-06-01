from fastapi import HTTPException
import torch

from constants import (
    GENERAL_CONFIDENCE_THRESHOLD,
    GENERAL_TOP_K,
    HOUSEHOLD_OBJECTS,
    OBJECT_TO_IMAGENET_LABELS,
    SUPPORTED_MODEL_NAMES,
)
from model_loader import models


def validate_general_request(target_object: str, model_name: str) -> None:
    if target_object not in HOUSEHOLD_OBJECTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported target_object. Choose one of: {HOUSEHOLD_OBJECTS}",
        )

    if model_name not in SUPPORTED_MODEL_NAMES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported model_name. Choose one of: {sorted(SUPPORTED_MODEL_NAMES)}",
        )


def predict_general(image_tensor, target_object: str, model_name: str):
    validate_general_request(target_object, model_name)

    model = models.classifiers[model_name]
    categories = models.categories[model_name]
    image_tensor = image_tensor.to(models.device)

    with torch.no_grad():
        logits = model(image_tensor)
        probabilities = torch.nn.functional.softmax(logits[0], dim=0)
        top_probabilities, top_indices = torch.topk(probabilities, k=GENERAL_TOP_K)

    top_predictions = []
    for probability, index in zip(top_probabilities, top_indices):
        top_predictions.append(
            {
                "label": categories[index.item()].lower(),
                "confidence": round(float(probability.item()), 4),
            }
        )

    predicted_label = top_predictions[0]["label"]
    confidence_value = top_predictions[0]["confidence"]
    expected_labels = OBJECT_TO_IMAGENET_LABELS[target_object]
    matched_labels = sorted(
        expected_label
        for expected_label in expected_labels
        if predicted_label == expected_label or expected_label in predicted_label
    )
    matched = len(matched_labels) > 0
    success = matched and confidence_value >= GENERAL_CONFIDENCE_THRESHOLD

    return {
        "mode": "general",
        "target_object": target_object,
        "predicted_object": predicted_label,
        "confidence": confidence_value,
        "threshold": GENERAL_CONFIDENCE_THRESHOLD,
        "matched_labels": matched_labels,
        "top_predictions": top_predictions,
        "success": success,
    }
