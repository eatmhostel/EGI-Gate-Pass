import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";
import Navbar from "../components/Navbar";
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { EXPO_PUBLIC_API_URL } from "@env";

const { width } = Dimensions.get("window");

const COLORS = {
    primary: "#0040a1",
    primaryContainer: "#0056d2",
    secondary: "#1b6d24",
    secondaryContainer: "#a0f399",
    surface: "#faf8ff",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerHigh: "#e7e7f2",
    surfaceContainerHighest: "#e1e2ec",
    onSurface: "#191b23",
    onSurfaceVariant: "#424654",
    onPrimary: "#ffffff",
    outline: "#737785",
    outlineVariant: "#c3c6d6",
    error: "#ba1a1a",
};

const FONTS = {
    headline: "Manrope",
    body: "Manrope",
    label: "Plus Jakarta Sans",
};

export default function Register() {
    const navigation = useNavigation();
    const [regNo, setRegNo] = useState("");
    const [fullName, setFullName] = useState("");
    const [course, setCourse] = useState("");
    const [branch, setBranch] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!regNo.trim()) newErrors.regNo = "Required";
        if (!fullName.trim()) newErrors.fullName = "Required";
        if (!course.trim()) newErrors.course = "Required";
        if (!branch.trim()) newErrors.branch = "Required";
        if (!email.trim()) newErrors.email = "Required";
        if (!phone.trim()) newErrors.phone = "Required";
        else if (!/^\d{10}$/.test(phone.trim())) newErrors.phone = "Enter valid 10-digit number";
        if (!gender) newErrors.gender = "Required";
        if (!password) newErrors.password = "Required";
        else if (password.length < 6) newErrors.password = "Min 6 characters";
        if (!confirmPassword) newErrors.confirmPassword = "Required";
        else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords don't match";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const res = await fetch(`${EXPO_PUBLIC_API_URL}/student/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    regNo: regNo.trim(),
                    fullName: fullName.trim(),
                    course: course.trim(),
                    branch: branch.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    gender,
                    password,
                }),
            });

            const data = await res.json();

            if (data.success) {
                alert("Registered successfully! Wait for admin approval.");
                navigation.navigate("Login");
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            console.log("REGISTER ERROR:", error);
            alert("Server not reachable ❌");
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (
        label,
        icon,
        placeholder,
        value,
        onChangeText,
        extraProps = {}
    ) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputContainer, errors[extraProps.field] && styles.inputContainerError]}>
                <MaterialIcons name={icon} size={20} color={COLORS.outline} style={styles.inputIcon} />
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.outlineVariant}
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    editable={!loading}
                    {...extraProps}
                />
            </View>
            {errors[extraProps.field] && (
                <Text style={styles.errorText}>{errors[extraProps.field]}</Text>
            )}
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
                    {/* Header */}
                    <View style={styles.headerSection}>
                        <Text style={styles.headerTitle}>Create Account</Text>
                        <Text style={styles.headerSubtitle}>Fill in your details to register</Text>
                    </View>

                    {/* Registration Form */}
                    <View style={styles.card}>
                        {renderInput(
                            "Registration Number",
                            "badge",
                            "e.g. 1901322057",
                            regNo,
                            setRegNo,
                            { field: "regNo", autoCapitalize: "none" }
                        )}

                        {renderInput(
                            "Full Name",
                            "person",
                            "First Middle Last",
                            fullName,
                            setFullName,
                            { field: "fullName" }
                        )}

                        {renderInput(
                            "Course",
                            "menu-book",
                            "Course of Study",
                            course,
                            setCourse,
                            { field: "course" }
                        )}

                        {renderInput(
                            "Branch",
                            "apartment",
                            "Branch or Department",
                            branch,
                            setBranch,
                            { field: "branch" }
                        )}

                        {renderInput(
                            "Email",
                            "alternate-email",
                            "name@college.edu",
                            email,
                            setEmail,
                            { field: "email", keyboardType: "email-address", autoCapitalize: "none" }
                        )}

                        {renderInput(
                            "Mobile Number",
                            "phone-android",
                            "10-digit mobile number",
                            phone,
                            setPhone,
                            { field: "phone", keyboardType: "numeric", maxLength: 10, autoCapitalize: "none" }
                        )}

                        {/* Gender Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Gender</Text>
                            <View style={[styles.inputContainer, errors.gender && styles.inputContainerError]}>
                                <MaterialIcons name="wc" size={20} color={COLORS.outline} style={styles.inputIcon} />
                                <Picker
                                    selectedValue={gender}
                                    onValueChange={(itemValue) => setGender(itemValue)}
                                    style={{ flex: 1, height: 44 }}
                                    dropdownIconColor={COLORS.outline}
                                    enabled={!loading}
                                >
                                    <Picker.Item label="Select Gender" value="" color={COLORS.outlineVariant} />
                                    <Picker.Item label="Male" value="Male" />
                                    <Picker.Item label="Female" value="Female" />
                                    <Picker.Item label="Other" value="Other" />
                                </Picker>
                            </View>
                            {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                        </View>

                        {renderInput(
                            "Password",
                            "lock",
                            "Min 6 characters",
                            password,
                            setPassword,
                            { field: "password", secureTextEntry: true, autoCapitalize: "none" }
                        )}

                        {renderInput(
                            "Confirm Password",
                            "lock-clock",
                            "Re-enter password",
                            confirmPassword,
                            setConfirmPassword,
                            { field: "confirmPassword", secureTextEntry: true, autoCapitalize: "none" }
                        )}

                        {/* Register Button */}
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? "Registering..." : "Register Account"}
                            </Text>
                            {!loading && (
                                <MaterialIcons name="arrow-forward" size={20} color={COLORS.onPrimary} />
                            )}
                        </TouchableOpacity>

                        {/* Sign In Prompt */}
                        <View style={styles.signInPrompt}>
                            <Text style={styles.signInText}>
                                Already have an account?{" "}
                                <Text
                                    style={styles.signInLink}
                                    onPress={() => navigation.navigate("Login")}
                                >
                                    Sign In
                                </Text>
                            </Text>
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
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.surface,
    },
    navbarWrapper: {},
    keyboardAvoid: {
        flex: 1,
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 30,
        alignItems: "center",
    },

    // Header
    headerSection: {
        width: "100%",
        marginBottom: 20,
        marginTop: 8,
    },
    headerTitle: {
        fontFamily: FONTS.headline,
        fontSize: 26,
        fontWeight: "800",
        color: COLORS.onSurface,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.onSurfaceVariant,
        fontWeight: "500",
    },

    // Card
    card: {
        width: "100%",
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 20,
        padding: 22,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 6,
    },

    // Inputs
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.onSurfaceVariant,
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surfaceContainerHighest,
        borderRadius: 12,
        paddingHorizontal: 4,
    },
    inputContainerError: {
        borderWidth: 1.5,
        borderColor: COLORS.error,
    },
    inputIcon: {
        paddingLeft: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 10,
        fontSize: 14,
        color: COLORS.onSurface,
        fontFamily: FONTS.body,
    },
    errorText: {
        fontSize: 11,
        color: COLORS.error,
        marginTop: 4,
        marginLeft: 4,
        fontWeight: "600",
    },

    // Button
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 9999,
        marginTop: 20,
        gap: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: COLORS.onPrimary,
        fontWeight: "800",
        fontSize: 14,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        fontFamily: FONTS.label,
    },

    // Sign In
    signInPrompt: {
        marginTop: 16,
        alignItems: "center",
    },
    signInText: {
        fontSize: 13,
        color: COLORS.onSurfaceVariant,
    },
    signInLink: {
        color: COLORS.primary,
        fontWeight: "700",
    },

    // Footer
    footerContainer: {
        width: "100%",
        paddingVertical: 20,
        alignItems: "center",
        marginTop: 12,
    },
    footerText: {
        fontSize: 12,
        color: "#888",
        textAlign: "center",
    },
});