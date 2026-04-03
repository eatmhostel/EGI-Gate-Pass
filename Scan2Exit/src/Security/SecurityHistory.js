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

import Navbar from "../components/Navbar";
import FooterSecurity from "../components/FooterSecurity";

export default function SecurityHistory() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#003080" />
            <Navbar />

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >

                {/* Header */}
                <Text style={styles.heading}>Scan History</Text>
                <Text style={styles.subheading}>
                    View all verified entries and exits.
                </Text>

                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Scans</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>Filter</Text>
                    </TouchableOpacity>
                </View>

                {/* Scan List */}
                {[1, 2, 3, 4, 5].map((item, index) => (
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
                            <Text style={styles.subText}>
                                B.Tech • CSE
                            </Text>
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

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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