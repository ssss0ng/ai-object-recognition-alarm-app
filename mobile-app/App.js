import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AlarmRingingScreen from "./screens/AlarmRingingScreen";
import AlarmSetupScreen from "./screens/AlarmSetupScreen";
import CameraCaptureScreen from "./screens/CameraCaptureScreen";
import CustomObjectRegisterScreen from "./screens/CustomObjectRegisterScreen";
import CustomObjectSelectScreen from "./screens/CustomObjectSelectScreen";
import GeneralObjectSelectScreen from "./screens/GeneralObjectSelectScreen";
import HomeScreen from "./screens/HomeScreen";
import ModeSelectScreen from "./screens/ModeSelectScreen";
import ResultScreen from "./screens/ResultScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: "#111827" },
            headerTintColor: "#ffffff",
            headerTitleStyle: { fontWeight: "700" }
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "AI Alarm" }} />
          <Stack.Screen name="AlarmSetup" component={AlarmSetupScreen} options={{ title: "Create Alarm" }} />
          <Stack.Screen name="ModeSelect" component={ModeSelectScreen} options={{ title: "Select Mode" }} />
          <Stack.Screen name="GeneralObjectSelect" component={GeneralObjectSelectScreen} options={{ title: "General Objects" }} />
          <Stack.Screen name="CustomObjectSelect" component={CustomObjectSelectScreen} options={{ title: "Custom Objects" }} />
          <Stack.Screen name="CustomObjectRegister" component={CustomObjectRegisterScreen} options={{ title: "Register Custom Object" }} />
          <Stack.Screen name="AlarmRinging" component={AlarmRingingScreen} options={{ title: "Alarm Ringing" }} />
          <Stack.Screen name="CameraCapture" component={CameraCaptureScreen} options={{ title: "Camera" }} />
          <Stack.Screen name="Result" component={ResultScreen} options={{ title: "Result" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
