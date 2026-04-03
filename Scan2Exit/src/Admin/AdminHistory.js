import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

export default function AdminHistory() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#003080" />

      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>History</Text>
        <Text style={styles.subheading}>
          View all processed student requests
        </Text>

        {[1, 2, 3].map((item, index) => (
          <View key={index} style={styles.card}>
            <View>
              <Text style={styles.name}>Student Name</Text>
              <Text style={styles.details}>B.Tech • CSE</Text>
              <Text style={styles.time}>10:45 AM</Text>
            </View>

            {/* Status */}
            <View style={styles.statusContainer}>
              <MaterialIcons name="check-circle" size={18} color="#4caf50" />
              <Text style={styles.approved}>Approved</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <FooterAdmin />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },

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

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  approved: {
    color: "#4caf50",
    fontWeight: "600",
  },
});