import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authGet } from "../../utils/api";

import Navbar from "../components/Navbar";
import Footer from "../components/FooterStudent";

const STATUS_CONFIG = {
    active: {
        label: "Active",
        bg: "#dcfce7",
        text: "#16a34a",
        icon: "✓",
        border: "#bbf7d0",
    },
    completed: {
        label: "Completed",
        bg: "#eef2ff",
        text: "#6366f1",
        icon: "✓",
        border: "#c7d2fe",
    },
    approved: {
        label: "Approved",
        bg: "#dcfce7",
        text: "#16a34a",
        icon: "✓",
        border: "#bbf7d0",
    },
    pending: {
        label: "Pending",
        bg: "#fef9c3",
        text: "#ca8a04",
        icon: "⏳",
        border: "#fef08a",
    },
    rejected: {
        label: "Rejected",
        bg: "#fee2e2",
        text: "#dc2626",
        icon: "✕",
        border: "#fecaca",
    },
    expired: {
        label: "Expired",
        bg: "#f1f5f9",
        text: "#64748b",
        icon: "⊘",
        border: "#e2e8f0",
    },
};

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatTime(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

// ✅ Updated: completed takes priority over expired
function getDisplayStatus(item) {
    // Both entry + exit scanned → completed
    if (item.scannedIn && item.scannedOut) {
        return "completed";
    }
    // Approved but time expired
    if (item.status === "approved") {
        return item.isExpired ? "expired" : "active";
    }
    return item.status?.toLowerCase() || "pending";
}

function InfoRow({ label, value }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || "—"}</Text>
        </View>
    );
}

