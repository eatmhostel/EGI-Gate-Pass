import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { EXPO_PUBLIC_API_URL } from "@env";
import Navbar from "../components/Navbar";
import FooterSecurity from "../components/FooterSecurity";

const FILTERS = [
    { key: "all", label: "All" },
    { key: "exit", label: "Exits" },
    { key: "enter", label: "Entries" },
    { key: "denied", label: "Denied" },
];

const fmtTime = (d) =>
    d
        ? new Date(d).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
          })
        : "";
const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
          })
        : "";

const getInitials = (name) =>
    name
        ? name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "?";

export default function SecurityHistory() {
    const [scans, setScans] = useState([]);
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const [hRes, sRes] = await Promise.all([
                fetch(
                    `${EXPO_PUBLIC_API_URL}/security-scans/history?filter=${filter}&limit=60`
                ),
                fetch(`${EXPO_PUBLIC_API_URL}/security-scans/today-stats`),
            ]);
            const hData = await hRes.json();
            const sData = await sRes.json();
            if (hData.success) setScans(hData.scans);
            if (sData.success) setStats(sData.stats);
        } catch (err) {
            console.log("History fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#003080" />
            <Navbar />

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    // Simple pull-to-refresh via a refresh button instead
                    null
                }
            >
                {/* Header */}
                <Text style={styles.heading}>Scan History</Text>
                <Text style={styles.subheading}>
                    View all verified entries and exits.
                </Text>

                {/* ── Today's Stats ─────────────────── */}
                {stats && (
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { borderLeftColor: "#f59e0b" }]}>
                            <Text style={styles.statNum}>{stats.exits}</Text>
                            <Text style={styles.statLabel}>Exits</Text>
                        </View>
                        <View style={[styles.statCard, { borderLeftColor: "#16a34a" }]}>
                            <Text style={styles.statNum}>{stats.entries}</Text>
                            <Text style={styles.statLabel}>Entries</Text>
                        </View>
                        <View style={[styles.statCard, { borderLeftColor: "#dc2626" }]}>
                            <Text style={styles.statNum}>{stats.denied}</Text>
                            <Text style={styles.statLabel}>Denied</Text>
                        </View>
                    </View>
                )}

                {/* ── Filter Tabs ───────────────────── */}
                <View style={styles.filterRow}>
                    {FILTERS.map((f) => (
                        <TouchableOpacity
                            key={f.key}
                            style={[
                                styles.filterChip,
                                filter === f.key && styles.filterChipActive,
                            ]}
                            onPress={() => setFilter(f.key)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    filter === f.key &&
                                        styles.filterChipTextActive,
                                ]}
                            >
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Scan List ─────────────────────── */}
                {loading ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#1a237e" />
                    </View>
                ) : scans.length === 0 ? (
                    <View style={styles.centerBox}>
                        <MaterialCommunityIcons
                            name="qrcode-scan"
                            size={56}
                            color="#c5cae9"
                        />
                        <Text style={styles.emptyTitle}>No Scans Yet</Text>
                        <Text style={styles.emptySub}>
                            {filter === "all"
                                ? "Scan a QR code to start recording history."
                                : `No ${filter} records found.`}
                        </Text>
                    </View>
                ) : (
                    scans.map((item) => {
                        const isExit =
                            item.action === "exit" && item.status === "allowed";
                        const isEnter =
                            item.action === "enter" && item.status === "allowed";
                        const isDenied = item.status === "denied";
                        const stu = item.student || {};
                        const gp = item.gatePass || {};

                        const badgeBg = isExit
                            ? "#fffbeb"
                            : isEnter
                            ? "#f0fdf4"
                            : "#fef2f2";
                        const badgeText = isExit
                            ? "#b45309"
                            : isEnter
                            ? "#15803d"
                            : "#dc2626";
                        const badgeLabel = isExit
                            ? "EXIT"
                            : isEnter
                            ? "ENTER"
                            : "DENIED";
                        const avatarBg = isExit
                            ? "#f59e0b"
                            : isEnter
                            ? "#16a34a"
                            : "#dc2626";

                        return (
                            <View key={item._id} style={styles.scanItem}>
                                {/* Avatar */}
                                <View
                                    style={[
                                        styles.avatar,
                                        { backgroundColor: avatarBg },
                                    ]}
                                >
                                    <Text style={styles.avatarText}>
                                        {getInitials(
                                            item.studentName || stu.fullName
                                        )}
                                    </Text>
                                </View>

                                {/* Info */}
                                <View style={styles.scanInfo}>
                                    <Text style={styles.name}>
                                        {item.studentName || stu.fullName || "Unknown"}
                                    </Text>
                                    <Text style={styles.subText}>
                                        {[
                                            item.studentRegNo || stu.regNo,
                                            gp.destination,
                                        ]
                                            .filter(Boolean)
                                            .join(" • ")}
                                    </Text>
                                    {isDenied && item.denyReason && (
                                        <Text style={styles.denyReason}>
                                            {item.denyReason}
                                        </Text>
                                    )}
                                </View>

                                {/* Time + Badge */}
                                <View style={styles.scanMeta}>
                                    <Text style={styles.time}>
                                        {fmtTime(item.createdAt)}
                                    </Text>
                                    <Text style={styles.date}>
                                        {fmtDate(item.createdAt)}
                                    </Text>
                                    <View
                                        style={[
                                            styles.badge,
                                            { backgroundColor: badgeBg },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.badgeText,
                                                { color: badgeText },
                                            ]}
                                        >
                                            {badgeLabel}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating refresh */}
            {!loading && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={fetchHistory}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="refresh" size={22} color="#fff" />
                </TouchableOpacity>
            )}

            <FooterSecurity />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f7fa" },
    scroll: { padding: 16, paddingBottom: 120 },

    heading: { fontSize: 28, fontWeight: "bold", color: "#1a237e", marginBottom: 6 },
    subheading: { color: "#5c6bc0", marginBottom: 24, fontSize: 15 },

    /* stats */
    statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
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

    /* filters */
    filterRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: "#e8eaf6",
    },
    filterChipActive: { backgroundColor: "#1a237e" },
    filterChipText: { fontSize: 13, fontWeight: "600", color: "#5c6bc0" },
    filterChipTextActive: { color: "#fff" },

    /* list */
    scanItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 2,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    avatarText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    scanInfo: { flex: 1 },
    name: { fontWeight: "700", fontSize: 15, color: "#263238" },
    subText: { fontSize: 12, color: "#78909c", marginTop: 2 },
    denyReason: { fontSize: 11, color: "#dc2626", marginTop: 3, fontStyle: "italic" },
    scanMeta: { alignItems: "flex-end", gap: 2 },
    time: { fontSize: 13, color: "#37474f", fontWeight: "600" },
    date: { fontSize: 11, color: "#90a4ae" },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
    badgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

    /* empty / loading */
    centerBox: { alignItems: "center", paddingVertical: 60, gap: 10 },
    emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1a237e", marginTop: 8 },
    emptySub: { fontSize: 13, color: "#78909c", textAlign: "center", paddingHorizontal: 30, lineHeight: 20 },

    /* FAB */
    fab: {
        position: "absolute",
        bottom: 90,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#1a237e",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#1a237e",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});