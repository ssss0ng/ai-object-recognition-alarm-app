# AI Object Recognition Alarm App

사용자가 목표 물체를 촬영해야 알람을 해제할 수 있는 Android AI 알람 앱입니다.

## 프로젝트 개요

일반 알람은 버튼 한 번으로 쉽게 꺼집니다. 이 프로젝트는 알람을 끄기 위해 사용자가 특정 물체를 직접 찾아 사진으로 촬영하도록 만들어, 더 확실한 기상 행동을 유도합니다.

mobile app은 카메라로 이미지를 촬영하고 FastAPI backend로 전송합니다. backend는 PyTorch 기반 객체 인식을 수행한 뒤, 알람 해제 조건을 만족했는지 결과를 반환합니다.

## 문제 정의와 해결 방법

기존 알람 앱은 사용자가 완전히 잠에서 깨지 않아도 쉽게 해제할 수 있습니다. 단순한 버튼 클릭 방식은 알람의 목적을 충분히 달성하지 못할 수 있습니다.

알람 해제 조건으로 객체 인식을 사용합니다. 사용자는 지정된 target object를 찾아 촬영해야 하며, backend가 confidence 또는 similarity 기준을 만족한다고 판단하면 알람이 해제됩니다. 기준을 만족하지 못하면 Retake Photo로 다시 촬영해야 합니다.

## 주요 기능

- alarm 생성
- alarm ON/OFF
- alarm 삭제
- alarm card menu를 통한 alarm test
- General Object Mode
- Custom Object Mode
- camera capture
- FastAPI backend로 image upload
- processing time 표시
- custom object 등록, 선택, 삭제

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

자세한 구조는 docs/system_architecture.md에 정리되어 있습니다.

## 인식 모드

### General Object Mode

사용자는 알람을 생성할 때 `bottle`, `cup`, `book`, `keyboard`, `mouse`, `laptop`, `toothbrush`, `remote control` 같은 일반 물체를 여러 개 선택할 수 있습니다. 알람이 시작되면 선택한 물체 중 하나가 random target object로 정해집니다.

backend는 ImageNet pretrained classification model의 top-k prediction과 label mapping을 사용합니다. ImageNet label과 사용자가 보는 target object 이름이 다를 수 있기 때문에 mapping이 필요합니다.

### Custom Object Mode

사용자는 하나의 custom object를 여러 장의 사진으로 등록합니다. backend는 등록 사진에서 feature vector를 추출하고 평균 embedding을 저장합니다.

알람이 시작되면 사용자는 등록한 물체를 촬영해야 합니다. backend는 test image embedding과 저장된 embedding의 cosine similarity를 비교합니다.

## 실험 결과 요약

최종 실험에는 인터넷 이미지가 아니라 직접 촬영한 이미지를 사용했습니다.

### General Object Mode vs Custom Object Mode

출처: docs/General,Custom비교.xlsx

| Mode | Trials | Success | Success Rate | Avg Score/Similarity | Avg Processing Time |
|---|---:|---:|---:|---:|---:|
| General Object Mode | 40 | 29 | 72.5% | 0.5923 | 2.313s |
| Custom Object Mode | 40 | 36 | 90.0% | 0.9156 | 2.704s |

Custom Object Model 성공률이 더 높았고, General Object Mode는 평균 처리 시간이 조금 더 짧았습니다.

### ResNet18 vs MobileNetV2

출처: docs/evaluation_summary.csv, docs/evaluation_results.csv

| Model | TP | FP | TN | FN | Accuracy | Precision | Recall | Avg Processing Time | Parameters |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ResNet18 | 46 | 36 | 524 | 34 | 0.8906 | 0.5610 | 0.5750 | 63.16 ms | 11.69M |
| MobileNetV2 | 10 | 11 | 549 | 70 | 0.8734 | 0.4762 | 0.1250 | 49.81 ms | 3.50M |

