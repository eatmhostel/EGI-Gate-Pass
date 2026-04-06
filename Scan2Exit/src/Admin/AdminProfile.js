import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, Image, ScrollView, Dimensions, Animated, Alert
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { authGet } from "../../utils/api";
import { AuthContext } from "../context/AuthContext";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

const { width } = Dimensions.get("window");

export default function AdminProfile() {
  const navigation = useNavigation();
  const { clearSession } = useContext(AuthContext); // ✅ Use clearSession
  const [activeTab, setActiveTab] = useState("overview");
  const [studentCount, setStudentCount] = useState(0);
  const [securityCount, setSecurityCount] = useState(0);

  useEffect(() => {
    fetchCounts();
  }, []);

  // ✅ FIXED: Using authGet
  const fetchCounts = async () => {
    try {
      const [data1, data2] = await Promise.all([
        authGet("/admin/total-students"),
        authGet("/admin/total-security"),
      ]);

      if (data1.success) setStudentCount(data1.count);
      if (data2.success) setSecurityCount(data2.count);
    } catch (err) {
      console.log(err);
    }
  };

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setActiveTab(tab);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  // ✅ FIXED: Logout using clearSession
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await clearSession();
          navigation.reset({ index: 0, routes: [{ name: "Home" }] });
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      <Navbar />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#1a237e", "#3949ab"]} style={styles.headerGradient}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }} style={styles.avatar} />
              <View style={styles.statusIndicator} />
            </View>
            <Text style={styles.name}>EATM Admin</Text>
            <Text style={styles.role}>System Administrator</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>PRO</Text></View>
          </View>
        </LinearGradient>
        
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {activeTab === "overview" && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="account-group" size={24} color="#3949ab" />
                <Text style={styles.statNumber}>{studentCount}</Text>
                <Text style={styles.statLabel}>Total Students</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="shield-account" size={24} color="#3949ab" />
                <Text style={styles.statNumber}>{securityCount}</Text>
                <Text style={styles.statLabel}>Total Security</Text>
              </View>
            </View>
          )}
          
          <TouchableOpacity style={styles.logout} onPress={handleLogout}>
            <MaterialIcons name="logout" size={22} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <FooterAdmin />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  headerGradient: { paddingTop: 20, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  profileHeader: { alignItems: "center" },
  avatarContainer: { position: "relative", marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#fff" },
  statusIndicator: { position: "absolute", bottom: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: "#00c853", borderWidth: 2, borderColor: "#fff" },
  name: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  role: { color: "rgba(255,255,255,0.8)" },
  badge: { marginTop: 8, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  content: { padding: 20 },
  statsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statCard: { width: (width - 50) / 2, backgroundColor: "#fff", padding: 15, borderRadius: 12, alignItems: "center", marginBottom: 10, elevation: 2 },
  statNumber: { fontSize: 24, fontWeight: "bold" },
  statLabel: { fontSize: 12, color: "#78909c" },
  logout: { backgroundColor: "#e53935", padding: 15, borderRadius: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: 20 },
  logoutText: { color: "#fff", marginLeft: 10, fontWeight: "600" },
});