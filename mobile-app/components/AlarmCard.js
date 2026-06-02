import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GENERAL_MODE } from "../constants/modes";
import AppButton from "./AppButton";

function formatSelectedObjects(objects) {
  if (!Array.isArray(objects) || objects.length === 0) {
    return "No objects selected";
  }

  const visibleObjects = objects.slice(0, 3).join(", ");
  const hiddenCount = objects.length - 3;
  return hiddenCount > 0 ? `${visibleObjects} +${hiddenCount} more` : visibleObjects;
}

export default function AlarmCard({ alarm, onToggle, onPress }) {
  const enabled = alarm.enabled ?? alarm.active ?? true;
  const targetText =
    alarm.mode === GENERAL_MODE
      ? formatSelectedObjects(alarm.selectedObjects)
      : alarm.customObjectId || alarm.objectId || "Not selected yet";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Text style={styles.time}>{alarm.time}</Text>
        <View style={styles.statusWrap}>
          <Text style={[styles.status, enabled ? styles.statusOn : styles.statusOff]}>
            {enabled ? "ON" : "OFF"}
          </Text>
          <AppButton title={enabled ? "Turn OFF" : "Turn ON"} variant="secondary" onPress={onToggle} />
        </View>
      </View>
      <Text style={styles.detail}>Mode: {alarm.mode}</Text>
      <Text style={styles.detail}>Selected: {targetText}</Text>
    </Pressable>
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
  pressed: {
    opacity: 0.88
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  time: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6
  },
  statusWrap: {
    minWidth: 118,
    gap: 6
  },
  detail: {
    color: "#4b5563",
    fontSize: 14,
    marginTop: 2
  },
  status: {
    minWidth: 52,
    borderRadius: 8,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    textAlign: "center",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900"
  },
  statusOn: {
    backgroundColor: "#047857"
  },
  statusOff: {
    backgroundColor: "#6b7280"
  }
});
