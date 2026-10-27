import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from "./components/Navbar";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { publicPost } from "../utils/api";

const COLORS = {
  primary: '#0040a1',
  onPrimary: '#ffffff',
  secondary: '#1b6d24',
  surface: '#faf8ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHigh: '#e7e7f2',
  surfaceContainerHighest: '#e1e2ec',
  onSurface: '#191b23',
  onSurfaceVariant: '#424654',
  outline: '#737785',
  outlineVariant: '#c3c6d6',
  error: '#dc2626',
};

const FONTS = {
  headline: 'Manrope',
  body: 'Manrope',
  label: 'Plus Jakarta Sans',
};

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  // Start countdown for resend OTP
  const startResendTimer = () => {
    setResendTimer(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ✅ STEP 1: Send OTP to email
  const handleSendOTP = async () => {
    setError('');
    if (!email) {
      setError('Please enter your registered email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const data = await publicPost("/student/forgot-password", { email });
      if (data.success) {
        setStep(2);
        startResendTimer();
        Alert.alert("Success", "OTP sent to your email");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Network error. Try again.");
    }
    setLoading(false);
  };

  // ✅ STEP 2: Verify OTP
  const handleVerifyOTP = async () => {
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const data = await publicPost("/student/verify-otp", { email, otp });
      if (data.success) {
        setResetToken(data.resetToken);
        setStep(3);
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Network error. Try again.");
    }
    setLoading(false);
  };

  // ✅ Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);
    try {
      const data = await publicPost("/student/resend-otp", { email });
      if (data.success) {
        startResendTimer();
        Alert.alert("Success", "New OTP sent to your email");
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setError("Network error. Try again.");
    }
    setLoading(false);
  };

  // ✅ STEP 3: Reset Password
  const handleResetPassword = async () => {
    setError('');
    if (!newPassword || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await publicPost("/student/reset-password", {
        resetToken,
        newPassword,
      });
      if (data.success) {
        Alert.alert("Success", "Password reset successfully. Please login.", [
          { text: "OK", onPress: () => navigation.navigate("Login") }
        ]);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Network error. Try again.");
    }
    setLoading(false);
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={styles.stepItem}>
          <View style={[styles.stepCircle, step >= s && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, step >= s && styles.stepNumberActive]}>
              {s}
            </Text>
          </View>
          {s < 3 && (
            <View style={[styles.stepLine, step > s && styles.stepLineActive]} />
          )}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
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
              <View style={styles.headerSection}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    if (step > 1) setStep(step - 1);
                    else navigation.goBack();
                  }}
                >
                  <MaterialIcons name="arrow-back" size={22} color={COLORS.onSurface} />
                </TouchableOpacity>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>
                  {step === 1 && "Enter your registered email to receive an OTP"}
                  {step === 2 && "Enter the 6-digit OTP sent to your email"}
                  {step === 3 && "Set a new password for your account"}
                </Text>
              </View>

              {renderStepIndicator()}

              {error ? (
                <View style={styles.errorBox}>
                  <MaterialIcons name="error-outline" size={18} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* STEP 1: EMAIL */}
              {step === 1 && (
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Registered Email</Text>
                    <View style={styles.inputContainer}>
                      <MaterialIcons name="alternate-email" size={22} color={COLORS.outline} style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="you@example.com"
                        placeholderTextColor={COLORS.outlineVariant}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                    onPress={handleSendOTP}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.onPrimary} size="small" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Send OTP</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 2: OTP */}
              {step === 2 && (
                <View style={styles.form}>
                  <View style={styles.emailReminder}>
                    <MaterialIcons name="mail-outline" size={16} color={COLORS.outline} />
                    <Text style={styles.emailReminderText}>OTP sent to {email}</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Enter OTP</Text>
                    <View style={styles.inputContainer}>
                      <MaterialIcons name="lock-outline" size={22} color={COLORS.outline} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.textInput, styles.otpInput]}
                        placeholder="000000"
                        placeholderTextColor={COLORS.outlineVariant}
                        value={otp}
                        onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                    onPress={handleVerifyOTP}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.onPrimary} size="small" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Verify OTP</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.resendRow}>
                    {resendTimer > 0 ? (
                      <Text style={styles.resendTimerText}>
                        Resend OTP in {resendTimer}s
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                        <Text style={styles.resendLink}>Resend OTP</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* STEP 3: NEW PASSWORD */}
              {step === 3 && (
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <View style={styles.inputContainer}>
                      <MaterialIcons name="lock" size={22} color={COLORS.outline} style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="••••••••"
                        placeholderTextColor={COLORS.outlineVariant}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                      />
                      <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} hitSlop={10}>
                        <MaterialIcons
                          name={showNewPassword ? 'visibility' : 'visibility-off'}
                          size={22}
                          color={COLORS.outline}
                          style={styles.visibilityIcon}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View style={styles.inputContainer}>
                      <MaterialIcons name="lock" size={22} color={COLORS.outline} style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="••••••••"
                        placeholderTextColor={COLORS.outlineVariant}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={10}>
                        <MaterialIcons
                          name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                          size={22}
                          color={COLORS.outline}
                          style={styles.visibilityIcon}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.passwordHint}>
                    <MaterialIcons name="info-outline" size={16} color={COLORS.outline} />
                    <Text style={styles.passwordHintText}>
                      Minimum 6 characters
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                    onPress={handleResetPassword}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.onPrimary} size="small" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Reset Password</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>© 2026 @TechVortex</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  navbarWrapper: {},
  keyboardAvoid: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  container: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.06, shadowRadius: 32, elevation: 8 },
  formPanel: { padding: 28, justifyContent: 'center', backgroundColor: COLORS.surfaceContainerLowest },
  headerSection: { marginBottom: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontFamily: FONTS.headline, fontWeight: '800', fontSize: 26, color: COLORS.onSurface, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.onSurfaceVariant, fontWeight: '500' },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.outlineVariant },
  stepCircleActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepNumber: { fontFamily: FONTS.label, fontWeight: '700', fontSize: 14, color: COLORS.outline },
  stepNumberActive: { color: COLORS.onPrimary },
  stepLine: { width: 50, height: 2, backgroundColor: COLORS.outlineVariant },
  stepLineActive: { backgroundColor: COLORS.primary },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginBottom: 16, gap: 8 },
  errorText: { color: COLORS.error, fontSize: 13, fontWeight: '600', flex: 1 },
  form: { marginBottom: 8 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontFamily: FONTS.label, fontSize: 10, fontWeight: '700', color: COLORS.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 4, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceContainerHighest, borderRadius: 12 },
  inputIcon: { paddingLeft: 16 },
  textInput: { flex: 1, padding: 16, color: COLORS.onSurface, fontSize: 15, fontFamily: FONTS.body },
  otpInput: { fontSize: 20, fontWeight: '700', letterSpacing: 6, textAlign: 'center' },
  visibilityIcon: { paddingRight: 16 },
  emailReminder: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, padding: 10, backgroundColor: COLORS.surfaceContainerHigh, borderRadius: 10 },
  emailReminderText: { fontSize: 12, color: COLORS.onSurfaceVariant, fontWeight: '600' },
  primaryButton: { width: '100%', paddingVertical: 16, backgroundColor: COLORS.primary, borderRadius: 9999, alignItems: 'center', marginTop: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: { fontFamily: FONTS.label, fontWeight: '800', fontSize: 14, color: COLORS.onPrimary, letterSpacing: 2, textTransform: 'uppercase' },
  resendRow: { alignItems: 'center', marginTop: 16 },
  resendTimerText: { fontSize: 13, color: COLORS.outline, fontWeight: '600' },
  resendLink: { fontSize: 14, fontWeight: '700', color: COLORS.secondary },
  passwordHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  passwordHintText: { fontSize: 12, color: COLORS.outline, fontWeight: '500' },
  footerContainer: { width: '100%', paddingVertical: 20, alignItems: 'center', marginTop: 16 },
  footerText: { fontSize: 12, color: '#888', textAlign: 'center' },
});

export default ForgotPassword;