import React, { useRef, useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "../components/AppButton";
import { DEFAULT_MODEL_NAME } from "../constants/config";
import { GENERAL_MODE } from "../constants/modes";
import { predictCustom, predictGeneral } from "../services/api";

export default function CameraCaptureScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { mode, targetObject, objectId, alarm } = route.params;
  const customObjectId = objectId || alarm?.customObjectId || alarm?.objectId;

  async function capturePhoto() {
    if (!permission?.granted) {
      const response = await requestPermission();
      if (!response.granted) {
        Alert.alert("Camera permission denied", "Please allow camera permission in phone settings.");
        return;
      }
    }

    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
    if (photo?.uri) {
      setImageUri(photo.uri);
    }
  }

  async function submitPhoto() {
    if (!imageUri) {
      Alert.alert("No image", "Please capture a photo first.");
      return;
    }

    setUploading(true);
    try {
      const startTime = Date.now();
      const result =
        mode === GENERAL_MODE
          ? await predictGeneral(imageUri, targetObject, DEFAULT_MODEL_NAME)
          : await predictCustom(customObjectId, imageUri);
      const elapsedTimeMs = Date.now() - startTime;

      navigation.navigate("Result", {
        result: {
          ...result,
          elapsedTimeMs
        },
        mode,
        alarm,
        targetObject,
        objectId: customObjectId
      });
    } catch (error) {
      Alert.alert("Upload failed", error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : permission?.granted ? (
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      ) : (
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>Camera permission is required.</Text>
          <AppButton title="Allow Camera" onPress={requestPermission} />
        </View>
      )}

      <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
        {imageUri ? (
          <>
            {uploading ? <Text style={styles.loadingText}>Recognizing image...</Text> : null}
            <AppButton title="Submit for Recognition" onPress={submitPhoto} loading={uploading} />
            <AppButton title="Retake" variant="secondary" onPress={() => setImageUri(null)} />
          </>
        ) : (
          <AppButton title="Capture Image" onPress={capturePhoto} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827"
  },
  camera: {
    flex: 1
  },
  preview: {
    flex: 1,
    resizeMode: "cover"
  },
  permissionBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12
  },
  permissionText: {
    color: "#ffffff",
    fontWeight: "800"
  },
  actions: {
    padding: 16,
    backgroundColor: "#f9fafb",
    gap: 10
  },
  loadingText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center"
  }
});
