import React, { useRef, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "../components/AppButton";
import { CUSTOM_MODE } from "../constants/modes";
import { registerCustomObject } from "../services/api";
import { scheduleAlarm } from "../services/alarmService";
import { addRegisteredCustomObjectId, saveAlarm } from "../services/storageService";

const OBJECT_ID_PATTERN = /^[a-z0-9_]+$/;
const MIN_CUSTOM_IMAGES = 5;

export default function CustomObjectRegisterScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const baseAlarm = route.params?.baseAlarm;
  const returnToCustomSelect = route.params?.returnToCustomSelect;
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [objectId, setObjectId] = useState("");
  const [imageUris, setImageUris] = useState([]);
  const [saving, setSaving] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const cleanObjectId = objectId.trim();
  const objectIdIsValid = OBJECT_ID_PATTERN.test(cleanObjectId);
  const hasEnoughImages = imageUris.length >= MIN_CUSTOM_IMAGES;
  const canRegister = objectIdIsValid && hasEnoughImages && !saving;

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
    if (!cleanObjectId) {
      Alert.alert("Missing object_id", "Please enter a custom object name.");
      return;
    }

    if (!objectIdIsValid) {
      Alert.alert("Invalid object_id", "Object ID can use only lowercase English letters, numbers, and underscores.");
      return;
    }

    if (!hasEnoughImages) {
      Alert.alert("Not enough images", `Please capture at least ${MIN_CUSTOM_IMAGES} images for custom object registration.`);
      return;
    }

    setSaving(true);
    setResultMessage("");
    try {
      const data = await registerCustomObject(cleanObjectId, imageUris);
      await addRegisteredCustomObjectId(cleanObjectId);
      setResultMessage(`Registered ${data.object_id} with ${data.num_images} images.`);

      if (returnToCustomSelect) {
        navigation.navigate("CustomObjectSelect", { baseAlarm, fromAlarmCreation: Boolean(baseAlarm) });
        return;
      }

      if (baseAlarm) {
        const notificationId = await scheduleAlarm(baseAlarm);
        await saveAlarm({
          ...baseAlarm,
          mode: CUSTOM_MODE,
          objectId: cleanObjectId,
          customObjectId: cleanObjectId,
          notificationId
        });
        navigation.navigate("Home");
      } else {
        navigation.navigate("Home");
      }
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      >
      <Text style={styles.label}>Custom Object ID</Text>
      <TextInput
        value={objectId}
        onChangeText={setObjectId}
        placeholder="my_bottle"
        autoCapitalize="none"
        style={styles.input}
      />
      <View style={styles.helpBox}>
        <Text style={styles.helpTitle}>Object ID rules</Text>
        <Text style={styles.helpText}>- Use lowercase English letters, numbers, and underscores only.</Text>
        <Text style={styles.helpText}>- Do not use spaces, Korean characters, or hyphens.</Text>
        <Text style={styles.helpText}>- Examples: my_bottle, blue_cup, study_book</Text>
        <Text style={styles.helpText}>- This ID will be used to find your registered object later.</Text>
      </View>
      {cleanObjectId && !objectIdIsValid ? (
        <Text style={styles.errorText}>Object ID can use only lowercase English letters, numbers, and underscores.</Text>
      ) : null}

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
      <View style={styles.helpBox}>
        <Text style={styles.helpTitle}>Photo capture guide</Text>
        <Text style={styles.helpText}>- Capture at least 5 photos of the same object.</Text>
        <Text style={styles.helpText}>- Take photos from different angles: front, side, and top.</Text>
        <Text style={styles.helpText}>- Include both close-up photos and farther photos.</Text>
        <Text style={styles.helpText}>- Make sure the whole object is visible.</Text>
        <Text style={styles.helpText}>- Do not crop part of the object by getting too close.</Text>
        <Text style={styles.helpText}>- Do not make the object too small by standing too far away.</Text>
        <Text style={styles.helpText}>- Use a bright environment.</Text>
        <Text style={styles.helpText}>- A simple background improves recognition stability.</Text>
        <Text style={styles.helpText}>- Avoid blurry or partially cropped images.</Text>
      </View>
      <Text style={styles.count}>Captured photos: {imageUris.length} / {MIN_CUSTOM_IMAGES} minimum</Text>
      <Text style={hasEnoughImages ? styles.success : styles.warning}>
        {hasEnoughImages ? "Enough photos are ready for registration." : `At least ${MIN_CUSTOM_IMAGES} photos are required.`}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
        {imageUris.map((uri) => (
          <Image key={uri} source={{ uri }} style={styles.preview} />
        ))}
      </ScrollView>

      {resultMessage ? <Text style={styles.success}>{resultMessage}</Text> : null}
      <AppButton title="Register Custom Object" onPress={submitRegistration} loading={saving} disabled={!canRegister} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb"
  },
  scroll: {
    flex: 1
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
  helpBox: {
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    padding: 12,
    gap: 4
  },
  helpTitle: {
    color: "#1e3a8a",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 2
  },
  helpText: {
    color: "#374151",
    fontSize: 13,
    lineHeight: 18
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: "700"
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
  warning: {
    color: "#b45309",
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
