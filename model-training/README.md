# Model Training and Evaluation

이 폴더는 model evaluation과 inference benchmark를 위한 scripts를 포함합니다.

## 파일 설명

| File | 설명 |
|---|---|
| `evaluate.py` | self-captured test images로 `ResNet18`과 `MobileNetV2`를 평가합니다. |
| `benchmark_inference.py` | model별 평균 inference time과 parameter 수를 측정합니다. |
| `train_resnet.py` | ResNet training helper script입니다. |
| `train_mobilenet.py` | MobileNet training helper script입니다. |
| `augmentation.py` | image transform helper입니다. |

## Test Image 준비

기본 test image folder 구조는 다음과 같습니다.

```text
test_images/
  bottle/
  cup/
  book/
  keyboard/
  mouse/
  laptop/
  toothbrush/
  remote_control/
```

각 folder에는 사용자가 직접 촬영한 이미지를 넣습니다.

## Evaluation 실행

```powershell
cd model-training
python evaluate.py
```

결과 파일:

```text
evaluation_results.json
evaluation_summary.json
```

`evaluate.py`는 test image가 없으면 오류로 종료하지 않고, 이미지를 어디에 넣어야 하는지 한국어 안내 메시지를 출력합니다.

## Benchmark 실행

```powershell
cd model-training
python benchmark_inference.py
```

결과 파일:

```text
benchmark_results.json
```

## Metric 해석

| Metric | 의미 |
|---|---|
| Accuracy | 전체 판단 중 올바른 판단 비율 |
| Precision | success 판단 중 실제 정답 비율 |
| Recall | 실제 정답 중 success로 판단한 비율 |
| Average inference time | model inference 평균 시간 |
| Parameters | model parameter 수 |

`TP`, `FP`, `TN`, `FN`은 `ResNet18`과 `MobileNetV2` 비교에만 사용합니다.

## 보고서 활용

`docs/evaluation_summary.csv` 또는 script output을 사용하여 model별 accuracy, precision, recall, average processing time, parameters를 보고서 표에 넣습니다.
