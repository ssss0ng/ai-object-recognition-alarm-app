import { GENERAL_MODE } from "../constants/modes";

export function setupNotificationHandler() {
  // Expo SDK 54의 Expo Go에서는 Android push notification 기능이 완전히 지원되지 않습니다.
  // 과제 시연용 Expo Go 테스트에서는 앱 안의 Start Alarm Test 버튼으로 알람 흐름을 확인합니다.
  // 실제 백그라운드 알람/알림 기능은 나중에 development build 또는 Android native 기능으로 확장해야 합니다.
  return true;
}

export async function requestNotificationPermission() {
  // Expo Go 테스트 모드에서는 알림 권한을 요구하지 않습니다.
  return { status: "expo-go-fallback" };
}

function getNextAlarmDate(timeText) {
  const [hourText, minuteText] = timeText.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Please enter alarm time in HH:MM format.");
  }

  const now = new Date();
  const alarmDate = new Date();
  alarmDate.setHours(hour, minute, 0, 0);

  if (alarmDate <= now) {
    alarmDate.setDate(alarmDate.getDate() + 1);
  }

  return alarmDate;
}

export async function scheduleAlarm(alarmConfig) {
  getNextAlarmDate(alarmConfig.time);

  // Expo Go 호환 fallback입니다.
  // 알림을 예약하지 않고 저장 가능한 ID만 반환합니다.
  // HomeScreen의 Start Alarm Test 버튼으로 AlarmRingingScreen을 직접 열어 전체 AI 인식 흐름을 테스트합니다.
  return `expo-go-fallback-${Date.now()}`;
}

export async function cancelAlarm(alarmId) {
  return Boolean(alarmId);
}

export function getRandomTargetObject(selectedObjects) {
  if (!Array.isArray(selectedObjects) || selectedObjects.length === 0) {
    throw new Error("No selected objects available.");
  }
  const index = Math.floor(Math.random() * selectedObjects.length);
  return selectedObjects[index];
}

export function prepareAlarmForRinging(alarm) {
  if (alarm.mode !== GENERAL_MODE) {
    return alarm;
  }

  const targetObject = getRandomTargetObject(alarm.selectedObjects);
  console.log("Selected general objects:", alarm.selectedObjects);
  console.log("Random target object:", targetObject);

  return {
    ...alarm,
    targetObject
  };
}

export function handleNotificationResponse() {
  // 실제 앱에서는 알림을 탭했을 때 navigation ref로 AlarmRingingScreen 이동을 연결할 수 있습니다.
  // 이 MVP에서는 HomeScreen에서 저장된 알람을 눌러 알람 화면 테스트가 가능하게 만들었습니다.
  return true;
}
