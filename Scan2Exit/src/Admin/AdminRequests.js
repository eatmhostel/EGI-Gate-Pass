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
import { authGet, authPut } from "../../utils/api";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch requests using authGet
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await authGet("/admin/requests");
        
        // ✅ Safely check if it's a success and an array
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

  // ✅ Approve using authPut
  const handleApprove = async (id) => {
    try {
      const data = await authPut(`/admin/approve/${id}`);
      
      if (data.success) {
        // remove from UI after approve
        setRequests((prev) => prev.filter((item) => item._id !== id));
      } else {
        Alert.alert("Error", data.message || "Failed to approve");
      }
    } catch (err) {
      Alert.alert("Error", "Network error");
    }
  };

  // ✅ Reject using authPut
  const handleReject = async (id) => {
    try {
      const data = await authPut(`/admin/reject/${id}`);
      
      if (data.success) {
        // remove from UI after reject
        setRequests((prev) => prev.filter((item) => item._id !== id));
      } else {
        Alert.alert("Error", data.message || "Failed to reject");
      }
    } catch (err) {
      Alert.alert("Error", "Network error");
    }
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

        {/* ✅ REAL DATA with Loading Check */}
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
                <Text style={styles.time}>
                  Reg No: {item.regNo}
                </Text>
              </View>

              <View style={styles.actions}>
                {/* Approve */}
                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => handleApprove(item._id)}
                >
                  <MaterialIcons name="check" size={18} color="#fff" />
                </TouchableOpacity>

                {/* Reject */}
                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => handleReject(item._id)}
                >
                  <MaterialIcons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

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
    paddingBottom: 100,
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
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    color: "#90a4ae",
    fontWeight: "500",
  },
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
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#263238",
  },
  details: {
    fontSize: 13,
    color: "#78909c",
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: "#546e7a",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  approveBtn: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 8,
  },
  rejectBtn: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 8,
  },
});