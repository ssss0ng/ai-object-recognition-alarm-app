# AI Object Recognition Alarm App Mobile

이 폴더는 `AI Object Recognition Alarm App`의 Android-first Expo 모바일 앱입니다.

앱의 목적은 알람이 울릴 때 사용자가 특정 물건을 카메라로 찍어야만 알람을 끌 수 있게 만드는 것입니다. 사진은 FastAPI 백엔드로 전송되고, 백엔드가 PyTorch 모델로 물건을 인식한 뒤 성공 여부를 앱에 돌려줍니다.

Google Play Store 배포는 필수 목표가 아닙니다. 이 프로젝트는 GitHub 포트폴리오와 대학교 과제 제출용이며, Expo로 실행하거나 필요할 때 APK로 빌드해서 테스트할 수 있습니다.

## 필요한 프로그램

1. `Node.js`
2. `Visual Studio Code`
3. Android 휴대폰
4. Android 휴대폰의 `Expo Go` 앱
5. 이미 만든 FastAPI 백엔드

`Node.js`는 JavaScript 앱을 실행하기 위한 프로그램입니다. Expo 앱은 `Node.js` 위에서 개발 서버를 실행합니다.

## 폴더 구조

```text
mobile-app/
  App.js
  app.json
  package.json
  screens/
  components/
  services/
  constants/
  README.md
```

## 지금 집이 아니어도 확인할 수 있는 것

집이 아니어도 아래 작업은 할 수 있습니다.

1. `npm install`로 모바일 앱 패키지가 설치되는지 확인
2. `npx expo start`로 Expo 개발 서버가 켜지는지 확인
3. 앱 화면이 열리는지 확인
4. `API_BASE_URL` 위치를 확인
5. 버튼과 화면 이동이 되는지 확인

다만 Android 휴대폰과 노트북이 같은 개인 Wi-Fi에 있지 않으면 로컬 FastAPI 백엔드 연결 테스트는 실패할 수 있습니다. 이 경우는 정상입니다.

## 나중에 집에서 꼭 테스트해야 하는 것

집에 가면 아래를 테스트해야 합니다.

1. Windows 노트북에서 FastAPI 백엔드 실행
2. Android 휴대폰과 노트북을 같은 Wi-Fi에 연결
3. 노트북 IP 주소 확인
4. `constants/config.js`의 `API_BASE_URL` 수정
5. 앱의 `Check Backend Connection` 버튼으로 연결 확인
6. `General Object Mode` 사진 업로드 테스트
7. `Custom Object Mode` 커스텀 객체 등록 및 판별 테스트

## 모바일 앱 설치 방법

Step 1: 터미널을 이 폴더에서 여세요:

```text
mobile-app/
```

Step 2: 필요한 패키지를 설치하세요:

```bash
npm install
```

Step 3: 예상 결과:

`node_modules/` 폴더가 생기고 오류 없이 설치가 끝나야 합니다.

Step 4: 오류가 나면:

`Node.js`가 설치되어 있는지 확인하세요. 터미널에서 아래 명령을 실행했을 때 버전이 보여야 합니다.

```bash
node -v
npm -v
```

## Expo 실행 방법

Step 1: 터미널을 이 폴더에서 여세요:

```text
mobile-app/
```

Step 2: Expo 개발 서버를 실행하세요:

```bash
npx expo start
```

Step 3: 예상 결과:

터미널에 QR 코드가 보입니다.

Step 4: Android 휴대폰에서 실행:

Android 휴대폰에서 `Expo Go` 앱을 열고 QR 코드를 스캔하세요.

Step 5: 성공 확인:

휴대폰 화면에 `AI Object Recognition Alarm` 홈 화면이 보이면 성공입니다.

## FastAPI 백엔드 먼저 실행하기

모바일 앱이 AI 인식을 하려면 백엔드가 먼저 켜져 있어야 합니다.

Step 1: 터미널을 이 폴더에서 여세요:

```text
backend/
```

Step 2: 가상환경을 켜세요:

```bash
venv\Scripts\activate
```

Step 3: FastAPI 서버를 실행하세요:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Step 4: 브라우저에서 확인하세요:

```text
http://127.0.0.1:8000/docs
```

Swagger UI 화면이 보이면 백엔드가 실행 중입니다.

## Windows에서 노트북 IP 주소 찾기

Android 휴대폰에서 노트북의 FastAPI 서버에 접속하려면 `127.0.0.1`을 쓰면 안 됩니다. `127.0.0.1`은 휴대폰 자기 자신을 뜻하기 때문입니다.

