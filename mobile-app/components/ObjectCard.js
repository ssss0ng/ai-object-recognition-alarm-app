import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export default function ObjectCard({ name, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.card, selected && styles.selected]}>
      <Text style={[styles.name, selected && styles.selectedText]}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#ffffff"
  },
  selected: {
    backgroundColor: "#dbeafe",
    borderColor: "#2563eb"
  },
  name: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600"
  },
  selectedText: {
    color: "#1d4ed8"
  }
});
