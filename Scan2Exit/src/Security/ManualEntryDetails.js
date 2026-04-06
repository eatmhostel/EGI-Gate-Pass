import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { EXPO_PUBLIC_API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ManualEntryDetails() {
    const route = useRoute();
    const navigation = useNavigation();
    const { entryId } = route.params;
    
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    const fetchEntry = async () => {
        try {
            // ✅ FIX: Get token
            const authToken = await AsyncStorage.getItem("authToken");
            if (!authToken) {
                Alert.alert("Error", "Please login again");
                setLoading(false);
                return;
            }

            const res = await fetch(`${EXPO_PUBLIC_API_URL}/manual-entries/${entryId}`, {
                headers: {
                    // ✅ FIX: Add Authorization header
                    "Authorization": `Bearer ${authToken}`,
                },
            });

            // ✅ FIX: Safe JSON parsing
            const responseText = await res.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                Alert.alert("Error", "Invalid response from server");
                return;
            }

            if (data.success) {
                setEntry(data.entry);
            } else {
                Alert.alert("Error", data.message || "Failed to load");
            }
        } catch (err) {
            console.log("Fetch error:", err.message);
            Alert.alert("Error", "Network error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntry();
    }, []);

    const handleToggle = async () => {
        setToggling(true);
        try {
            // ✅ FIX: Get token
            const authToken = await AsyncStorage.getItem("authToken");
            if (!authToken) {
                Alert.alert("Error", "Please login again");
                setToggling(false);
                return;
            }

            // ✅ FIX: Correct route - /toggle/:id not /:id/toggle
            const res = await fetch(`${EXPO_PUBLIC_API_URL}/manual-entries/toggle/${entryId}`, { 
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    // ✅ FIX: Add Authorization header
                    "Authorization": `Bearer ${authToken}`,
                },
            });

            // ✅ FIX: Safe JSON parsing
            const responseText = await res.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                Alert.alert("Error", "Invalid response from server");
                return;
            }

            if (data.success) {
                setEntry(prev => ({ ...prev, currentAction: data.currentAction, status: data.status }));
                Alert.alert("Updated", `Status changed to ${data.currentAction.toUpperCase()}. This entry is now completed.`);
            } else {
                Alert.alert("Cannot Update", data.message || "Failed to update status.");
            }
        } catch (err) {
            console.log("Toggle error:", err.message);
            Alert.alert("Error", "Network error");
        } finally {
            setToggling(false);
        }
    };

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1a237e" /></View>;
    if (!entry) return <View style={s.center}><Text>Not found</Text></View>;

    const isCompleted = entry.status === "completed";
    const isActive = !isCompleted;
    const isEntry = entry.currentAction === "entry";
    
    const accentColor = isCompleted ? "#6366f1" : isEntry ? "#16a34a" : "#f59e0b";

    return (
        <View style={s.container}>
            <ScrollView contentContainerStyle={s.scroll}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color="#1a237e" />
                    </TouchableOpacity>
                    <Text style={s.title}>Manual Entry Details</Text>
                </View>

                <View style={[s.banner, { backgroundColor: isCompleted ? "#eef2ff" : isEntry ? "#f0fdf4" : "#fffbeb", borderColor: isCompleted ? "#c7d2fe" : isEntry ? "#bbf7d0" : "#fde68a" }]}>
                    <MaterialIcons name={isCompleted ? "task-alt" : isEntry ? "login" : "logout"} size={20} color={accentColor} />
                    <Text style={[s.bannerText, { color: accentColor }]}>
                        {isCompleted ? "COMPLETED" : `Current Status: ${entry.currentAction.toUpperCase()}`}
                    </Text>
                </View>

                <View style={s.card}>
                    <DetailRow icon="person" label="Type" value={entry.type.toUpperCase()} />
                    <DetailRow icon="badge" label={entry.type === 'student' ? "Regd No" : "ID"} value={entry.regNo || "N/A"} />
                    <DetailRow icon="phone" label="Mobile" value={entry.mobile} />
                    <DetailRow icon="location-on" label="Destination" value={entry.destination || "N/A"} />
                    <DetailRow icon="schedule" label="Out Time" value={entry.outTime || "N/A"} />
                    {entry.returnDate && <DetailRow icon="event" label="Return Date" value={entry.returnDate} />}
                    <DetailRow icon="schedule" label="Return Time" value={entry.returnTime || "N/A"} />
                    <DetailRow icon="security" label="Recorded By" value={entry.scannedBy} />
                    <DetailRow icon="history" label="Created At" value={new Date(entry.createdAt).toLocaleString("en-IN")} />
                </View>

                {isCompleted && (
                    <View style={s.completedBox}>
                        <MaterialIcons name="verified" size={18} color="#6366f1" />
                        <Text style={s.completedText}>
                            This entry has been completed. The status cannot be changed again.
                        </Text>
                    </View>
                )}

                {isActive && (
                    <TouchableOpacity 
                        style={[s.toggleBtn, { backgroundColor: isEntry ? "#f59e0b" : "#16a34a" }]} 
                        onPress={handleToggle}
                        disabled={toggling}
                    >
                        <MaterialIcons name={isEntry ? "logout" : "login"} size={20} color="#fff" />
                        <Text style={s.toggleBtnText}>
                            {toggling ? "Updating..." : `Mark as ${isEntry ? 'Exit' : 'Entry'}`}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

function DetailRow({ icon, label, value }) {
    return (
        <View style={s.row}>
            <MaterialIcons name={icon} size={18} color="#5c6bc0" />
            <Text style={s.label}>{label}</Text>
            <Text style={s.value}>{value}</Text>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f7fa" },
    scroll: { padding: 16, paddingBottom: 40 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", elevation: 2, marginRight: 15 },
    title: { fontSize: 22, fontWeight: "bold", color: "#1a237e" },
    banner: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
    bannerText: { fontSize: 14, fontWeight: "700", marginLeft: 8, flex: 1 },
    card: { backgroundColor: "#fff", padding: 16, borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
    row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
    label: { fontSize: 13, color: "#78909c", marginLeft: 10, flex: 1 },
    value: { fontSize: 14, fontWeight: "600", color: "#1e293b", textAlign: "right" },
    
    completedBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eef2ff",
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#c7d2fe",
        marginTop: 20,
        gap: 10,
    },
    completedText: {
        fontSize: 13,
        color: "#4338ca",
        fontWeight: "600",
        flex: 1,
    },

    toggleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 14, marginTop: 20, gap: 8, elevation: 4 },
    toggleBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});