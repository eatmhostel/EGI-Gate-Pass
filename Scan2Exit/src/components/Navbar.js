import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
  });

  const { user, clearSession } = useContext(AuthContext); // ✅ Use clearSession
  const navigation = useNavigation();
  const [showMenu, setShowMenu] = useState(false);

  if (!fontsLoaded) return null;

  const handleLogout = async () => {
    await clearSession(); // ✅ Clear token and user data
    setShowMenu(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  return (
    <View style={styles.header}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <MaterialIcons name="qr-code-scanner" size={30} color="#0040a1" />
        <Text
          style={styles.logo}
          onPress={() => {
            if (!user) {
              navigation.navigate("Home");
            }
          }}
        >
          Scan2Exit
        </Text>
      </View>

      {/* Right Side */}
      {user ? (
        <View style={{ position: "relative" }}>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => setShowMenu(!showMenu)}
          >
            <MaterialIcons name="account-circle" size={26} color="#fff" />
          </TouchableOpacity>

          {showMenu && (
            <View style={styles.dropdown}>
              <Text style={styles.userName}>{user?.name || "User"}</Text>
              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.logout}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
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
  dropdown: {
    position: "absolute",
    top: 50,
    right: 0,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 10,
    zIndex: 999,
    minWidth: 120,
  },
  userName: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  logout: {
    color: "red",
    fontWeight: "bold",
  },
});