import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { EXPO_PUBLIC_API_URL } from "@env";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);

  // ✅ Fetch requests
  useEffect(() => {
    fetch(`${EXPO_PUBLIC_API_URL}/admin/requests`)
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch((err) => console.log(err));
  }, []);

  // ✅ Approve
  const handleApprove = async (id) => {
    await fetch(`${EXPO_PUBLIC_API_URL}/admin/approve/${id}`, {
      method: "PUT",
    });

    // remove from UI after approve
    setRequests((prev) => prev.filter((item) => item._id !== id));
  };

  // ✅ Reject
  const handleReject = async (id) => {
    await fetch(`${EXPO_PUBLIC_API_URL}/admin/reject/${id}`, {
      method: "PUT",
    });

    setRequests((prev) => prev.filter((item) => item._id !== id));
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

        {/* ✅ REAL DATA */}
        {requests.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No pending requests
          </Text>
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