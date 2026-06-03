import json
import time
from pathlib import Path

import torch
from torchvision.models import MobileNet_V2_Weights, ResNet18_Weights, mobilenet_v2, resnet18


WARMUP_RUNS = 5
MEASURE_RUNS = 30
OUTPUT_PATH = Path(__file__).resolve().parent / "benchmark_results.json"


def count_parameters(model) -> int:
    return sum(parameter.numel() for parameter in model.parameters())


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

    avg_ms = (elapsed / MEASURE_RUNS) * 1000
    return {
        "model": name,
        "avg_inference_ms": round(avg_ms, 2),
        "avg_inference_seconds": round(avg_ms / 1000, 4),
        "parameters": count_parameters(model),
        "parameters_million": round(count_parameters(model) / 1_000_000, 2),
        "warmup_runs": WARMUP_RUNS,
        "measure_runs": MEASURE_RUNS,
    }


def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    results = [
        benchmark("resnet18", resnet18(weights=ResNet18_Weights.DEFAULT).to(device), device),
        benchmark("mobilenet_v2", mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT).to(device), device),
    ]

    OUTPUT_PATH.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")

    print("Benchmark completed.")
    print(f"Results saved to: {OUTPUT_PATH}")
    print()
    print("Model          Avg ms   Parameters")
    for row in results:
        print(f"{row['model']:<14} {row['avg_inference_ms']:>7.2f} {row['parameters']:>12}")


if __name__ == "__main__":
    main()