ResNet18은 MobileNetV2보다 accuracy, precision, recall이 더 높았고, MobileNetV2는 ResNet18보다 processing time이 빠르며 parameter 수가 적었습니다.

### 저조도 실험

출처: docs/Lighting.xlsx

| Light | Mode | Trials | Success | Success Rate | Avg Score/Similarity | Avg Processing Time |
|---|---|---:|---:|---:|---:|---:|
| On | General | 12 | 9 | 75.0% | 0.5726 | 2.425s |
| Low | General | 12 | 9 | 75.0% | 0.6014 | 2.292s |
| On | Custom | 12 | 12 | 100.0% | 0.9358 | 2.145s |
| Low | Custom | 12 | 9 | 75.0% | 0.8996 | 2.298s |

저조도 환경에서는 특히 Custom Object Mode의 성공률이 낮아졌습니다. processing time은 조명 조건에 따라 큰 차이를 보이지 않았습니다.

## Dataset

- General Object Mode는 직접 촬영한 test images를 사용했습니다.
- Custom Object Mode    는 사용자가 직접 촬영해 등록한 object images를 사용했습니다.
- 최종 test dataset에는 인터넷 이미지를 사용하지 않았습니다.
- test_images/에는 model evaluation용 직접 촬영 이미지가 들어 있습니다.
- docs/에는 실험 결과 파일이 들어 있습니다.

## 실행 방법

이 프로젝트는 mobile-app과 backend를 따로 실행해야 합니다. mobile app은 화면, 알람 flow, camera capture를 담당하고, backend는 PyTorch model inference를 담당합니다. 따라서 실제 객체 인식 테스트를 하려면 backend server가 먼저 실행되어 있어야 합니다.

### 1. Project 다운로드

GitHub repository를 clone합니다.

```powershell
git clone https://github.com/ssss0ng/ai-object-recognition-alarm-app.git
cd ai-object-recognition-alarm-app
```

ZIP 파일로 받은 경우에는 압축을 푼 뒤 project root folder에서 terminal을 엽니다.

### 2. Backend 실행

backend folder로 이동합니다.

```powershell
cd backend
```

Python virtual environment를 만듭니다.

```powershell
python -m venv venv
```

Windows에서 virtual environment를 활성화합니다.

```powershell
venv\Scripts\activate
```

필요한 Python package를 설치합니다.

```powershell
pip install -r requirements.txt
```

FastAPI server를 실행합니다.

```powershell
uvicorn main:app --host 0.0.0.0 --port 8000
```

실행이 성공하면 terminal에 `Uvicorn running on http://0.0.0.0:8000`과 비슷한 메시지가 보입니다. 이 terminal은 backend server용이므로 앱 테스트가 끝날 때까지 닫지 않습니다.

Swagger UI는 browser에서 아래 주소로 확인할 수 있습니다.

```text
http://127.0.0.1:8000/docs
```

Swagger UI에서 `GET /health`를 실행했을 때 정상 응답이 오면 backend가 실행 중인 것입니다.

### 3. Backend computer IP 확인

Android phone에서 backend에 접속하려면 `127.0.0.1`이 아니라 backend computer의 Wi-Fi IP address를 사용해야 합니다.

Windows terminal에서 아래 명령을 실행합니다.

```powershell
ipconfig
```

출력 중 `IPv4 Address` 값을 찾습니다.

예시:

```text
IPv4 Address . . . . . . . . . . : 192.168.0.15
```

이 경우 backend 주소는 다음과 같습니다.

```text
http://192.168.0.15:8000
```

### 4. API_BASE_URL 설정

mobile app이 backend에 접속할 수 있도록 아래 파일을 수정합니다.

```text
mobile-app/constants/config.js
```

예시:

```javascript
export const API_BASE_URL = "http://192.168.0.15:8000";
```

주의:

