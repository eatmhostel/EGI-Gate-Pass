import React, { useContext, useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/FooterStudent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EXPO_PUBLIC_API_URL } from "@env";

export default function StudentProfile() {
    const { user } = useContext(AuthContext);
    
    const [totalPasses, setTotalPasses] = useState(0);
    const [hasActivePass, setHasActivePass] = useState(false);
    const [loadingStats, setLoadingStats] = useState(true);

    // ✅ Fetch real-time stats on mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const studentId = await AsyncStorage.getItem("studentId");
                if (!studentId) return;

                const res = await fetch(`${EXPO_PUBLIC_API_URL}/gatepass/dashboard/${studentId}`);
                const data = await res.json();

                if (data.success) {
                    setTotalPasses(data.totalPasses || 0);
                    setHasActivePass(!!data.activePass);
                }
            } catch (err) {
                console.log("Failed to fetch profile stats:", err.message);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <View style={styles.container}>
            <Navbar />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Profile Header */}
                <View style={styles.profileSection}>
                    <View style={styles.imageWrapper}>
                        <Image
                            source={{
                                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdMnzYfFVDwPafcI_WAv6z4ba6ANapWW8jxsy9SvDA8W_UpB2Uay0u-ZGdIefnmBrWrmY09OKJYtFzlmzn4Cqa2xJ7vchqjqLPhWGKDsrprr9eurUpVL5WOa75r-hdjscO690HLavD79r6m_sQkeEuWKtjr6G2OFh11pPMcgdvTndg9E5XxnjWKPJEJTLmTCBSA1K_0dXN9iJ5GFUe7l9kwu2cCdq1fBCgiiIQ1ywfDSZgisZ8o4tz_eOrrgyTqnu6Oam10udY0V94"
                            }}
                            style={styles.profileImage}
                        />
                        <View style={styles.verified}>
                            <MaterialIcons name="verified" size={16} color="#217128" />
                        </View>
                    </View>

                    <Text style={styles.name}>{user?.name}</Text>

                    <View style={styles.metaRow}>
                        <Text style={styles.meta}>{user?.regNo}</Text>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.branch}>{user?.branch}</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>TOTAL PASSES</Text>
                        <View style={styles.statRow}>
                            {loadingStats ? (
                                <ActivityIndicator size="small" color="#0040a1" />
                            ) : (
                                <Text style={styles.statNumber}>{totalPasses}</Text>
                            )}
                            <Text style={styles.statSub}>Issued</Text>
                        </View>
                    </View>

                    <View style={[styles.activeBox, !hasActivePass && !loadingStats && styles.activeBoxInactive]}>
                        <Text style={[styles.statLabel, !hasActivePass && styles.statLabelInactive]}>ACTIVE PASS</Text>
                        
                        {loadingStats ? (
                            <ActivityIndicator size="small" color={hasActivePass ? "#1b6d24" : "#666"} />
                        ) : (
                            <Text style={[styles.activeText, !hasActivePass && styles.activeTextInactive]}>
                                {hasActivePass ? "YES" : "NO"}
                            </Text>
                        )}
                        
                        <Text style={[styles.activeSub, !hasActivePass && styles.activeSubInactive]}>
                            {hasActivePass 
                                ? "Current gate pass is valid for exit" 
                                : "No active gate pass right now"}
                        </Text>
                    </View>
                </View>

                {/* Account Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Account Information</Text>

                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Full Name</Text>
                        <Text style={styles.value}>{user?.name}</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.infoBlock, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Registration Number</Text>
                            <Text style={styles.value}>{user?.regNo}</Text>
                        </View>

                        <View style={[styles.infoBlock, { flex: 1 }]}>
                            <Text style={styles.label}>Course</Text>
                            <Text style={styles.value}>{user?.course}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Branch</Text>
                        <Text style={styles.value}>{user?.branch}</Text>
                    </View>

                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Institutional Email</Text>
                        <Text style={styles.email}>{user?.email}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Text style={styles.sectionTitle}>Settings & Security</Text>

                    {[
                        { icon: "edit", label: "Edit Profile" },
                        { icon: "lock-open", label: "Change Password" },
                        { icon: "help", label: "Help Support" },
                    ].map((item, index) => (
                        <TouchableOpacity key={index} style={styles.actionBtn}>
                            <View style={styles.actionLeft}>
                                <MaterialIcons name={item.icon} size={20} color="#0040a1" />
                                <Text style={styles.actionText}>{item.label}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color="#777" />
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.logoutBtn}>
                        <MaterialIcons name="logout" size={20} color="#ba1a1a" />
                        <Text style={styles.logoutText}>Logout Account</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#faf8ff",
    },

    scroll: {
        padding: 16,
        paddingTop: 30,
        paddingBottom: 100,
    },

    profileSection: {
        alignItems: "center",
        marginBottom: 20,
    },

    imageWrapper: {
        position: "relative",
        marginBottom: 10,
    },

    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },

    verified: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#a0f399",
        borderRadius: 12,
        padding: 4,
        borderWidth: 2,
        borderColor: "#fff",
    },

    name: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1a237e",
    },

    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
    },

    meta: {
        fontSize: 12,
        color: "#777",
    },

    branch: {
        fontSize: 12,
        color: "#0040a1",
        fontWeight: "700",
    },

    dot: {
        fontSize: 10,
        color: "#999",
    },

    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },

    statBox: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#eee",
    },

    activeBox: {
        flex: 1,
        backgroundColor: "#dcfce7",
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#bbf7d0",
        shadowColor: "#1b6d24",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },

    activeBoxInactive: {
        backgroundColor: "#f8f9fc",
        borderColor: "#e2e8f0",
        shadowColor: "#000",
    },

    statLabel: {
        fontSize: 10,
        color: "#777",
        fontWeight: "700",
        letterSpacing: 0.5,
        marginBottom: 10,
    },

    statLabelInactive: {
        color: "#94a3b8",
    },

    statRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    statNumber: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#0040a1",
    },

    statSub: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },

    activeText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1b6d24",
        marginBottom: 4,
    },

    activeTextInactive: {
        color: "#64748b",
    },

    activeSub: {
        fontSize: 11,
        color: "#333",
        lineHeight: 16,
    },

    activeSubInactive: {
        color: "#94a3b8",
    },

    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#eee",
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 14,
        color: "#1a237e",
    },

    infoBlock: {
        marginBottom: 14,
    },

    label: {
        fontSize: 10,
        color: "#777",
        fontWeight: "600",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        marginBottom: 4,
    },

    value: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1a237e",
    },

    email: {
        color: "#0040a1",
        fontWeight: "600",
        fontSize: 14,
    },

    row: {
        flexDirection: "row",
    },

    actions: {
        marginTop: 10,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#1a237e",
    },

    actionBtn: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#eee",
    },

    actionLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    actionText: {
        fontWeight: "600",
        color: "#1a237e",
        fontSize: 14,
    },

    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        backgroundColor: "#fff5f5",
        borderRadius: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#fecaca",
    },

    logoutText: {
        color: "#ba1a1a",
        fontWeight: "bold",
        fontSize: 14,
    },
});