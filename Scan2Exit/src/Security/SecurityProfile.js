import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { EXPO_PUBLIC_API_URL } from "@env";

import Navbar from "../components/Navbar";
import FooterSecurity from "../components/FooterSecurity";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function SecurityProfile() {
    const { user } = useContext(AuthContext);
    const [myStats, setMyStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyStats = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            // Fetch stats filtered by THIS security guard's name
            const scannedBy = user?.name || "Security";
            const res = await fetch(
                `${EXPO_PUBLIC_API_URL}/security-scans/today-stats?scannedBy=${encodeURIComponent(scannedBy)}`
            );
            const data = await res.json();
            if (data.success) setMyStats(data.stats);
        } catch (err) {
            console.log("Profile stats error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.name]);

    useEffect(() => {
        fetchMyStats();
    }, [fetchMyStats]);

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                onPress: () => console.log("Logout pressed"),
                style: "destructive",
            },
        ]);
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
                        onRefresh={() => fetchMyStats(true)}
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

                {/* ── Performance Stats (Real Data) ─────── */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>
                        Today's Performance
                    </Text>

                    {loading ? (
                        <ActivityIndicator
                            size="large"
                            color="#1a237e"
                            style={{ paddingVertical: 30 }}
                        />
                    ) : myStats ? (
                        <>
                            {/* Row 1: Verified & Rejected */}
                            <View style={styles.statsRow}>
                                <View style={styles.statCard}>
                                    <MaterialCommunityIcons
                                        name="account-check"
                                        size={28}
                                        color="#4caf50"
                                    />
                                    <Text style={styles.statNumber}>
                                        {myStats.total}
                                    </Text>
                                    <Text style={styles.statLabel}>
                                        QR Scanned
                                    </Text>
                                    <View style={styles.statDetail}>
                                        <Text style={styles.statDetailText}>
                                            {myStats.exits} exit ·{" "}
                                            {myStats.entries} entry
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.statCard}>
                                    <MaterialIcons
                                        name="block"
                                        size={28}
                                        color="#dc2626"
                                    />
                                    <Text style={styles.statNumberRed}>
                                        {myStats.denied}
                                    </Text>
                                    <Text style={styles.statLabel}>
                                        Rejected
                                    </Text>
                                    <View style={styles.statDetail}>
                                        <Text style={styles.statDetailText}>
                                            Invalid / expired
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Row 2: Success Rate */}
                            <View style={styles.rateCard}>
                                <View style={styles.rateLeft}>
                                    <MaterialIcons
                                        name="speed"
                                        size={22}
                                        color="#1a237e"
                                    />
                                    <View>
                                        <Text style={styles.rateTitle}>
                                            Success Rate
                                        </Text>
                                        <Text style={styles.rateSub}>
                                            Allowed vs total scanned
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rateRight}>
                                    <Text style={styles.ratePercent}>
                                        {myStats.total > 0
                                            ? Math.round(
                                                  (myStats.total -
                                                      myStats.denied) /
                                                      myStats.total *
                                                      100
                                              )
                                            : 0}
                                        %
                                    </Text>
                                </View>
                                {/* Progress bar */}
                                <View style={styles.rateBar}>
                                    <View
                                        style={[
                                            styles.rateBarFill,
                                            {
                                                width:
                                                    myStats.total > 0
                                                        ? `${Math.round(
                                                              (myStats.total -
                                                                  myStats.denied) /
                                                                  myStats.total *
                                                                  100
                                                          )}%`
                                                        : "0%",
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        </>
                    ) : null}
                </View>

                {/* ── Account Information ───────────────── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>
                            Account Information
                        </Text>
                    </View>

                    <InfoRow
                        icon="badge"
                        label="Employee ID"
                        value={user?.empId || "—"}
                    />
                    <InfoRow
                        icon="email"
                        label="Email"
                        value={user?.email || "—"}
                    />
                    <InfoRow
                        icon="phone"
                        label="Phone"
                        value={user?.phone || "—"}
                    />
                    <InfoRow
                        icon="business"
                        label="Department"
                        value="Campus Security"
                    />
                    <InfoRow
                        icon="location-on"
                        label="Assigned Gate"
                        value="Main Gate B"
                        last
                    />
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
        <View
            style={[
                styles.infoRow,
                !last && styles.infoRowBorder,
            ]}
        >
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

    /* ── Stats ───────────────────────────────────────── */
    statsContainer: {
        marginBottom: 24,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a237e",
        marginBottom: 12,
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
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },

    statNumber: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1a237e",
        marginVertical: 4,
    },

    statNumberRed: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#dc2626",
        marginVertical: 4,
    },

    statLabel: {
        fontSize: 12,
        color: "#78909c",
        textAlign: "center",
        fontWeight: "600",
    },

    statDetail: {
        marginTop: 6,
        backgroundColor: "#f5f7fa",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },

    statDetailText: {
        fontSize: 10,
        color: "#90a4ae",
        fontWeight: "500",
    },

    /* ── Success Rate Card ───────────────────────────── */
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

    rateLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
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
        alignItems: "flex-end",
        marginBottom: 10,
    },

    ratePercent: {
        fontSize: 28,
        fontWeight: "800",
        color: "#16a34a",
    },

    rateBar: {
        height: 6,
        backgroundColor: "#e8eaf6",
        borderRadius: 3,
        overflow: "hidden",
    },

    rateBarFill: {
        height: "100%",
        backgroundColor: "#16a34a",
        borderRadius: 3,
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