import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { GENERAL_MODE } from "../constants/modes";

export default function AlarmCard({ alarm }) {
  const targetText =
    alarm.mode === GENERAL_MODE
      ? (alarm.selectedObjects || []).join(", ") || "No objects selected"
      : alarm.objectId || "Not selected yet";

  return (
    <View style={styles.card}>
      <Text style={styles.time}>{alarm.time}</Text>
      <Text style={styles.detail}>Mode: {alarm.mode}</Text>
      <Text style={styles.detail}>Selected: {targetText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff",
    marginBottom: 10
  },
  time: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6
  },
  detail: {
    color: "#4b5563",
    fontSize: 14,
    marginTop: 2
  }
});
