import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Navbar from "./components/Navbar";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native'; // ✅ import useNavigation

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#0040a1',
  onPrimary: '#ffffff',
  primaryContainer: '#0056d2',
  secondary: '#1b6d24',
  onSecondary: '#ffffff',
  secondaryContainer: '#a0f399',
  surface: '#faf8ff',
  surfaceContainer: '#ededf8',
  surfaceContainerLow: '#f2f3fe',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHigh: '#e7e7f2',
  surfaceContainerHighest: '#e1e2ec',
  onSurface: '#191b23',
  onSurfaceVariant: '#424654',
  outline: '#737785',
  outlineVariant: '#c3c6d6',
  error: '#ba1a1a',
  onError: '#ffffff',
};

const FONTS = {
  headline: 'Manrope',
  body: 'Manrope',
  label: 'Plus Jakarta Sans',
};

const Login = () => {
  const navigation = useNavigation(); // ✅ moved inside component
  const [portal, setPortal] = useState('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.formPanel}>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome back</Text>
              <Text style={styles.welcomeSubtitle}>Select your portal to continue</Text>
            </View>

            {/* Portal Selector */}
            <View style={styles.portalSelector}>
              {['STUDENT', 'SECURITY', 'ADMIN'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.portalButton,
                    portal === p && styles.portalButtonActive,
                  ]}
                  onPress={() => setPortal(p)}
                >
                  <Text
                    style={[
                      styles.portalButtonText,
                      portal === p && styles.portalButtonTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email or Student ID</Text>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="alternate-email" size={22} color={COLORS.outline} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="alex.rivers@college.edu"
                    placeholderTextColor={COLORS.outlineVariant}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="lock" size={22} color={COLORS.outline} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.outlineVariant}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <MaterialIcons
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={22}
                      color={COLORS.outline}
                      style={styles.visibilityIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember me + Forgot */}
              <View style={styles.formOptions}>
                <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <MaterialIcons name="check" size={16} color={COLORS.onSecondary} />}
                  </View>
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => {
                  if (portal === "STUDENT") {
                    navigation.navigate("StudentDashboard");
                  } else if (portal === "SECURITY") {
                    navigation.navigate("SecurityDashboard");
                  } else if (portal === "ADMIN") {
                    // You can create AdminDashboard later
                    navigation.navigate("AdminDashboard");
                    // navigation.navigate("AdminDashboard");
                  }
                }}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Footer Support */}
            {portal === 'STUDENT' && (
              <View style={styles.footerSupport}>
                <Text style={styles.footerSupportText}>
                  Don't have an account?{' '}
                  <Text style={styles.footerSupportLink} onPress={() => navigation.navigate("Register")}>
                    Sign Up
                  </Text>
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>© 2026 @TechVortex</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles remain same ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 8,
    minHeight: height * 0.55,
    maxHeight: height * 0.85,
  },
  formPanel: { flex: 1.2, padding: 32, justifyContent: 'center', backgroundColor: COLORS.surfaceContainerLowest },
  welcomeSection: { marginBottom: 40 },
  welcomeTitle: { fontFamily: FONTS.headline, fontWeight: '800', fontSize: 28, color: COLORS.onSurface, marginBottom: 8 },
  welcomeSubtitle: { fontSize: 16, color: COLORS.onSurfaceVariant, fontWeight: '500' },
  portalSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, gap: 12 },
  portalButton: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 20, backgroundColor: COLORS.surfaceContainerHigh, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  portalButtonActive: { backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  portalButtonText: { fontFamily: FONTS.label, fontWeight: '700', fontSize: 14, color: COLORS.onSurfaceVariant, letterSpacing: 1 },
  portalButtonTextActive: { color: COLORS.onPrimary },
  form: { marginBottom: 48 },
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontFamily: FONTS.label, fontSize: 10, fontWeight: '700', color: COLORS.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 4, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceContainerHighest, borderRadius: 12 },
  inputIcon: { paddingLeft: 16 },
  textInput: { flex: 1, padding: 16, color: COLORS.onSurface, fontSize: 16 },
  visibilityIcon: { paddingRight: 16 },
  formOptions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: COLORS.outlineVariant, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  checkboxLabel: { fontSize: 14, fontWeight: '500', color: COLORS.onSurfaceVariant },
  forgotPasswordText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  signInButton: { width: '100%', paddingVertical: 20, backgroundColor: COLORS.primary, borderRadius: 9999, alignItems: 'center', marginTop: 16, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 },
  signInButtonText: { fontFamily: FONTS.label, fontWeight: '800', fontSize: 14, color: COLORS.onPrimary, letterSpacing: 2, textTransform: 'uppercase' },
  footerSupport: { marginTop: 'auto', alignItems: 'center' },
  footerSupportText: { fontSize: 14, color: COLORS.onSurfaceVariant },
  footerSupportLink: { fontWeight: '700', color: COLORS.secondary },
  footerContainer: {
    width: '100%',
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center', // center horizontally
    backgroundColor: '#faf8ff', // optional, match your app background
    position: 'absolute', // stick to bottom
    bottom: 0,
    marginLeft: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center', // ensure text is centered
  },
});

export default Login;