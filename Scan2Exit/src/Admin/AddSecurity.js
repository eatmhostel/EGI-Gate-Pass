import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";
import { authPost } from "../../utils/api";

export default function AddSecurity() {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    name: "",
    empId: "",
    email: "",
    phone: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert("Validation Error", "Please enter security name");
      return false;
    }
    if (!form.empId.trim()) {
      Alert.alert("Validation Error", "Please enter employee ID");
      return false;
    }
    if (!form.email.trim()) {
      Alert.alert("Validation Error", "Please enter email");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      Alert.alert("Validation Error", "Please enter a valid email");
      return false;
    }
    if (!form.phone.trim()) {
      Alert.alert("Validation Error", "Please enter phone number");
      return false;
    }
    if (form.phone.length < 10) {
      Alert.alert("Validation Error", "Phone number must be at least 10 digits");
      return false;
    }
    if (!form.password.trim()) {
      Alert.alert("Validation Error", "Please enter password");
      return false;
    }
    if (form.password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // ✅ FIXED: Using authPost
      const data = await authPost("/security/add", form);

      if (data.success) {
        Alert.alert("Success", "Security added successfully", [
          {
            text: "OK",
            onPress: () => navigation.goBack()
          }
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to add security");
      }
    } catch (err) {
      Alert.alert("Error", "Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      name: "",
      empId: "",
      email: "",
      phone: "",
      password: ""
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.mainWrapper}>
        <Navbar />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.title}>Add Security</Text>
              <Text style={styles.subtitle}>
                Fill in the details to add a new security personnel
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.sectionIconText}>👤</Text>
              </View>
              <View>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Enter security personnel details
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
              <TextInput placeholder="Enter full name" style={styles.input} value={form.name} onChangeText={(v) => handleChange("name", v)} placeholderTextColor="#9ca3af" />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Employee ID <Text style={styles.required}>*</Text></Text>
              <TextInput placeholder="Enter employee ID" style={styles.input} value={form.empId} onChangeText={(v) => handleChange("empId", v)} placeholderTextColor="#9ca3af" autoCapitalize="characters" />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
              <TextInput placeholder="Enter email address" style={styles.input} value={form.email} onChangeText={(v) => handleChange("email", v)} placeholderTextColor="#9ca3af" keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
              <TextInput placeholder="Enter phone number" style={styles.input} value={form.phone} onChangeText={(v) => handleChange("phone", v)} placeholderTextColor="#9ca3af" keyboardType="phone-pad" maxLength={15} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
              <TextInput placeholder="Create a password (min. 6 characters)" style={styles.input} value={form.password} onChangeText={(v) => handleChange("password", v)} placeholderTextColor="#9ca3af" secureTextEntry />
            </View>

            <View style={styles.divider} />

            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>The security personnel will receive login credentials via email after successful registration.</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} activeOpacity={0.7} disabled={loading}>
              <Text style={styles.submitBtnText}>{loading ? "Adding..." : "Add Security"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerSpacer} />
        </ScrollView>
      </View>
      
      <View style={styles.footerWrapper}>
        <FooterAdmin />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 5, paddingBottom: 20, flexGrow: 1 },
  headerSection: { flexDirection: "row", alignItems: "center", marginBottom: 24, marginTop: 10 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, marginRight: 14 },
  backIcon: { fontSize: 20, color: "#1e293b" },
  headerText: { flex: 1 },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a", marginBottom: 2 },
  subtitle: { fontSize: 13, color: "#64748b", lineHeight: 18 },
  formCard: { backgroundColor: "#ffffff", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  sectionIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 14 },
  sectionIconText: { fontSize: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  sectionSubtitle: { fontSize: 12, color: "#94a3b8", marginTop: 1 },
  divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 16 },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "500", color: "#374151", marginBottom: 6 },
  required: { color: "#ef4444" },
  input: { borderWidth: 1.5, borderColor: "#e2e8f0", padding: 13, borderRadius: 10, fontSize: 14, color: "#0f172a", backgroundColor: "#f9fafb", fontWeight: "400" },
  infoBox: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fde68a", borderRadius: 10, padding: 12 },
  infoIcon: { fontSize: 14, marginRight: 8, marginTop: 1 },
  infoText: { flex: 1, fontSize: 12, color: "#92400e", lineHeight: 18 },
  buttonContainer: { flexDirection: "row", marginTop: 20, marginBottom: 10, gap: 12 },
  resetBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", borderWidth: 1.5, borderColor: "#d1d5db" },
  resetBtnText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  submitBtn: { flex: 2, padding: 14, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#0040a1" },
  submitBtnDisabled: { backgroundColor: "#94a3b8" },
  submitBtnText: { fontSize: 14, fontWeight: "600", color: "#ffffff" },
  footerSpacer: { flex: 1 },
  footerWrapper: { marginTop: 60, backgroundColor: "#f3f4f6" }
});