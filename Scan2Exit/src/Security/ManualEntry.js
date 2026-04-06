import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { EXPO_PUBLIC_API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import FooterSecurity from "../components/FooterSecurity";

export default function ManualEntry() {
    const { user, token } = useContext(AuthContext);
    const navigation = useNavigation();

    const [type, setType] = useState("visitor");
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [regNo, setRegNo] = useState("");
    const [course, setCourse] = useState("");
    const [branch, setBranch] = useState("");
    const [destination, setDestination] = useState("Market");
    const [outTime, setOutTime] = useState("");
    const [returnTime, setReturnTime] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [action, setAction] = useState("exit");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name || !mobile) {
            return Alert.alert("Error", "Name and Mobile number are required.");
        }

        if (type === "student" && !destination) {
            return Alert.alert("Error", "Destination is required for students.");
        }

        setLoading(true);
        try {
            // ✅ FIX: Get token
            const authToken = token || await AsyncStorage.getItem("authToken");
            
            if (!authToken) {
                Alert.alert("Error", "Authentication error. Please login again.");
                setLoading(false);
                return;
            }

            // ✅ FIX: Correct endpoint - /create not just /
            const res = await fetch(`${EXPO_PUBLIC_API_URL}/manual-entries/create`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    // ✅ FIX: Add Authorization header
                    "Authorization": `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    type, 
                    name, 
                    mobile, 
                    ...(type === "student" && { regNo, course, branch, destination, outTime, returnTime, returnDate }),
                    currentAction: action,
                    scannedBy: user?.name || "Security"
                }),
            });

            // ✅ FIX: Safe JSON parsing
            const responseText = await res.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.log("Invalid response:", responseText.substring(0, 100));
                Alert.alert("Error", "Invalid response from server");
                return;
            }

            if (data.success) {
                Alert.alert("Success", "Manual entry recorded successfully.", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Error", data.message || "Something went wrong");
            }
        } catch (err) {
            console.log("Manual entry error:", err.message);
            Alert.alert("Error", "Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Navbar />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color="#1a237e" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Manual Entry</Text>
                </View>

                <View style={styles.segmentControl}>
                    <TouchableOpacity 
                        style={[styles.segmentBtn, type === 'visitor' && styles.segmentActive]} 
                        onPress={() => setType('visitor')}
                    >
                        <Text style={[styles.segmentText, type === 'visitor' && styles.segmentTextActive]}>Visitor</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.segmentBtn, type === 'student' && styles.segmentActive]} 
                        onPress={() => setType('student')}
                    >
                        <Text style={[styles.segmentText, type === 'student' && styles.segmentTextActive]}>Student</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <CustomInput label="Full Name" value={name} onChange={setName} icon="person" />
                    <CustomInput label="Mobile Number" value={mobile} onChange={setMobile} icon="phone" keyboardType="phone-pad" />
                </View>

                {type === 'student' && (
                    <>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Student Details</Text>
                            <CustomInput label="Regd Number" value={regNo} onChange={setRegNo} icon="badge" />
                            <CustomInput label="Course" value={course} onChange={setCourse} icon="school" />
                            <CustomInput label="Branch" value={branch} onChange={setBranch} icon="engineering" />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Schedule</Text>
                            
                            <Text style={styles.label}>Destination</Text>
                            <View style={styles.destRow}>
                                {["Market", "Home", "Other"].map(d => (
                                    <TouchableOpacity key={d} style={[styles.destChip, destination === d && styles.destChipActive]} onPress={() => setDestination(d)}>
                                        <Text style={[styles.destText, destination === d && styles.destTextActive]}>{d}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {destination === "Other" && <CustomInput label="Specify Destination" value="" onChange={(val) => setDestination(val)} icon="location-on" />}

                            <CustomInput label="Out Time (e.g., 10:00 AM)" value={outTime} onChange={setOutTime} icon="schedule" />
                            
                            {(destination === "Home" || destination === "Other") && (
                                <CustomInput label="Return Date (e.g., 25-10-2023)" value={returnDate} onChange={setReturnDate} icon="event" />
                            )}
                            <CustomInput label="Return Time (e.g., 05:00 PM)" value={returnTime} onChange={setReturnTime} icon="schedule" />
                        </View>
                    </>
                )}

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Action Type</Text>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.actionBtn, action === 'exit' && styles.actionExit]} onPress={() => setAction('exit')}>
                            <MaterialIcons name="logout" size={20} color={action === 'exit' ? "#fff" : "#f59e0b"} />
                            <Text style={[styles.actionText, action === 'exit' && styles.actionTextWhite]}>Exit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, action === 'entry' && styles.actionEntry]} onPress={() => setAction('entry')}>
                            <MaterialIcons name="login" size={20} color={action === 'entry' ? "#fff" : "#16a34a"} />
                            <Text style={[styles.actionText, action === 'entry' && styles.actionTextWhite]}>Entry</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading}>
                    <Text style={styles.submitBtnText}>{loading ? "Saving..." : "Submit Entry"}</Text>
                </TouchableOpacity>

            </ScrollView>
            <FooterSecurity />
        </View>
    );
}

function CustomInput({ label, value, onChange, icon, keyboardType }) {
    return (
        <View style={c.inputGroup}>
            <Text style={c.label}>{label}</Text>
            <View style={c.inputWrap}>
                <MaterialIcons name={icon} size={18} color="#5c6bc0" />
                <TextInput
                    style={c.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder={`Enter ${label}`}
                    keyboardType={keyboardType || "default"}
                />
            </View>
        </View>
    );
}

const c = StyleSheet.create({
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, color: "#546e7a", fontWeight: "600", marginBottom: 6 },
    inputWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 10, paddingHorizontal: 12, backgroundColor: "#fafafa" },
    input: { flex: 1, height: 44, fontSize: 14, color: "#263238", marginLeft: 10 },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f7fa" },
    scroll: { padding: 16, paddingBottom: 120 },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", elevation: 2, marginRight: 15 },
    title: { fontSize: 22, fontWeight: "bold", color: "#1a237e" },
    
    segmentControl: { flexDirection: "row", backgroundColor: "#e8eaf6", borderRadius: 12, padding: 4, marginBottom: 20 },
    segmentBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
    segmentActive: { backgroundColor: "#1a237e" },
    segmentText: { fontSize: 14, fontWeight: "700", color: "#5c6bc0" },
    segmentTextActive: { color: "#fff" },

    card: { backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
    cardTitle: { fontSize: 16, fontWeight: "bold", color: "#1a237e", marginBottom: 14 },
    label: { fontSize: 13, color: "#546e7a", fontWeight: "600", marginBottom: 6 },

    destRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    destChip: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#c5cae9", alignItems: "center" },
    destChipActive: { backgroundColor: "#1a237e", borderColor: "#1a237e" },
    destText: { fontSize: 13, fontWeight: "600", color: "#5c6bc0" },
    destTextActive: { color: "#fff" },

    actionRow: { flexDirection: "row", gap: 12 },
    actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: "#e0e0e0", gap: 8 },
    actionExit: { backgroundColor: "#f59e0b", borderColor: "#f59e0b" },
    actionEntry: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
    actionText: { fontSize: 15, fontWeight: "700", color: "#546e7a" },
    actionTextWhite: { color: "#fff" },

    submitBtn: { backgroundColor: "#1a237e", paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 10, elevation: 4 },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});