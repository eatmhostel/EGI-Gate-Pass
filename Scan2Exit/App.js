import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native'; // ✅ Removed expo-status-bar to prevent prop conflicts
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider } from "./src/context/AuthContext";

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
import ApproveLeave from './src/Admin/ApproveLeave';
import AdminSecurityList from './src/Admin/AdminSecurityList';
import AdminStudents from './src/Admin/AdminStudents';
import AdminRequests from './src/Admin/AdminRequests';
import AddSecurity from './src/Admin/AddSecurity';
import AdminHistory from './src/Admin/AdminHistory';
import AdminProfile from './src/Admin/AdminProfile';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <NavigationContainer>
          <Stack.Navigator 
            screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
          >
            <Stack.Screen name="Home" component={Index} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            
            {/* Student Screens */}
            <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
            <Stack.Screen name="Request" component={Request} />
            <Stack.Screen name="RequestSuccess" component={RequestSuccess} />
            <Stack.Screen name="History" component={StudentHistory} />
            <Stack.Screen name="Profile" component={StudentProfile} />
            
            {/* Security Screens */}
            <Stack.Screen name="SecurityDashboard" component={SecurityDashboard} />
            <Stack.Screen name="SecurityHistory" component={SecurityHistory} />
            <Stack.Screen name="SecurityProfile" component={SecurityProfile} />
            <Stack.Screen name="Scanner" component={Scanner} />
            
            {/* Admin Screens */}
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
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Keeps background white when transitioning between screens
  },
});