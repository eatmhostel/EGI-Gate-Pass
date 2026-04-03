import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { useNavigation } from "@react-navigation/native"; // ✅ import hook

export default function Navbar() {
  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
  });

  const navigation = useNavigation(); // ✅ get navigation object

  if (!fontsLoaded) return null;

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <MaterialIcons name="qr-code-scanner" size={30} color="#0040a1" />
        <Text style={styles.logo} onPress={() => navigation.navigate("Home")}> Scan2Exit</Text>
      </View>

      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => navigation.navigate("Login")} // ✅ navigate to Login screen
      >
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#0040a1",
    letterSpacing: 0.5,
  },

  loginBtn: {
    backgroundColor: "#0040a1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  loginText: {
    color: "#fff",
    fontWeight: "bold",
  },
});