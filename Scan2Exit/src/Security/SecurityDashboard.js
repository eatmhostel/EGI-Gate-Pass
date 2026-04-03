import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import Navbar from "../components/Navbar";
import FooterSecurity from "../components/FooterSecurity";

export default function SecurityDashboard() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#003080" />
            <Navbar />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Status Bar */}
                {/* <View style={styles.statusBar}>
                    <View style={styles.statusHeader}>
                        <View style={styles.statusIndicator} />
                        <Text style={styles.statusText}>System Active: Main Gate B</Text>
                    </View>
                    <Text style={styles.statusSub}>Uptime: 14h 22m</Text>
                </View> */}

                {/* Header */}
                <Text style={styles.heading}>Security Dashboard</Text>
                <Text style={styles.subheading}>
                    Verify credentials and manage campus access.
                </Text>

                {/* Gate Control */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIcon}>
                            <MaterialIcons name="security" size={24} color="#0040a1" />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>Gate Control</Text>
                            <Text style={styles.cardSub}>
                                Scan or manually verify passes
                            </Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
                            <MaterialIcons name="qr-code-scanner" size={20} color="#fff" />
                            <Text style={styles.btnText}>Scan QR</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
                            <MaterialIcons name="edit" size={20} color="#0040a1" />
                            <Text style={styles.secondaryBtnText}>Manual Entry</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.row}>
                    <View style={styles.statBoxGreen}>
                        <View style={styles.statHeader}>
                            <MaterialIcons name="today" size={18} color="#006633" />
                            <Text style={styles.statLabel}>Passes Today</Text>
                        </View>
                        <Text style={styles.statNumber}>142</Text>
                        <View style={styles.statBar}>
                            <View style={[styles.statBarFill, { width: '75%' }]} />
                        </View>
                    </View>

                    <View style={styles.statBox}>
                        <View style={styles.statHeader}>
                            <MaterialIcons name="people" size={18} color="#0040a1" />
                            <Text style={styles.statLabel}>Active Visitors</Text>
                        </View>
                        <Text style={styles.statNumber}>28</Text>
                        <View style={styles.statBar}>
                            <View style={[styles.statBarFillBlue, { width: '40%' }]} />
                        </View>
                    </View>
                </View>

                {/* Recent Scans */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Scans</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {[1,2,3].map((item, index) => (
                    <View key={index} style={styles.scanItem}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{
                                    uri: "https://randomuser.me/api/portraits/men/1.jpg",
                                }}
                                style={styles.avatar}
                            />
                            <View style={styles.statusDot} />
                        </View>

                        <View style={styles.scanInfo}>
                            <Text style={styles.name}>Student Name</Text>
                            <Text style={styles.subText}>B.Tech • CSE</Text>
                        </View>

                        <View style={styles.scanTime}>
                            <Text style={styles.time}>14:22</Text>
                            <View style={styles.approvedBadge}>
                                <Text style={styles.approved}>Approved</Text>
                            </View>
                        </View>
                    </View>
                ))}

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

    
    heading: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1a237e",
        marginBottom: 6,
    },

    subheading: {
        color: "#5c6bc0",
        marginBottom: 24,
        fontSize: 15,
    },

    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 6,
    },

    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },

    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#e8eaf6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },

    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a237e",
    },

    cardSub: {
        color: "#5c6bc0",
        fontSize: 14,
        marginTop: 2,
    },

    row: {
        flexDirection: "row",
        gap: 12,
    },

    primaryBtn: {
        flex: 1,
        flexDirection: "row",
        gap: 8,
        backgroundColor: "#1a237e",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#1a237e",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },

    secondaryBtn: {
        flex: 1,
        flexDirection: "row",
        gap: 8,
        backgroundColor: "#e8eaf6",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#c5cae9",
    },

    btnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },

    secondaryBtnText: {
        color: "#1a237e",
        fontWeight: "600",
        fontSize: 15,
    },

    statBox: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 5,
    },

    statBoxGreen: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 5,
        borderLeftWidth: 3,
        borderLeftColor: "#4caf50",
    },

    statHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },

    statLabel: {
        fontSize: 13,
        color: "#5c6bc0",
        marginLeft: 6,
        fontWeight: "500",
    },

    statNumber: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1a237e",
        marginBottom: 8,
    },

    statBar: {
        height: 4,
        backgroundColor: "#e8eaf6",
        borderRadius: 2,
        overflow: "hidden",
    },

    statBarFill: {
        height: "100%",
        backgroundColor: "#4caf50",
        borderRadius: 2,
    },

    statBarFillBlue: {
        height: "100%",
        backgroundColor: "#3f51b5",
        borderRadius: 2,
    },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 24,
        marginBottom: 16,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a237e",
    },

    viewAllText: {
        color: "#3f51b5",
        fontSize: 14,
        fontWeight: "500",
    },

    scanItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 3,
    },

    avatarContainer: {
        position: "relative",
        marginRight: 14,
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },

    statusDot: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "#4caf50",
        borderWidth: 2,
        borderColor: "#fff",
    },

    scanInfo: {
        flex: 1,
    },

    name: {
        fontWeight: "600",
        fontSize: 16,
        color: "#263238",
    },

    subText: {
        fontSize: 13,
        color: "#78909c",
        marginTop: 2,
    },

    scanTime: {
        alignItems: "flex-end",
    },

    time: {
        fontSize: 13,
        color: "#546e7a",
        marginBottom: 4,
    },

    approvedBadge: {
        backgroundColor: "#e8f5e9",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },

    approved: {
        fontSize: 11,
        color: "#2e7d32",
        fontWeight: "600",
    },
});