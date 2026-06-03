# 교수님 제출 가이드

## 제출 자료 목록

| Item | Description |
|---|---|
| 보고서 | 프로젝트 목적, 구현 내용, 실험 결과, 한계와 개선 방향 |
| 발표 자료 | 시스템 구조, demo flow, 실험 결과 요약 |
| source code | `backend/`, `mobile-app/`, `model-training/` |
| 사용 데이터 | `test_images/`, `docs/General,Custom비교.xlsx`, `docs/Lighting.xlsx`, CSV 결과 |
| GitHub URL | public repository URL |

## 확인 방법

교수님은 GitHub repository에서 source code와 문서를 확인할 수 있다. backend와 mobile app을 실행하면 실제 demo flow를 테스트할 수 있다.

## Backend 실행 방법

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

## Mobile App 실행 방법

```powershell
cd mobile-app
npm install
npx expo start -c
```

Android phone에서 `Expo Go`로 QR code를 scan한다.

## Expo Go 테스트 방법

1. backend server를 먼저 실행한다.
2. `mobile-app/constants/config.js`의 `API_BASE_URL`을 backend 주소로 설정한다.
3. mobile app에서 `Check Backend Connection`을 누른다.
4. alarm을 생성한다.
5. alarm card를 누르고 `Start Test`를 선택한다.
6. camera로 target object를 촬영한다.
7. `ResultScreen`에서 recognition result와 processing time을 확인한다.

## 데이터 제출 방식

실험 데이터는 다음 파일로 제출할 수 있다.

```text
docs/General,Custom비교.xlsx
docs/Lighting.xlsx
docs/evaluation_results.csv
docs/evaluation_summary.csv
test_images/
```

## Server-Based Inference 설명

본 프로젝트는 PyTorch model inference를 FastAPI backend에서 수행한다. 따라서 mobile app에서 AI recognition을 테스트하려면 backend server가 실행 중이어야 한다. 이 구조는 Python/PyTorch 기반 model inference를 안정적으로 사용하기 위한 선택이다.
