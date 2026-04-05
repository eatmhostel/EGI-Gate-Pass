import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Animated,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { EXPO_PUBLIC_API_URL } from "@env";

import Navbar from "../components/Navbar";
import FooterSecurity from "../components/FooterSecurity";

const fmtTime = (d) =>
    d
        ? new Date(d).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
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

/* ── Animated Pulse Dot ────────────────────────────── */
function LiveDot() {
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 0.3, duration: 600, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [pulse]);

    return (
        <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
    );
}

export default function SecurityDashboard() {
    const navigation = useNavigation();
    const [stats, setStats] = useState(null);
    const [recentScans, setRecentScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const intervalRef = useRef(null);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else if (!stats) setLoading(true); // Only show spinner on initial load

        try {
            const [sRes, hRes] = await Promise.all([
                fetch(`${EXPO_PUBLIC_API_URL}/security-scans/today-stats`),
                fetch(
                    `${EXPO_PUBLIC_API_URL}/security-scans/history?filter=all&limit=5`
                ),
            ]);

            const sData = await sRes.json();
            const hData = await hRes.json();

            if (sData.success) setStats(sData.stats);
            if (hData.success) setRecentScans(hData.scans);
            
            setIsLive(true);
        } catch (err) {
            console.log("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [stats]);

    // ✅ Initial load
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ✅ Polling — every 4 seconds
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            fetchData();
        }, 4000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchData]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#003080" />
            <Navbar />

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchData(true)}
                        colors={["#1a237e"]}
                        tintColor="#1a237e"
                    />
                }
            >
                {/* Header */}
                <Text style={styles.heading}>Security Dashboard</Text>
                <Text style={styles.subheading}>
                    Verify credentials and manage campus access.
                </Text>

                {/* ── Gate Control ─────────────────────── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIcon}>
                            <MaterialIcons
                                name="security"
                                size={24}
                                color="#0040a1"
                            />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>Gate Control</Text>
                            <Text style={styles.cardSub}>
                                Scan or manually verify passes
                            </Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate("Scanner")}
                        >
                            <MaterialIcons
                                name="qr-code-scanner"
                                size={20}
                                color="#fff"
                            />
                            <Text style={styles.btnText}>Scan QR</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons
                                name="edit"
                                size={20}
                                color="#0040a1"
                            />
                            <Text style={styles.secondaryBtnText}>
                                Manual Entry
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Stats ────────────────────────────── */}
                {loading ? (
                    <ActivityIndicator
                        size="large"
                        color="#1a237e"
                        style={{ marginVertical: 40 }}
                    />
                ) : stats ? (
                    <>
                        {/* ✅ Section Header with Live Indicator */}
                        <View style={styles.statsSectionHeader}>
                            <Text style={styles.statsSectionTitle}>Today's Activity</Text>
                            {isLive && (
                                <View style={styles.liveChip}>
                                    <LiveDot />
                                    <Text style={styles.liveChipText}>LIVE</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.row}>
                            {/* ✅ Passes Today (Total who passed) */}
                            <View style={styles.statBoxGreen}>
                                <View style={styles.statHeader}>
                                    <MaterialIcons
                                        name="verified-user"
                                        size={18}
                                        color="#006633"
                                    />
                                    <Text style={styles.statLabel}>
                                        Passed Gate
                                    </Text>
                                </View>
                                <Text style={styles.statNumber}>
                                    {stats.passed}
                                </Text>
                                <View style={styles.statBar}>
                                    <View
                                        style={[
                                            styles.statBarFill,
                                            {
                                                width:
                                                    stats.passed > 0
                                                        ? `${Math.min((stats.exits / Math.max(stats.passed, 1)) * 100, 100)}%`
                                                        : "0%",
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.statSubText}>
                                    {stats.exits} out · {stats.entries} in
                                </Text>
                            </View>

                            {/* Active Outside */}
                            <View style={styles.statBoxAmber}>
                                <View style={styles.statHeader}>
                                    <MaterialIcons
                                        name="people-alt"
                                        size={18}
                                        color="#e65100"
                                    />
                                    <Text style={styles.statLabel}>
                                        Outside Campus
                                    </Text>
                                </View>
                                <Text style={styles.statNumberAmber}>
                                    {stats.activeOutside}
                                </Text>
                                <View style={styles.statBar}>
                                    <View
                                        style={[
                                            styles.statBarFillAmber,
                                            {
                                                width:
                                                    stats.activeOutside > 0
                                                        ? `${Math.min(stats.activeOutside * 3, 100)}%`
                                                        : "0%",
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.statSubText}>
                                    Awaiting return
                                </Text>
                            </View>
                        </View>

                        {/* Denied row */}
                        <View style={styles.deniedRow}>
                            <MaterialIcons
                                name="block"
                                size={16}
                                color="#c62828"
                            />
                            <Text style={styles.deniedText}>
                                <Text style={styles.deniedNum}>
                                    {stats.denied}
                                </Text>{" "}
                                denied today
                            </Text>
                        </View>
                    </>
                ) : null}

                {/* ── Recent Scans ─────────────────────── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Scans</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("SecurityHistory")}
                    >
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {!loading && recentScans.length === 0 && (
                    <View style={styles.emptyBox}>
                        <MaterialCommunityIcons
                            name="qrcode-scan"
                            size={48}
                            color="#c5cae9"
                        />
                        <Text style={styles.emptyText}>No scans today yet</Text>
                    </View>
                )}

                {recentScans.map((item) => {
                    const isExit =
                        item.action === "exit" && item.status === "allowed";
                    const isEnter =
                        item.action === "enter" && item.status === "allowed";
                    const isDenied = item.status === "denied";

                    const avatarBg = isExit
                        ? "#f59e0b"
                        : isEnter
                        ? "#16a34a"
                        : "#dc2626";
                    const badgeBg = isExit
                        ? "#fffbeb"
                        : isEnter
                        ? "#f0fdf4"
                        : "#fef2f2";
                    const badgeColor = isExit
                        ? "#b45309"
                        : isEnter
                        ? "#15803d"
                        : "#dc2626";
                    const badgeLabel = isExit
                        ? "EXIT"
                        : isEnter
                        ? "ENTER"
                        : "DENIED";

                    const stu = item.student || {};

                    return (
                        <View key={item._id} style={styles.scanItem}>
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

                            <View style={styles.scanInfo}>
                                <Text style={styles.name}>
                                    {item.studentName ||
                                        stu.fullName ||
                                        "Unknown"}
                                </Text>
                                <Text style={styles.subText}>
                                    {[
                                        item.studentRegNo || stu.regNo,
                                        item.destination ||
                                            (item.gatePass &&
                                                item.gatePass.destination),
                                    ]
                                        .filter(Boolean)
                                        .join(" • ")}
                                </Text>
                            </View>

                            <View style={styles.scanMeta}>
                                <Text style={styles.time}>
                                    {fmtTime(item.createdAt)}
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
                                            { color: badgeColor },
                                        ]}
                                    >
                                        {badgeLabel}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                })}

                <View style={{ height: 100 }} />
            </ScrollView>

            <FooterSecurity />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa",
    },

    scroll: {
        padding: 16,
        paddingBottom: 120,
    },

    heading: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1a237e",
        marginBottom: 6,
    },

    subheading: {
        color: "#5c6bc0",
        marginBottom: 24,
        fontSize: 15,
    },

    /* ── Live Chip ──────────────────────────────────── */
    liveChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#dcfce7",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#16a34a",
        marginRight: 4,
    },
    liveChipText: {
        fontSize: 9,
        fontWeight: "800",
        color: "#16a34a",
        letterSpacing: 0.8,
    },

    /* ── Card ─────────────────────────────────────────── */
    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 6,
    },

    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },

    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#e8eaf6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },

    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a237e",
    },

    cardSub: {
        color: "#5c6bc0",
        fontSize: 14,
        marginTop: 2,
    },

    row: {
        flexDirection: "row",
        gap: 12,
    },

    primaryBtn: {
        flex: 1,
        flexDirection: "row",
        gap: 8,
        backgroundColor: "#1a237e",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#1a237e",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },

    secondaryBtn: {
        flex: 1,
        flexDirection: "row",
        gap: 8,
        backgroundColor: "#e8eaf6",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#c5cae9",
    },

    btnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },

    secondaryBtnText: {
        color: "#1a237e",
        fontWeight: "600",
        fontSize: 15,
    },

    /* ── Stats Section ───────────────────────────────── */
    statsSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    statsSectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a237e",
    },

    /* ── Stat Boxes ───────────────────────────────────── */
    statBoxGreen: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 5,
        borderLeftWidth: 4,
        borderLeftColor: "#4caf50",
    },

    statBoxAmber: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 5,
        borderLeftWidth: 4,
        borderLeftColor: "#ff9800",
    },

    statHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },

    statLabel: {
        fontSize: 13,
        color: "#5c6bc0",
        marginLeft: 6,
        fontWeight: "500",
    },

    statNumber: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1a237e",
        marginBottom: 8,
    },

    statNumberAmber: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#e65100",
        marginBottom: 8,
    },

    statBar: {
        height: 4,
        backgroundColor: "#e8eaf6",
        borderRadius: 2,
        overflow: "hidden",
    },

    statBarFill: {
        height: "100%",
        backgroundColor: "#4caf50",
        borderRadius: 2,
    },

    statBarFillAmber: {
        height: "100%",
        backgroundColor: "#ff9800",
        borderRadius: 2,
    },

    statSubText: {
        fontSize: 11,
        color: "#90a4ae",
        marginTop: 6,
        fontWeight: "500",
    },

    /* ── Denied Row ───────────────────────────────────── */
    deniedRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fef2f2",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#fecaca",
    },

    deniedText: {
        fontSize: 13,
        color: "#7f1d1d",
        marginLeft: 6,
        fontWeight: "500",
    },

    deniedNum: {
        fontWeight: "800",
        color: "#dc2626",
    },

    /* ── Section ──────────────────────────────────────── */
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 28,
        marginBottom: 16,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a237e",
    },

    viewAllText: {
        color: "#3f51b5",
        fontSize: 14,
        fontWeight: "500",
    },

    /* ── Scan Items ───────────────────────────────────── */
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
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },

    avatarText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },

    scanInfo: {
        flex: 1,
    },

    name: {
        fontWeight: "600",
        fontSize: 15,
        color: "#263238",
    },

    subText: {
        fontSize: 12,
        color: "#78909c",
        marginTop: 2,
    },

    scanMeta: {
        alignItems: "flex-end",
        gap: 4,
    },

    time: {
        fontSize: 13,
        color: "#546e7a",
        fontWeight: "600",
    },

    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },

    badgeText: {
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 0.5,
    },

    /* ── Empty ────────────────────────────────────────── */
    emptyBox: {
        alignItems: "center",
        paddingVertical: 40,
        gap: 8,
    },

    emptyText: {
        fontSize: 14,
        color: "#90a4ae",
        fontWeight: "500",
    },
});