# 평가 계획

## 평가 목적

본 평가는 AI Object Recognition Alarm App의 객체 인식 기반 알람 해제 성능을 확인하기 위해 수행한다. 평가의 핵심 목적은 `General Object Mode`, `Custom Object Mode`, `ResNet18`, `MobileNetV2`, 조명 조건에 따른 성능 차이를 분석하는 것이다.

최종 test dataset은 인터넷 이미지가 아니라 사용자가 직접 촬영한 이미지로 구성한다.

## General Object Mode 평가 계획

`General Object Mode`에서는 사용자가 선택한 일반 생활 객체를 target object로 설정하고, backend가 ImageNet pretrained model의 top-k prediction과 label mapping을 사용하여 성공 여부를 판단한다.

평가 항목은 다음과 같다.

- target object
- top prediction
- matched target label
- confidence
- threshold
- result
- processing time

## Custom Object Mode 평가 계획

`Custom Object Mode`에서는 사용자가 여러 장의 사진으로 custom object를 등록한 뒤, 테스트 이미지와 등록 object embedding의 cosine similarity를 비교한다.

평가 항목은 다음과 같다.

- registered object ID
- best match
- similarity
- threshold
- result
- processing time

## ResNet18 vs MobileNetV2 비교

두 model은 같은 self-captured test image set에서 비교한다.

비교 항목은 다음과 같다.

- `TP`
- `FP`
- `TN`
- `FN`
- `Accuracy`
- `Precision`
- `Recall`
- average processing time
- parameters

`TP`, `FP`, `TN`, `FN`은 model 비교에만 사용한다.

## 평가 지표 정의

| Metric | Definition |
|---|---|
| TP | correct target object and app success |
| FP | wrong object but app success |
| TN | wrong object and app failure |
| FN | correct target object but app failure |

공식은 다음과 같다.

```text
Accuracy = (TP + TN) / (TP + FP + TN + FN)
Precision = TP / (TP + FP)
Recall = TP / (TP + FN)
```

## Processing Time 측정

mobile app의 `ResultScreen`에 표시되는 `Processing time`은 mobile app 기준 API elapsed time이다. 이 값에는 image upload, backend inference, response time이 포함된다.

model-training 평가 script에서 측정되는 processing time은 model inference 중심의 시간이다.

## 저조도 실험

저조도 실험은 일반 조명 `On`과 저조도 `Low` 환경에서 같은 객체를 촬영하여 비교한다.

평가 항목은 다음과 같다.

- light condition
- mode
- object
- score or similarity
- threshold
- result
- processing time

## 실패 사례 분석

실패 사례는 다음 기준으로 정리한다.

- ImageNet label mismatch
- low confidence
- similarity below threshold
- similar-looking objects
- low-light or blurry images
- object too small or partially cropped

## 데이터 수집 규칙

- 최종 테스트에는 직접 촬영한 이미지를 사용한다.
- 같은 object는 가능한 비슷한 거리와 각도에서 반복 촬영한다.
- 저조도 실험에서는 조명 조건만 바꾸고 나머지 조건은 최대한 유지한다.
- 결과값은 `ResultScreen`, `docs/General,Custom비교.xlsx`, `docs/Lighting.xlsx`, `docs/evaluation_results.csv`, `docs/evaluation_summary.csv`에 기록한다.
- 누락된 값은 임의로 만들지 않고 `Not measured yet`로 표시한다.
