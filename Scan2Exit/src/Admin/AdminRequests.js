import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { authGet } from "../../utils/api";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

export default function AdminRequests() {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await authGet("/admin/requests");
        if (data.success && Array.isArray(data.requests)) {
          setRequests(data.requests);
        } else {
          Alert.alert("Error", data.message || "Failed to load requests");
        }
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Network error. Please login again.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // ✅ Refresh list when returning from details screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchRequestsInline();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchRequestsInline = async () => {
    try {
      const data = await authGet("/admin/requests");
      if (data.success && Array.isArray(data.requests)) {
        setRequests(data.requests);
      }
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#003080" />
      <Navbar />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Student Requests</Text>
        <Text style={styles.subheading}>
          Approve or reject student gate pass requests
        </Text>

        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
            Loading requests...
          </Text>
        ) : requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="task-alt" size={50} color="#c5cae9" />
            <Text style={styles.emptyText}>No pending requests</Text>
          </View>
        ) : (
          requests.map((item) => (
            <View key={item._id} style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.details}>
                  {item.course} • {item.branch}
                </Text>
                <Text style={styles.time}>Reg No: {item.regNo}</Text>
              </View>

              {/* ✅ View Details button — navigates to RequestDetails */}
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() =>
                  navigation.navigate("RequestDetails", { id: item._id })
                }
              >
                <MaterialIcons name="visibility" size={16} color="#fff" />
                <Text style={styles.viewBtnText}>View</Text>
              </TouchableOpacity>
            </View>
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
  heading: { fontSize: 26, fontWeight: "bold", color: "#1a237e", marginBottom: 6 },
  subheading: { color: "#5c6bc0", marginBottom: 20 },
  emptyContainer: { alignItems: "center", marginTop: 40, gap: 10 },
  emptyText: { fontSize: 15, color: "#90a4ae", fontWeight: "500" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600", color: "#263238" },
  details: { fontSize: 13, color: "#78909c", marginTop: 2 },
  time: { fontSize: 12, color: "#546e7a", marginTop: 4 },
  viewBtn: {
    backgroundColor: "#0040a1",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});