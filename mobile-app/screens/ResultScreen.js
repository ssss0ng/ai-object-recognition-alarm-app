import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, Vibration, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "../components/AppButton";
import { GENERAL_MODE } from "../constants/modes";

function formatSecondsFromMs(milliseconds) {
  return (milliseconds / 1000).toFixed(2);
}

export default function ResultScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { result, mode, alarm, targetObject, objectId } = route.params;
  const topPredictions = result.top_predictions || [];
  const topPrediction = topPredictions[0];
  const requiredTarget = result.target_object || result.targetObject || targetObject;
  const matchedLabel = result.matched_label;
  const generalFailureReason = matchedLabel
    ? "Recognition failed. The matched target label was below the threshold."
    : "Recognition failed. No target-related label was found in the top predictions.";
  const backendInferenceTime = result.inference_time ?? result.processing_time ?? result.elapsed_time;
  const hasApiElapsedTime = result.elapsedTimeMs !== null && result.elapsedTimeMs !== undefined;
  const hasBackendInferenceTime = backendInferenceTime !== null && backendInferenceTime !== undefined;

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
          <Text style={styles.row}>Required target: {requiredTarget}</Text>
          <Text style={styles.row}>
            Top prediction: {topPrediction ? `${topPrediction.label} (${topPrediction.confidence})` : result.predicted_object}
          </Text>
          <Text style={styles.row}>
            Matched target label: {matchedLabel ? `${matchedLabel} (${result.confidence})` : "None"}
          </Text>
          {hasApiElapsedTime ? (
            <Text style={styles.row}>Processing time: {formatSecondsFromMs(result.elapsedTimeMs)} seconds</Text>
          ) : null}
          {hasBackendInferenceTime ? (
            <Text style={styles.row}>Backend inference time: {backendInferenceTime} seconds</Text>
          ) : null}
          <Text style={styles.row}>Required confidence threshold: {result.threshold}</Text>
          <Text style={styles.row}>
            Result: {result.success ? "Succeeded" : "Failed"}
          </Text>
          <Text style={styles.explanation}>
            {result.success
              ? "Recognition succeeded. The matched target label passed the threshold."
              : generalFailureReason}
          </Text>
          <Text style={styles.sectionTitle}>Top predictions:</Text>
          {topPredictions.map((item, index) => (
            <Text key={`${item.label}-${index}`} style={styles.detailRow}>
              {index + 1}. {item.label} ({item.confidence})
            </Text>
          ))}
        </View>
      ) : (
        <View style={styles.panel}>
          <Text style={styles.row}>Required object ID: {result.object_id}</Text>
          <Text style={styles.row}>Similarity: {result.similarity}</Text>
          {hasApiElapsedTime ? (
            <Text style={styles.row}>Processing time: {formatSecondsFromMs(result.elapsedTimeMs)} seconds</Text>
          ) : null}
          {hasBackendInferenceTime ? (
            <Text style={styles.row}>Backend inference time: {backendInferenceTime} seconds</Text>
          ) : null}
          <Text style={styles.row}>Required similarity threshold: {result.threshold}</Text>
          <Text style={styles.row}>Best match: {result.best_match_object_id || "none"}</Text>
          {result.second_best_object_id ? (
            <Text style={styles.row}>Second best: {result.second_best_object_id} ({result.second_best_similarity})</Text>
          ) : null}
          {result.margin !== null && result.margin !== undefined ? (
            <Text style={styles.row}>Margin: {result.margin}</Text>
          ) : null}
          <Text style={styles.row}>Result: {result.success ? "Succeeded" : "Failed"}</Text>
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
  explanation: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 6
  },
  detailRow: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500"
  }
});
