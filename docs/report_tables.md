# 보고서용 표 정리

이 문서는 Word 보고서에 복사해서 사용할 수 있는 표를 정리한 것이다. 실험 수치는 `docs/General,Custom비교.xlsx`, `docs/Lighting.xlsx`, `docs/evaluation_summary.csv`, `docs/evaluation_results.csv`에서 확인된 값만 사용하였다.

## 1. 시스템 구성 요소

| Component | Description |
|---|---|
| `mobile-app/` | React Native Expo 기반 Android mobile app |
| `backend/` | FastAPI 기반 AI inference server |
| `model-training/` | model evaluation, benchmark, training helper scripts |
| `docs/` | 실험 결과, 보고서용 문서, 제출 가이드 |
| `test_images/` | 사용자가 직접 촬영한 test images |

## 2. 인식 방식 비교

| Mode | Input | Method | Score | Threshold | Strength | Limitation |
|---|---|---|---|---:|---|---|
| General Object Mode | User-captured target image | ImageNet classification + top-k label mapping | confidence | 0.40 | 별도 등록 없이 사용 가능 | ImageNet label mismatch 가능 |
| Custom Object Mode | Registered object images + test image | Feature embedding + cosine similarity | similarity | 0.88 | 개인 물건 인식에 적합 | 등록 사진 품질과 조명에 영향 |

## 3. 사용자 지정 객체 등록 데이터

| Item | Value |
|---|---|
| Minimum registration images | 5 images |
| Recommended capture conditions | front, side, top, close-up, farther photos |
| Storage | `backend/embeddings/`, `backend/registered_objects/` |
| Final test image source | Self-captured images |
| Internet-captured images | Not used |

## 4. 데이터 증강 방식

| Purpose | Method |
|---|---|
| Custom object embedding stability | Multiple captured images |
| Custom object registration variants | brightness adjustment, small rotation, original image |
| Low-light robustness | low-light normalization preprocessing |

## 5. FastAPI 주요 API

| Endpoint | Method | Purpose |
|---|---|---|
| `/` | GET | backend root status |
| `/health` | GET | backend/model health check |
| `/objects/general` | GET | supported general object list |
| `/predict/general` | POST | General Object Mode image recognition |
| `/custom/register` | POST | register custom object from multiple images |
| `/predict/custom` | POST | Custom Object Mode similarity recognition |
| `/objects/custom` | GET | list registered custom objects |
| `/custom/{object_id}` | DELETE | delete registered custom object |

## 6. 평가 지표 정의

| Metric | Formula | Meaning |
|---|---|---|
| Accuracy | `(TP + TN) / (TP + FP + TN + FN)` | 전체 예측 중 올바른 판단 비율 |
| Precision | `TP / (TP + FP)` | success라고 판단한 것 중 실제 정답 비율 |
| Recall | `TP / (TP + FN)` | 실제 정답 중 success로 판단한 비율 |
| Processing time | API elapsed time or inference time | recognition request에 걸린 시간 |

`TP`, `FP`, `TN`, `FN`은 `ResNet18`과 `MobileNetV2` 모델 비교에만 사용하였다.

## 7. 일반 객체 모드 실험 결과

| Target Object | Trials | Success | Success Rate | Avg Score | Avg Processing Time |
|---|---:|---:|---:|---:|---:|
| book | 5 | 4 | 80.0% | 0.5167 | 3.020s |
| bottle | 5 | 4 | 80.0% | 0.5732 | 1.724s |
| cup | 5 | 4 | 80.0% | 0.6761 | 2.354s |
| keyboard | 5 | 3 | 60.0% | 0.4422 | 2.142s |
| laptop | 5 | 5 | 100.0% | 0.5538 | 2.410s |
| mouse | 5 | 5 | 100.0% | 0.8514 | 2.240s |
| remote control | 5 | 4 | 80.0% | 0.7583 | 2.422s |
| toothbrush | 5 | 0 | 0.0% | 0.3664 | 2.194s |
| Overall | 40 | 29 | 72.5% | 0.5923 | 2.313s |

## 8. 사용자 지정 객체 모드 실험 결과

