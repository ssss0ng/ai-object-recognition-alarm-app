import React, { useEffect } from "react";
import { StyleSheet, Text, Vibration, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "../components/AppButton";
import { GENERAL_MODE } from "../constants/modes";

export default function AlarmRingingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const alarm = route.params?.alarm;

  useEffect(() => {
    const vibrationPattern = [500, 700, 500, 700];
    Vibration.vibrate(vibrationPattern, true);

    return () => {
      Vibration.cancel();
    };
  }, []);

  if (!alarm) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.error}>No alarm data found.</Text>
      </View>
    );
  }

  const customObjectId = alarm.customObjectId || alarm.objectId;
  const targetText = alarm.mode === GENERAL_MODE ? alarm.targetObject : customObjectId;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>Alarm Ringing</Text>
      <Text style={styles.time}>{alarm.time}</Text>
      <Text style={styles.detail}>Mode: {alarm.mode}</Text>
      <Text style={styles.target}>Target object: {targetText}</Text>
      <Text style={styles.message}>Take a photo of this object to dismiss the alarm.</Text>
      <Text style={styles.note}>
        Expo Go test mode uses in-app vibration. Real background alarm sound can be added later with a development build.
      </Text>
      <AppButton
        title="Open Camera"
        onPress={() =>
          navigation.navigate("CameraCapture", {
            alarm,
            mode: alarm.mode,
            targetObject: alarm.targetObject,
            objectId: customObjectId
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 20,
    justifyContent: "center",
    gap: 12
  },
  title: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "900"
  },
  time: {
    color: "#2563eb",
    fontSize: 42,
    fontWeight: "900"
  },
  detail: {
    color: "#374151",
    fontSize: 17,
    fontWeight: "700"
  },
  target: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "900"
  },
  message: {
    color: "#374151",
    fontSize: 16,
    lineHeight: 22
  },
  note: {
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 18
  },
  error: {
    color: "#b91c1c",
    fontWeight: "800"
  }
});
