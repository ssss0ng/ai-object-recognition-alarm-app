import React, { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AlarmCard from "../components/AlarmCard";
import AppButton from "../components/AppButton";
import { GENERAL_MODE } from "../constants/modes";
import { checkHealth } from "../services/api";
import { getSavedAlarms } from "../services/storageService";
import { getRandomTargetObject, prepareAlarmForRinging } from "../services/alarmService";

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
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
    const hasGeneralObjects = alarm.mode === GENERAL_MODE && Array.isArray(alarm.selectedObjects) && alarm.selectedObjects.length > 0;
    const hasCustomObject = Boolean(alarm.objectId);

    if (!hasGeneralObjects && !hasCustomObject) {
      Alert.alert("Alarm is incomplete", "Please create an alarm with a target object first.");
      return;
    }

    try {
      navigation.navigate("AlarmRinging", { alarm: prepareAlarmForRinging(alarm) });
    } catch (error) {
      Alert.alert("Alarm start failed", error.message);
    }
  }

  function startAlarmTest() {
    const usableAlarm = alarms.find(
      (alarm) =>
        (alarm.mode === GENERAL_MODE && Array.isArray(alarm.selectedObjects) && alarm.selectedObjects.length > 0) ||
        alarm.objectId
    );

    if (usableAlarm) {
      try {
        navigation.navigate("AlarmRinging", { alarm: prepareAlarmForRinging(usableAlarm) });
      } catch (error) {
        Alert.alert("Alarm test failed", error.message);
      }
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
    <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
      <Text style={styles.title}>AI Object Recognition Alarm</Text>
      <Text style={styles.subtitle}>Saved Alarms</Text>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
