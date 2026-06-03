# AI Object Recognition Alarm App Mobile

이 폴더는 `AI Object Recognition Alarm App`의 React Native Expo mobile app이다.

## 실행 준비

필요한 프로그램:

- `Node.js`
- `npm`
- Android phone
- `Expo Go`
- 실행 중인 FastAPI backend

## 패키지 설치

```powershell
cd mobile-app
npm install
```

## Expo 실행

```powershell
npx expo start -c
```

Android phone에서 `Expo Go`를 열고 QR code를 scan한다.

## API_BASE_URL 설정

파일:

```text
mobile-app/constants/config.js
```

예시:

```javascript
export const API_BASE_URL = "http://192.168.0.15:8000";
```

주의:

- `127.0.0.1`은 Android phone 자기 자신을 의미하므로 backend computer에 접속할 수 없다.
- Android phone과 backend computer는 같은 Wi-Fi에 있어야 한다.
- backend computer의 IPv4 주소를 사용해야 한다.

Windows에서 IP 확인:

```powershell
ipconfig
```

## Backend 연결 확인

1. backend server를 먼저 실행한다.
2. app의 `HomeScreen`에서 `Check Backend Connection`을 누른다.
3. 성공하면 `Backend connected successfully.`가 표시된다.

실패하면 다음을 확인한다.

- backend server가 실행 중인지 확인
- `API_BASE_URL`이 정확한지 확인
- 같은 Wi-Fi에 연결되어 있는지 확인
- Windows firewall이 Python 또는 `uvicorn` 연결을 막지 않는지 확인

## 알람 생성

1. `HomeScreen`에서 `Create Alarm`을 누른다.
2. alarm time을 입력한다.
3. mode를 선택한다.
4. target object를 선택하거나 custom object를 선택한다.
5. `Save Alarm`을 누른다.

## General Object Mode 사용 방법

`General Object Mode`에서는 여러 일반 object를 선택할 수 있다.

지원 object:

```text
bottle
cup
book
keyboard
mouse
laptop
toothbrush
remote control
```

alarm이 시작되면 선택된 object 중 하나가 random target object로 선택된다. backend는 ImageNet pretrained model의 top-k prediction과 label mapping을 사용한다.

## Custom Object Mode 사용 방법

### Custom Object 등록

1. `HomeScreen`에서 `Register Custom Object`를 누른다.
2. `Custom Object ID`를 입력한다.
3. 같은 물체를 최소 5장 이상 촬영한다.
4. `Register Custom Object`를 누른다.

`object_id` 규칙:

- lowercase English letters, numbers, underscores만 사용
- spaces, Korean characters, hyphens 사용 금지
- 좋은 예: `my_bottle`, `blue_cup`, `study_book`

사진 촬영 guide:

- 같은 물건을 최소 5장 이상 촬영
- front, side, top 등 다양한 각도 포함
- close-up과 farther photo 모두 포함
- 물체 전체가 보이도록 촬영
- 너무 어둡거나 흔들린 사진은 피하기

### Custom Object 선택

`Create Alarm`에서 `Custom Object Mode`를 선택하면 `CustomObjectSelectScreen`에서 등록된 object를 선택할 수 있다.

### Custom Object 삭제

`CustomObjectSelectScreen`에서 각 object의 `Delete`를 누르면 삭제할 수 있다. 단, 해당 custom object를 사용하는 saved alarm이 있으면 삭제가 차단된다.

## 알람 테스트 방법

`HomeScreen`에는 global `Start Alarm Test` 버튼이 없다. 각 alarm의 설정을 사용해야 하므로 alarm card menu에서 테스트한다.

1. `HomeScreen`에서 saved alarm card를 누른다.
2. `Alarm management` menu에서 `Start Test`를 선택한다.
3. `AlarmRingingScreen`에서 target object를 확인한다.
4. `Open Camera`를 누른다.
5. target object를 촬영한다.
6. `Submit for Recognition`을 누른다.
7. `ResultScreen`에서 결과를 확인한다.

## ResultScreen 읽는 방법

### General Object Mode

| Field | Meaning |
|---|---|
| `Required target` | 알람 해제를 위해 촬영해야 하는 target object |
| `Top prediction` | model의 top-1 prediction |
| `Matched target label` | target과 관련된 ImageNet label |
| `Required confidence threshold` | success에 필요한 confidence threshold |
| `Processing time` | image upload, backend inference, response가 포함된 mobile API elapsed time |
| `Result` | `Succeeded` 또는 `Failed` |
| `Top predictions` | top-k prediction list |

### Custom Object Mode

| Field | Meaning |
|---|---|
| `Required object ID` | 등록된 custom object ID |
| `Similarity` | test image와 registered object embedding의 cosine similarity |
| `Required similarity threshold` | success에 필요한 similarity threshold |
| `Best match` | 가장 유사한 registered object |
| `Processing time` | recognition request에 걸린 시간 |
| `Result` | `Succeeded` 또는 `Failed` |

## Expo Go 제한

Expo Go에서는 Android background notification과 exact alarm 기능에 제한이 있다. 따라서 현재 앱은 과제 시연과 테스트를 위해 alarm card menu의 `Start Test` flow를 사용한다.

## Common Errors and Fixes

| Error | Fix |
|---|---|
| `Backend connection failed` | backend 실행, `API_BASE_URL`, Wi-Fi 확인 |
| `Network request failed` | phone과 backend computer가 같은 network인지 확인 |
| camera permission denied | Android 설정에서 `Expo Go` camera permission 허용 |
| recognition always fails | target object, lighting, blur, threshold 확인 |
| custom object delete blocked | 해당 object를 사용하는 alarm을 먼저 삭제 |
