import argparse
import csv
import time
from pathlib import Path

import torch
from PIL import Image, ImageOps

from constants import (
    GENERAL_CONFIDENCE_THRESHOLD,
    GENERAL_TOP_K,
    HOUSEHOLD_OBJECTS,
    OBJECT_TO_IMAGENET_LABELS,
)
from general_classifier import labels_match, normalize_label
from model_loader import models
from preprocessing import preprocess_image


CLASS_FOLDER_TO_TARGET = {
    "remote_control": "remote control",
}

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def resolve_target_name(folder_name: str) -> str:
    return CLASS_FOLDER_TO_TARGET.get(folder_name, folder_name)


def load_image(path: Path) -> Image.Image:
    return ImageOps.autocontrast(Image.open(path).convert("RGB"), cutoff=1)


def count_parameters(model) -> int:
    return sum(parameter.numel() for parameter in model.parameters())


def get_process_memory_mb() -> float | None:
    try:
        import psutil

        return round(psutil.Process().memory_info().rss / (1024 * 1024), 2)
    except ImportError:
        return None


def predict_top_k(image: Image.Image, model_name: str) -> tuple[list[dict], float]:
    model = models.classifiers[model_name]
    categories = models.categories[model_name]
    image_tensor = preprocess_image(image, model_name).to(models.device)

    start_time = time.perf_counter()
    with torch.no_grad():
        logits = model(image_tensor)
        probabilities = torch.nn.functional.softmax(logits[0], dim=0)
        top_probabilities, top_indices = torch.topk(probabilities, k=GENERAL_TOP_K)
    elapsed_time_ms = (time.perf_counter() - start_time) * 1000

    top_predictions = []
    for probability, index in zip(top_probabilities, top_indices):
        top_predictions.append(
            {
                "label": normalize_label(categories[index.item()]),
                "confidence": round(float(probability.item()), 4),
            }
        )

    return top_predictions, elapsed_time_ms


def match_target(top_predictions: list[dict], target_object: str) -> dict:
    expected_labels = OBJECT_TO_IMAGENET_LABELS[target_object]
    matched_prediction = None
    matched_label = None

    for prediction in top_predictions:
        for expected_label in sorted(expected_labels, key=len, reverse=True):
            if labels_match(prediction["label"], expected_label):
                matched_prediction = prediction
                matched_label = normalize_label(expected_label)
                break
        if matched_prediction:
            break

    confidence = matched_prediction["confidence"] if matched_prediction else top_predictions[0]["confidence"]
    success = matched_prediction is not None and confidence >= GENERAL_CONFIDENCE_THRESHOLD

    return {
        "matched_label": matched_label,
        "mapped": matched_prediction is not None,
        "confidence": confidence,
        "success": success,
    }


def collect_images(dataset_dir: Path) -> list[tuple[Path, str]]:
    images = []
    for class_dir in sorted(dataset_dir.iterdir()):
        if not class_dir.is_dir():
            continue

        target_name = resolve_target_name(class_dir.name)
        if target_name not in HOUSEHOLD_OBJECTS:
            continue

        for path in sorted(class_dir.iterdir()):
            if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS:
                images.append((path, target_name))

    return images


