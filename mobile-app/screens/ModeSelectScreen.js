import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "../components/AppButton";
import { CUSTOM_MODE, GENERAL_MODE } from "../constants/modes";

export default function ModeSelectScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { baseAlarm } = route.params;

  useEffect(() => {
    if (baseAlarm?.mode === GENERAL_MODE) {
      navigation.replace("GeneralObjectSelect", { baseAlarm });
    }
    if (baseAlarm?.mode === CUSTOM_MODE) {
      navigation.replace("CustomObjectSelect", { baseAlarm, fromAlarmCreation: true });
    }
  }, [baseAlarm, navigation]);

  if (baseAlarm?.mode === GENERAL_MODE || baseAlarm?.mode === CUSTOM_MODE) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.panel}>
        <Text style={styles.title}>General Object Mode</Text>
        <Text style={styles.body}>Choose household objects. When the alarm rings, one object will be randomly selected.</Text>
        <AppButton title="Choose General Objects" onPress={() => navigation.navigate("GeneralObjectSelect", { baseAlarm: { ...baseAlarm, mode: GENERAL_MODE } })} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.title}>Custom Object Mode</Text>
        <Text style={styles.body}>Register your own object with multiple photos. Later, take a photo of the same object to dismiss the alarm.</Text>
        <AppButton title="Choose Custom Object" onPress={() => navigation.navigate("CustomObjectSelect", { baseAlarm: { ...baseAlarm, mode: CUSTOM_MODE }, fromAlarmCreation: true })} />
      </View>
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
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    backgroundColor: "#ffffff",
    gap: 10
  },
  title: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900"
  },
  body: {
    color: "#4b5563",
    fontSize: 15,
    lineHeight: 21
  }
});
