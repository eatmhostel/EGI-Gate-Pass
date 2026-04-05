import React, { useEffect, useState } from "react";
import {
    View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert,
} from "react-native"; // ✅ Added Linking & Alert
import { MaterialIcons } from "@expo/vector-icons";
import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";
import { useNavigation } from "@react-navigation/native";
import { EXPO_PUBLIC_API_URL } from "@env";

export default function AdminDashboard() {
    const navigation = useNavigation();
    const [counts, setCounts] = useState({ students: 0, security: 0, activePasses: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchCounts(); }, []);

    const fetchCounts = async () => {
        try {
            const [res1, res2, res3, res4] = await Promise.all([
                fetch(`${EXPO_PUBLIC_API_URL}/admin/total-students`),
                fetch(`${EXPO_PUBLIC_API_URL}/admin/total-security`),
                fetch(`${EXPO_PUBLIC_API_URL}/security-scans/today-stats`),
                fetch(`${EXPO_PUBLIC_API_URL}/admin/requests`),
            ]);

            const data1 = await res1.json();
            const data2 = await res2.json();
            const data3 = await res3.json();
            const data4 = await res4.json();

            setCounts({
                students: data1.success ? data1.count : 0,
                security: data2.success ? data2.count : 0,
                activePasses: data3.success ? data3.stats.total : 0,
                pending: Array.isArray(data4) ? data4.length : 0,
            });
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Download Handler
    const handleDownload = async () => {
        try {
            const url = `${EXPO_PUBLIC_API_URL}/admin/download-data`;
            // Opens the phone's browser which immediately downloads the CSV file
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Error", "Unable to open download link in your browser.");
            }
        } catch (err) {
            Alert.alert("Error", "Failed to trigger download.");
        }
    };

    if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0040a1" /></View>;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#003080" />
            <Navbar />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.heading}>Dashboard Overview</Text>
                <Text style={styles.subheading}>Real-time institutional control and access monitoring.</Text>

                <View style={styles.grid}>
                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AdminStudents")}>
                        <MaterialIcons name="group" size={26} color="#0040a1" />
                        <Text style={styles.cardLabel}>Total Students</Text>
                        <Text style={styles.cardValue}>{counts.students}</Text>
                        <MaterialIcons name="chevron-right" size={18} color="#aaa" style={styles.arrow} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AdminSecurityList")}>
                        <MaterialIcons name="security" size={26} color="#555" />
                        <Text style={styles.cardLabel}>Total Security</Text>
                        <Text style={styles.cardValue}>{counts.security}</Text>
                        <MaterialIcons name="chevron-right" size={18} color="#aaa" style={styles.arrow} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AdminHistory")}>
                        <MaterialIcons name="qr-code-scanner" size={26} color="#1b6d24" />
                        <Text style={styles.cardLabel}>Gate Passes Today</Text>
                        <Text style={styles.cardValue}>{counts.activePasses}</Text>
                        <MaterialIcons name="chevron-right" size={18} color="#aaa" style={styles.arrow} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AdminRequests")}>
                        <MaterialIcons name="pending-actions" size={26} color="#ba1a1a" />
                        <Text style={styles.cardLabel}>Pending Requests</Text>
                        <Text style={styles.cardValue}>{counts.pending}</Text>
                        {counts.pending > 0 && <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>{counts.pending}</Text></View>}
                        <MaterialIcons name="chevron-right" size={18} color="#aaa" style={styles.arrow} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Institutional Actions</Text>

                <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate("ApproveLeave")}>
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                    <Text style={styles.btnText}>Approved Student Leave</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: "#1b6d24" }]} onPress={() => navigation.navigate("AddSecurity")}>
                    <MaterialIcons name="shield" size={20} color="#fff" />
                    <Text style={styles.btnText}>Add New Security</Text>
                </TouchableOpacity>

                {/* ✅ Updated Download Button */}
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: "#cf1515" }]} onPress={handleDownload}>
                    <MaterialIcons name="download" size={20} color="#fff" />
                    <Text style={styles.btnText}>Download Last 24h Entry/Exit Data</Text>
                </TouchableOpacity>
            </ScrollView>
            <FooterAdmin />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f7fa" },
    loadingContainer: { flex: 1, backgroundColor: "#f5f7fa", justifyContent: "center", alignItems: "center" },
    content: { padding: 16, paddingBottom: 100 },
    heading: { fontSize: 26, fontWeight: "bold", color: "#1a237e", marginBottom: 6 },
    subheading: { color: "#5c6bc0", marginBottom: 20 },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    card: { 
        width: "48%", backgroundColor: "#fff", padding: 16, borderRadius: 14, 
        marginBottom: 12, elevation: 4, position: "relative", 
        borderWidth: 1, borderColor: "#eee" 
    },
    arrow: { position: "absolute", top: 16, right: 16 },
    cardLabel: { fontSize: 12, color: "#777", marginTop: 8 },
    cardValue: { fontSize: 22, fontWeight: "bold", marginTop: 4, color: "#1a237e" },
    cardBadge: { position: "absolute", top: 12, right: 35, backgroundColor: "#fee2e2", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    cardBadgeText: { fontSize: 10, fontWeight: "700", color: "#ba1a1a" },
    sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 16, color: "#1a237e" },
    primaryBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#0040a1", padding: 14, borderRadius: 12, marginBottom: 10, justifyContent: "center" },
    btnText: { color: "#fff", fontWeight: "600" },
});