# AI Object Recognition Alarm App

사용자가 목표 물체를 촬영해야 알람을 해제할 수 있는 Android AI 알람 앱입니다.

## 프로젝트 개요

일반 알람은 버튼 한 번으로 쉽게 꺼질 수 있습니다. 이 프로젝트는 알람을 끄기 위해 사용자가 특정 물체를 직접 찾아 사진으로 촬영하도록 만들어, 더 확실한 기상 행동을 유도합니다.

mobile app은 카메라로 이미지를 촬영하고 FastAPI backend로 전송합니다. backend는 PyTorch 기반 객체 인식을 수행한 뒤, 알람 해제 조건을 만족했는지 결과를 반환합니다.

## 문제 정의

기존 알람 앱은 사용자가 완전히 잠에서 깨지 않아도 쉽게 해제할 수 있습니다. 단순한 버튼 클릭 방식은 알람의 목적을 충분히 달성하지 못할 수 있습니다.

## 해결 방법

알람 해제 조건으로 객체 인식을 사용합니다. 사용자는 지정된 target object를 찾아 촬영해야 하며, backend가 confidence 또는 similarity 기준을 만족한다고 판단하면 알람이 해제됩니다. 기준을 만족하지 못하면 `Retake Photo`로 다시 촬영해야 합니다.

## 주요 기능

- alarm 생성
- alarm ON/OFF
- alarm 삭제
- alarm card menu를 통한 per-alarm test
- `General Object Mode`
- `Custom Object Mode`
- camera capture
- FastAPI backend로 image upload
- PyTorch inference
- `ResNet18`과 `MobileNetV2` 비교
- confidence/similarity threshold 적용
- processing time 표시
- custom object 등록, 선택, 삭제
- GitHub 제출용 문서 구조

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| Mobile app | React Native Expo, JavaScript |
| Backend | FastAPI, Python |
| AI inference | PyTorch, torchvision |
| Models | ResNet18, MobileNetV2 |
| Storage | AsyncStorage, local backend files |
| Evaluation | pandas, CSV/XLSX result files |

## 시스템 구조

```text
Android app -> Camera capture -> FastAPI backend -> PyTorch model
-> recognition result -> alarm dismissed or retake requested
```

자세한 구조는 `docs/system_architecture.md`에 정리되어 있습니다.

## 인식 모드

### General Object Mode

사용자는 `bottle`, `cup`, `book`, `keyboard`, `mouse`, `laptop`, `toothbrush`, `remote control` 같은 일반 물체를 여러 개 선택할 수 있습니다. 알람이 시작되면 선택한 물체 중 하나가 random target object로 정해집니다.

backend는 ImageNet pretrained classification model의 top-k prediction과 label mapping을 사용합니다. ImageNet label과 사용자가 보는 target object 이름이 다를 수 있기 때문에 mapping이 필요합니다.

### Custom Object Mode

사용자는 하나의 custom object를 여러 장의 사진으로 등록합니다. backend는 등록 사진에서 feature vector를 추출하고 평균 embedding을 저장합니다.

알람이 시작되면 사용자는 등록한 물체를 촬영해야 합니다. backend는 test image embedding과 저장된 embedding의 cosine similarity를 비교합니다.

## 실험 결과 요약

최종 실험에는 인터넷 이미지가 아니라 직접 촬영한 이미지를 사용했습니다.

### General Object Mode vs Custom Object Mode

출처: `docs/General,Custom비교.xlsx`

| Mode | Trials | Success | Success Rate | Avg Score/Similarity | Avg Processing Time |
|---|---:|---:|---:|---:|---:|
| General Object Mode | 40 | 29 | 72.5% | 0.5923 | 2.313s |
| Custom Object Mode | 40 | 36 | 90.0% | 0.9156 | 2.704s |

`Custom Object Mode`는 성공률이 더 높았고, `General Object Mode`는 평균 처리 시간이 조금 더 짧았습니다.

