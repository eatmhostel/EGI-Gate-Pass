import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    StatusBar,
    TouchableOpacity,
    Alert,
    Switch,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

import Navbar from "../components/Navbar";
import FooterSecurity from "../components/FooterSecurity";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function SecurityProfile() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const { user } = useContext(AuthContext);
    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    onPress: () => console.log("Logout pressed"),
                    style: "destructive"
                }
            ]
        );
    };

    const handleEditProfile = () => {
        Alert.alert("Edit Profile", "This would open the profile edit screen");
    };

    const handleChangePassword = () => {
        Alert.alert("Change Password", "This would open the password change screen");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#003080" />
            <Navbar />

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header with Background */}
                <View style={styles.profileHeader}>
                    <View style={styles.profileBackground} />
                    <View style={styles.profileContainer}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{
                                    uri: "https://randomuser.me/api/portraits/men/32.jpg",
                                }}
                                style={styles.avatar}
                            />
                            <TouchableOpacity style={styles.editAvatarBtn} onPress={handleEditProfile}>
                                <MaterialIcons name="camera-alt" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.name}>{user?.name}</Text>
                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>On Duty</Text>
                        </View>
                    </View>
                </View>


                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Performance Stats</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons name="account-check" size={24} color="#4caf50" />
                            <Text style={styles.statNumber}>342</Text>
                            <Text style={styles.statLabel}>Verified Today</Text>
                        </View>
                        <View style={styles.statCard}>
                            <MaterialIcons name="schedule" size={24} color="#ff9800" />
                            <Text style={styles.statNumber}>8h 24m</Text>
                            <Text style={styles.statLabel}>Time On Duty</Text>
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                    </View>
                </View>

                {/* Account Information Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Account Information</Text>

                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <MaterialIcons name="badge" size={16} color="#5c6bc0" />
                            <Text style={styles.label}>Employee ID</Text>
                        </View>
                        <Text style={styles.value}>{user?.empId}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <MaterialIcons name="email" size={16} color="#5c6bc0" />
                            <Text style={styles.label}>Email</Text>
                        </View>
                        <Text style={styles.value}>{user?.email}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <MaterialIcons name="phone" size={16} color="#5c6bc0" />
                            <Text style={styles.label}>Phone</Text>
                        </View>
                        <Text style={styles.value}>{user?.phone}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <MaterialIcons name="business" size={16} color="#5c6bc0" />
                            <Text style={styles.label}>Department</Text>
                        </View>
                        <Text style={styles.value}>Campus Security</Text>
                    </View>
                </View>
                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <MaterialIcons name="logout" size={20} color="#f44336" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            <FooterSecurity />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa",
    },

    scroll: {
        padding: 16,
        paddingBottom: 120,
    },

    profileHeader: {
        marginBottom: 24,
        position: "relative",
    },

    profileBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        backgroundColor: "#1a237e",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },

    profileContainer: {
        alignItems: "center",
        paddingTop: 40,
    },

    avatarContainer: {
        position: "relative",
        marginBottom: 12,
    },

    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: "#fff",
    },

    editAvatarBtn: {
        position: "absolute",
        bottom: 5,
        right: 5,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#1a237e",
        justifyContent: "center",
        alignItems: "center",
    },

    name: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1a237e",
    },

    role: {
        fontSize: 14,
        color: "#5c6bc0",
        marginTop: 4,
    },

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e8f5e9",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 10,
    },

    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#4caf50",
        marginRight: 6,
    },

    statusText: {
        fontSize: 12,
        color: "#2e7d32",
        fontWeight: "600",
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a237e",
        marginBottom: 12,
    },



    statsContainer: {
        marginBottom: 24,
    },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },

    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
        marginHorizontal: 4,
    },

    statNumber: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a237e",
        marginVertical: 6,
    },

    statLabel: {
        fontSize: 11,
        color: "#78909c",
        textAlign: "center",
    },

    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 6,
        marginBottom: 20,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a237e",
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },

    infoItem: {
        flexDirection: "row",
        alignItems: "center",
    },

    label: {
        fontSize: 14,
        color: "#78909c",
        marginLeft: 8,
    },

    value: {
        fontSize: 15,
        fontWeight: "600",
        color: "#263238",
        flex: 1,
        textAlign: "right",
    },


    logoutBtn: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },

    logoutText: {
        fontSize: 16,
        color: "#f44336",
        fontWeight: "600",
        marginLeft: 8,
    },
});