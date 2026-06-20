# 실험 결과 요약

## 실험 개요

본 프로젝트는 Android AI 알람 앱에서 객체 인식 기반 알람 해제 방식의 성능을 확인하기 위해 실험을 진행하였다. 실험 이미지는 인터넷 이미지가 아니라 사용자가 직접 촬영한 이미지와 앱에서 직접 등록한 custom object 이미지를 사용하였다.

주요 비교 대상은 다음과 같다.

- `General Object Mode`: ImageNet pretrained model의 top-k prediction과 label mapping을 사용한다.
- `Custom Object Mode`: 사용자가 직접 등록한 object embedding과 테스트 이미지 embedding의 cosine similarity를 비교한다.
- `ResNet18`과 `MobileNetV2`: 같은 test image set에서 pretrained model 기반 일반 객체 인식 성능을 비교한다.
- 조명 조건: 일반 조명 `On`과 저조도 `Low` 환경을 비교한다.

## General Object Mode 결과

출처: `docs/General,Custom비교.xlsx`

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

`General Object Mode`는 `mouse`와 `laptop`에서 높은 성공률을 보였지만, `toothbrush`는 5회 모두 실패하였다. 이는 ImageNet pretrained model이 `toothbrush`를 target-related label로 예측하지 못하고 `spindle`, `hammer`, `ballpoint` 등 다른 label로 예측했기 때문이다.

## Custom Object Mode 결과

출처: `docs/General,Custom비교.xlsx`

| Registered Object | Trials | Success | Success Rate | Avg Similarity | Avg Processing Time |
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

`Custom Object Mode`는 전체 성공률 90.0%로 `General Object Mode`보다 높았다. 특히 `toothbrush`는 `General Object Mode`에서 0.0%였지만 `Custom Object Mode`에서는 100.0% 성공하였다. 이는 사용자 지정 객체 등록 방식이 개인 물건 인식에 더 적합하다는 근거가 된다.

## ResNet18 vs MobileNetV2 비교

출처: `docs/evaluation_summary.csv`, `docs/evaluation_results.csv`

`TP`, `FP`, `TN`, `FN`은 ResNet18과 MobileNetV2 비교에만 사용한다.

| Model | TP | FP | TN | FN | Accuracy | Precision | Recall | Avg Processing Time | Parameters |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ResNet18 | 46 | 36 | 524 | 34 | 0.8906 | 0.5610 | 0.5750 | 63.16 ms | 11.69M |
| MobileNetV2 | 10 | 11 | 549 | 70 | 0.8734 | 0.4762 | 0.1250 | 49.81 ms | 3.50M |

`ResNet18`은 `MobileNetV2`보다 평균 처리 시간은 더 길지만, accuracy, precision, recall이 모두 높았다. `MobileNetV2`는 parameter 수가 더 적고 평균 처리 시간이 더 짧았지만, 본 프로젝트의 test image set에서는 threshold를 통과하는 성공률이 낮았다.

## 저조도 실험 결과

출처: `docs/Lighting.xlsx`

| Light | Mode | Trials | Success | Success Rate | Avg Score/Similarity | Avg Processing Time |
|---|---|---:|---:|---:|---:|---:|
| On | General | 12 | 9 | 75.0% | 0.5726 | 2.425s |
| Low | General | 12 | 9 | 75.0% | 0.6014 | 2.292s |
| On | Custom | 12 | 12 | 100.0% | 0.9358 | 2.145s |
| Low | Custom | 12 | 9 | 75.0% | 0.8996 | 2.298s |

저조도 환경에서 전체 성공률은 감소하였다. 특히 `Custom Object Mode`는 일반 조명에서 100.0% 성공했지만 저조도에서는 75.0%로 감소하였다. 이는 조명 변화로 인해 embedding similarity가 낮아질 수 있음을 보여준다.

## 실패 사례 분석

| Mode | Object | Failure Pattern | Interpretation |
|---|---|---|---|
| General | toothbrush | `spindle`, `hammer`, `ballpoint`, `screwdriver` 등으로 예측 | ImageNet label과 실제 target object의 불일치 |
| General | keyboard | 일부 trial에서 `remote control`로 예측 | 비슷한 직사각형 형태와 촬영 각도 영향 |
| Custom | laptop | similarity가 0.88 threshold 아래로 떨어짐 | 등록 사진과 테스트 사진의 각도, 거리, 화면 상태 차이 가능성 |
| Custom | cup | 일부 trial에서 similarity 0.8770 또는 0.8648 | threshold에 근접한 실패 |
| Low light | custom toothbrush | similarity가 0.88 아래로 감소 | 저조도 환경에서 feature 품질 저하 |

