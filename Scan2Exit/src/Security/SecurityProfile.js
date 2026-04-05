import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    StatusBar,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Animated,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { EXPO_PUBLIC_API_URL } from "@env";

import Navbar from "../components/Navbar";
import FooterSecurity from "../components/FooterSecurity";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

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

/* ── Counter Animation ─────────────────────────────── */
function AnimatedNumber({ value, style }) {
    const [displayed, setDisplayed] = useState(value);

    useEffect(() => {
        if (value === displayed) return;
        setDisplayed(value);
    }, [value, displayed]);

    return <Text style={style}>{displayed}</Text>;
}

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

export default function SecurityProfile() {
    const { user, setUser } = useContext(AuthContext);
    const navigation = useNavigation();
    const [myStats, setMyStats] = useState(null);
    const [myScans, setMyScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const intervalRef = useRef(null);

    const fetchMyData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);

        try {
            const scannedBy = user?.name || "Security";

            const [sRes, hRes] = await Promise.all([
                fetch(
                    `${EXPO_PUBLIC_API_URL}/security-scans/today-stats?scannedBy=${encodeURIComponent(scannedBy)}`
                ),
                fetch(
                    `${EXPO_PUBLIC_API_URL}/security-scans/history?filter=all&limit=10&scannedBy=${encodeURIComponent(scannedBy)}`
                ),
            ]);

            const sData = await sRes.json();
            const hData = await hRes.json();

            if (sData.success) setMyStats(sData.stats);
            if (hData.success) setMyScans(hData.scans);

            setLastUpdated(new Date());
            setIsLive(true);
        } catch (err) {
            console.log("Profile fetch error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.name]);

    // ✅ Initial load
    useEffect(() => {
        fetchMyData();
    }, [fetchMyData]);

    // ✅ Polling — every 4 seconds
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            fetchMyData();
        }, 4000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchMyData]);

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                onPress: () => {
                    setUser(null);
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "Home" }],
                    });
                },
                style: "destructive",
            },
        ]);
    };

    const successRate =
        myStats && myStats.total > 0
            ? Math.round(((myStats.total - myStats.denied) / myStats.total) * 100)
            : 0;

    const formatLastUpdated = (date) => {
        if (!date) return "";
        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

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
                        onRefresh={() => fetchMyData(true)}
                        colors={["#1a237e"]}
                        tintColor="#1a237e"
                    />
                }
            >
                {/* ── Profile Header ────────────────────── */}
                <View style={styles.profileHeader}>
                    <View style={styles.profileBackground} />
                    <View style={styles.profileContainer}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{
                                    uri: "https://randomuser.me/api/portraits/men/32.jpg",
                                }}
                                style={styles.avatar}
                            />
                            <TouchableOpacity style={styles.editAvatarBtn}>
                                <MaterialIcons
                                    name="camera-alt"
                                    size={16}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.name}>{user?.name || "Security Guard"}</Text>
                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>On Duty</Text>
                        </View>
                    </View>
                </View>

                {/* ── Performance Stats (Real-Time) ─────── */}
                <View style={styles.statsContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Today's Performance
                        </Text>
                        {isLive && !loading && (
                            <View style={styles.liveChip}>
                                <LiveDot />
                                <Text style={styles.liveChipText}>LIVE</Text>
                            </View>
                        )}
                    </View>

                    {lastUpdated && !loading && (
                        <Text style={styles.lastUpdated}>
                            Updated {formatLastUpdated(lastUpdated)}
                        </Text>
                    )}

                    {loading ? (
                        <ActivityIndicator
                            size="large"
                            color="#1a237e"
                            style={{ paddingVertical: 30 }}
                        />
                    ) : myStats ? (
                        <>
                            {/* Row 1: Scanned & Rejected */}
                            <View style={styles.statsRow}>
                                <View style={[styles.statCard, styles.statCardGreen]}>
                                    <View style={styles.statIconWrap}>
                                        <MaterialCommunityIcons
                                            name="account-check"
                                            size={26}
                                            color="#4caf50"
                                        />
                                    </View>
                                    <AnimatedNumber
                                        value={myStats.total}
                                        style={styles.statNumber}
                                    />
                                    <Text style={styles.statLabel}>QR Scanned</Text>
                                    <View style={styles.statBreakdown}>
                                        <View style={styles.statBreakdownItem}>
                                            <MaterialIcons name="call-made" size={14} color="#2196f3" />
                                            <Text style={styles.statBreakdownText}>
                                                {myStats.exits} out
                                            </Text>
                                        </View>
                                        <View style={styles.statBreakdownDivider} />
                                        <View style={styles.statBreakdownItem}>
                                            <MaterialIcons name="call-received" size={14} color="#ff9800" />
                                            <Text style={styles.statBreakdownText}>
                                                {myStats.entries} in
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={[styles.statCard, styles.statCardRed]}>
                                    <View style={styles.statIconWrap}>
                                        <MaterialIcons name="block" size={26} color="#dc2626" />
                                    </View>
                                    <AnimatedNumber
                                        value={myStats.denied}
                                        style={styles.statNumberRed}
                                    />
                                    <Text style={styles.statLabel}>Rejected</Text>
                                    <View style={styles.statDetail}>
                                        <Text style={styles.statDetailText}>
                                            Invalid / expired
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Row 2: Active Outside */}
                            <View style={styles.activeOutsideCard}>
                                <View style={styles.activeOutsideLeft}>
                                    <View style={styles.activeOutsideIconWrap}>
                                        <MaterialCommunityIcons name="account-group" size={20} color="#ff6f00" />
                                    </View>
                                    <View>
                                        <Text style={styles.activeOutsideTitle}>Currently Outside</Text>
                                        <Text style={styles.activeOutsideSub}>Students yet to return</Text>
                                    </View>
                                </View>
                                <View style={styles.activeOutsideNumber}>
                                    <AnimatedNumber value={myStats.activeOutside} style={styles.activeOutsideNum} />
                                </View>
                            </View>

                            {/* Row 3: Success Rate */}
                            <View style={styles.rateCard}>
                                <View style={styles.rateHeader}>
                                    <View style={styles.rateLeft}>
                                        <MaterialIcons name="speed" size={22} color="#1a237e" />
                                        <View>
                                            <Text style={styles.rateTitle}>Success Rate</Text>
                                            <Text style={styles.rateSub}>Allowed vs total scanned</Text>
                                        </View>
                                    </View>
                                    <View style={styles.rateRight}>
                                        <AnimatedNumber
                                            value={successRate}
                                            style={[
                                                styles.ratePercent,
                                                successRate >= 90 && styles.ratePercentGreen,
                                                successRate >= 70 && successRate < 90 && styles.ratePercentYellow,
                                                successRate < 70 && styles.ratePercentRed,
                                            ]}
                                        />
                                        <Text style={styles.ratePercentSign}>%</Text>
                                    </View>
                                </View>
                                <View style={styles.rateBar}>
                                    <View
                                        style={[
                                            styles.rateBarFill,
                                            {
                                                width: `${successRate}%`,
                                                backgroundColor:
                                                    successRate >= 90 ? "#16a34a" : successRate >= 70 ? "#f59e0b" : "#dc2626",
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={styles.rateBreakdownRow}>
                                    <Text style={styles.rateBreakdownText}>{myStats.total - myStats.denied} allowed</Text>
                                    <Text style={styles.rateBreakdownDivider}>·</Text>
                                    <Text style={styles.rateBreakdownText}>{myStats.denied} denied</Text>
                                    <Text style={styles.rateBreakdownDivider}>·</Text>
                                    <Text style={styles.rateBreakdownText}>{myStats.total} total</Text>
                                </View>
                            </View>
                        </>
                    ) : null}
                </View>

                {/* ── ✅ My Scan Details (Exit/Entry List) ── */}
                <View style={styles.scanSection}>
                    <View style={styles.scanSectionHeader}>
                        <Text style={styles.scanSectionTitle}>My Scan Activity</Text>
                        <Text style={styles.scanCount}>{myScans.length} records</Text>
                    </View>

                    {!loading && myScans.length === 0 && (
                        <View style={styles.emptyBox}>
                            <MaterialCommunityIcons name="qrcode-scan" size={48} color="#c5cae9" />
                            <Text style={styles.emptyText}>No scans performed yet today</Text>
                        </View>
                    )}

                    {myScans.map((item) => {
                        const isExit = item.action === "exit" && item.status === "allowed";
                        const isEnter = item.action === "enter" && item.status === "allowed";
                        const isDenied = item.status === "denied";

                        const avatarBg = isExit ? "#f59e0b" : isEnter ? "#16a34a" : "#dc2626";
                        const badgeBg = isExit ? "#fffbeb" : isEnter ? "#f0fdf4" : "#fef2f2";
                        const badgeColor = isExit ? "#b45309" : isEnter ? "#15803d" : "#dc2626";
                        const badgeLabel = isExit ? "EXIT" : isEnter ? "ENTER" : "DENIED";

                        const actionIcon = isExit ? "logout" : isEnter ? "login" : "block";
                        const actionColor = isExit ? "#f59e0b" : isEnter ? "#16a34a" : "#dc2626";

                        const stu = item.student || {};

                        return (
                            <View key={item._id} style={styles.scanItem}>
                                {/* Left: Avatar + Info */}
                                <View style={styles.scanItemLeft}>
                                    <View style={[styles.scanAvatar, { backgroundColor: avatarBg }]}>
                                        <Text style={styles.scanAvatarText}>
                                            {getInitials(item.studentName || stu.fullName)}
                                        </Text>
                                    </View>
                                    <View style={styles.scanItemInfo}>
                                        <Text style={styles.scanItemName}>
                                            {item.studentName || stu.fullName || "Unknown"}
                                        </Text>
                                        <View style={styles.scanItemMeta}>
                                            <Text style={styles.scanItemReg}>
                                                {item.studentRegNo || stu.regNo || "—"}
                                            </Text>
                                            <Text style={styles.scanItemDot}>•</Text>
                                            <Text style={styles.scanItemDest}>
                                                {item.destination || (item.gatePass && item.gatePass.destination) || "—"}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Right: Badge + Time */}
                                <View style={styles.scanItemRight}>
                                    <Text style={styles.scanItemTime}>{fmtTime(item.createdAt)}</Text>
                                    <View style={[styles.scanBadge, { backgroundColor: badgeBg }]}>
                                        <MaterialIcons name={actionIcon} size={12} color={badgeColor} />
                                        <Text style={[styles.scanBadgeText, { color: badgeColor }]}>
                                            {badgeLabel}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* ── Account Information ───────────────── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Account Information</Text>
                    </View>
                    <InfoRow icon="badge" label="Employee ID" value={user?.empId || "—"} />
                    <InfoRow icon="email" label="Email" value={user?.email || "—"} />
                    <InfoRow icon="phone" label="Phone" value={user?.phone || "—"} />
                    <InfoRow icon="business" label="Department" value="Campus Security" />
                </View>

                {/* ── Logout ────────────────────────────── */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <MaterialIcons name="logout" size={20} color="#f44336" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            <FooterSecurity />
        </View>
    );
}

/* ── Small reusable row ─────────────────────────────── */
function InfoRow({ icon, label, value, last }) {
    return (
        <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
            <View style={styles.infoItem}>
                <MaterialIcons name={icon} size={16} color="#5c6bc0" />
                <Text style={styles.label}>{label}</Text>
            </View>
            <Text style={styles.value}>{value}</Text>
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

    /* ── Profile Header ──────────────────────────────── */
    profileHeader: {
        marginBottom: 24,
        position: "relative",
    },
    profileBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        backgroundColor: "#1a237e",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    profileContainer: {
        alignItems: "center",
        paddingTop: 40,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 12,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: "#fff",
    },
    editAvatarBtn: {
        position: "absolute",
        bottom: 5,
        right: 5,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#1a237e",
        justifyContent: "center",
        alignItems: "center",
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1a237e",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e8f5e9",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 10,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#4caf50",
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: "#2e7d32",
        fontWeight: "600",
    },

    /* ── Stats Section ──────────────────────────────── */
    statsContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a237e",
    },
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
    lastUpdated: {
        fontSize: 11,
        color: "#90a4ae",
        marginBottom: 12,
        fontWeight: "500",
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
        alignItems: "center",
    },
    statCardGreen: {
        borderTopWidth: 3,
        borderTopColor: "#4caf50",
    },
    statCardRed: {
        borderTopWidth: 3,
        borderTopColor: "#dc2626",
    },
    statIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#f1f8e9",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    statNumber: {
        fontSize: 32,
        fontWeight: "800",
        color: "#1a237e",
    },
    statNumberRed: {
        fontSize: 32,
        fontWeight: "800",
        color: "#dc2626",
    },
    statLabel: {
        fontSize: 12,
        color: "#78909c",
        textAlign: "center",
        fontWeight: "600",
        marginTop: 2,
    },
    statBreakdown: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        backgroundColor: "#f5f7fa",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statBreakdownItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    statBreakdownText: {
        fontSize: 11,
        color: "#546e7a",
        fontWeight: "600",
    },
    statBreakdownDivider: {
        width: 1,
        height: 14,
        backgroundColor: "#cfd8dc",
        marginHorizontal: 8,
    },
    statDetail: {
        marginTop: 10,
        backgroundColor: "#fef2f2",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statDetailText: {
        fontSize: 10,
        color: "#ef4444",
        fontWeight: "500",
    },
    activeOutsideCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 14,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: "#ff6f00",
    },
    activeOutsideLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    activeOutsideIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#fff3e0",
        alignItems: "center",
        justifyContent: "center",
    },
    activeOutsideTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1a237e",
    },
    activeOutsideSub: {
        fontSize: 11,
        color: "#90a4ae",
        marginTop: 1,
    },
    activeOutsideNumber: {
        backgroundColor: "#fff3e0",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    activeOutsideNum: {
        fontSize: 22,
        fontWeight: "800",
        color: "#ff6f00",
    },
    rateCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },
    rateHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    rateLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    rateTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1a237e",
    },
    rateSub: {
        fontSize: 11,
        color: "#90a4ae",
        marginTop: 1,
    },
    rateRight: {
        flexDirection: "row",
        alignItems: "flex-end",
    },
    ratePercent: {
        fontSize: 28,
        fontWeight: "800",
        color: "#16a34a",
    },
    ratePercentGreen: { color: "#16a34a" },
    ratePercentYellow: { color: "#f59e0b" },
    ratePercentRed: { color: "#dc2626" },
    ratePercentSign: {
        fontSize: 14,
        fontWeight: "700",
        color: "#90a4ae",
        marginBottom: 4,
        marginLeft: 1,
    },
    rateBar: {
        height: 8,
        backgroundColor: "#e8eaf6",
        borderRadius: 4,
        overflow: "hidden",
    },
    rateBarFill: {
        height: "100%",
        borderRadius: 4,
    },
    rateBreakdownRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        gap: 6,
    },
    rateBreakdownText: {
        fontSize: 11,
        color: "#90a4ae",
        fontWeight: "500",
    },
    rateBreakdownDivider: {
        fontSize: 11,
        color: "#cfd8dc",
    },

    /* ── ✅ Scan Activity Section ────────────────────── */
    scanSection: {
        marginBottom: 24,
    },
    scanSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    scanSectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a237e",
    },
    scanCount: {
        fontSize: 12,
        color: "#90a4ae",
        fontWeight: "600",
        backgroundColor: "#f5f7fa",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },

    /* ── Scan Items ─────────────────────────────────── */
    scanItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
    scanItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    scanAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    scanAvatarText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
    scanItemInfo: {
        flex: 1,
    },
    scanItemName: {
        fontWeight: "600",
        fontSize: 14,
        color: "#263238",
    },
    scanItemMeta: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    scanItemReg: {
        fontSize: 11,
        color: "#78909c",
        fontWeight: "500",
    },
    scanItemDot: {
        fontSize: 11,
        color: "#cfd8dc",
        marginHorizontal: 4,
    },
    scanItemDest: {
        fontSize: 11,
        color: "#546e7a",
        fontWeight: "600",
    },
    scanItemRight: {
        alignItems: "flex-end",
        gap: 6,
        marginLeft: 10,
    },
    scanItemTime: {
        fontSize: 12,
        color: "#546e7a",
        fontWeight: "600",
    },
    scanBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 3,
    },
    scanBadgeText: {
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 0.5,
    },

    /* ── Empty ────────────────────────────────────────── */
    emptyBox: {
        alignItems: "center",
        paddingVertical: 30,
        gap: 8,
    },
    emptyText: {
        fontSize: 14,
        color: "#90a4ae",
        fontWeight: "500",
    },

    /* ── Account Card ────────────────────────────────── */
    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 6,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a237e",
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
    },
    infoRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    label: {
        fontSize: 14,
        color: "#78909c",
        marginLeft: 8,
    },
    value: {
        fontSize: 15,
        fontWeight: "600",
        color: "#263238",
        flex: 1,
        textAlign: "right",
    },

    /* ── Logout ──────────────────────────────────────── */
    logoutBtn: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },
    logoutText: {
        fontSize: 16,
        color: "#f44336",
        fontWeight: "600",
        marginLeft: 8,
    },
});