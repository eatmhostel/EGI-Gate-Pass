import React, { useEffect, useState } from "react";
import {
    View, Text, StyleSheet, StatusBar, ScrollView,
    TouchableOpacity, ActivityIndicator, Alert
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";
import { useNavigation } from "@react-navigation/native";
import { authGet, authDownloadPdf } from "../../utils/api";

export default function AdminDashboard() {
    const navigation = useNavigation();
    const [counts, setCounts] = useState({
        students: 0,
        security: 0,
        activePasses: 0,
        pending: 0
    });
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            const [data1, data2, data3, data4] = await Promise.all([
                authGet("/admin/total-students"),
                authGet("/admin/total-security"),
                authGet("/security-scans/today-stats"),
                authGet("/admin/requests"),
            ]);

            setCounts({
                students: data1.success ? data1.count : 0,
                security: data2.success ? data2.count : 0,
                activePasses: data3.success ? data3.stats.total : 0,
                pending: data4.success ? data4.requests.length : 0,
            });
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // ✅✅✅ Download PDF, save to device, open Share sheet
    const handleDownload = async () => {
        if (downloading) return;
        setDownloading(true);

        try {
            const fileUri = await authDownloadPdf(
                "/admin/download-data",
                "gate-activity-report.pdf"
            );

            // Open share sheet — user can Save to Files, send via email, etc.
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: "application/pdf",
                    dialogTitle: "Save Gate Activity Report",
                    UTI: "com.adobe.pdf",
                });
            } else {
                Alert.alert("Saved", `PDF saved to:\n${fileUri}`);
            }
        } catch (err) {
            console.log("Download error:", err);
            Alert.alert("Error", "Failed to download report. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0040a1" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#003080" />
            <Navbar />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.heading}>Dashboard Overview</Text>
                <Text style={styles.subheading}>
                    Real-time institutional control and access monitoring.
                </Text>

                <View style={styles.grid}>
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("AdminStudents")}
                    >
                        <MaterialIcons name="group" size={26} color="#0040a1" />
                        <Text style={styles.cardLabel}>Total Students</Text>
                        <Text style={styles.cardValue}>{counts.students}</Text>
                        <MaterialIcons name="chevron-right" size={18} color="#aaa" style={styles.arrow} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("AdminSecurityList")}
                    >
                        <MaterialIcons name="security" size={26} color="#555" />
                        <Text style={styles.cardLabel}>Total Security</Text>
                        <Text style={styles.cardValue}>{counts.security}</Text>
                        <MaterialIcons name="chevron-right" size={18} color="#aaa" style={styles.arrow} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("AdminHistory")}
                    >
                        <MaterialIcons name="qr-code-scanner" size={26} color="#1b6d24" />
                        <Text style={styles.cardLabel}>Gate Passes Today</Text>
                        <Text style={styles.cardValue}>{counts.activePasses}</Text>
                        <MaterialIcons name="chevron-right" size={18} color="#aaa" style={styles.arrow} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("AdminRequests")}
                    >
                        <MaterialIcons name="pending-actions" size={26} color="#ba1a1a" />
                        <Text style={styles.cardLabel}>Pending Requests</Text>
                        <Text style={styles.cardValue}>{counts.pending}</Text>
                        {counts.pending > 0 && (
                            <View style={styles.cardBadge}>
                                <Text style={styles.cardBadgeText}>{counts.pending}</Text>
                            </View>
                        )}
                        <MaterialIcons name="chevron-right" size={18} color="#aaa" style={styles.arrow} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Institutional Actions</Text>

                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => navigation.navigate("ApproveLeave")}
                >
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                    <Text style={styles.btnText}>Approve Student Leave</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: "#1b6d24" }]}
                    onPress={() => navigation.navigate("AddSecurity")}
                >
                    <MaterialIcons name="shield" size={20} color="#fff" />
                    <Text style={styles.btnText}>Add New Security</Text>
                </TouchableOpacity>

                {/* ✅ PDF Download Button */}
                <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: "#cf1515" }]}
                    onPress={handleDownload}
                    disabled={downloading}
                >
                    <MaterialIcons
                        name={downloading ? "hourglass-empty" : "picture-as-pdf"}
                        size={20}
                        color="#fff"
                    />
                    <Text style={styles.btnText}>
                        {downloading ? "Generating PDF..." : "Download Last 24h Report (PDF)"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
            <FooterAdmin />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f7fa" },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#f5f7fa",
        justifyContent: "center",
        alignItems: "center"
    },
    content: { padding: 16, paddingBottom: 100 },
    heading: { fontSize: 26, fontWeight: "bold", color: "#1a237e", marginBottom: 6 },
    subheading: { color: "#5c6bc0", marginBottom: 20 },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    card: {
        width: "48%",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        elevation: 4,
        position: "relative",
        borderWidth: 1,
        borderColor: "#eee"
    },
    arrow: { position: "absolute", top: 16, right: 16 },
    cardLabel: { fontSize: 12, color: "#777", marginTop: 8 },
    cardValue: { fontSize: 22, fontWeight: "bold", marginTop: 4, color: "#1a237e" },
    cardBadge: {
        position: "absolute",
        top: 12,
        right: 35,
        backgroundColor: "#fee2e2",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6
    },
    cardBadgeText: { fontSize: 10, fontWeight: "700", color: "#ba1a1a" },
    sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 16, color: "#1a237e" },
    primaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#0040a1",
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        justifyContent: "center"
    },
    btnText: { color: "#fff", fontWeight: "600" },
});