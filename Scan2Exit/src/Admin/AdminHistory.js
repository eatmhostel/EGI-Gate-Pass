import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar, ActivityIndicator, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { authGet } from "../../utils/api";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "";

// ✅ FIX: Format manual times properly
const formatManualTime = (outTime, inTime) => {
    const parts = [];
    if (outTime) parts.push(`Out: ${fmtTime(outTime)}`);
    if (inTime) parts.push(`In: ${fmtTime(inTime)}`);
    return parts.length > 0 ? parts.join("  |  ") : "";
};

export default function AdminHistory() {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [stats, setStats] = useState(null); // ✅ ADD: Stats state

    useEffect(() => { fetchHistory(); }, [filter]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            
            const scanEndpoint = filter === "all" 
                ? `/security-scans/history?limit=100`
                : `/security-scans/history?filter=${filter}&limit=100`;
                
            // ✅ FIX: Fetch stats along with other data
            const [scanData, manualData, sData] = await Promise.all([
                authGet(scanEndpoint),
                authGet("/manual-entries/all?limit=100"),
                authGet("/security-scans/today-stats")
            ]);

            // ✅ FIX: Store stats
            if (sData.success) setStats(sData.stats);

            // ✅ FIX: Properly map manual entries with separate times
            const formattedManual = (manualData.entries || []).map((m) => ({
                _id: m._id,
                studentName: m.name,
                studentRegNo: m.regNo,
                destination: m.destination,
                action: m.currentAction || "exit", // ✅ Default to exit
                status: "allowed", // ✅ Manual entries never denied
                createdAt: m.currentAction === "entry" 
                    ? (m.entryTime || m.createdAt) 
                    : (m.exitTime || m.createdAt),
                scannedBy: m.scannedBy,
                gatePass: { destination: m.destination }, 
                student: { fullName: m.name, regNo: m.regNo, course: m.course },
                isManual: true,
                entryType: m.type,
                scannedOutAt: m.exitTime,     // ✅ Separate times
                scannedInAt: m.entryTime       // ✅ Separate times
            }));

            const combined = [...(scanData.scans || []), ...formattedManual].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setScans(combined);
        } catch (err) { 
            console.log("Admin history error:", err); 
        }
        finally { setLoading(false); }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#003080" />
            <Navbar />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.heading}>Gate Pass History</Text>
                <Text style={styles.subheading}>Real-time record of students and visitors passing through the gate.</Text>

                {/* ✅ FIX: Add Stats Row */}
                {stats && (
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { borderLeftColor: "#f59e0b" }]}>
                            <Text style={styles.statNum}>{stats.exits}</Text>
                            <Text style={styles.statLabel}>Total Exits</Text>
                        </View>
                        <View style={[styles.statCard, { borderLeftColor: "#16a34a" }]}>
                            <Text style={styles.statNum}>{stats.entries}</Text>
                            <Text style={styles.statLabel}>Total Entries</Text>
                        </View>
                    </View>
                )}

                <View style={styles.filterRow}>
                    {["all", "exit", "enter", "denied"].map((f) => (
                        <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
                            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                {f === "all" ? "All" : f === "exit" ? "Exits" : f === "enter" ? "Entries" : "Denied"}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#0040a1" style={{ marginTop: 40 }} />
                ) : scans.length === 0 ? (
                    <Text style={styles.empty}>No scans found for this filter.</Text>
                ) : (
                    scans.map((item) => {
                        // ✅ FIX: Separated manual vs QR logic
                        const isExit = item.action === "exit" && !item.isManual;
                        const isEnter = item.action === "enter" && !item.isManual;
                        const isManualExit = item.action === "exit" && item.isManual;
                        const isManualEnter = item.action === "enter" && item.isManual;
                        const isDenied = !item.isManual && item.status === "denied";
                        
                        const stu = item.student || {};

                        // ✅ FIX: Correct styling
                        const badgeBg = isDenied 
                            ? "#fef2f2" 
                            : (isExit || isManualExit) 
                                ? "#fffbeb" 
                                : "#f0fdf4";
                        const badgeTextColor = isDenied 
                            ? "#dc2626" 
                            : (isExit || isManualExit) 
                                ? "#b45309" 
                                : "#15803d";
                        const badgeIcon = isDenied ? "block" : (isExit || isManualExit) ? "logout" : "login";
                        const badgeLabel = isDenied ? "DENIED" : (isExit || isManualExit) ? "EXIT" : "ENTER";

                        // ✅ FIX: Format time display
                        const displayTime = item.isManual 
                            ? formatManualTime(item.scannedOutAt, item.scannedInAt)
                            : fmtTime(item.createdAt);

                        return (
                            <View key={item._id} style={styles.card}>
                                <View style={styles.info}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.name}>
                                            {item.studentName || stu.fullName || "Unknown"}
                                        </Text>
                                        {item.isManual && (
                                            <View style={[styles.manualTag, item.entryType === 'visitor' && styles.manualTagVisitor]}>
                                                <MaterialIcons name={item.entryType === 'visitor' ? "person-pin" : "school"} size={10} color="#fff" />
                                                <Text style={styles.manualTagText}>
                                                    {item.entryType === 'visitor' ? "VISITOR" : "MANUAL"}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.details}>
                                        {item.studentRegNo || stu.regNo} • {item.destination || (item.gatePass && item.gatePass.destination) || "N/A"}
                                    </Text>
                                    <Text style={styles.time}>
                                        Scanned by: {item.scannedBy} • {displayTime || fmtTime(item.createdAt)}
                                    </Text>
                                    {isDenied && <Text style={styles.denyReason}>{item.denyReason}</Text>}
                                </View>
                                <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                                    <MaterialIcons name={badgeIcon} size={14} color={badgeTextColor} />
                                    <Text style={{ color: badgeTextColor, fontSize: 11, fontWeight: "700", marginLeft: 4 }}>
                                        {badgeLabel}
                                    </Text>
                                </View>
                            </View>
                        );
                    })
                )}
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
    
    /* ✅ Stats Styles */
    statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 2,
    },
    statNum: { fontSize: 24, fontWeight: "800", color: "#1a237e" },
    statLabel: { fontSize: 11, color: "#78909c", fontWeight: "600", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },

    filterRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
    filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#e8eaf6" },
    filterActive: { backgroundColor: "#1a237e" },
    filterText: { fontSize: 13, fontWeight: "600", color: "#5c6bc0" },
    filterTextActive: { color: "#fff" },
    
    card: { 
        backgroundColor: "#fff", 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 12, 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        elevation: 3 
    },
    info: { flex: 1 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
    name: { fontSize: 16, fontWeight: "600", color: "#263238", flexShrink: 1 },
    manualTag: { flexDirection: "row", alignItems: "center", backgroundColor: "#ff9800", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 3 },
    manualTagVisitor: { backgroundColor: "#e65100" },
    manualTagText: { fontSize: 8, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
    details: { fontSize: 13, color: "#78909c", marginTop: 2 },
    time: { fontSize: 12, color: "#90a4ae", marginTop: 4 },
    denyReason: { fontSize: 11, color: "#dc2626", marginTop: 3, fontStyle: "italic" },
    badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 }
});