- Android phone과 backend computer는 같은 Wi-Fi에 연결되어 있어야 합니다.
- Android phone에서 `127.0.0.1`은 phone 자기 자신을 의미하므로 backend computer에 접속할 수 없습니다.
- backend server terminal이 꺼져 있으면 recognition request가 실패합니다.

### 5. Mobile app 실행

새 terminal을 열고 project root에서 mobile app folder로 이동합니다.

```powershell
cd mobile-app
```

필요한 npm package를 설치합니다.

```powershell
npm install
```

Expo development server를 실행합니다.

```powershell
npx expo start -c
```

terminal에 QR code가 나타나면 Android phone에서 `Expo Go` app을 열고 QR code를 scan합니다.

### 6. Backend 연결 확인

앱이 실행되면 `HomeScreen`에서 `Check Backend Connection` 버튼을 누릅니다.

성공 시:

```text
Backend connected successfully.
```

실패 시:

```text
Backend connection failed. Check API_BASE_URL or make sure FastAPI is running.
```

실패하면 아래를 확인합니다.

1. backend server가 켜져 있는지 확인합니다.
2. `API_BASE_URL`이 backend computer의 IPv4 address로 되어 있는지 확인합니다.
3. Android phone과 backend computer가 같은 Wi-Fi에 연결되어 있는지 확인합니다.
4. Windows firewall이 Python 또는 `uvicorn` 접속을 막고 있지 않은지 확인합니다.

## 테스트 방법

### General Object Mode 테스트

1. `HomeScreen`에서 `Create Alarm`을 누릅니다.
2. alarm time을 입력합니다.
3. `General Object Mode`를 선택합니다.
4. `bottle`, `cup`, `book`, `keyboard`, `mouse`, `laptop`, `toothbrush`, `remote control` 중 하나 이상을 선택합니다.
5. `Save Alarm`을 누릅니다.
6. `HomeScreen`에서 생성된 alarm card를 누릅니다.
7. `Alarm management` menu에서 `Start Test`를 선택합니다.
8. `AlarmRingingScreen`에서 required target object를 확인합니다.
9. `Open Camera`를 누르고 target object를 촬영합니다.
10. `Submit for Recognition`을 누릅니다.
11. `ResultScreen`에서 아래 값을 확인합니다.

```text
Required target
Top prediction
Matched target label
Required confidence threshold
Processing time
Result
Top predictions
```

성공하면 `Return to Home`을 누르고, 실패하면 `Retake Photo`로 다시 촬영합니다.

### Custom Object Mode 테스트

먼저 custom object를 등록합니다.

1. `HomeScreen`에서 `Register Custom Object`를 누릅니다.
2. `Custom Object ID`를 입력합니다. 예: `my_bottle`
3. 같은 object를 최소 5장 이상 촬영합니다.
4. `Register Custom Object`를 누릅니다.

그다음 custom alarm을 만듭니다.

1. `HomeScreen`에서 `Create Alarm`을 누릅니다.
2. alarm time을 입력합니다.
3. `Custom Object Mode`를 선택합니다.
4. 등록된 custom object를 선택합니다.
5. `Use Selected Object`를 눌러 alarm을 저장합니다.
6. `HomeScreen`에서 alarm card를 누릅니다.
7. `Alarm management` menu에서 `Start Test`를 선택합니다.
8. `Open Camera`를 누르고 등록한 object를 촬영합니다.
9. `Submit for Recognition`을 누릅니다.
10. `ResultScreen`에서 아래 값을 확인합니다.

```text
Required object ID
Similarity
Required similarity threshold
Best match
Processing time
Result
```

## 한계

- server-based inference 구조이므로 backend 실행이 필요합니다.
- Expo Go에서는 실제 Android background alarm 기능에 제한이 있습니다.
- 저조도나 흔들린 이미지는 정확도를 낮출 수 있습니다.

## 향후 개선 방향

- 실제 알람기능 지원
- TensorFlow Lite, PyTorch Mobile, ExecuTorch 등을 활용한 on-device inference
- 더 강한 low-light preprocessing

