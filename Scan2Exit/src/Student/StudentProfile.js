import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import Navbar from "../components/Navbar";
import Footer from "../components/FooterStudent";

export default function StudentProfile() {
    const { user } = useContext(AuthContext);
    return (
        <View style={styles.container}>
            <Navbar />

            <ScrollView contentContainerStyle={styles.scroll}>

                {/* Profile Header */}
                <View style={styles.profileSection}>
                    <View style={styles.imageWrapper}>
                        <Image
                            source={{
                                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdMnzYfFVDwPafcI_WAv6z4ba6ANapWW8jxsy9SvDA8W_UpB2Uay0u-ZGdIefnmBrWrmY09OKJYtFzlmzn4Cqa2xJ7vchqjqLPhWGKDsrprr9eurUpVL5WOa75r-hdjscO690HLavD79r6m_sQkeEuWKtjr6G2OFh11pPMcgdvTndg9E5XxnjWKPJEJTLmTCBSA1K_0dXN9iJ5GFUe7l9kwu2cCdq1fBCgiiIQ1ywfDSZgisZ8o4tz_eOrrgyTqnu6Oam10udY0V94"
                            }}
                            style={styles.profileImage}
                        />
                        <View style={styles.verified}>
                            <MaterialIcons name="verified" size={16} color="#217128" />
                        </View>
                    </View>

                    <Text style={styles.name}>{user?.name}</Text>

                    <View style={styles.metaRow}>
                        <Text style={styles.meta}>{user?.regNo}</Text>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.value}>{user?.branch}</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>TOTAL PASSES</Text>
                        <View style={styles.statRow}>
                            <Text style={styles.statNumber}>24</Text>
                            <Text style={styles.statSub}>Issued</Text>
                        </View>
                    </View>

                    <View style={styles.activeBox}>
                        <Text style={styles.statLabel}>ACTIVE PASS</Text>
                        <Text style={styles.activeText}>YES</Text>
                        <Text style={styles.activeSub}>
                            Current gate pass is valid for exit
                        </Text>
                    </View>
                </View>

                {/* Account Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Account Information</Text>

                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Full Name</Text>
                        <Text style={styles.value}>{user?.name}</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.infoBlock}>
                            <Text style={styles.label}>Registration Number</Text>
                            <Text style={styles.value}>{user?.regNo}</Text>
                        </View>

                        <View style={styles.infoBlock}>
                            <Text style={styles.label}>Course</Text>
                            <Text style={styles.value}>{user?.course}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Branch</Text>
                        <Text style={styles.value}>{user?.branch}</Text>
                    </View>

                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Institutional Email</Text>
                        <Text style={styles.email}>{user?.email}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Text style={styles.sectionTitle}>Settings & Security</Text>

                    {[
                        { icon: "edit", label: "Edit Profile" },
                        { icon: "lock-open", label: "Change Password" },
                        { icon: "help", label: "Help Support" },
                    ].map((item, index) => (
                        <TouchableOpacity key={index} style={styles.actionBtn}>
                            <View style={styles.actionLeft}>
                                <MaterialIcons name={item.icon} size={20} color="#0040a1" />
                                <Text style={styles.actionText}>{item.label}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color="#777" />
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.logoutBtn}>
                        <MaterialIcons name="logout" size={20} color="#ba1a1a" />
                        <Text style={styles.logoutText}>Logout Account</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#faf8ff",
    },

    scroll: {
        padding: 16,
        paddingTop: 30,
        paddingBottom: 100,
    },

    profileSection: {
        alignItems: "center",
        marginBottom: 20,
    },

    imageWrapper: {
        position: "relative",
        marginBottom: 10,
    },

    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },

    verified: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#a0f399",
        borderRadius: 10,
        padding: 3,
    },

    name: {
        fontSize: 22,
        fontWeight: "bold",
    },

    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    meta: {
        fontSize: 10,
        color: "#777",
    },

    branch: {
        fontSize: 12,
        color: "#0040a1",
        fontWeight: "600",
    },

    dot: {
        fontSize: 10,
        color: "#999",
    },

    statsRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 20,
    },

    statBox: {
        flex: 1,
        backgroundColor: "#eee",
        padding: 16,
        borderRadius: 12,
    },

    activeBox: {
        flex: 1,
        backgroundColor: "#a0f399",
        padding: 16,
        borderRadius: 12,
    },

    statLabel: {
        fontSize: 10,
        color: "#777",
        marginBottom: 6,
    },

    statRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },

    statNumber: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#0040a1",
    },

    statSub: {
        fontSize: 12,
        color: "#666",
    },

    activeText: {
        fontSize: 18,
        fontWeight: "bold",
    },

    activeSub: {
        fontSize: 11,
        color: "#333",
    },

    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },

    infoBlock: {
        marginBottom: 10,
    },

    label: {
        fontSize: 10,
        color: "#777",
    },

    value: {
        fontSize: 14,
        fontWeight: "600",
    },

    email: {
        color: "#0040a1",
        fontWeight: "600",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    actions: {
        marginTop: 10,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },

    actionBtn: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 14,
        backgroundColor: "#eee",
        borderRadius: 10,
        marginBottom: 10,
    },

    actionLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    actionText: {
        fontWeight: "600",
    },

    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 14,
        backgroundColor: "#ffdad6",
        borderRadius: 10,
        marginTop: 10,
    },

    logoutText: {
        color: "#ba1a1a",
        fontWeight: "bold",
    },
});