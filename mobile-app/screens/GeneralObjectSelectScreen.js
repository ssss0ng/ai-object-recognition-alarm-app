import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "../components/AppButton";
import ObjectCard from "../components/ObjectCard";
import { GENERAL_MODE } from "../constants/modes";
import { FALLBACK_GENERAL_OBJECTS } from "../constants/objects";
import { getGeneralObjects } from "../services/api";
import { scheduleAlarm } from "../services/alarmService";
import { saveAlarm, saveSelectedGeneralObjects } from "../services/storageService";

export default function GeneralObjectSelectScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { baseAlarm } = route.params;
  const [objects, setObjects] = useState(FALLBACK_GENERAL_OBJECTS);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [sourceMessage, setSourceMessage] = useState("Using local fallback object list.");

  useEffect(() => {
    getGeneralObjects()
      .then((data) => {
        setObjects(data);
        setSourceMessage("Loaded object list from backend.");
      })
      .catch(() => {
        setObjects(FALLBACK_GENERAL_OBJECTS);
        setSourceMessage("Backend unavailable. Using local fallback object list.");
      });
  }, []);

  function toggleObject(name) {
    setSelectedObjects((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    );
  }

  async function saveGeneralAlarm() {
    if (selectedObjects.length === 0) {
      Alert.alert("No selected objects", "Please select at least one object.");
      return;
    }

    setSaving(true);
    try {
      const notificationId = await scheduleAlarm(baseAlarm);
      const alarm = {
        ...baseAlarm,
        mode: GENERAL_MODE,
        selectedObjects,
        notificationId
      };
      console.log("Saved selected general objects:", selectedObjects);
      await saveSelectedGeneralObjects(selectedObjects);
      await saveAlarm(alarm);
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Alarm save failed", error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
      <Text style={styles.message}>{sourceMessage}</Text>
      <FlatList
        data={objects}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ObjectCard name={item} selected={selectedObjects.includes(item)} onPress={() => toggleObject(item)} />
        )}
      />
      <Text style={styles.count}>Selected: {selectedObjects.length}</Text>
      <AppButton title="Save Alarm" onPress={saveGeneralAlarm} loading={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 20
  },
  message: {
    color: "#4b5563",
    marginBottom: 12,
    fontWeight: "600"
  },
  listContent: {
    paddingBottom: 12
  },
  count: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
    marginVertical: 10
  }
});