def calculate_metrics(rows: list[dict], target_objects: list[str]) -> dict:
    per_class = []
    for target_object in target_objects:
        tp = sum(1 for row in rows if row["true_label"] == target_object and row["target_object"] == target_object and row["success"])
        fp = sum(1 for row in rows if row["true_label"] != target_object and row["target_object"] == target_object and row["success"])
        fn = sum(1 for row in rows if row["true_label"] == target_object and row["target_object"] == target_object and not row["success"])

        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        per_class.append({"target_object": target_object, "precision": precision, "recall": recall})

    true_target_rows = [row for row in rows if row["true_label"] == row["target_object"]]
    mapped_accuracy = (
        sum(1 for row in true_target_rows if row["mapped"]) / len(true_target_rows)
        if true_target_rows
        else 0.0
    )
    threshold_success_accuracy = (
        sum(1 for row in true_target_rows if row["success"]) / len(true_target_rows)
        if true_target_rows
        else 0.0
    )
    macro_precision = sum(item["precision"] for item in per_class) / len(per_class) if per_class else 0.0
    macro_recall = sum(item["recall"] for item in per_class) / len(per_class) if per_class else 0.0
    avg_processing_time_ms = (
        sum(float(row["processing_time_ms"]) for row in true_target_rows) / len(true_target_rows)
        if true_target_rows
        else 0.0
    )

    return {
        "mapped_accuracy": mapped_accuracy,
        "threshold_success_accuracy": threshold_success_accuracy,
        "accuracy": threshold_success_accuracy,
        "precision": macro_precision,
        "recall": macro_recall,
        "avg_processing_time_ms": avg_processing_time_ms,
    }


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def run_evaluation(dataset_dir: Path, output_dir: Path) -> None:
    images = collect_images(dataset_dir)
    target_objects = [resolve_target_name(path.name) for path in sorted(dataset_dir.iterdir()) if path.is_dir()]
    target_objects = [target for target in target_objects if target in HOUSEHOLD_OBJECTS]

    if not images:
        raise RuntimeError(f"No supported images found in {dataset_dir}")

    all_rows = []
    summary_rows = []

    for model_name in ["resnet", "mobilenet"]:
        model_rows = []
        memory_before_mb = get_process_memory_mb()
        parameters = count_parameters(models.classifiers[model_name])

        for image_path, true_label in images:
            image = load_image(image_path)
            top_predictions, processing_time_ms = predict_top_k(image, model_name)
            top_prediction = top_predictions[0]

            for target_object in target_objects:
                match_result = match_target(top_predictions, target_object)
                row = {
                    "image_path": str(image_path),
                    "true_label": true_label,
                    "model": model_name,
                    "target_object": target_object,
                    "top_prediction": top_prediction["label"],
                    "top_prediction_confidence": top_prediction["confidence"],
                    "matched_label": match_result["matched_label"] or "",
                    "mapped": match_result["mapped"],
                    "confidence": match_result["confidence"],
                    "threshold": GENERAL_CONFIDENCE_THRESHOLD,
                    "success": match_result["success"],
                    "processing_time_ms": round(processing_time_ms, 2),
                }
                all_rows.append(row)
                model_rows.append(row)

        metrics = calculate_metrics(model_rows, target_objects)
        memory_after_mb = get_process_memory_mb()
        summary_rows.append(
            {
                "model": model_name,
                "mapped_accuracy": round(metrics["mapped_accuracy"], 4),
                "threshold_success_accuracy": round(metrics["threshold_success_accuracy"], 4),
                "accuracy": round(metrics["accuracy"], 4),
                "precision": round(metrics["precision"], 4),
                "recall": round(metrics["recall"], 4),
                "avg_processing_time_ms": round(metrics["avg_processing_time_ms"], 2),
                "avg_processing_time_seconds": round(metrics["avg_processing_time_ms"] / 1000, 4),
                "parameters": parameters,
                "parameters_million": round(parameters / 1_000_000, 2),
                "memory_before_mb": memory_before_mb if memory_before_mb is not None else "",
                "memory_after_mb": memory_after_mb if memory_after_mb is not None else "",
            }
        )

    write_csv(
        output_dir / "evaluation_results.csv",
        all_rows,
        [
            "image_path",
            "true_label",
            "model",
            "target_object",
            "top_prediction",
            "top_prediction_confidence",
            "matched_label",
            "mapped",
            "confidence",
            "threshold",
            "success",
            "processing_time_ms",
        ],
    )
    write_csv(
        output_dir / "evaluation_summary.csv",
        summary_rows,
        [
            "model",
            "mapped_accuracy",
            "threshold_success_accuracy",
            "accuracy",
            "precision",
            "recall",
            "avg_processing_time_ms",
            "avg_processing_time_seconds",
            "parameters",
            "parameters_million",
            "memory_before_mb",
            "memory_after_mb",
        ],
    )

    print(f"Evaluated {len(images)} images with {len(target_objects)} target objects.")
    print(f"Saved detail results to {output_dir / 'evaluation_results.csv'}")
    print(f"Saved summary results to {output_dir / 'evaluation_summary.csv'}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate ResNet18 and MobileNetV2 on General Object Mode images.")
    parser.add_argument("--dataset-dir", default="../test_images", help="Path to the test image folder.")
    parser.add_argument("--output-dir", default="../evaluation_outputs", help="Path for CSV output files.")
    args = parser.parse_args()

    backend_dir = Path(__file__).resolve().parent
    dataset_dir = (backend_dir / args.dataset_dir).resolve()
    output_dir = (backend_dir / args.output_dir).resolve()
    run_evaluation(dataset_dir, output_dir)


if __name__ == "__main__":
    main()
