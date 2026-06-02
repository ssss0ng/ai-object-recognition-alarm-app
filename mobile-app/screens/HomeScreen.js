import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AlarmCard from "../components/AlarmCard";
import AppButton from "../components/AppButton";
import { GENERAL_MODE } from "../constants/modes";
import { checkHealth } from "../services/api";
import { deleteAlarm, getSavedAlarms, toggleAlarm } from "../services/storageService";
import { cancelAlarm, prepareAlarmForRinging } from "../services/alarmService";

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [alarms, setAlarms] = useState([]);
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshAlarms();
    }, [])
  );

  async function refreshAlarms() {
    try {
      const savedAlarms = await getSavedAlarms();
      setAlarms(savedAlarms);
    } catch (error) {
      setAlarms([]);
      setMessage("Saved alarms could not be loaded.");
    }
  }

  async function handleCheckBackend() {
    setChecking(true);
    setMessage("");
    try {
      await checkHealth();
      setMessage("Backend connected successfully.");
    } catch (error) {
      setMessage("Backend connection failed. Check API_BASE_URL or make sure FastAPI is running.");
    } finally {
      setChecking(false);
    }
  }

  function validateAlarmForTest(alarm) {
    const hasGeneralObjects = alarm.mode === GENERAL_MODE && Array.isArray(alarm.selectedObjects) && alarm.selectedObjects.length > 0;
    const hasCustomObject = Boolean(alarm.customObjectId || alarm.objectId);

    if (!hasGeneralObjects && !hasCustomObject) {
      throw new Error("Please create an alarm with a target object first.");
    }
  }

  function testAlarm(alarm) {
    try {
      validateAlarmForTest(alarm);
      navigation.navigate("AlarmRinging", { alarm: prepareAlarmForRinging(alarm) });
    } catch (error) {
      Alert.alert("Alarm test failed", error.message);
    }
  }

  async function handleToggleAlarm(alarm) {
    try {
      const nextAlarms = await toggleAlarm(alarm.id);
      setAlarms(nextAlarms);
      setMessage(`Alarm turned ${(alarm.enabled ?? alarm.active ?? true) ? "OFF" : "ON"}.`);
    } catch (error) {
      Alert.alert("Alarm update failed", error.message);
    }
  }

  function confirmDeleteAlarm(alarm) {
    Alert.alert(
      "Delete alarm",
      "Are you sure you want to delete this alarm?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelAlarm(alarm.notificationId || alarm.id);
              const nextAlarms = await deleteAlarm(alarm.id);
              setAlarms(nextAlarms);
              setMessage("Alarm deleted.");
            } catch (error) {
              Alert.alert("Delete failed", error.message);
            }
          }
        }
      ],
      { cancelable: true }
    );
  }

  function showAlarmActions(alarm) {
    Alert.alert(
      "Alarm management",
      `${alarm.time} alarm`,
      [
        {
          text: (alarm.enabled ?? alarm.active ?? true) ? "Turn OFF" : "Turn ON",
          onPress: () => handleToggleAlarm(alarm)
        },
        {
          text: "Start Test",
          onPress: () => testAlarm(alarm)
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDeleteAlarm(alarm)
        },
        { text: "Cancel", style: "cancel" }
      ],
      { cancelable: true }
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
      <Text style={styles.title}>AI Object Recognition Alarm</Text>
      <Text style={styles.subtitle}>Saved Alarms</Text>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>No alarms yet. Create your first alarm.</Text>}
        renderItem={({ item }) => (
          <AlarmCard
            alarm={item}
            onToggle={() => handleToggleAlarm(item)}
            onPress={() => showAlarmActions(item)}
          />
        )}
      />

      {message ? <Text style={message.includes("successfully") ? styles.success : styles.error}>{message}</Text> : null}

      <View style={styles.actions}>
        <AppButton title="Check Backend Connection" onPress={handleCheckBackend} loading={checking} />
        <AppButton title="Create Alarm" onPress={() => navigation.navigate("AlarmSetup")} />
        <AppButton title="Register Custom Object" variant="secondary" onPress={() => navigation.navigate("CustomObjectRegister")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 20
  },
  title: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 18
  },
  subtitle: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10
  },
  empty: {
    color: "#6b7280",
    paddingVertical: 24,
    textAlign: "center"
  },
  listContent: {
    paddingBottom: 12
  },
  actions: {
    gap: 10,
    marginTop: 12
  },
  success: {
    color: "#047857",
    fontWeight: "700",
    marginVertical: 10
  },
  error: {
    color: "#b91c1c",
    fontWeight: "700",
    marginVertical: 10
  }
});
