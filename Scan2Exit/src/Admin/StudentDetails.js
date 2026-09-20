import React, { useEffect, useState } from "react";
import {
    View, Text, ScrollView, StyleSheet, StatusBar, ActivityIndicator,
    TouchableOpacity, Alert
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { authGet, authDelete } from "../../utils/api";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

export default function StudentDetails() {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params;

    const [student, setStudent] = useState(null);
    const [gatePasses, setGatePasses] = useState([]);
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, []);

    // Replace the fetchDetails function:

    const fetchDetails = async () => {
        try {
            console.log("Fetching student with ID:", id);  // Debug log
            const data = await authGet(`/admin/student/${id}`);
            console.log("Response:", JSON.stringify(data).substring(0, 200));  // Debug log

            if (data.success) {
                setStudent(data.student);
                setGatePasses(data.gatePasses || []);
                setScans(data.scans || []);
            } else {
                console.log("API returned success=false:", data.message);
            }
        } catch (err) {
            console.log("❌ fetchDetails error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Delete student and go back automatically
    const handleDelete = () => {
        Alert.alert(
            "Delete Student",
            `Are you sure you want to delete ${student.fullName}? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            const data = await authDelete(`/admin/delete-student/${student._id}`);
                            if (data.success) {
                                Alert.alert("Deleted", "Student has been deleted successfully.", [
                                    { text: "OK", onPress: () => navigation.goBack() }
                                ]);
                            } else {
                                Alert.alert("Error", data.message || "Failed to delete student");
                            }
                        } catch (err) {
                            Alert.alert("Error", "Failed to delete student");
                        } finally {
                            setDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    const fmtDate = (d) =>
        d
            ? new Date(d).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
            : "—";

    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#003080" />
                <Navbar />
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="#0040a1" />
                </View>
                <FooterAdmin />
            </View>
        );
    }

    if (!student) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#003080" />
                <Navbar />
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <MaterialIcons name="error-outline" size={60} color="#ccc" />
                    <Text style={{ fontSize: 16, color: "#777", marginTop: 12 }}>
                        Student not found.
                    </Text>
                    <TouchableOpacity
                        style={[styles.backBtn, { marginTop: 16 }]}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={20} color="#1a237e" />
                        <Text style={styles.backBtnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
                <FooterAdmin />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#003080" />
            <Navbar />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Back button */}
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={20} color="#1a237e" />
                    <Text style={styles.backBtnText}>Back to Students</Text>
                </TouchableOpacity>

                {/* Header Card */}
                <View style={styles.headerCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {student.fullName?.charAt(0)?.toUpperCase() || "S"}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.studentName}>{student.fullName}</Text>
                        <Text style={styles.studentReg}>{student.regNo}</Text>
                        <View
                            style={[
                                styles.statusBadge,
                                {
                                    backgroundColor:
                                        student.status === "approved" ? "#e8f5e9" : "#fff3e0",
                                },
                            ]}
                        >
                            <Text
                                style={{
                                    color: student.status === "approved" ? "#2e7d32" : "#ef6c00",
                                    fontSize: 11,
                                    fontWeight: "700",
                                }}
                            >
                                {student.status?.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Personal Information */}
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.card}>
                    <DetailRow icon="person" label="Full Name" value={student.fullName} />
                    <DetailRow icon="badge" label="Registration No" value={student.regNo} />
                    <DetailRow icon="email" label="Email" value={student.email} />
                    <DetailRow icon="phone" label="Phone" value={student.phone || "—"} />
                    <DetailRow icon="school" label="Course" value={student.course || "—"} />
                    <DetailRow icon="category" label="Branch" value={student.branch || "—"} />
                    {student.year && (
                        <DetailRow icon="event" label="Year" value={student.year} />
                    )}
                    {student.semester && (
                        <DetailRow icon="menu-book" label="Semester" value={student.semester} />
                    )}
                    {student.fatherName && (
                        <DetailRow icon="family-restroom" label="Father's Name" value={student.fatherName} />
                    )}
                    {student.motherName && (
                        <DetailRow icon="family-restroom" label="Mother's Name" value={student.motherName} />
                    )}
                    {student.address && (
                        <DetailRow icon="home" label="Address" value={student.address} />
                    )}
                </View>

                {/* Account Information */}
                <Text style={styles.sectionTitle}>Account Information</Text>
                <View style={styles.card}>
                    <DetailRow icon="verified-user" label="Status" value={student.status} />
                    <DetailRow icon="date-range" label="Registered On" value={fmtDate(student.createdAt)} />
                    <DetailRow icon="update" label="Last Updated" value={fmtDate(student.updatedAt)} />
                </View>

                {/* Gate Pass History */}
                <Text style={styles.sectionTitle}>
                    Gate Pass History ({gatePasses.length})
                </Text>
                <View style={styles.card}>
                    {gatePasses.length === 0 ? (
                        <Text style={styles.empty}>No gate passes issued.</Text>
                    ) : (
                        gatePasses.map((gp) => (
                            <View key={gp._id} style={styles.listItem}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.listTitle}>{gp.destination || "—"}</Text>
                                    <Text style={styles.listSub}>
                                        Out: {gp.outTime ? fmtDate(gp.outTime) : "—"}
                                    </Text>
                                    <Text style={styles.listSub}>
                                        Return: {gp.returnTime ? fmtDate(gp.returnTime) : "—"}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.miniBadge,
                                        {
                                            backgroundColor:
                                                gp.status === "approved"
                                                    ? "#e8f5e9"
                                                    : gp.status === "pending"
                                                        ? "#fff3e0"
                                                        : "#ffebee",
                                        },
                                    ]}
                                >
                                    <Text style={styles.miniBadgeText}>
                                        {gp.status?.toUpperCase() || "—"}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Scan History */}
                <Text style={styles.sectionTitle}>
                    Scan History ({scans.length})
                </Text>
                <View style={styles.card}>
                    {scans.length === 0 ? (
                        <Text style={styles.empty}>No scan history found.</Text>
                    ) : (
                        scans.map((sc, i) => (
                            <View key={sc._id || i} style={styles.listItem}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.listTitle}>
                                        {sc.action?.toUpperCase() || "SCAN"}
                                    </Text>
                                    <Text style={styles.listSub}>
                                        {sc.destination || "—"} • {fmtDate(sc.createdAt)}
                                    </Text>
                                    <Text style={styles.listSub}>
                                        Scanned by: {sc.scannedBy || "—"}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.miniBadge,
                                        {
                                            backgroundColor:
                                                sc.status === "denied"
                                                    ? "#ffebee"
                                                    : sc.status === "approved"
                                                        ? "#e8f5e9"
                                                        : "#e3f2fd",
                                        },
                                    ]}
                                >
                                    <Text style={styles.miniBadgeText}>
                                        {sc.status?.toUpperCase() || "OK"}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* ✅ Delete Button — full width, prominent */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.deleteFullBtn, deleting && { opacity: 0.6 }]}
                        onPress={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <MaterialIcons name="delete-outline" size={20} color="#fff" />
                                <Text style={styles.deleteFullBtnText}>Delete Student</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <FooterAdmin />
        </View>
    );
}

const DetailRow = ({ icon, label, value }) => (
    <View style={styles.detailRow}>
        <View style={styles.detailIconWrap}>
            <MaterialIcons name={icon} size={18} color="#1a237e" />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value || "—"}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f7fa" },
    content: { padding: 16, paddingBottom: 100 },

    backBtn: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        marginBottom: 12,
        gap: 4,
    },
    backBtnText: { color: "#1a237e", fontWeight: "600", fontSize: 14, marginLeft: 4 },

    headerCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 14,
        elevation: 3,
        marginBottom: 20,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#0040a1",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    avatarText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
    studentName: { fontSize: 20, fontWeight: "bold", color: "#1a237e" },
    studentReg: { fontSize: 13, color: "#78909c", marginTop: 2 },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginTop: 6,
    },

    sectionTitle: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#1a237e",
        marginBottom: 8,
        marginTop: 8,
    },
    card: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        elevation: 2,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    detailIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#eef2ff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    detailLabel: { fontSize: 11, color: "#90a4ae", textTransform: "uppercase" },
    detailValue: { fontSize: 14, color: "#263238", marginTop: 2 },

    listItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    listTitle: { fontSize: 14, fontWeight: "600", color: "#263238" },
    listSub: { fontSize: 12, color: "#90a4ae", marginTop: 2 },
    miniBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    miniBadgeText: { fontSize: 10, fontWeight: "700", color: "#37474f" },
    empty: { textAlign: "center", color: "#999", paddingVertical: 16, fontSize: 13 },

    actions: { marginTop: 8 },
    deleteFullBtn: {
        flexDirection: "row",
        backgroundColor: "#dc2626",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    deleteFullBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});