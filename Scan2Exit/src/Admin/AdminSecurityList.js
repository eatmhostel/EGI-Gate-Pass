import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { authGet, authDelete } from "../../utils/api";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

export default function AdminSecurityList() {
    const [security, setSecurity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchSecurity(); }, []);

    // ✅ FIXED: Correct endpoint + authGet
    const fetchSecurity = async () => {
        try {
            const data = await authGet("/admin/all-security");
            if (data.success) setSecurity(data.security);
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    const handleDelete = (id, name) => {
        Alert.alert("Delete Security Guard", `Are you sure you want to remove ${name}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive",
                onPress: async () => {
                    // ✅ FIXED: Correct endpoint + authDelete
                    const data = await authDelete(`/admin/delete-security/${id}`);
                    if (data.success) {
                        setSecurity((prev) => prev.filter((s) => s._id !== id));
                    } else {
                        Alert.alert("Error", data.message || "Failed to delete");
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#003080" />
            <Navbar />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.heading}>Security Personnel</Text>
                <Text style={styles.subheading}>{security.length} guards added by admin.</Text>

                {loading ? <ActivityIndicator size="large" color="#0040a1" style={{ marginTop: 40 }} /> : 
                security.length === 0 ? <Text style={styles.empty}>No security guards found.</Text> :
                security.map((item) => (
                    <View key={item._id} style={styles.card}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{item.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</Text>
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.details}>Emp ID: {item.empId}</Text>
                            <Text style={styles.sub}>{item.email} • {item.phone}</Text>
                        </View>
                        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id, item.name)}>
                            <MaterialIcons name="delete-outline" size={22} color="#dc2626" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
            <FooterAdmin />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f7fa" },
    content: { padding: 16, paddingBottom: 100 },
    heading: { fontSize: 24, fontWeight: "bold", color: "#1a237e", marginBottom: 4 },
    subheading: { color: "#5c6bc0", marginBottom: 20, fontSize: 14 },
    empty: { textAlign: "center", marginTop: 40, color: "#777" },
    card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: "row", alignItems: "center", elevation: 3 },
    avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#1a237e", justifyContent: "center", alignItems: "center", marginRight: 14 },
    avatarText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: "600", color: "#263238" },
    details: { fontSize: 13, color: "#546e7a", marginTop: 2 },
    sub: { fontSize: 12, color: "#90a4ae", marginTop: 4 },
    deleteBtn: { padding: 10, backgroundColor: "#fef2f2", borderRadius: 10 }
});