# API Documentation

Backend base URL 예시:

```text
http://127.0.0.1:8000
```

## GET /

backend 기본 상태를 확인합니다.

Response example:

```json
{
  "message": "AI Object Recognition Alarm App Backend",
  "status": "running"
}
```

## GET /health

backend와 model loading 상태를 확인합니다.

## GET /objects/general

지원하는 general object 목록을 반환합니다.

Example objects:

```text
bottle, cup, book, keyboard, mouse, laptop, toothbrush, remote control
```

## POST /predict/general

`General Object Mode`에서 image recognition을 수행합니다.

Form fields:

| Field | 설명 |
|---|---|
| `file` | 업로드할 image file |
| `target_object` | 선택된 target object |
| `model_name` | `resnet` 또는 `mobilenet` |

Response fields:

| Field | 설명 |
|---|---|
| `mode` | recognition mode, 여기서는 `general` |
| `target_object` | 알람 해제를 위해 필요한 target object |
| `top_prediction` | model의 top-1 prediction |
| `predicted_object` | matched prediction이 있으면 해당 prediction, 없으면 top prediction |
| `confidence` | matched confidence 또는 top prediction confidence |
| `threshold` | success 판단에 사용하는 confidence threshold |
| `matched_label` | target과 관련 있다고 판단된 mapped label |
| `top_predictions` | top-k prediction list |
| `allowed_labels` | target object에 허용된 mapped ImageNet labels |
| `success` | recognition 성공 여부 |

## POST /custom/register

custom object를 여러 장의 이미지로 등록합니다.

Form fields:

| Field | 설명 |
|---|---|
| `object_id` | custom object ID |
| `files` | 최소 5장의 등록 이미지 |

저장 위치:

```text
backend/embeddings/
backend/registered_objects/
```

## POST /predict/custom

`Custom Object Mode`에서 등록된 object와 test image의 similarity를 비교합니다.

Form fields:

| Field | 설명 |
|---|---|
| `object_id` | 등록된 custom object ID |
| `file` | 업로드할 test image |

Response fields:

| Field | 설명 |
|---|---|
| `object_id` | required object ID |
| `similarity` | cosine similarity |
| `threshold` | success 판단에 사용하는 similarity threshold |
| `best_match_object_id` | 가장 유사한 registered object |
| `second_best_object_id` | 두 번째로 유사한 registered object |
| `margin` | best match와 second best의 similarity 차이 |
| `success` | recognition 성공 여부 |

## GET /objects/custom

등록된 custom object 목록을 반환합니다.

## DELETE /custom/{object_id}

등록된 custom object의 embedding file과 metadata file을 삭제합니다.

주의: mobile app에서는 해당 custom object를 사용하는 saved alarm이 있으면 삭제를 막습니다.
