import csv
import json
import sys
import time
from pathlib import Path

import torch
from PIL import Image
from torchvision.models import MobileNet_V2_Weights, ResNet18_Weights, mobilenet_v2, resnet18


ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"
TEST_DIR = ROOT_DIR / "test_images"
OUTPUT_RESULTS = Path(__file__).resolve().parent / "evaluation_results.json"
OUTPUT_SUMMARY = Path(__file__).resolve().parent / "evaluation_summary.json"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

sys.path.insert(0, str(BACKEND_DIR))

from constants import GENERAL_CONFIDENCE_THRESHOLD, HOUSEHOLD_OBJECTS, OBJECT_TO_IMAGENET_LABELS  # noqa: E402


AMBIGUOUS_SUBSTRING_LABELS = {"can", "file", "pad", "screen"}
MIN_REVERSE_MATCH_LENGTH = 5


def normalize_label(label: str) -> str:
    return " ".join(label.lower().replace("_", " ").split())


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


def count_parameters(model) -> int:
    return sum(parameter.numel() for parameter in model.parameters())


def find_images(test_dir: Path) -> list[Path]:
    return sorted(
        path
        for path in test_dir.rglob("*")
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    )


def true_label_from_path(path: Path) -> str:
    return normalize_label(path.parent.name)


def load_models(device):
    return {
        "resnet": {
            "model": resnet18(weights=ResNet18_Weights.DEFAULT).to(device).eval(),
            "weights": ResNet18_Weights.DEFAULT,
        },
        "mobilenet": {
            "model": mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT).to(device).eval(),
            "weights": MobileNet_V2_Weights.DEFAULT,
        },
    }


def predict_top_k(model, weights, image_path: Path, device, top_k: int = 10):
    transform = weights.transforms()
    categories = weights.meta["categories"]

    image = Image.open(image_path).convert("RGB")
    tensor = transform(image).unsqueeze(0).to(device)

    start = time.perf_counter()
    with torch.no_grad():
        logits = model(tensor)
        probabilities = torch.nn.functional.softmax(logits[0], dim=0)
        top_probabilities, top_indices = torch.topk(probabilities, k=top_k)
    elapsed_ms = (time.perf_counter() - start) * 1000

    predictions = []
    for probability, index in zip(top_probabilities, top_indices):
        predictions.append(
            {
                "label": normalize_label(categories[index.item()]),
                "confidence": round(float(probability.item()), 4),
            }
        )

    return predictions, round(elapsed_ms, 2)


def evaluate_target(top_predictions, target_object: str):
    expected_labels = OBJECT_TO_IMAGENET_LABELS[target_object]
    for prediction in top_predictions:
        for expected_label in sorted(expected_labels, key=len, reverse=True):
            if labels_match(prediction["label"], expected_label):
                return {
                    "matched_label": normalize_label(expected_label),
                    "confidence": prediction["confidence"],
                    "mapped": True,
                    "success": prediction["confidence"] >= GENERAL_CONFIDENCE_THRESHOLD,
                }

    return {
        "matched_label": None,
        "confidence": top_predictions[0]["confidence"],
        "mapped": False,
        "success": False,
    }


def calculate_metrics(rows):
    tp = sum(1 for row in rows if row["is_true_target"] and row["success"])
    fp = sum(1 for row in rows if not row["is_true_target"] and row["success"])
    tn = sum(1 for row in rows if not row["is_true_target"] and not row["success"])
    fn = sum(1 for row in rows if row["is_true_target"] and not row["success"])
    total = tp + fp + tn + fn

    return {
        "TP": tp,
        "FP": fp,
        "TN": tn,
        "FN": fn,
        "accuracy": round((tp + tn) / total, 4) if total else 0,
        "precision": round(tp / (tp + fp), 4) if tp + fp else 0,
        "recall": round(tp / (tp + fn), 4) if tp + fn else 0,
    }


def main():
    images = find_images(TEST_DIR)
    if not images:
        print("평가할 이미지가 없습니다.")
        print("아래 구조로 직접 촬영한 이미지를 추가한 뒤 다시 실행하세요.")
        print("test_images/bottle/, test_images/cup/, test_images/book/ ...")
        return

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model_bundle = load_models(device)
    all_rows = []
    summary = []

    for model_name, bundle in model_bundle.items():
        model = bundle["model"]
        weights = bundle["weights"]
        model_rows = []

        for image_path in images:
            true_label = true_label_from_path(image_path)
            top_predictions, elapsed_ms = predict_top_k(model, weights, image_path, device)

            for target_object in HOUSEHOLD_OBJECTS:
                result = evaluate_target(top_predictions, target_object)
                is_true_target = true_label == normalize_label(target_object)
                row = {
                    "image_path": str(image_path),
                    "true_label": true_label,
                    "model": model_name,
                    "target_object": target_object,
                    "is_true_target": is_true_target,
                    "top_prediction": top_predictions[0]["label"],
                    "top_prediction_confidence": top_predictions[0]["confidence"],
                    "matched_label": result["matched_label"],
                    "mapped": result["mapped"],
                    "confidence": result["confidence"],
                    "threshold": GENERAL_CONFIDENCE_THRESHOLD,
                    "success": result["success"],
                    "processing_time_ms": elapsed_ms,
                }
                all_rows.append(row)
                model_rows.append(row)

        metrics = calculate_metrics(model_rows)
        avg_time_ms = sum(row["processing_time_ms"] for row in model_rows) / len(model_rows)
        summary.append(
            {
                "model": model_name,
                **metrics,
                "avg_processing_time_ms": round(avg_time_ms, 2),
                "avg_processing_time_seconds": round(avg_time_ms / 1000, 4),
                "parameters": count_parameters(model),
                "parameters_million": round(count_parameters(model) / 1_000_000, 2),
            }
        )

    OUTPUT_RESULTS.write_text(json.dumps(all_rows, ensure_ascii=False, indent=2), encoding="utf-8")
    OUTPUT_SUMMARY.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    print("평가가 완료되었습니다.")
    print(f"상세 결과: {OUTPUT_RESULTS}")
    print(f"요약 결과: {OUTPUT_SUMMARY}")
    print()
    print("Model       TP   FP   TN   FN   Accuracy   Precision   Recall   Avg ms   Parameters")
    for row in summary:
        print(
            f"{row['model']:<10} "
            f"{row['TP']:>3} {row['FP']:>4} {row['TN']:>4} {row['FN']:>4} "
            f"{row['accuracy']:>9.4f} {row['precision']:>11.4f} {row['recall']:>8.4f} "
            f"{row['avg_processing_time_ms']:>8.2f} {row['parameters']:>12}"
        )


if __name__ == "__main__":
    main()
