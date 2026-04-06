import React, { useContext } from "react";
import { StyleSheet, View, StatusBar, Platform, ActivityIndicator, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";

import { AuthProvider, AuthContext } from "./src/context/AuthContext";

// Screens
import Index from "./src/index";
import Login from "./src/Login";
import Register from "./src/Student/Register";

// Student
import StudentDashboard from "./src/Student/StudentDashboard";
import Request from "./src/Student/Request";
import RequestSuccess from "./src/Student/Request-success";
import StudentHistory from "./src/Student/StudentHistory";
import StudentProfile from "./src/Student/StudentProfile";

// Security
import SecurityDashboard from "./src/Security/SecurityDashboard";
import ManualEntry from "./src/Security/ManualEntry";
import ManualEntryDetails from "./src/Security/ManualEntryDetails";
import SecurityHistory from "./src/Security/SecurityHistory";
import SecurityProfile from "./src/Security/SecurityProfile";
import Scanner from "./src/Security/Scanner";

// Admin
import AdminDashboard from "./src/Admin/AdminDashboard";
import ApproveLeave from "./src/Admin/ApproveLeave";
import AdminSecurityList from "./src/Admin/AdminSecurityList";
import AdminStudents from "./src/Admin/AdminStudents";
import AdminRequests from "./src/Admin/AdminRequests";
import AddSecurity from "./src/Admin/AddSecurity";
import AdminHistory from "./src/Admin/AdminHistory";
import AdminProfile from "./src/Admin/AdminProfile";

const Stack = createNativeStackNavigator();

// ✅ NEW: Splash Screen while checking Async Storage
function SplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <MaterialIcons name="qr-code-scanner" size={70} color="#0040a1" />
      <Text style={styles.splashText}>Scan2Exit</Text>
      <ActivityIndicator size="large" color="#0040a1" style={{ marginTop: 20 }} />
      <Text style={styles.splashSubText}>Restoring session...</Text>
    </View>
  );
}

// ✅ NEW: Inner Navigator that reads Auth Context
function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  // 1. Show Splash while reading AsyncStorage
  if (isLoading) {
    return <SplashScreen />;
  }

  // 2. Decide Initial Route based on saved role
  let initialRoute = "Home";
  if (user?.role === "admin") initialRoute = "AdminDashboard";
  else if (user?.role === "student") initialRoute = "StudentDashboard";
  else if (user?.role === "security") initialRoute = "SecurityDashboard";

  // 3. Render Navigation
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
      />

      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            contentStyle: { backgroundColor: "#ffffff" },
          }}
        >
          {/* ───────── COMMON ───────── */}
          <Stack.Screen name="Home" component={Index} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />

          {/* ───────── STUDENT ───────── */}
          <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
          <Stack.Screen name="Request" component={Request} />
          <Stack.Screen name="RequestSuccess" component={RequestSuccess} />
          <Stack.Screen name="History" component={StudentHistory} />
          <Stack.Screen name="Profile" component={StudentProfile} />

          {/* ───────── SECURITY ───────── */}
          <Stack.Screen name="SecurityDashboard" component={SecurityDashboard} />
          <Stack.Screen name="SecurityHistory" component={SecurityHistory} />
          <Stack.Screen name="SecurityProfile" component={SecurityProfile} />
          <Stack.Screen name="Scanner" component={Scanner} />
          <Stack.Screen name="ManualEntry" component={ManualEntry} />
          <Stack.Screen name="ManualEntryDetails" component={ManualEntryDetails} />

          {/* ───────── ADMIN ───────── */}
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="ApproveLeave" component={ApproveLeave} />
          <Stack.Screen name="AddSecurity" component={AddSecurity} />
          <Stack.Screen name="AdminSecurityList" component={AdminSecurityList} />
          <Stack.Screen name="AdminStudents" component={AdminStudents} />
          <Stack.Screen name="AdminRequests" component={AdminRequests} />
          <Stack.Screen name="AdminHistory" component={AdminHistory} />
          <Stack.Screen name="AdminProfile" component={AdminProfile} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

// ✅ MAIN APP COMPONENT (Just wraps the provider)
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  splashText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0040a1",
    marginTop: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  splashSubText: {
    fontSize: 12,
    color: "#888",
    marginTop: 10,
  },
});