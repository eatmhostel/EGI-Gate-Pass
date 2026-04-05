import { React, useContext, useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Navbar from "../components/Navbar";
import Footer from "../components/FooterStudent";
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EXPO_PUBLIC_API_URL } from "@env";

// ✅ Calculate live remaining time
function getTimeRemaining(validUntil) {
    if (!validUntil) return null;
    const now = new Date();
    const expiry = new Date(validUntil);
    const diff = expiry - now;

    if (diff <= 0) return { expired: true, text: "Expired" };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return { expired: false, text: `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m` };
    return { expired: false, text: `${String(minutes).padStart(2, '0')}m` };
}

// ✅ Map status to activity UI config
function getActivityConfig(status, isExpired) {
    if (status === "pending") return { icon: "hourglass-top", bg: "#fff4e5", color: "#ca8a04", title: "Awaiting Approval" };
    if (status === "rejected") return { icon: "highlight-off", bg: "#fee2e2", color: "#dc2626", title: "Pass Rejected" };
    if (isExpired || status === "expired") return { icon: "history", bg: "#f1f5f9", color: "#64748b", title: "Pass Expired" };
    return { icon: "check-circle", bg: "#e6f4ea", color: "#16a34a", title: "Pass Approved" };
}

function formatDateTime(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + ", " + 
           d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function StudentDashboard() {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    
    const [studentId, setStudentId] = useState(null);
    const [activePass, setActivePass] = useState(null);
    const [recentRequests, setRecentRequests] = useState([]);
    const [timeLeft, setTimeLeft] = useState("00h 00m");
    const [loading, setLoading] = useState(true);

    // Fetch Student ID
    useEffect(() => {
        const getId = async () => {
            const id = await AsyncStorage.getItem("studentId");
            setStudentId(id);
        };
        getId();
    }, []);

    // Fetch Dashboard Data
    const fetchDashboard = useCallback(async () => {
        if (!studentId) return;
        try {
            const res = await fetch(`${EXPO_PUBLIC_API_URL}/gatepass/dashboard/${studentId}`);
            const data = await res.json();
            if (data.success) {
                setActivePass(data.activePass);
                setRecentRequests(data.recentRequests);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // ✅ Live Timer Effect (Updates every minute)
    useEffect(() => {
        const updateTimer = () => {
            if (activePass && activePass.validUntil) {
                const remaining = getTimeRemaining(activePass.validUntil);
                setTimeLeft(remaining?.text || "Expired");
                
                // If it just expired, refresh dashboard to update UI completely
                if (remaining?.expired) {
                    fetchDashboard();
                }
            } else {
                setTimeLeft("No Active Pass");
            }
        };

        updateTimer(); // Initial call
        const interval = setInterval(updateTimer, 60000); // Update every 60s
        return () => clearInterval(interval);
    }, [activePass, fetchDashboard]);

    const isValid = activePass && !activePass.isExpired;

    return (
        <View style={styles.container}>
            <Navbar />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                
                {/* Validity Banner */}
                <View style={[styles.validity, isValid ? styles.validityActive : styles.validityInactive]}>
                    <MaterialIcons name={isValid ? "timer" : "timer-off"} size={20} color="#fff" />
                    <Text style={styles.validityText}>Current Pass Validity</Text>
                    <Text style={styles.validityTime}>{loading ? "..." : timeLeft}</Text>
                </View>

                {/* Welcome */}
                <View style={styles.welcome}>
                    <Text style={styles.title}>
                        Welcome back,{"\n"}
                        <Text style={styles.highlight}>{user?.name || "Student"}</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        {isValid ? "Your campus access is currently active." : "You have no active gate pass right now."}
                    </Text>
                </View>

                {/* Create Pass */}
                <TouchableOpacity style={styles.createPass} onPress={() => navigation.navigate("Request")}>
                    <MaterialIcons name="add-card" size={30} color="#fff" />
                    <Text style={styles.createTitle}>Create Gate Pass</Text>
                    <Text style={styles.createDesc}>Request a new entry or exit permit.</Text>
                </TouchableOpacity>

                <View style={styles.row}>
                    <View style={styles.card}>
                        <MaterialIcons name={isValid ? "outdoor-grill" : "location-on"} size={24} color={isValid ? "#1b6d24" : "#777"} />
                        <Text style={styles.cardTitle}>{isValid ? "Outside Campus" : "Inside Campus"}</Text>
                        <Text style={styles.cardText}>
                            {isValid ? `Dest: ${activePass.destination}` : "No active pass"}
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <MaterialIcons name="event-available" size={24} color="#005149" />
                        <Text style={styles.cardTitle}>{recentRequests.length} Total</Text>
                        <Text style={styles.cardText}>Gatepass requests made</Text>
                    </View>
                </View>

                {/* Activity Section */}
                <View style={styles.activityCard}>
                    <View style={styles.headerRow}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("StudentHistory")}>
                            <Text style={styles.history}>History</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="small" color="#0040a1" />
                    ) : recentRequests.length === 0 ? (
                        <Text style={styles.emptyText}>No recent activity</Text>
                    ) : (
                        recentRequests.map((item) => {
                            const config = getActivityConfig(item.status, item.isExpired);
                            return (
                                <TouchableOpacity 
                                    key={item._id}
                                    style={styles.activityItem}
                                    onPress={() => navigation.navigate("RequestSuccess", { requestId: item._id })}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
                                        <MaterialIcons name={config.icon} size={22} color={config.color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.activityTitle}>{config.title}</Text>
                                        <Text style={styles.activityText}>
                                            {item.destination} • #{item._id.slice(-5).toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={styles.activityDate}>{formatDateTime(item.createdAt)}</Text>
                                </TouchableOpacity>
                            );
                        })
                    )}

                    <View style={styles.viewAllContainer}>
                        <Text style={styles.viewAllText}>View All Requests</Text>
                        <MaterialIcons name="arrow-forward" size={18} color="#0040a1" />
                    </View>
                </View>

                {/* Policy */}
                <View style={styles.policyCard}>
                    <Image
                        source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJiYCDLN07tx51sxKJvgkpRW6665WoPfDsreoF6IynhOSdJ_qZoX3p84qY6Kcl4eTLwp2CY3Dg1HA8hrBuwKlgHQbDIYlFd2x44FBlegrAPqtdHRXwmEnzzlvB1FvWIs3bDLDinbBSf9s74BFHmTvsGY5lkVai5Fr-LSzliiITThSl9Gbzw7cpbIftdDvO87RmCDAa__I7YAHtddlcv0ntgVP25bt3-SArsrhYIeNgBKAkXrVns5TPC6-pqJOdo_Y6YyTYfjkF5Mfs" }}
                        style={styles.policyImg}
                    />
                    <View style={styles.policyContent}>
                        <Text style={styles.policyTitle}>Campus Policy Update</Text>
                        <Text style={styles.policyText}>Gate passes will require 2FA authentication soon.</Text>
                        <Text style={styles.learnMore}>Learn More</Text>
                    </View>
                </View>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>© 2026 @TechVortex</Text>
                </View>

            </ScrollView>
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#faf8ff" },
    
    validity: {
        margin: 15,
        padding: 14,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    validityActive: { backgroundColor: "#1b6d24" },
    validityInactive: { backgroundColor: "#64748b" },
    validityText: { color: "#fff", fontSize: 13, flex: 1, marginLeft: 10, fontWeight: "500" },
    validityTime: { color: "#fff", fontWeight: "bold", fontSize: 15, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },

    welcome: { paddingHorizontal: 15, marginBottom: 10 },
    title: { fontSize: 40, fontWeight: "bold", lineHeight: 48 },
    highlight: { color: "#0040a1" },
    subtitle: { color: "gray", marginTop: 5, fontSize: 15 },

    createPass: {
        backgroundColor: "#0040a1",
        margin: 15,
        padding: 20,
        borderRadius: 16,
        shadowColor: "#0040a1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    createTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 8 },
    createDesc: { color: "#ddd", marginTop: 4 },

    row: { flexDirection: "row", gap: 12, paddingHorizontal: 15 },
    card: {
        flex: 1,
        backgroundColor: "#f2f3fe",
        padding: 15,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: { fontWeight: "bold", marginTop: 8, fontSize: 14 },
    cardText: { fontSize: 12, color: "gray", marginTop: 2 },

    activityCard: {
        margin: 15,
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: { fontSize: 18, fontWeight: "bold" },
    emptyText: { color: "#777", paddingVertical: 20, textAlign: "center" },

    activityItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    activityTitle: { fontWeight: "600", fontSize: 14, color: "#1a237e" },
    activityText: { fontSize: 12, color: "#6b7280", marginTop: 2 },
    activityDate: { fontSize: 10, color: "#9ca3af", textAlign: "right" },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    history: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#0040a1",
        backgroundColor: "#e6edff",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    viewAllContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        paddingTop: 14,
        borderTopWidth: 1,
        borderColor: "#eee",
    },
    viewAllText: { fontSize: 14, fontWeight: "bold", color: "#0040a1", marginRight: 6 },

    policyCard: {
        margin: 15,
        borderRadius: 16,
        backgroundColor: "#ffffff",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
    },
    policyImg: { width: "100%", height: 160 },
    policyContent: { padding: 16 },
    policyTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
    policyText: { fontSize: 13, color: "#6b7280", lineHeight: 18 },
    learnMore: {
        marginTop: 12,
        backgroundColor: "#0040a1",
        color: "#fff",
        paddingVertical: 10,
        textAlign: "center",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: "bold",
    },
    footerContainer: {
        width: '100%',
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#faf8ff',
    },
    footerText: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
    },
});