Step 1: Windows 터미널을 여세요.

Step 2: 아래 명령을 실행하세요:

```bash
ipconfig
```

Step 3: `IPv4 Address`를 찾으세요.

예시:

```text
IPv4 Address . . . . . . . . . . : 192.168.0.15
```

이 경우 노트북 IP 주소는 `192.168.0.15`입니다.

## API_BASE_URL 설정 방법

Step 1: 이 파일을 여세요:

```text
mobile-app/constants/config.js
```

Step 2: 아래 값을 바꾸세요:

```javascript
export const API_BASE_URL = "http://YOUR_LAPTOP_IP:8000";
```

Step 3: 예를 들어 노트북 IP가 `192.168.0.15`라면 이렇게 바꾸세요:

```javascript
export const API_BASE_URL = "http://192.168.0.15:8000";
```

Step 4: 저장한 뒤 Expo 앱을 새로고침하세요.

## Backend 연결 확인 방법

Step 1: 앱 홈 화면으로 가세요.

Step 2: `Check Backend Connection` 버튼을 누르세요.

Step 3: 성공하면 아래 메시지가 보입니다.

```text
Backend connected successfully.
```

Step 4: 실패하면 아래 메시지가 보입니다.

```text
Backend connection failed. Check API_BASE_URL or make sure FastAPI is running.
```

실패했다면 아래를 확인하세요.

1. FastAPI 서버가 켜져 있는지 확인
2. `API_BASE_URL`에 노트북 IP가 정확히 들어갔는지 확인
3. Android 휴대폰과 노트북이 같은 Wi-Fi인지 확인
4. Windows 방화벽이 Python 또는 `uvicorn` 연결을 막고 있지 않은지 확인

## Expo Go 알림 기능 제한 안내

Expo SDK 54에서 `Expo Go`는 Android의 `expo-notifications` push notification 기능을 완전히 지원하지 않습니다. 그래서 이 프로젝트는 과제 시연과 포트폴리오 테스트를 위해 `Expo Go` 호환 방식으로 동작하게 만들었습니다.

현재 Expo Go 테스트 모드에서는 실제 백그라운드 알림에 의존하지 않고, 홈 화면의 `Start Alarm Test` 버튼으로 알람 화면을 바로 열 수 있습니다.

이 방식으로 아래 핵심 흐름을 테스트할 수 있습니다.

```text
alarm screen -> camera -> backend image recognition -> result -> alarm dismiss/fail
```

즉, 교수님이 확인해야 하는 AI 알람 인식 흐름은 Expo Go에서도 테스트할 수 있습니다.

다만 실제 Android 기본 알람 앱처럼 시간이 되면 백그라운드에서 정확히 울리는 기능은 `Expo Go`만으로는 한계가 있습니다. 이 기능은 나중에 `development build` 또는 Android native exact alarm 기능으로 개선할 수 있습니다.

Google Play Store 배포는 교수님이 명확히 요구하지 않는 한 필수 작업이 아닙니다.

## Start Alarm Test 사용 방법

Step 1: 앱 홈 화면을 여세요.

Step 2: `Start Alarm Test` 버튼을 누르세요.

Step 3: `Alarm Ringing` 화면이 열리는지 확인하세요.

Step 4: `Open Camera`를 누르세요.

Step 5: 물건을 촬영한 뒤 `Submit for Recognition`을 누르세요.

Step 6: 백엔드 연결이 되어 있다면 AI 인식 결과 화면이 나옵니다.

집이 아니라서 백엔드 연결이 안 되는 경우에는 업로드 단계에서 실패할 수 있습니다. 이때는 앱 문제가 아니라 `API_BASE_URL`, 같은 Wi-Fi, 또는 ngrok 설정 문제일 가능성이 큽니다.

## General Object Mode 테스트 방법

Step 1: 홈 화면에서 `Create Alarm`을 누르세요.

Step 2: 알람 시간을 `07:30`처럼 입력하세요.

Step 3: `General Object Mode`를 선택하세요.

Step 4: `Continue`를 누르세요.

Step 5: 물건을 하나 이상 선택하세요.

Step 6: `Save Alarm`을 누르세요.

Step 7: 홈 화면에서 저장된 알람 카드를 누르세요.

Step 8: `Open Camera`를 누르고 목표 물건을 촬영하세요.

Step 9: `Submit for Recognition`을 누르세요.

