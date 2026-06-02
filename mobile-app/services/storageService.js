import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  alarms: "saved_alarms",
  selectedGeneralObjects: "selected_general_objects",
  registeredCustomObjectIds: "registered_custom_object_ids",
  registeredCustomObjects: "registered_custom_objects",
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

export async function getAlarms() {
  return getSavedAlarms();
}

export async function saveAlarms(alarms) {
  await writeJson(KEYS.alarms, alarms);
  return alarms;
}

export async function saveAlarm(alarm) {
  const alarms = await getSavedAlarms();
  const normalizedAlarm = {
    ...alarm,
    enabled: alarm.enabled ?? alarm.active ?? true,
    active: alarm.active ?? alarm.enabled ?? true,
    createdAt: alarm.createdAt || new Date().toISOString()
  };
  const nextAlarms = [normalizedAlarm, ...alarms.filter((item) => item.id !== normalizedAlarm.id)];
  await writeJson(KEYS.alarms, nextAlarms);
  await writeJson(KEYS.alarmConfig, normalizedAlarm);
  return nextAlarms;
}

export async function updateAlarm(alarmId, updatedFields) {
  const alarms = await getSavedAlarms();
  const nextAlarms = alarms.map((alarm) =>
    alarm.id === alarmId
      ? {
          ...alarm,
          ...updatedFields
        }
      : alarm
  );
  await writeJson(KEYS.alarms, nextAlarms);
  return nextAlarms;
}

export async function toggleAlarm(alarmId) {
  const alarms = await getSavedAlarms();
  const targetAlarm = alarms.find((alarm) => alarm.id === alarmId);
  if (!targetAlarm) {
    throw new Error("Alarm not found.");
  }

  const nextEnabled = !(targetAlarm.enabled ?? targetAlarm.active ?? true);
  return updateAlarm(alarmId, {
    enabled: nextEnabled,
    active: nextEnabled
  });
}

export async function deleteAlarm(alarmId) {
  const alarms = await getSavedAlarms();
  const nextAlarms = alarms.filter((alarm) => alarm.id !== alarmId);
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

export async function getRegisteredCustomObjects() {
  const savedObjects = await readJson(KEYS.registeredCustomObjects, []);
  const savedObjectIds = await getRegisteredCustomObjectIds();
  const normalizedObjects = savedObjects.map((item) => (typeof item === "string" ? { id: item, name: item } : item));
  const objectsFromIds = savedObjectIds.map((id) => ({ id, name: id }));
  const mergedObjects = [...normalizedObjects, ...objectsFromIds];
  const uniqueObjects = new Map();

  mergedObjects.forEach((item) => {
    const id = item.id || item.object_id || item.name;
    if (id) {
      uniqueObjects.set(id, {
        id,
        name: item.name || id,
        createdAt: item.createdAt || null
      });
    }
  });

  return Array.from(uniqueObjects.values());
}

export async function saveRegisteredCustomObjects(objects) {
  await writeJson(KEYS.registeredCustomObjects, objects);
  await writeJson(
    KEYS.registeredCustomObjectIds,
    objects.map((item) => item.id)
  );
  return objects;
}

export async function deleteRegisteredCustomObject(objectId) {
  const objects = await getRegisteredCustomObjects();
  const nextObjects = objects.filter((item) => item.id !== objectId);
  await saveRegisteredCustomObjects(nextObjects);
  return nextObjects;
}

export async function addRegisteredCustomObjectId(objectId) {
  const objects = await getRegisteredCustomObjects();
  const nextObjects = [
    {
      id: objectId,
      name: objectId,
      createdAt: new Date().toISOString()
    },
    ...objects.filter((item) => item.id !== objectId)
  ];
  await saveRegisteredCustomObjects(nextObjects);
  return nextObjects.map((item) => item.id);
}
