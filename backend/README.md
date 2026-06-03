# AI Object Recognition Alarm App Backend

이 폴더는 FastAPI 기반 backend입니다. mobile app에서 업로드한 이미지를 받아 PyTorch model inference를 수행하고, 알람 해제 성공 여부를 반환합니다.

## 주요 기능

- `ResNet18` 또는 `MobileNetV2` 기반 `General Object Mode` inference
- ImageNet top-k prediction
- user-facing target object와 ImageNet label mapping
- `Custom Object Mode` registration
- custom object cosine similarity matching
- Swagger UI를 통한 API 테스트

## 설치 방법

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## 실행 방법

```powershell
uvicorn main:app --host 0.0.0.0 --port 8000
```

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

## API Endpoints

| Endpoint | Method | 설명 |
|---|---|---|
| `/` | GET | backend 기본 상태 확인 |
| `/health` | GET | backend와 model 상태 확인 |
| `/objects/general` | GET | 지원하는 general object 목록 반환 |
| `/predict/general` | POST | `General Object Mode` 인식 수행 |
| `/custom/register` | POST | custom object 등록 |
| `/predict/custom` | POST | `Custom Object Mode` 인식 수행 |
| `/objects/custom` | GET | 등록된 custom object 목록 반환 |
| `/custom/{object_id}` | DELETE | 등록된 custom object 삭제 |

## General Object Mode Logic

1. mobile app이 `/predict/general`로 이미지를 업로드합니다.
2. backend가 이미지를 model input에 맞게 전처리합니다.
3. 선택한 model인 `resnet` 또는 `mobilenet`이 ImageNet top-k label을 예측합니다.
4. backend가 top-k label이 target object의 mapped label과 관련 있는지 확인합니다.
5. matched confidence가 threshold 이상이면 success가 `true`가 됩니다.

Threshold:

```text
GENERAL_CONFIDENCE_THRESHOLD = 0.40
```

## Custom Object Mode Logic

1. 사용자가 `/custom/register`로 custom object를 등록합니다.
2. backend가 여러 등록 이미지에서 embedding을 추출합니다.
3. 평균 embedding을 저장합니다.
4. test image가 `/predict/custom`으로 업로드됩니다.
5. backend가 test embedding과 saved embedding의 cosine similarity를 비교합니다.
6. similarity가 threshold 이상이고 best-match 조건을 만족하면 success가 `true`가 됩니다.

Threshold:

```text
CUSTOM_SIMILARITY_THRESHOLD = 0.88
```

## 저장 위치

runtime 중 생성되는 custom object data는 아래에 저장됩니다.

```text
backend/embeddings/
backend/registered_objects/
```

이 폴더들은 실행 중 생성되는 data를 담기 때문에 Git에는 올리지 않습니다.

## API Test Examples

### Health Check

```powershell
curl http://127.0.0.1:8000/health
```

### General Prediction

```powershell
curl -X POST "http://127.0.0.1:8000/predict/general" -F "file=@test.jpg" -F "target_object=bottle" -F "model_name=resnet"
```

### Custom Register

```powershell
curl -X POST "http://127.0.0.1:8000/custom/register" -F "object_id=my_bottle" -F "files=@image1.jpg" -F "files=@image2.jpg" -F "files=@image3.jpg" -F "files=@image4.jpg" -F "files=@image5.jpg"
```

### Custom Prediction

```powershell
curl -X POST "http://127.0.0.1:8000/predict/custom" -F "object_id=my_bottle" -F "file=@test.jpg"
```

### Custom Delete

```powershell
curl -X DELETE "http://127.0.0.1:8000/custom/my_bottle"
```

## 참고 사항

- 첫 실행 시 PyTorch pretrained model weights를 다운로드하므로 시간이 걸릴 수 있습니다.
- mobile app에서 recognition을 테스트하려면 backend가 먼저 실행 중이어야 합니다.
- `venv/`, `embeddings/`, `registered_objects/`, large model files는 Git에 올리지 않습니다.
