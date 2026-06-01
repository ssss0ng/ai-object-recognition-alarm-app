import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "../components/AppButton";
import { CUSTOM_MODE, GENERAL_MODE } from "../constants/modes";
import { saveLastRecognitionMode } from "../services/storageService";

export default function AlarmSetupScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [time, setTime] = useState("");
  const [mode, setMode] = useState(GENERAL_MODE);

  async function continueSetup() {
    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert("Invalid time", "Please enter time like 07:30.");
      return;
    }

    await saveLastRecognitionMode(mode);
    const baseAlarm = {
      id: String(Date.now()),
      time,
      mode,
      active: true
    };

    if (mode === GENERAL_MODE) {
      navigation.navigate("GeneralObjectSelect", { baseAlarm });
    } else {
      navigation.navigate("CustomObjectRegister", { baseAlarm });
    }
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.label}>Alarm Time</Text>
      <TextInput
        value={time}
        onChangeText={setTime}
        placeholder="07:30"
        keyboardType="numbers-and-punctuation"
        style={styles.input}
      />

      <Text style={styles.label}>Recognition Mode</Text>
      <View style={styles.modeRow}>
        <AppButton title="General Object Mode" onPress={() => setMode(GENERAL_MODE)} variant={mode === GENERAL_MODE ? "primary" : "secondary"} />
        <AppButton title="Custom Object Mode" onPress={() => setMode(CUSTOM_MODE)} variant={mode === CUSTOM_MODE ? "primary" : "secondary"} />
      </View>

      <AppButton title="Continue" onPress={continueSetup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 20,
    gap: 14
  },
  label: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800"
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    fontSize: 16
  },
  modeRow: {
    gap: 10
  }
});
