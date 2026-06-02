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


AMBIGUOUS_SUBSTRING_LABELS = {"can", "file", "pad", "screen"}
MIN_REVERSE_MATCH_LENGTH = 5


def normalize_label(label: str) -> str:
    return " ".join(label.lower().split())


def labels_match(predicted_label: str, expected_label: str) -> bool:
    predicted_label = normalize_label(predicted_label)
    expected_label = normalize_label(expected_label)

    if predicted_label == expected_label:
        return True

    if expected_label in AMBIGUOUS_SUBSTRING_LABELS:
        return False

    if expected_label in predicted_label:
        return True

    return (
        predicted_label not in AMBIGUOUS_SUBSTRING_LABELS
        and len(predicted_label) >= MIN_REVERSE_MATCH_LENGTH
        and predicted_label in expected_label
    )


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
                "label": normalize_label(categories[index.item()]),
                "confidence": round(float(probability.item()), 4),
            }
        )

    expected_labels = OBJECT_TO_IMAGENET_LABELS[target_object]
    matched_prediction = None
    matched_label = None

    for prediction in top_predictions:
        prediction_label = prediction["label"]
        for expected_label in sorted(expected_labels, key=len, reverse=True):
            if labels_match(prediction_label, expected_label):
                matched_prediction = prediction
                matched_label = normalize_label(expected_label)
                break
        if matched_prediction:
            break

    top_prediction = top_predictions[0]
    predicted_label = matched_prediction["label"] if matched_prediction else top_predictions[0]["label"]
    confidence_value = matched_prediction["confidence"] if matched_prediction else top_predictions[0]["confidence"]
    matched_confidence = matched_prediction["confidence"] if matched_prediction else None
    matched_labels = [matched_label] if matched_label else []
    matched = matched_prediction is not None
    success = matched and confidence_value >= GENERAL_CONFIDENCE_THRESHOLD

    return {
        "mode": "general",
        "target_object": target_object,
        "top_prediction": top_prediction,
        "predicted_object": predicted_label,
        "confidence": confidence_value,
        "threshold": GENERAL_CONFIDENCE_THRESHOLD,
        "matched_label": matched_label,
        "matched_confidence": matched_confidence,
        "matched_labels": matched_labels,
        "top_predictions": top_predictions,
        "allowed_labels": sorted(normalize_label(label) for label in expected_labels),
        "success": success,
    }
