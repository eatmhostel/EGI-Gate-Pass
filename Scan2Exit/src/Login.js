import React, { useState, useContext } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from "./components/Navbar";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { EXPO_PUBLIC_API_URL } from "@env";
import { AuthContext } from "./context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const navigation = useNavigation();
  const [portal, setPortal] = useState('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields ❌");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        setUser({
          name: email || "Admin",
          role: "admin",
        });
        navigation.reset({
          index: 0,
          routes: [{ name: "AdminDashboard" }],
        });
      } else {
        alert(data.message || "Login failed ❌");
      }
    } catch (error) {
      console.log(error);
      alert("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields ❌");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${EXPO_PUBLIC_API_URL}/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regNo: email, password }),
      });

      const data = await res.json();
      if (data.success) {
        await AsyncStorage.setItem("studentId", data.user._id);
        setUser({
          name: data.user.name,
          regNo: data.user.regNo,
          course: data.user.course,
          branch: data.user.branch,
          email: data.user.email,
          phone: data.user.phone, 
          role: "student",
        });
        navigation.reset({
          index: 0,
          routes: [{ name: "StudentDashboard" }],
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields ❌");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${EXPO_PUBLIC_API_URL}/security/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empId: email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setUser({
          name: data.user.name,
          empId: data.user.empId,
          email: data.user.email,
          phone: data.user.phone,
          role: "security",
        });
        navigation.reset({
          index: 0,
          routes: [{ name: "SecurityDashboard" }],
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    if (portal === "ADMIN") handleLogin();
    else if (portal === "STUDENT") handleStudentLogin();
    else if (portal === "SECURITY") handleSecurityLogin();
  };

  const getPlaceholder = () => {
    if (portal === 'STUDENT') return 'Enter your Reg No';
    if (portal === 'SECURITY') return 'Enter your Emp ID';
    return 'admin@college.edu';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      {/* Navbar - flush to top, no extra spacing */}
      <View style={styles.navbarWrapper}>
        <Navbar />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
                    activeOpacity={0.7}
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
                {/* User ID */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {portal === 'STUDENT' ? 'Reg No' : portal === 'SECURITY' ? 'Emp ID' : 'Email'}
                  </Text>
                  <View style={styles.inputContainer}>
                    <MaterialIcons
                      name={portal === 'STUDENT' ? 'badge' : portal === 'SECURITY' ? 'work' : 'alternate-email'}
                      size={22}
                      color={COLORS.outline}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder={getPlaceholder()}
                      placeholderTextColor={COLORS.outlineVariant}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType={portal === 'ADMIN' ? 'email-address' : 'default'}
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
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
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
                  <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)} hitSlop={10}>
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <MaterialIcons name="check" size={16} color={COLORS.onSecondary} />}
                    </View>
                    <Text style={styles.checkboxLabel}>Remember me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity hitSlop={10}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[styles.signInButton, loading && styles.signInButtonDisabled]}
                  onPress={handleSignIn}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <Text style={styles.signInButtonText}>Signing In...</Text>
                  ) : (
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  )}
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

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>© 2026 @TechVortex</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  navbarWrapper: {
    // No extra padding/margin - sits flush at top
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  container: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 8,
  },
  formPanel: {
    padding: 28,
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  // Welcome
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontFamily: FONTS.headline,
    fontWeight: '800',
    fontSize: 28,
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },

  // Portal Selector
  portalSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 10,
  },
  portalButton: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerHigh,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  portalButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  portalButtonText: {
    fontFamily: FONTS.label,
    fontWeight: '700',
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1,
  },
  portalButtonTextActive: {
    color: COLORS.onPrimary,
  },

  // Form
  form: {
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: FONTS.label,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginLeft: 4,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: 12,
  },
  inputIcon: {
    paddingLeft: 16,
  },
  textInput: {
    flex: 1,
    padding: 16,
    color: COLORS.onSurface,
    fontSize: 15,
    fontFamily: FONTS.body,
  },
  visibilityIcon: {
    paddingRight: 16,
  },

  // Options
  formOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Button
  signInButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 9999,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontFamily: FONTS.label,
    fontWeight: '800',
    fontSize: 14,
    color: COLORS.onPrimary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Footer support
  footerSupport: {
    marginTop: 24,
    alignItems: 'center',
    paddingBottom: 4,
  },
  footerSupportText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  footerSupportLink: {
    fontWeight: '700',
    color: COLORS.secondary,
  },

  // Footer
  footerContainer: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

export default Login;