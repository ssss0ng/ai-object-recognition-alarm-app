import React, { useRef, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

import AppButton from "../components/AppButton";
import { CUSTOM_MODE } from "../constants/modes";
import { registerCustomObject } from "../services/api";
import { scheduleAlarm } from "../services/alarmService";
import { addRegisteredCustomObjectId, saveAlarm } from "../services/storageService";

export default function CustomObjectRegisterScreen({ navigation, route }) {
  const baseAlarm = route.params?.baseAlarm;
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [objectId, setObjectId] = useState("");
  const [imageUris, setImageUris] = useState([]);
  const [saving, setSaving] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  async function capturePhoto() {
    if (!permission?.granted) {
      const response = await requestPermission();
      if (!response.granted) {
        Alert.alert("Camera permission denied", "Please allow camera permission in phone settings.");
        return;
      }
    }

    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) {
      setImageUris((current) => [...current, photo.uri]);
    }
  }

  async function submitRegistration() {
    const cleanObjectId = objectId.trim();
    if (!cleanObjectId) {
      Alert.alert("Missing object_id", "Please enter a custom object name.");
      return;
    }

    if (imageUris.length < 5) {
      Alert.alert("Not enough images", "Please capture at least 5 images for custom object registration.");
      return;
    }

    setSaving(true);
    setResultMessage("");
    try {
      const data = await registerCustomObject(cleanObjectId, imageUris);
      await addRegisteredCustomObjectId(cleanObjectId);
      setResultMessage(`Registered ${data.object_id} with ${data.num_images} images.`);

      if (baseAlarm) {
        const notificationId = await scheduleAlarm(baseAlarm);
        await saveAlarm({
          ...baseAlarm,
          mode: CUSTOM_MODE,
          objectId: cleanObjectId,
          notificationId
        });
        navigation.navigate("Home");
      }
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Custom Object ID</Text>
      <TextInput
        value={objectId}
        onChangeText={setObjectId}
        placeholder="my_bottle"
        autoCapitalize="none"
        style={styles.input}
      />

      <View style={styles.cameraWrap}>
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        ) : (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionText}>Camera permission is required.</Text>
            <AppButton title="Allow Camera" onPress={requestPermission} />
          </View>
        )}
      </View>

      <AppButton title="Capture Photo" onPress={capturePhoto} />
      <Text style={styles.count}>Captured images: {imageUris.length} / 5 minimum</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
        {imageUris.map((uri) => (
          <Image key={uri} source={{ uri }} style={styles.preview} />
        ))}
      </ScrollView>

      {resultMessage ? <Text style={styles.success}>{resultMessage}</Text> : null}
      <AppButton title="Register Custom Object" onPress={submitRegistration} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb"
  },
  content: {
    padding: 20,
    gap: 12
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
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    fontSize: 16
  },
  cameraWrap: {
    height: 320,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#111827"
  },
  camera: {
    flex: 1
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
    fontWeight: "700"
  },
  count: {
    color: "#111827",
    fontWeight: "800"
  },
  previewRow: {
    maxHeight: 86
  },
  preview: {
    width: 76,
    height: 76,
    borderRadius: 8,
    marginRight: 8
  },
  success: {
    color: "#047857",
    fontWeight: "800"
  }
});
