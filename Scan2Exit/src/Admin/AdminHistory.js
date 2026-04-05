import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar, ActivityIndicator, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { EXPO_PUBLIC_API_URL } from "@env";
import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "";

export default function AdminHistory() {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => { fetchHistory(); }, [filter]);

    const fetchHistory = async () => {
        try {
            const url = filter === "all" 
                ? `${EXPO_PUBLIC_API_URL}/security-scans/history?limit=100`
                : `${EXPO_PUBLIC_API_URL}/security-scans/history?filter=${filter}&limit=100`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) setScans(data.scans);
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#003080" />
            <Navbar />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.heading}>Gate Pass History</Text>
                <Text style={styles.subheading}>Real-time record of students passing through the gate.</Text>

                {/* Filters */}
                <View style={styles.filterRow}>
                    {["all", "exit", "enter", "denied"].map((f) => (
                        <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
                            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f === "all" ? "All" : f === "exit" ? "Exits" : f === "enter" ? "Entries" : "Denied"}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading ? <ActivityIndicator size="large" color="#0040a1" style={{ marginTop: 40 }} /> : 
                scans.length === 0 ? <Text style={styles.empty}>No scans found for this filter.</Text> :
                scans.map((item) => {
                    const isExit = item.action === "exit" && item.status === "allowed";
                    const isEnter = item.action === "enter" && item.status === "allowed";
                    const isDenied = item.status === "denied";
                    const stu = item.student || {};

                    return (
                        <View key={item._id} style={styles.card}>
                            <View style={styles.info}>
                                <Text style={styles.name}>{item.studentName || stu.fullName || "Unknown"}</Text>
                                <Text style={styles.details}>
                                    {item.studentRegNo || stu.regNo} • {item.destination || (item.gatePass && item.gatePass.destination) || "N/A"}
                                </Text>
                                <Text style={styles.time}>Scanned by: {item.scannedBy} • {fmtTime(item.createdAt)}</Text>
                                {isDenied && <Text style={styles.denyReason}>{item.denyReason}</Text>}
                            </View>
                            <View style={[styles.badge, { backgroundColor: isExit ? "#fffbeb" : isEnter ? "#f0fdf4" : "#fef2f2" }]}>
                                <MaterialIcons name={isExit ? "logout" : isEnter ? "login" : "block"} size={14} color={isExit ? "#b45309" : isEnter ? "#15803d" : "#dc2626"} />
                                <Text style={{ color: isExit ? "#b45309" : isEnter ? "#15803d" : "#dc2626", fontSize: 11, fontWeight: "700", marginLeft: 4 }}>
                                    {isExit ? "EXIT" : isEnter ? "ENTER" : "DENIED"}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
            <FooterAdmin />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f7fa" },
    content: { padding: 16, paddingBottom: 100 },
    heading: { fontSize: 24, fontWeight: "bold", color: "#1a237e", marginBottom: 4 },
    subheading: { color: "#5c6bc0", marginBottom: 20, fontSize: 14 },
    empty: { textAlign: "center", marginTop: 40, color: "#777" },
    filterRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
    filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#e8eaf6" },
    filterActive: { backgroundColor: "#1a237e" },
    filterText: { fontSize: 13, fontWeight: "600", color: "#5c6bc0" },
    filterTextActive: { color: "#fff" },
    card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", elevation: 3 },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: "600", color: "#263238" },
    details: { fontSize: 13, color: "#78909c", marginTop: 2 },
    time: { fontSize: 12, color: "#90a4ae", marginTop: 4 },
    denyReason: { fontSize: 11, color: "#dc2626", marginTop: 3, fontStyle: "italic" },
    badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 }
});