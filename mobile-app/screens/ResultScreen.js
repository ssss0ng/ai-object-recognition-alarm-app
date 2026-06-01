import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, Vibration, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "../components/AppButton";
import { GENERAL_MODE } from "../constants/modes";

export default function ResultScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { result, mode, alarm, targetObject, objectId } = route.params;

  useEffect(() => {
    if (result?.success) {
      Vibration.cancel();
    }
  }, [result?.success]);

  function retakePhoto() {
    navigation.navigate("CameraCapture", {
      alarm,
      mode,
      targetObject,
      objectId
    });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
    >
      <Text style={result.success ? styles.successTitle : styles.failTitle}>
        {result.success ? "Alarm dismissed successfully." : "Recognition failed. Please retake the photo."}
      </Text>

      {mode === GENERAL_MODE ? (
        <View style={styles.panel}>
          <Text style={styles.row}>Target object: {result.target_object}</Text>
          <Text style={styles.row}>Predicted object: {result.predicted_object}</Text>
          <Text style={styles.row}>Confidence: {result.confidence}</Text>
          <Text style={styles.row}>Threshold: {result.threshold}</Text>
          <Text style={styles.row}>Matched labels: {(result.matched_labels || []).join(", ") || "none"}</Text>
          {(result.top_predictions || []).map((item, index) => (
            <Text key={`${item.label}-${index}`} style={styles.detailRow}>
              Top {index + 1}: {item.label} ({item.confidence})
            </Text>
          ))}
          <Text style={styles.row}>Success: {String(result.success)}</Text>
        </View>
      ) : (
        <View style={styles.panel}>
          <Text style={styles.row}>Object ID: {result.object_id}</Text>
          <Text style={styles.row}>Similarity: {result.similarity}</Text>
          <Text style={styles.row}>Threshold: {result.threshold}</Text>
          <Text style={styles.row}>Success: {String(result.success)}</Text>
        </View>
      )}

      {result.success ? (
        <AppButton title="Return to Home" onPress={() => navigation.navigate("Home")} />
      ) : (
        <AppButton title="Retake Photo" onPress={retakePhoto} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb"
  },
  content: {
    flexGrow: 1,
    backgroundColor: "#f9fafb",
    padding: 20,
    justifyContent: "center",
    gap: 14
  },
  successTitle: {
    color: "#047857",
    fontSize: 24,
    fontWeight: "900"
  },
  failTitle: {
    color: "#b91c1c",
    fontSize: 24,
    fontWeight: "900"
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 8
  },
  row: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600"
  },
  detailRow: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500"
  }
});
