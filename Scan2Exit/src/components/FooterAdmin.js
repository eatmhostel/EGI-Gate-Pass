import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function FooterAdmin() {
  const navigation = useNavigation();
  const route = useRoute();

  const currentRoute = route.name;

  return (
    <View style={styles.footer}>

      {/* Home */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("AdminDashboard")}
      >
        <MaterialIcons
          name="grid-view"
          size={22}
          color={currentRoute === "AdminDashboard" ? "#0040a1" : "gray"}
        />
        <Text
          style={
            currentRoute === "AdminDashboard"
              ? styles.active
              : styles.text
          }
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* Request */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("AdminRequests")}
      >
        <MaterialIcons
          name="add-circle"
          size={22}
          color={currentRoute === "AdminRequests" ? "#0040a1" : "gray"}
        />
        <Text
          style={
            currentRoute === "AdminRequests"
              ? styles.active
              : styles.text
          }
        >
          Request
        </Text>
      </TouchableOpacity>

      {/* History */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("AdminHistory")}
      >
        <MaterialIcons
          name="history"
          size={22}
          color={currentRoute === "AdminHistory" ? "#0040a1" : "gray"}
        />
        <Text
          style={
            currentRoute === "AdminHistory"
              ? styles.active
              : styles.text
          }
        >
          History
        </Text>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("AdminProfile")}
      >
        <MaterialIcons
          name="person"
          size={22}
          color={currentRoute === "AdminProfile" ? "#0040a1" : "gray"}
        />
        <Text
          style={
            currentRoute === "AdminProfile"
              ? styles.active
              : styles.text
          }
        >
          Profile
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    paddingVertical: 12,
    paddingBottom: 18,

    backgroundColor: "rgba(255,255,255,0.9)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    borderTopWidth: 1,
    borderColor: "#e0e0e0",

    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  item: {
    alignItems: "center",
    justifyContent: "center",
  },

  active: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0040a1",
    marginTop: 4,
  },

  text: {
    fontSize: 11,
    fontWeight: "600",
    color: "gray",
    marginTop: 4,
  },
});