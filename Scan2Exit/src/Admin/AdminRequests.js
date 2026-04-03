import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

export default function AdminRequests() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#003080" />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content}>

        {/* Heading */}
        <Text style={styles.heading}>Student Requests</Text>
        <Text style={styles.subheading}>
          Approve or reject student gate pass requests
        </Text>

        {/* Request List */}
        {[1, 2, 3].map((item, index) => (
          <View key={index} style={styles.card}>

            <View style={styles.info}>
              <Text style={styles.name}>Student Name</Text>
              <Text style={styles.details}>B.Tech • CSE</Text>
              <Text style={styles.time}>Requested: 10:45 AM</Text>
            </View>

            <View style={styles.actions}>
              {/* Approve */}
              <TouchableOpacity style={styles.approveBtn}>
                <MaterialIcons name="check" size={18} color="#fff" />
              </TouchableOpacity>

              {/* Reject */}
              <TouchableOpacity style={styles.rejectBtn}>
                <MaterialIcons name="close" size={18} color="#fff" />
              </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },

  content: {
    padding: 16,
    paddingBottom: 100, // avoid footer overlap
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