### ResNet18 vs MobileNetV2

출처: `docs/evaluation_summary.csv`, `docs/evaluation_results.csv`

| Model | TP | FP | TN | FN | Accuracy | Precision | Recall | Avg Processing Time | Parameters |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ResNet18 | 46 | 36 | 524 | 34 | 0.8906 | 0.5610 | 0.5750 | 63.16 ms | 11.69M |
| MobileNetV2 | 10 | 11 | 549 | 70 | 0.8734 | 0.4762 | 0.1250 | 49.81 ms | 3.50M |

`TP`, `FP`, `TN`, `FN`은 `ResNet18`과 `MobileNetV2` 비교에만 사용했습니다.

### 저조도 실험

출처: `docs/Lighting.xlsx`

| Light | Mode | Trials | Success | Success Rate | Avg Score/Similarity | Avg Processing Time |
|---|---|---:|---:|---:|---:|---:|
| On | General | 12 | 9 | 75.0% | 0.5726 | 2.425s |
| Low | General | 12 | 9 | 75.0% | 0.6014 | 2.292s |
| On | Custom | 12 | 12 | 100.0% | 0.9358 | 2.145s |
| Low | Custom | 12 | 9 | 75.0% | 0.8996 | 2.298s |

저조도 환경에서는 특히 `Custom Object Mode`의 성공률이 낮아졌습니다. processing time은 조명 조건에 따라 큰 차이를 보이지 않았습니다.

## Dataset

- `General Object Mode`는 직접 촬영한 test images를 사용했습니다.
- `Custom Object Mode`는 사용자가 직접 촬영해 등록한 object images를 사용했습니다.
- 최종 test dataset에는 인터넷 이미지를 사용하지 않았습니다.
- `test_images/`에는 model evaluation용 직접 촬영 이미지가 들어 있습니다.
- `docs/`에는 실험 결과 파일이 들어 있습니다.

## 실행 방법

### Backend 실행

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

### Mobile app 실행

```powershell
cd mobile-app
npm install
npx expo start -c
```

Android phone에서 `Expo Go`로 실행합니다.

### API_BASE_URL 설정

수정할 파일:

```text
mobile-app/constants/config.js
```

예시:

```javascript
export const API_BASE_URL = "http://YOUR_LAPTOP_IP:8000";
```

Android phone과 backend computer는 같은 Wi-Fi에 연결되어 있어야 합니다. local Wi-Fi 접속이 어렵다면 테스트용으로 `ngrok` 같은 tunneling tool을 사용할 수 있습니다.

##  테스트 방법

GitHub repository에서 source code와 문서를 확인할 수 있습니다. 실제 동작 테스트를 하려면 backend를 실행한 뒤 Expo app을 실행하면 됩니다. AI recognition은 server-based PyTorch inference로 동작하므로 backend가 실행 중이어야 합니다.

## 한계

- server-based inference 구조이므로 backend 실행이 필요합니다.
- Expo Go에서는 실제 Android background alarm 기능에 제한이 있습니다.
- `General Object Mode`는 ImageNet label과 mapping에 영향을 받습니다.
- `Custom Object Mode`는 full retraining이 아니라 feature similarity 기반입니다.
- 저조도나 흔들린 이미지는 정확도를 낮출 수 있습니다.

## 향후 개선 방향

- Android native exact alarm support
- TensorFlow Lite, PyTorch Mobile, ExecuTorch 등을 활용한 on-device inference
- 더 강한 low-light preprocessing
- custom object 관리 기능 개선
- user authentication

## CV 문장

English:

```text
Built an Android AI alarm app using React Native Expo, FastAPI, and PyTorch, requiring object recognition-based photo verification to dismiss alarms.
```

Korean:

```text
React Native Expo, FastAPI, PyTorch를 활용하여 목표 물체 촬영 인식에 성공해야 알람을 해제할 수 있는 Android AI 알람 앱을 개발했습니다.
```
