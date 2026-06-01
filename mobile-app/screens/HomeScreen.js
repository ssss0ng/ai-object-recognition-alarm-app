import React, { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import AlarmCard from "../components/AlarmCard";
import AppButton from "../components/AppButton";
import { GENERAL_MODE } from "../constants/modes";
import { checkHealth } from "../services/api";
import { getSavedAlarms } from "../services/storageService";
import { getRandomTargetObject } from "../services/alarmService";

export default function HomeScreen({ navigation }) {
  const [alarms, setAlarms] = useState([]);
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getSavedAlarms().then(setAlarms).catch(() => setAlarms([]));
    }, [])
  );

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

  function openAlarm(alarm) {
    if (!alarm.targetObject && !alarm.objectId) {
      Alert.alert("Alarm is incomplete", "Please create an alarm with a target object first.");
      return;
    }
    navigation.navigate("AlarmRinging", { alarm });
  }

  function startAlarmTest() {
    const usableAlarm = alarms.find((alarm) => alarm.targetObject || alarm.objectId);

    if (usableAlarm) {
      navigation.navigate("AlarmRinging", { alarm: usableAlarm });
      return;
    }

    const selectedObjects = ["bottle", "cup", "book"];
    const targetObject = getRandomTargetObject(selectedObjects);
    navigation.navigate("AlarmRinging", {
      alarm: {
        id: `test-${Date.now()}`,
        time: "Test",
        mode: GENERAL_MODE,
        selectedObjects,
        targetObject,
        active: true,
        notificationId: "expo-go-test"
      }
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Object Recognition Alarm</Text>
      <Text style={styles.subtitle}>Saved Alarms</Text>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No alarms yet. Create your first alarm.</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => openAlarm(item)}>
            <AlarmCard alarm={item} />
          </Pressable>
        )}
      />

      {message ? <Text style={message.includes("successfully") ? styles.success : styles.error}>{message}</Text> : null}

      <View style={styles.actions}>
        <AppButton title="Check Backend Connection" onPress={handleCheckBackend} loading={checking} />
        <AppButton title="Start Alarm Test" variant="secondary" onPress={startAlarmTest} />
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
