import React, { useState, useCallback } from "react";
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { authGet } from "../../utils/api";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // ✅ useFocusEffect: re-fetch when screen regains focus (e.g., after delete on details page)
  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [])
  );

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await authGet("/admin/all-students");
      if (data.success) setStudents(data.students);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const openStudentDetails = (student) => {
    navigation.navigate("StudentDetails", { id: student._id });
  };

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
        <Text style={styles.subheading}>
          {students.length} students registered in the system.
        </Text>

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

        {loading ? (
          <ActivityIndicator size="large" color="#0040a1" style={{ marginTop: 40 }} />
        ) : filteredStudents.length === 0 ? (
          <Text style={styles.empty}>No students found.</Text>
        ) : (
          filteredStudents.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => openStudentDetails(item)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.fullName?.charAt(0)?.toUpperCase() || "S"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.fullName}</Text>
                  <Text style={styles.details}>
                    {item.course} • {item.branch}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === "approved" ? "#e8f5e9" : "#fff3e0",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: item.status === "approved" ? "#2e7d32" : "#ef6c00",
                      fontSize: 10,
                      fontWeight: "700",
                    }}
                  >
                    {item.status?.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.sub}>
                Reg No: {item.regNo}
              </Text>
              <Text style={styles.sub}>{item.email}</Text>

              <View style={styles.viewRow}>
                <Text style={styles.viewBtnText}>View Full Details</Text>
                <MaterialIcons name="chevron-right" size={20} color="#1a73e8" />
              </View>
            </TouchableOpacity>
          ))
        )}
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

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 14, color: "#37474f" },

  empty: { textAlign: "center", marginTop: 40, color: "#777" },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#0040a1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  name: { fontSize: 16, fontWeight: "600", color: "#263238" },
  details: { fontSize: 13, color: "#78909c", marginTop: 2 },
  sub: { fontSize: 12, color: "#90a4ae", marginTop: 4 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  viewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 4,
  },
  viewBtnText: { color: "#1a73e8", fontWeight: "600", fontSize: 13 },
});