export default function StudentHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentId, setStudentId] = useState(null);

    const navigation = useNavigation();

    useEffect(() => {
        loadStudentId();
    }, []);

    useEffect(() => {
        if (studentId) {
            fetchHistory();
        }
    }, [studentId]);

    const loadStudentId = async () => {
        try {
            const id = await AsyncStorage.getItem("studentId");
            setStudentId(id);
        } catch (err) {
            console.log(err);
        }
    };

    // ✅ FIXED: Replaced axios with authGet (automatically sends token)
    const fetchHistory = async () => {
        try {
            const data = await authGet(`/gatepass/student/${studentId}`);
            
            if (data.success) {
                setHistory(data.requests);
            } else {
                console.log("Fetch error:", data.message);
            }
        } catch (err) {
            console.log("ERROR:", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
            <View style={styles.container}>
                <Navbar />

                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <Text style={styles.greeting}>Your Records</Text>
                        <Text style={styles.subtitle}>
                            {loading
                                ? "Loading..."
                                : `${history.length} gatepass ${history.length === 1 ? "request" : "requests"} found`}
                        </Text>
                    </View>

                    {/* ✅ Summary Chips — includes completed */}
                    {!loading && history.length > 0 && (
                        <View style={styles.chipsRow}>
                            {["active", "completed", "pending", "expired", "rejected"].map(
                                (key) => {
                                    const count = history.filter(
                                        (h) => getDisplayStatus(h) === key
                                    ).length;
                                    if (count === 0) return null;
                                    const cfg = STATUS_CONFIG[key];
                                    return (
                                        <View
                                            key={key}
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: cfg.bg,
                                                    borderColor: cfg.border,
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    { color: cfg.text },
                                                ]}
                                            >
                                                {cfg.icon} {count}
                                            </Text>
                                        </View>
                                    );
                                }
                            )}
                        </View>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <View style={styles.centerBox}>
                            <ActivityIndicator size="large" color="#7c3aed" />
                            <Text style={styles.loadingText}>
                                Fetching your history...
                            </Text>
                        </View>
                    )}

                    {/* Empty State */}
                    {!loading && history.length === 0 && (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconWrap}>
                                <Text style={styles.emptyIcon}>📋</Text>
                            </View>
                            <Text style={styles.emptyTitle}>No History Yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Your approved and past gatepass requests will
                                appear here.
                            </Text>
                        </View>
                    )}

                    {/* Cards */}
                    {!loading &&
                        history.length > 0 &&
                        history.map((item, index) => {
                            const displayKey = getDisplayStatus(item);
                            const statusCfg =
                                STATUS_CONFIG[displayKey] ||
                                STATUS_CONFIG.pending;
                            return (
                                <TouchableOpacity
                                    key={item._id}
                                    style={styles.card}
                                    activeOpacity={0.85}
                                    onPress={() =>
                                        navigation.navigate("RequestSuccess", {
                                            requestId: item._id,
                                        })
                                    }
                                >
                                    {/* Card Top Accent Bar */}
                                    <View
                                        style={[
                                            styles.cardAccent,
                                            {
                                                backgroundColor: statusCfg.text,
                                            },
                                        ]}
                                    />

                                    {/* Card Header */}
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardHeaderLeft}>
                                            <Text style={styles.cardIndex}>
                                                #{String(index + 1).padStart(2, "0")}
                                            </Text>
                                            <Text style={styles.cardDestination}>
                                                {item.destination ||
                                                    "Unknown Destination"}
                                            </Text>
                                        </View>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                {
                                                    backgroundColor: statusCfg.bg,
                                                    borderColor: statusCfg.border,
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    { color: statusCfg.text },
                                                ]}
                                            >
                                                {statusCfg.icon}{" "}
                                                {statusCfg.label}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Card Divider */}
                                    <View style={styles.divider} />

                                    {/* Card Body */}
                                    <View style={styles.cardBody}>
                                        <View style={styles.infoGrid}>
                                            <View style={styles.infoBlock}>
                                                <Text style={styles.infoBlockLabel}>
                                                    Date
                                                </Text>
                                                <Text style={styles.infoBlockValue}>
                                                    {formatDate(item.outTime)}
                                                </Text>
                                            </View>
                                            <View style={styles.infoBlock}>
                                                <Text style={styles.infoBlockLabel}>
                                                    Out Time
                                                </Text>
                                                <Text style={styles.infoBlockValue}>
                                                    {formatTime(item.outTime)}
                                                </Text>
                                            </View>
                                            <View style={styles.infoBlock}>
                                                <Text style={styles.infoBlockLabel}>
                                                    Return Time
                                                </Text>
                                                <Text style={styles.infoBlockValue}>
                                                    {formatTime(item.returnTime)}
                                                </Text>
                                            </View>
                                            <View style={styles.infoBlock}>
                                                <Text style={styles.infoBlockLabel}>
                                                    Purpose
                                                </Text>
                                                <Text style={styles.infoBlockValue}>
                                                    {item.purpose || "General"}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* ✅ Scan progress mini indicator */}
                                        {item.status === "approved" && (
                                            <View style={styles.miniScanProgress}>
                                                <View style={styles.miniScanDot}>
                                                    <View
                                                        style={[
                                                            styles.miniScanDotInner,
                                                            item.scannedIn && styles.miniScanDotDone,
                                                        ]}
                                                    />
                                                    <Text style={styles.miniScanLabel}>IN</Text>
                                                </View>
                                                <View
                                                    style={[
                                                        styles.miniScanLine,
                                                        item.scannedIn && styles.miniScanLineDone,
                                                    ]}
                                                />
                                                <View style={styles.miniScanDot}>
                                                    <View
                                                        style={[
                                                            styles.miniScanDotInner,
                                                            item.scannedOut && styles.miniScanDotDone,
                                                        ]}
                                                    />
                                                    <Text style={styles.miniScanLabel}>OUT</Text>
                                                </View>
                                            </View>
                                        )}

                                        {item.reason && (
                                            <>
                                                <View style={styles.divider} />
                                                <InfoRow
                                                    label="Reason"
                                                    value={item.reason}
                                                />
                                            </>
                                        )}
                                    </View>

                                    {/* Card Footer */}
                                    <View style={styles.cardFooter}>
                                        <Text style={styles.cardFooterText}>
                                            Tap to view details →
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}

                    {/* Footer */}
                    <View style={styles.footerContainer}>
                        <View style={styles.footerDivider} />
                        <Text style={styles.footerText}>
                            © 2026 @TechVortex
                        </Text>
                    </View>
                </ScrollView>

                <Footer />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f5f3ff",
    },
    container: {
        flex: 1,
        backgroundColor: "#f5f3ff",
    },
    scroll: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 100,
    },

    /* ── Header ── */
    headerSection: {
        marginBottom: 20,
    },
    greeting: {
        fontSize: 30,
        fontWeight: "800",
        color: "#1e1b4b",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: "#8b8ba7",
        marginTop: 4,
        fontWeight: "500",
    },

    /* ── Summary Chips ── */
    chipsRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 24,
        flexWrap: "wrap",
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 12,
        fontWeight: "700",
    },

    /* ── Loading ── */
    centerBox: {
        paddingVertical: 60,
        alignItems: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#8b8ba7",
        fontWeight: "500",
    },

    /* ── Empty State ── */
    emptyState: {
        alignItems: "center",
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    emptyIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#ede9fe",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyIcon: {
        fontSize: 36,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1e1b4b",
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#8b8ba7",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },

    /* ── Card ── */
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        marginBottom: 16,
        overflow: "hidden",
        shadowColor: "#7c3aed",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#ede9fe",
    },
    cardAccent: {
        height: 4,
        width: "100%",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        paddingTop: 14,
    },
    cardHeaderLeft: {
        flex: 1,
        marginRight: 12,
    },
    cardIndex: {
        fontSize: 11,
        fontWeight: "700",
        color: "#a78bfa",
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    cardDestination: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1e1b4b",
        lineHeight: 24,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        flexShrink: 0,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    divider: {
        height: 1,
        backgroundColor: "#f1f0fb",
        marginHorizontal: 16,
        marginVertical: 12,
    },

    /* ── Card Body ── */
    cardBody: {
        paddingHorizontal: 16,
    },
    infoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    infoBlock: {
        flex: 1,
        minWidth: "45%",
        backgroundColor: "#faf9ff",
        borderRadius: 10,
        padding: 10,
    },
    infoBlockLabel: {
        fontSize: 10,
        fontWeight: "600",
        color: "#a78bfa",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 3,
    },
    infoBlockValue: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1e1b4b",
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 2,
    },
    infoLabel: {
        fontSize: 12,
        color: "#8b8ba7",
        fontWeight: "500",
    },
    infoValue: {
        fontSize: 13,
        color: "#1e1b4b",
        fontWeight: "600",
        flex: 1,
        textAlign: "right",
    },

    /* ── ✅ Mini Scan Progress ── */
    miniScanProgress: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        paddingVertical: 8,
        backgroundColor: "#faf9ff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#f1f0fb",
    },
    miniScanDot: {
        alignItems: "center",
        gap: 3,
    },
    miniScanDotInner: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: "#cbd5e1",
        backgroundColor: "#f1f5f9",
    },
    miniScanDotDone: {
        borderColor: "#16a34a",
        backgroundColor: "#16a34a",
    },
    miniScanLabel: {
        fontSize: 9,
        fontWeight: "700",
        color: "#94a3b8",
        letterSpacing: 0.5,
    },
    miniScanLine: {
        width: 40,
        height: 2,
        backgroundColor: "#e2e8f0",
        borderRadius: 1,
        marginHorizontal: 10,
    },
    miniScanLineDone: {
        backgroundColor: "#16a34a",
    },

    /* ── Card Footer ── */
    cardFooter: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#f1f0fb",
    },
    cardFooterText: {
        fontSize: 12,
        color: "#a78bfa",
        fontWeight: "600",
        textAlign: "center",
    },

    /* ── Footer ── */
    footerContainer: {
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 10,
    },
    footerDivider: {
        width: 60,
        height: 3,
        borderRadius: 2,
        backgroundColor: "#e0dafb",
        marginBottom: 12,
    },
    footerText: {
        fontSize: 11,
        color: "#b0adc4",
        fontWeight: "500",
    },
});