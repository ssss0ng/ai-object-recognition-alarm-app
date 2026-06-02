import React, { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "../components/AppButton";
import { CUSTOM_MODE } from "../constants/modes";
import { deleteCustomObject, getCustomObjects } from "../services/api";
import { scheduleAlarm } from "../services/alarmService";
import {
  deleteRegisteredCustomObject,
  getRegisteredCustomObjects,
  getSavedAlarms,
  saveAlarm,
  saveRegisteredCustomObjects
} from "../services/storageService";

function normalizeBackendObjects(data) {
  return (data?.objects || []).map((item) => ({
    id: item.object_id || item.id || item.name,
    name: item.object_id || item.id || item.name,
    createdAt: item.createdAt || null
  })).filter((item) => item.id);
}

function mergeObjects(localObjects, backendObjects) {
  const merged = new Map();
  [...localObjects, ...backendObjects].forEach((item) => {
    const id = item.id || item.name;
    if (id) {
      merged.set(id, {
        id,
        name: item.name || id,
        createdAt: item.createdAt || null
      });
    }
  });
  return Array.from(merged.values());
}

export default function CustomObjectSelectScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const baseAlarm = route.params?.baseAlarm;
  const [customObjects, setCustomObjects] = useState([]);
  const [selectedObjectId, setSelectedObjectId] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("Loading registered custom objects...");
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCustomObjects();
    }, [])
  );

  async function loadCustomObjects() {
    try {
      const localObjects = await getRegisteredCustomObjects();
      let backendObjects = [];

      try {
        const backendData = await getCustomObjects();
        backendObjects = normalizeBackendObjects(backendData);
      } catch (error) {
        backendObjects = [];
      }

      const mergedObjects = mergeObjects(localObjects, backendObjects);
      setCustomObjects(mergedObjects);
      setSelectedObjectId((current) => current || mergedObjects[0]?.id || "");
      setLoadingMessage(
        mergedObjects.length > 0
          ? "Select a registered custom object for this alarm."
          : "No registered custom objects found. Please register one first."
      );

      if (backendObjects.length > 0) {
        await saveRegisteredCustomObjects(mergedObjects);
      }
    } catch (error) {
      setCustomObjects([]);
      setLoadingMessage("Registered custom objects could not be loaded.");
    }
  }

  async function saveCustomAlarm() {
    if (!baseAlarm) {
      Alert.alert("Missing alarm setup", "Please start from Create Alarm.");
      return;
    }

    if (!selectedObjectId) {
      Alert.alert("No custom object selected", "Please select a registered custom object.");
      return;
    }

    setSaving(true);
    try {
      const notificationId = await scheduleAlarm(baseAlarm);
      await saveAlarm({
        ...baseAlarm,
        mode: CUSTOM_MODE,
        selectedObjects: [],
        objectId: selectedObjectId,
        customObjectId: selectedObjectId,
        notificationId
      });
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Alarm save failed", error.message);
    } finally {
      setSaving(false);
    }
  }

  function registerNewObject() {
    navigation.navigate("CustomObjectRegister", {
      baseAlarm,
      returnToCustomSelect: true
    });
  }

  async function deleteObject(objectId) {
    const alarms = await getSavedAlarms();
    const objectIsUsedByAlarm = alarms.some((alarm) => alarm.customObjectId === objectId || alarm.objectId === objectId);

    if (objectIsUsedByAlarm) {
      Alert.alert(
        "Cannot delete custom object",
        "An alarm is using this custom object. Delete that alarm first, then try again."
      );
      return;
    }

    try {
      try {
        await deleteCustomObject(objectId);
      } catch (error) {
        // Local deletion still works if the backend is temporarily unavailable.
      }
      const nextObjects = await deleteRegisteredCustomObject(objectId);
      setCustomObjects(nextObjects);
      setSelectedObjectId((current) => (current === objectId ? nextObjects[0]?.id || "" : current));
      setLoadingMessage(
        nextObjects.length > 0
          ? "Select a registered custom object for this alarm."
          : "No registered custom objects found. Please register one first."
      );
    } catch (error) {
      Alert.alert("Delete failed", error.message);
    }
  }

  function confirmDeleteObject(objectId) {
    Alert.alert(
      "Delete custom object",
      "Are you sure you want to delete this custom object? If an alarm uses it, deletion will be blocked.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteObject(objectId)
        }
      ],
      { cancelable: true }
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>Select Custom Object</Text>
      <Text style={styles.message}>{loadingMessage}</Text>

      <FlatList
        data={customObjects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No registered custom objects.</Text>
            <Text style={styles.emptyText}>Register a custom object first, then select it for an alarm.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const selected = item.id === selectedObjectId;
          return (
            <Pressable
              onPress={() => setSelectedObjectId(item.id)}
              style={[styles.objectCard, selected && styles.objectCardSelected]}
            >
              <View style={styles.objectHeader}>
                <View style={styles.objectTextBlock}>
                  <Text style={styles.objectName}>{item.name}</Text>
                  <Text style={styles.objectStatus}>{selected ? "Selected" : "Tap to select"}</Text>
                </View>
                <AppButton title="Delete" variant="danger" onPress={() => confirmDeleteObject(item.id)} />
              </View>
            </Pressable>
          );
        }}
      />

      <View style={styles.actions}>
        <AppButton title="Use Selected Object" onPress={saveCustomAlarm} loading={saving} disabled={!selectedObjectId} />
        <AppButton title="Register New Custom Object" variant="secondary" onPress={registerNewObject} />
        <AppButton title="Back" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 20
  },
  title: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8
  },
  message: {
    color: "#4b5563",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12
  },
  listContent: {
    paddingBottom: 12
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 6
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900"
  },
  emptyText: {
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 20
  },
  objectCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    padding: 14,
    marginBottom: 10,
    gap: 4
  },
  objectCardSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff"
  },
  objectHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  objectTextBlock: {
    flex: 1
  },
  objectName: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900"
  },
  objectStatus: {
    color: "#4b5563",
    fontSize: 13,
    fontWeight: "700"
  },
  actions: {
    gap: 10,
    marginTop: 10
  }
});
