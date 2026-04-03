import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

const { width } = Dimensions.get("window");

export default function AdminProfile() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("overview");

  // ✅ FIX: useRef so animation persists
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      <Navbar />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <LinearGradient
          colors={["#1a237e", "#3949ab"]}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
                style={styles.avatar}
              />
              <View style={styles.statusIndicator} />
            </View>

            <Text style={styles.name}>Admin Name</Text>
            <Text style={styles.role}>System Administrator</Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>PRO</Text>
            </View>
          </View>
        </LinearGradient>

        {/* TABS */}
        <View style={styles.tabContainer}>
          {["overview", "activity", "security"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => handleTabChange(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CONTENT */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="account-group" size={24} color="#3949ab" />
                  <Text style={styles.statNumber}>1,248</Text>
                  <Text style={styles.statLabel}>Total Users</Text>
                </View>

                <View style={styles.statCard}>
                  <MaterialIcons name="trending-up" size={24} color="#00c853" />
                  <Text style={styles.statNumber}>98.5%</Text>
                  <Text style={styles.statLabel}>Uptime</Text>
                </View>

                <View style={styles.statCard}>
                  <MaterialIcons name="security" size={24} color="#ff9800" />
                  <Text style={styles.statNumber}>24</Text>
                  <Text style={styles.statLabel}>Alerts</Text>
                </View>

                <View style={styles.statCard}>
                  <MaterialIcons name="storage" size={24} color="#e53935" />
                  <Text style={styles.statNumber}>68%</Text>
                  <Text style={styles.statLabel}>Storage</Text>
                </View>
              </View>

              {/* QUICK ACTIONS */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <View style={styles.quickActionsContainer}>
                  {[
                    { icon: "people", text: "User Management" },
                    { icon: "bar-chart", text: "Analytics" },
                    { icon: "notifications", text: "Notifications" },
                    { icon: "backup", text: "Backup" },
                  ].map((item, index) => (
                    <TouchableOpacity key={index} style={styles.quickAction}>
                      <View style={styles.quickActionIcon}>
                        <MaterialIcons name={item.icon} size={22} color="#fff" />
                      </View>
                      <Text style={styles.quickActionText}>{item.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* SETTINGS */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Account Settings</Text>

                {[
                  { icon: "person", text: "Edit Profile" },
                  { icon: "notifications-active", text: "Notifications" },
                  { icon: "language", text: "Language" },
                  { icon: "help", text: "Help & Support" },
                ].map((item, index) => (
                  <TouchableOpacity key={index} style={styles.option}>
                    <MaterialIcons name={item.icon} size={22} color="#3949ab" />
                    <Text style={styles.optionText}>{item.text}</Text>
                    <MaterialIcons name="chevron-right" size={22} color="#b0bec5" />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* ACTIVITY */}
          {activeTab === "activity" && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>

              {[
                "System Backup Completed",
                "New Admin User Added",
                "Security Scan Completed",
                "Failed Login Attempt",
              ].map((text, index, arr) => (
                <View
                  key={index}
                  style={[
                    styles.activityItem,
                    index === arr.length - 1 && { borderBottomWidth: 0 }, // ✅ FIX
                  ]}
                >
                  <View style={styles.activityIcon}>
                    <MaterialIcons name="check-circle" size={20} color="#00c853" />
                  </View>

                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{text}</Text>
                    <Text style={styles.activityTime}>2 hours ago</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Security Settings</Text>

              {[
                "Change Password",
                "Two-Factor Authentication",
                "Biometric Login",
                "Login History",
              ].map((text, index) => (
                <TouchableOpacity key={index} style={styles.option}>
                  <MaterialIcons name="lock" size={22} color="#3949ab" />
                  <Text style={styles.optionText}>{text}</Text>
                  <MaterialIcons name="chevron-right" size={22} color="#b0bec5" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* LOGOUT */}
          <TouchableOpacity
            style={styles.logout}
            onPress={() => navigation.navigate("Login")}
          >
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
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },

  scrollView: { flex: 1 },

  scrollContent: {
    paddingBottom: 120, // ✅ prevents footer overlap
  },

  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  profileHeader: { alignItems: "center" },

  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },

  statusIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#00c853",
    borderWidth: 2,
    borderColor: "#fff",
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },

  role: {
    color: "rgba(255,255,255,0.8)",
  },

  badge: {
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 12,
    padding: 5,
    elevation: 3,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },

  activeTab: { backgroundColor: "#3949ab" },

  tabText: { color: "#78909c" },

  activeTabText: { color: "#fff" },

  content: { padding: 20 },

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: (width - 50) / 2,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },

  statLabel: {
    fontSize: 12,
    color: "#78909c",
  },

  sectionContainer: { marginTop: 20 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  quickAction: {
    width: (width - 50) / 2,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  quickActionIcon: {
    backgroundColor: "#3949ab",
    padding: 10,
    borderRadius: 20,
    marginBottom: 8,
  },

  quickActionText: {
    fontSize: 14,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  optionText: {
    flex: 1,
    marginLeft: 10,
  },

  activityItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  activityIcon: {
    marginRight: 10,
  },

  activityContent: { flex: 1 },

  logout: {
    backgroundColor: "#e53935",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  logoutText: {
    color: "#fff",
    marginLeft: 10,
    fontWeight: "600",
  },
});