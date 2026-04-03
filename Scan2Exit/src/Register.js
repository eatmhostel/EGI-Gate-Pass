// Register.js
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Navbar from "./components/Navbar";
import { useNavigation } from '@react-navigation/native';

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
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    return (
        <SafeAreaView style={styles.safeArea}>
            <Navbar />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Registration Form */}
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Registration Number</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="badge" size={22} color={COLORS.outline} />
                            <TextInput
                                placeholder="e.g. 1901322057"
                                placeholderTextColor={COLORS.outlineVariant}
                                style={styles.input}
                                value={regNo}
                                onChangeText={setRegNo}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="person" size={22} color={COLORS.outline} />
                            <TextInput
                                placeholder="First Middle Last"
                                placeholderTextColor={COLORS.outlineVariant}
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Course</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="menu-book" size={22} color={COLORS.outline} style={styles.inputIcon} />
                            <TextInput
                                placeholder="Course of Study"
                                placeholderTextColor={COLORS.outlineVariant}
                                style={styles.input}
                                value={course}
                                onChangeText={setCourse}
                            />
                        </View>
                    </View>

                    {/* Branch Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Branch</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="apartment" size={22} color={COLORS.outline} style={styles.inputIcon} />
                            <TextInput
                                placeholder="Branch or Department"
                                placeholderTextColor={COLORS.outlineVariant}
                                style={styles.input}
                                value={branch}
                                onChangeText={setBranch}
                            />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons
                                name="alternate-email"
                                size={22}
                                color={COLORS.outline}
                            />
                            <TextInput
                                placeholder="name@gmail.com"
                                placeholderTextColor={COLORS.outlineVariant}
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="lock" size={22} color={COLORS.outline} />
                            <TextInput
                                placeholder="••••••••"
                                placeholderTextColor={COLORS.outlineVariant}
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="lock-clock" size={22} color={COLORS.outline} />
                            <TextInput
                                placeholder="••••••••"
                                placeholderTextColor={COLORS.outlineVariant}
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Register Account</Text>
                        <MaterialIcons
                            name="arrow-forward"
                            size={20}
                            color={COLORS.onPrimary}
                        />
                    </TouchableOpacity>

                    <View style={styles.signInPrompt}>
                        <Text style={styles.signInText}>
                            Already have an account?{" "}
                            <Text style={styles.signInLink} onPress={() => navigation.navigate("Login")}>
                                Sign In
                            </Text>
                        </Text>
                    </View>
                </View>
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>© 2026 @TechVortex</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.surface },
    scrollContainer: { padding: 16, paddingBottom: 40, alignItems: "center" },
    card: {
        marginTop: 40,
        width: "100%",
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 6,
    },

    inputGroup: { marginBottom: 16 },
    label: { fontSize: 10, fontWeight: "700", color: COLORS.outline, marginBottom: 4, textTransform: "uppercase" },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surfaceContainerHighest, borderRadius: 12, paddingHorizontal: 12 },
    input: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14, color: COLORS.onSurface },

    row: { flexDirection: "row" },

    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 50,
        marginTop: 16,
        gap: 8,
    },
    buttonText: { color: COLORS.onPrimary, fontWeight: "bold", fontSize: 16 },

    signInPrompt: { marginTop: 12, alignItems: "center" },
    signInText: { fontSize: 12, color: COLORS.onSurfaceVariant },
    signInLink: { color: COLORS.primary, fontWeight: "bold" },
    footerContainer: {
        width: '100%',
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
    },
    footerText: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
    },
});