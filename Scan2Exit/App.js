import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider } from "./src/context/AuthContext"; // ✅ FIX PATH

import Index from './src/index';
import Login from './src/Login';
import Register from './src/Student/Register';
import StudentDashboard from './src/Student/StudentDashboard';
import Request from './src/Student/Request';
import RequestSuccess from './src/Student/Request-success';
import StudentHistory from './src/Student/StudentHistory';
import StudentProfile from './src/Student/StudentProfile';
import SecurityDashboard from './src/Security/SecurityDashboard';
import SecurityHistory from './src/Security/SecurityHistory';
import SecurityProfile from './src/Security/SecurityProfile';
import Scanner from './src/Security/Scanner';
import AdminDashboard from './src/Admin/AdminDashboard';
import AdminRequests from './src/Admin/AdminRequests';
import AddSecurity from './src/Admin/AddSecurity';
import AdminHistory from './src/Admin/AdminHistory';
import AdminProfile from './src/Admin/AdminProfile';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider> {/* ✅ WRAP HERE */}
      <View style={styles.container}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={Index} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Request" component={Request} />
            <Stack.Screen name="History" component={StudentHistory} />
            <Stack.Screen name="Profile" component={StudentProfile} />
            <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
            <Stack.Screen name="SecurityDashboard" component={SecurityDashboard} />
            <Stack.Screen name="SecurityHistory" component={SecurityHistory} />
            <Stack.Screen name="SecurityProfile" component={SecurityProfile} />
            <Stack.Screen name="Scanner" component={Scanner} />
            <Stack.Screen name="RequestSuccess" component={RequestSuccess} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="AddSecurity" component={AddSecurity} />
            <Stack.Screen name="AdminRequests" component={AdminRequests} />
            <Stack.Screen name="AdminHistory" component={AdminHistory} />
            <Stack.Screen name="AdminProfile" component={AdminProfile} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});