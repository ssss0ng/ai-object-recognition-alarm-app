import time
from pathlib import Path

import torch
from torch.utils.data import DataLoader
from torchvision import datasets
from torchvision.models import (
    MobileNet_V2_Weights,
    ResNet18_Weights,
    mobilenet_v2,
    resnet18,
)

from augmentation import build_eval_transform


TEST_DIR = Path("data") / "test"
BATCH_SIZE = 1


def count_parameters(model) -> int:
    return sum(parameter.numel() for parameter in model.parameters())


def estimate_model_size_mb(model) -> float:
    total_bytes = sum(parameter.numel() * parameter.element_size() for parameter in model.parameters())
    return total_bytes / (1024 * 1024)


def evaluate_model(name, model, loader, device):
    model.eval()
    correct = 0
    total = 0
    elapsed = 0.0

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)
            start = time.perf_counter()
            outputs = model(images)
            elapsed += time.perf_counter() - start
            predictions = outputs.argmax(dim=1)
            correct += (predictions == labels).sum().item()
            total += labels.size(0)

    accuracy = correct / total if total else 0
    avg_ms = (elapsed / total) * 1000 if total else 0
    print(
        f"{name}: accuracy={accuracy:.4f}, avg_inference_ms={avg_ms:.2f}, "
        f"parameters={count_parameters(model):,}, estimated_size_mb={estimate_model_size_mb(model):.2f}"
    )


def main():
    dataset = datasets.ImageFolder(TEST_DIR, transform=build_eval_transform())
    loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=False)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    models = {
        "resnet18": resnet18(weights=ResNet18_Weights.DEFAULT).to(device),
        "mobilenet_v2": mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT).to(device),
    }

    for name, model in models.items():
        evaluate_model(name, model, loader, device)

    print("Also record failure cases manually: low-light, blurry, similar objects, unusual angle.")


if __name__ == "__main__":
    main()