| Registered Object ID | Trials | Success | Success Rate | Avg Similarity | Avg Processing Time |
|---|---:|---:|---:|---:|---:|
| my_book | 5 | 5 | 100.0% | 0.9179 | 2.414s |
| my_bottle | 5 | 5 | 100.0% | 0.9148 | 4.694s |
| my_cup | 5 | 4 | 80.0% | 0.9116 | 2.202s |
| my_keyboard | 5 | 5 | 100.0% | 0.9406 | 2.744s |
| my_laptop | 5 | 3 | 60.0% | 0.8818 | 2.200s |
| my_mouse | 5 | 4 | 80.0% | 0.9271 | 2.668s |
| my_remote_control | 5 | 5 | 100.0% | 0.9258 | 2.378s |
| my_toothbrush | 5 | 5 | 100.0% | 0.9053 | 2.328s |
| Overall | 40 | 36 | 90.0% | 0.9156 | 2.704s |

## 9. ResNet18과 MobileNetV2 성능 비교

| Model | TP | FP | TN | FN | Accuracy | Precision | Recall | Avg Processing Time | Parameters |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ResNet18 | 46 | 36 | 524 | 34 | 0.8906 | 0.5610 | 0.5750 | 63.16 ms | 11.69M |
| MobileNetV2 | 10 | 11 | 549 | 70 | 0.8734 | 0.4762 | 0.1250 | 49.81 ms | 3.50M |

## 10. 모델별 객체 인식 상세 결과

| Model | Object | Trials | Success | Success Rate | Avg Confidence |
|---|---|---:|---:|---:|---:|
| ResNet18 | book | 10 | 5 | 50.0% | 0.5050 |
| ResNet18 | bottle | 10 | 6 | 60.0% | 0.5525 |
| ResNet18 | cup | 10 | 3 | 30.0% | 0.3342 |
| ResNet18 | keyboard | 10 | 5 | 50.0% | 0.4065 |
| ResNet18 | laptop | 10 | 7 | 70.0% | 0.4661 |
| ResNet18 | mouse | 10 | 10 | 100.0% | 0.8606 |
| ResNet18 | remote control | 10 | 10 | 100.0% | 0.8336 |
| ResNet18 | toothbrush | 10 | 0 | 0.0% | 0.3117 |
| MobileNetV2 | book | 10 | 0 | 0.0% | 0.0996 |
| MobileNetV2 | bottle | 10 | 3 | 30.0% | 0.2831 |
| MobileNetV2 | cup | 10 | 0 | 0.0% | 0.0892 |
| MobileNetV2 | keyboard | 10 | 0 | 0.0% | 0.1222 |
| MobileNetV2 | laptop | 10 | 0 | 0.0% | 0.1987 |
| MobileNetV2 | mouse | 10 | 7 | 70.0% | 0.4400 |
| MobileNetV2 | remote control | 10 | 0 | 0.0% | 0.1818 |
| MobileNetV2 | toothbrush | 10 | 0 | 0.0% | 0.0592 |

## 11. 저조도 환경 실험 결과

| Light | Mode | Trials | Success | Success Rate | Avg Score/Similarity | Avg Processing Time |
|---|---|---:|---:|---:|---:|---:|
| On | General | 12 | 9 | 75.0% | 0.5726 | 2.425s |
| Low | General | 12 | 9 | 75.0% | 0.6014 | 2.292s |
| On | Custom | 12 | 12 | 100.0% | 0.9358 | 2.145s |
| Low | Custom | 12 | 9 | 75.0% | 0.8996 | 2.298s |

## 12. 실패 사례 분석

| Case | Failure Cause | Evidence |
|---|---|---|
| General toothbrush | ImageNet label mismatch | `spindle`, `hammer`, `ballpoint`, `screwdriver` 등으로 예측 |
| General keyboard | Similar rectangular objects | 일부 trial에서 `remote control`로 예측 |
| Custom laptop | Similarity below threshold | 0.7933, 0.8681 등 threshold 0.88 미만 |
| Custom cup | Similarity close to threshold | 0.8770 또는 0.8648 |
| Low light custom object | Feature quality reduction | Low light에서 similarity 감소 |

## 13. GitHub 저장소 구성

| Path | Purpose |
|---|---|
| `README.md` | project overview and setup |
| `backend/README.md` | backend setup and API guide |
| `mobile-app/README.md` | mobile app setup and testing guide |
| `model-training/README.md` | evaluation and benchmark script guide |
| `docs/` | report support documents and experiment results |
| `.gitignore` | exclude dependencies, cache, runtime artifacts |
| `LICENSE` | MIT License |
