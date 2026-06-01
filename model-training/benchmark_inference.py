import time

import torch
from torchvision.models import (
    MobileNet_V2_Weights,
    ResNet18_Weights,
    mobilenet_v2,
    resnet18,
)


WARMUP_RUNS = 5
MEASURE_RUNS = 30


def count_parameters(model) -> int:
    return sum(parameter.numel() for parameter in model.parameters())


def estimate_model_size_mb(model) -> float:
    total_bytes = sum(parameter.numel() * parameter.element_size() for parameter in model.parameters())
    return total_bytes / (1024 * 1024)


def benchmark(name, model, device):
    model.eval()
    sample = torch.randn(1, 3, 224, 224).to(device)

    with torch.no_grad():
        for _ in range(WARMUP_RUNS):
            model(sample)

        start = time.perf_counter()
        for _ in range(MEASURE_RUNS):
            model(sample)
        elapsed = time.perf_counter() - start

    print(
        f"{name}: avg_inference_ms={(elapsed / MEASURE_RUNS) * 1000:.2f}, "
        f"parameters={count_parameters(model):,}, estimated_size_mb={estimate_model_size_mb(model):.2f}"
    )


def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    benchmark("resnet18", resnet18(weights=ResNet18_Weights.DEFAULT).to(device), device)
    benchmark("mobilenet_v2", mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT).to(device), device)


if __name__ == "__main__":
    main()