성공하면 `Alarm dismissed successfully.`가 보입니다. 실패하면 `Retake Photo`를 눌러 다시 촬영하세요.

## Custom Object Mode 테스트 방법

Step 1: 홈 화면에서 `Register Custom Object`를 누르세요.

Step 2: `Custom Object ID`에 예를 들어 `my_bottle`을 입력하세요.

Step 3: 같은 물건을 다른 각도에서 최소 5장 촬영하세요.

Step 4: `Register Custom Object`를 누르세요.

Step 5: 등록이 성공하면 백엔드의 `embeddings/` 폴더에 임베딩 파일이 저장됩니다.

Step 6: 알람 생성 과정에서 `Custom Object Mode`를 선택하고 같은 방식으로 사진을 찍어 테스트하세요.

## ngrok으로 임시 외부 테스트하기

ngrok은 내 노트북에서 실행 중인 백엔드를 임시 공개 URL로 열어주는 도구입니다. 같은 Wi-Fi가 아닐 때 교수님이나 다른 사람이 테스트해야 하면 사용할 수 있습니다.

Step 1: FastAPI 백엔드를 실행하세요:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Step 2: 다른 터미널에서 ngrok을 실행하세요:

```bash
ngrok http 8000
```

Step 3: ngrok이 보여주는 `https://...ngrok-free.app` 주소를 복사하세요.

Step 4: `mobile-app/constants/config.js`를 열고 아래처럼 바꾸세요:

```javascript
export const API_BASE_URL = "https://YOUR_NGROK_URL.ngrok-free.app";
```

Step 5: 앱에서 `Check Backend Connection` 버튼을 눌러 확인하세요.

## APK 빌드가 필요한 경우

Expo 테스트는 개발 단계에서는 충분합니다. 교수님이 직접 설치할 APK 파일을 요구하는 경우에만 APK 빌드를 진행하면 됩니다.

APK 빌드는 Google Play Store 배포와 다릅니다. APK는 휴대폰에 직접 설치할 수 있는 파일이고, Google Play Store 배포는 앱스토어에 정식 출시하는 과정입니다.

Step 1: EAS CLI를 설치하세요:

```bash
npm install -g eas-cli
```

Step 2: Expo 계정에 로그인하세요:

```bash
eas login
```

Step 3: EAS 설정을 만드세요:

```bash
eas build:configure
```

Step 4: Android APK 빌드를 실행하세요:

```bash
eas build -p android --profile preview
```

Google Play Store 출시는 교수님이 명확히 요구하지 않는 한 필수 작업이 아닙니다.

## 자주 나는 오류와 해결

### Network request failed

원인:

휴대폰이 백엔드 서버에 접속하지 못하는 상태입니다.

해결:

1. `API_BASE_URL`이 `http://노트북IP:8000`인지 확인하세요.
2. 휴대폰과 노트북이 같은 Wi-Fi인지 확인하세요.
3. FastAPI 서버가 실행 중인지 확인하세요.

### Backend connection failed

원인:

`GET /health` 요청에 실패했습니다.

해결:

브라우저에서 아래 주소를 열어 확인하세요.

```text
http://127.0.0.1:8000/health
```

노트북 브라우저에서는 되지만 휴대폰 앱에서는 안 되면 IP 주소나 Wi-Fi 문제일 가능성이 큽니다.

### Camera permission denied

원인:

휴대폰에서 카메라 권한을 거부했습니다.

해결:

Android 설정에서 `Expo Go` 앱의 카메라 권한을 허용하세요.

### API URL wrong

원인:

`constants/config.js`에 잘못된 주소가 들어갔습니다.

해결:

`ipconfig`로 확인한 `IPv4 Address`를 사용하세요.

### Phone and laptop are not on the same Wi-Fi

원인:

휴대폰은 모바일 데이터나 다른 Wi-Fi에 있고, 노트북은 다른 네트워크에 있을 수 있습니다.

해결:

휴대폰과 노트북을 같은 개인 Wi-Fi에 연결하세요. 학교나 카페 Wi-Fi는 기기 간 연결을 막을 수 있습니다.

## Expo 알림 제한

이 MVP는 Expo Go 테스트 안정성을 우선합니다. SDK 54의 Expo Go에서는 Android notification 기능이 제한되므로, 현재 앱은 `Start Alarm Test` 버튼과 앱 안의 진동으로 알람 흐름을 테스트합니다.

나중에 완성도를 높이려면 Android native exact alarm 기능을 추가할 수 있습니다.
