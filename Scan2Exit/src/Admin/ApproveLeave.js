import React, { useState, useEffect, useCallback } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { authGet, authPut } from "../../utils/api";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function ApproveLeave() {
    const navigation = useNavigation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchRequests = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            // ✅ FIXED: Using authGet
            const data = await authGet("/gatepass/pending-home");

            if (data.success) {
                setRequests(data.requests);
            }
        } catch (err) {
            console.log("ERROR:", err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const handleApprove = (item) => {
        Alert.alert("Approve Home Leave", `Approve home leave request for ${item.student?.fullName || item.student?.name || "this student"}?`,
            [{ text: "Cancel", style: "cancel" }, { text: "Approve", style: "default", onPress: () => performAction(item._id, "approve") }]
        );
    };

    const handleReject = (item) => {
        Alert.alert("Reject Home Leave", `Reject home leave request for ${item.student?.fullName || item.student?.name || "this student"}?`,
            [{ text: "Cancel", style: "cancel" }, { text: "Reject", style: "destructive", onPress: () => performAction(item._id, "reject") }]
        );
    };

    const performAction = async (id, action) => {
        setActionLoading(id);
        try {
            const endpoint = action === "approve" ? `/gatepass/approve/${id}` : `/gatepass/reject/${id}`;
            
            // ✅ FIXED: Using authPut
            const data = await authPut(endpoint);

            if (data.success) {
                setRequests((prev) => prev.filter((r) => r._id !== id));
            } else {
                Alert.alert("Error", data.message || "Action failed");
            }
        } catch (err) {
            Alert.alert("Error", "Something went wrong");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <View style={styles.container}>
            <Navbar />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchRequests(true)} colors={["#0040a1"]} tintColor="#0040a1" />}
            >
                <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={22} color="#0040a1" />
                    <Text style={styles.backText}>Back to Dashboard</Text>
                </TouchableOpacity>

                <View style={styles.headerSection}>
                    <Text style={styles.title}>Home Leave Requests</Text>
                    <Text style={styles.subtitle}>
                        {loading ? "Loading..." : requests.length === 0 ? "No pending requests" : `${requests.length} pending request${requests.length !== 1 ? "s" : ""} awaiting approval`}
                    </Text>
                </View>

                {loading && (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#0040a1" />
                        <Text style={styles.loadingText}>Fetching requests...</Text>
                    </View>
                )}

                {!loading && requests.length === 0 && (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconWrap}><MaterialIcons name="home" size={36} color="#0040a1" /></View>
                        <Text style={styles.emptyTitle}>All Caught Up</Text>
                        <Text style={styles.emptySubtitle}>No pending home leave requests at the moment.</Text>
                    </View>
                )}

                {!loading && requests.length > 0 && requests.map((item, index) => {
                    const isActioning = actionLoading === item._id;
                    const studentName = item.student?.fullName || item.student?.name || "Unknown";

                    return (
                        <View key={item._id} style={styles.card}>
                            <View style={styles.cardAccent} />
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderLeft}>
                                    <Text style={styles.cardIndex}>#{String(index + 1).padStart(2, "0")}</Text>
                                    <Text style={styles.cardDestination}>Home Leave</Text>
                                </View>
                                <View style={styles.pendingBadge}>
                                    <MaterialIcons name="hourglass-top" size={12} color="#ca8a04" />
                                    <Text style={styles.pendingBadgeText}>Pending</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />
                            <View style={styles.infoGrid}>
                                <View style={styles.infoBlock}><Text style={styles.infoBlockLabel}>Student Name</Text><Text style={styles.infoBlockValue}>{studentName}</Text></View>
                                <View style={styles.infoBlock}><Text style={styles.infoBlockLabel}>Regd No</Text><Text style={styles.infoBlockValue}>{item.student?.regNo || "—"}</Text></View>
                                <View style={styles.infoBlock}><Text style={styles.infoBlockLabel}>Course / Branch</Text><Text style={styles.infoBlockValue}>{item.student?.course || "—"} {item.student?.branch ? `• ${item.student.branch}` : ""}</Text></View>
                                <View style={styles.infoBlock}><Text style={styles.infoBlockLabel}>Requested On</Text><Text style={styles.infoBlockValue}>{formatDate(item.createdAt)}</Text></View>
                            </View>

                            <View style={styles.divider} />
                            <View style={styles.timingRow}>
                                <View style={styles.timingItem}><MaterialIcons name="exit-to-app" size={14} color="#0040a1" /><Text style={styles.timingLabel}>Out</Text><Text style={styles.timingValue}>{formatTime(item.outTime)}</Text></View>
                                <View style={styles.timingArrow}><MaterialIcons name="arrow-forward" size={16} color="#c3c6d6" /></View>
                                <View style={styles.timingItem}><MaterialIcons name="home" size={14} color="#1b6d24" /><Text style={styles.timingLabel}>Return Date</Text><Text style={styles.timingValue}>{formatDate(item.returnDate)}</Text></View>
                                <View style={styles.timingArrow}><MaterialIcons name="arrow-forward" size={16} color="#c3c6d6" /></View>
                                <View style={styles.timingItem}><MaterialIcons name="login" size={14} color="#ba1a1a" /><Text style={styles.timingLabel}>Return</Text><Text style={styles.timingValue}>{formatTime(item.returnTime)}</Text></View>
                            </View>

                            {(item.purpose || item.reason) && (<><View style={styles.divider} /><View style={styles.reasonRow}><MaterialIcons name="description" size={14} color="#737785" /><Text style={styles.reasonText}>{item.reason || item.purpose || "General"}</Text></View></>)}

                            <View style={styles.divider} />
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={[styles.rejectBtn, isActioning && styles.btnDisabled]} onPress={() => handleReject(item)} disabled={isActioning}>
                                    {isActioning ? <ActivityIndicator size="small" color="#dc2626" /> : <MaterialIcons name="close" size={18} color="#dc2626" />}
                                    <Text style={styles.rejectBtnText}>Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.approveBtn, isActioning && styles.btnDisabled]} onPress={() => handleApprove(item)} disabled={isActioning}>
                                    {isActioning ? <ActivityIndicator size="small" color="#fff" /> : <MaterialIcons name="check" size={18} color="#fff" />}
                                    <Text style={styles.approveBtnText}>Approve</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
                <View style={styles.footerSpacer} />
            </ScrollView>
            <FooterAdmin />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f7fa" },
    scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100 },
    backRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 6 },
    backText: { fontSize: 14, color: "#0040a1", fontWeight: "600" },
    headerSection: { marginBottom: 24 },
    title: { fontSize: 26, fontWeight: "800", color: "#1a237e", letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: "#5c6bc0", marginTop: 4, fontWeight: "500" },
    centerBox: { alignItems: "center", paddingVertical: 60, gap: 12 },
    loadingText: { fontSize: 14, color: "#737785", fontWeight: "500" },
    emptyState: { alignItems: "center", paddingVertical: 50, paddingHorizontal: 20 },
    emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#e8eaf6", alignItems: "center", justifyContent: "center", marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: "700", color: "#1a237e", marginBottom: 6 },
    emptySubtitle: { fontSize: 14, color: "#737785", textAlign: "center", lineHeight: 20 },
    card: { backgroundColor: "#ffffff", borderRadius: 16, marginBottom: 16, overflow: "hidden", elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, borderWidth: 1, borderColor: "#e8eaf6" },
    cardAccent: { height: 4, backgroundColor: "#ca8a04" },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 16, paddingTop: 14 },
    cardHeaderLeft: { flex: 1, marginRight: 12 },
    cardIndex: { fontSize: 11, fontWeight: "700", color: "#0040a1", marginBottom: 2, letterSpacing: 0.5 },
    cardDestination: { fontSize: 17, fontWeight: "700", color: "#1a237e" },
    pendingBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#fef9c3", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: "#fef08a", gap: 4 },
    pendingBadgeText: { fontSize: 11, fontWeight: "700", color: "#ca8a04" },
    divider: { height: 1, backgroundColor: "#f0f0f5", marginHorizontal: 16 },
    infoGrid: { flexDirection: "row", flexWrap: "wrap", padding: 14, gap: 10 },
    infoBlock: { flex: 1, minWidth: "45%", backgroundColor: "#f8f9fc", borderRadius: 10, padding: 10 },
    infoBlockLabel: { fontSize: 10, fontWeight: "600", color: "#0040a1", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
    infoBlockValue: { fontSize: 13, fontWeight: "600", color: "#1a237e" },
    timingRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 4 },
    timingItem: { flex: 1, alignItems: "center", gap: 3 },
    timingLabel: { fontSize: 9, fontWeight: "700", color: "#737785", textTransform: "uppercase", letterSpacing: 0.4 },
    timingValue: { fontSize: 12, fontWeight: "700", color: "#1a237e" },
    timingArrow: { paddingHorizontal: 2 },
    reasonRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    reasonText: { flex: 1, fontSize: 13, color: "#424654", lineHeight: 19 },
    actionRow: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 10 },
    rejectBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: "#fecaca", backgroundColor: "#fff5f5" },
    rejectBtnText: { fontSize: 13, fontWeight: "700", color: "#dc2626" },
    approveBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 10, backgroundColor: "#0040a1", shadowColor: "#0040a1", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4 },
    approveBtnText: { fontSize: 13, fontWeight: "700", color: "#ffffff" },
    btnDisabled: { opacity: 0.5 },
    footerSpacer: { height: 10 },
});