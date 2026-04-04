import { React, useRef, useEffect,useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";
import { useNavigation } from "@react-navigation/native";
import { EXPO_PUBLIC_API_URL } from "@env";


export default function AdminDashboard() {
    const [studentCount, setStudentCount] = useState(0);
    const [securityCount, setSecurityCount] = useState(0);
    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            const res1 = await fetch(`${EXPO_PUBLIC_API_URL}/admin/total-students`);
            const data1 = await res1.json();

            const res2 = await fetch(`${EXPO_PUBLIC_API_URL}/admin/total-security`);
            const data2 = await res2.json();

            if (data1.success) setStudentCount(data1.count);
            if (data2.success) setSecurityCount(data2.count);
        } catch (err) {
            console.log(err);
        }
    };

    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#003080" />

            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.content}>

                {/* Heading */}
                <Text style={styles.heading}>Dashboard Overview</Text>
                <Text style={styles.subheading}>
                    Real-time institutional control and access monitoring.
                </Text>

                {/* Stats Cards */}
                <View style={styles.grid}>
                    <View style={styles.card}>
                        <MaterialIcons name="group" size={26} color="#0040a1" />
                        <Text style={styles.cardValue}>{studentCount}</Text>
                    </View>
                    <View style={styles.card}>
                        <MaterialIcons name="security" size={26} color="#555" />
                        <Text style={styles.cardValue}>{securityCount}</Text>
                    </View>

                    <View style={styles.card}>
                        <MaterialIcons name="qr-code-scanner" size={26} color="#1b6d24" />
                        <Text style={styles.cardLabel}>Active Passes</Text>
                        <Text style={styles.cardValue}>185</Text>
                    </View>

                    <View style={styles.card}>
                        <MaterialIcons name="pending-actions" size={26} color="#ba1a1a" />
                        <Text style={styles.cardLabel}>Pending Requests</Text>
                        <Text style={styles.cardValue}>12</Text>
                    </View>
                </View>

                {/* Actions */}
                <Text style={styles.sectionTitle}>Institutional Actions</Text>

                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => navigation.navigate("AdminRequests")}
                >
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                    <Text style={styles.btnText}>Approved Student</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: "#1b6d24" }]}
                    onPress={() => navigation.navigate("AddSecurity")}
                >
                    <MaterialIcons name="shield" size={20} color="#fff" />
                    <Text style={styles.btnText}>Add New Security</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn}>
                    <MaterialIcons name="assessment" size={20} color="#0040a1" />
                    <Text style={styles.secondaryText}>Generate Reports</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn}>
                    <MaterialIcons name="campaign" size={20} color="#ba1a1a" />
                    <Text style={styles.secondaryText}>Broadcast Alert</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Footer */}
            <FooterAdmin />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa",
    },

    content: {
        padding: 16,
        paddingBottom: 100, // prevent footer overlap
    },

    heading: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#1a237e",
        marginBottom: 6,
    },

    subheading: {
        color: "#5c6bc0",
        marginBottom: 20,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    card: {
        width: "48%",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        elevation: 4,
    },

    cardLabel: {
        fontSize: 12,
        color: "#777",
        marginTop: 8,
    },

    cardValue: {
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 4,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 16,
        color: "#1a237e",
    },

    primaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#0040a1",
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        justifyContent: "center",
    },

    btnText: {
        color: "#fff",
        fontWeight: "600",
    },

    secondaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#e8eaf6",
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        justifyContent: "center",
    },

    secondaryText: {
        color: "#0040a1",
        fontWeight: "600",
    },
});