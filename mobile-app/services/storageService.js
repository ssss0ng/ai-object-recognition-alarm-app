import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  alarms: "saved_alarms",
  selectedGeneralObjects: "selected_general_objects",
  registeredCustomObjectIds: "registered_custom_object_ids",
  lastRecognitionMode: "last_recognition_mode",
  alarmConfig: "alarm_configuration"
};

async function readJson(key, fallback) {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

async function writeJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getSavedAlarms() {
  return readJson(KEYS.alarms, []);
}

export async function saveAlarm(alarm) {
  const alarms = await getSavedAlarms();
  const nextAlarms = [alarm, ...alarms.filter((item) => item.id !== alarm.id)];
  await writeJson(KEYS.alarms, nextAlarms);
  await writeJson(KEYS.alarmConfig, alarm);
  return nextAlarms;
}

export async function updateAlarm(updatedAlarm) {
  const alarms = await getSavedAlarms();
  const nextAlarms = alarms.map((alarm) => (alarm.id === updatedAlarm.id ? updatedAlarm : alarm));
  await writeJson(KEYS.alarms, nextAlarms);
  return nextAlarms;
}

export async function saveSelectedGeneralObjects(objects) {
  await writeJson(KEYS.selectedGeneralObjects, objects);
}

export async function getSelectedGeneralObjects() {
  return readJson(KEYS.selectedGeneralObjects, []);
}

export async function saveLastRecognitionMode(mode) {
  await AsyncStorage.setItem(KEYS.lastRecognitionMode, mode);
}

export async function getRegisteredCustomObjectIds() {
  return readJson(KEYS.registeredCustomObjectIds, []);
}

export async function addRegisteredCustomObjectId(objectId) {
  const objectIds = await getRegisteredCustomObjectIds();
  const nextObjectIds = Array.from(new Set([objectId, ...objectIds]));
  await writeJson(KEYS.registeredCustomObjectIds, nextObjectIds);
  return nextObjectIds;
}
