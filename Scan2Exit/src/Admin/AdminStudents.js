import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { authGet, authDelete } from "../../utils/api";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

export default function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchStudents(); }, []);

    const fetchStudents = async () => {
        try {
            const data = await authGet("/admin/all-students");
            if (data.success) setStudents(data.students);
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    const handleDelete = (id, name) => {
        Alert.alert("Delete Student", `Are you sure you want to delete ${name}? This cannot be undone.`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive",
                onPress: async () => {
                    const data = await authDelete(`/admin/delete-student/${id}`);
                    if (data.success) {
                        setStudents((prev) => prev.filter((s) => s._id !== id));
                    } else {
                        Alert.alert("Error", data.message || "Failed to delete");
                    }
                }
            }
        ]);
    };

    // Filter students based on search query (name, reg no, email, course, or branch)
    const filteredStudents = students.filter((item) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            item.fullName?.toLowerCase().includes(query) ||
            item.regNo?.toLowerCase().includes(query) ||
            item.email?.toLowerCase().includes(query) ||
            item.course?.toLowerCase().includes(query) ||
            item.branch?.toLowerCase().includes(query)
        );
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#003080" />
            <Navbar />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.heading}>All Registered Students</Text>
                <Text style={styles.subheading}>{students.length} students registered in the system.</Text>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={22} color="#90a4ae" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Enter Student Regd No."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#90a4ae"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <MaterialIcons name="cancel" size={18} color="#90a4ae" />
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? <ActivityIndicator size="large" color="#0040a1" style={{ marginTop: 40 }} /> : 
                filteredStudents.length === 0 ? <Text style={styles.empty}>No students found.</Text> :
                filteredStudents.map((item) => (
                    <View key={item._id} style={styles.card}>
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.fullName}</Text>
                            <Text style={styles.details}>{item.course} • {item.branch}</Text>
                            <Text style={styles.sub}>Reg No: {item.regNo} • {item.email}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: item.status === 'approved' ? '#e8f5e9' : '#fff3e0' }]}>
                                <Text style={{ color: item.status === 'approved' ? '#2e7d32' : '#ef6c00', fontSize: 11, fontWeight: '700' }}>{item.status?.toUpperCase()}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id, item.fullName)}>
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
    subheading: { color: "#5c6bc0", marginBottom: 16, fontSize: 14 },
    
    // Search Bar Styles
    searchContainer: { 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: "#fff", 
        borderRadius: 12, 
        paddingHorizontal: 12, 
        marginBottom: 16, 
        elevation: 3, 
        borderWidth: 1, 
        borderColor: "#e0e0e0" 
    },
    searchIcon: { 
        marginRight: 8 
    },
    searchInput: { 
        flex: 1, 
        height: 48, 
        fontSize: 14, 
        color: "#37474f" 
    },
    
    empty: { textAlign: "center", marginTop: 40, color: "#777" },
    card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", elevation: 3 },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: "600", color: "#263238" },
    details: { fontSize: 13, color: "#78909c", marginTop: 2 },
    sub: { fontSize: 12, color: "#90a4ae", marginTop: 4 },
    statusBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 6 },
    deleteBtn: { padding: 10, backgroundColor: "#fef2f2", borderRadius: 10 }
});