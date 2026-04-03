import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Navbar from "../components/Navbar";
import Footer from "../components/FooterStudent";
import { MaterialIcons } from "@expo/vector-icons";

export default function StudentDashboard() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Navbar />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }} // important
            >

                {/* Validity */}
                <View style={styles.validity}>
                    <Text style={styles.validityText}>Current Pass Validity</Text>
                    <Text style={styles.validityTime}>04h 22m</Text>
                </View>

                {/* Welcome */}
                <View style={styles.welcome}>
                    <Text style={styles.title}>
                        Welcome back,{"\n"}
                        <Text style={styles.highlight}>Alex Rivers</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Your campus access is currently active.
                    </Text>
                </View>

                {/* Create Pass */}
                <TouchableOpacity
                    style={styles.createPass}
                    onPress={() => navigation.navigate("Request")}
                >
                    <MaterialIcons name="add-card" size={30} color="#fff" />
                    <Text style={styles.createTitle}>Create Gate Pass</Text>
                    <Text style={styles.createDesc}>
                        Request a new entry or exit permit.
                    </Text>
                </TouchableOpacity>
                <View style={styles.row}>
                    <View style={styles.card}>
                        <MaterialIcons name="location-on" size={24} color="#1b6d24" />
                        <Text style={styles.cardTitle}>Inside Campus</Text>
                        <Text style={styles.cardText}>
                            Last entry at Main Gate: 6:00 PM
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <MaterialIcons name="event-available" size={24} color="#005149" />
                        <Text style={styles.cardTitle}>24 This Semester</Text>
                        <Text style={styles.cardText}>
                            85% of weekend allowance used
                        </Text>
                    </View>
                </View>
                {/* Activity */}
                <View style={styles.activityCard}>
                    {/* Header Row */}
                    <View style={styles.headerRow}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <Text style={styles.history}>History</Text>
                    </View>

                    {/* Activity Items */}
                    <View style={styles.activityItem}>
                        <View style={[styles.iconBox, { backgroundColor: "#e6f4ea" }]}>
                            <MaterialIcons name="check-circle" size={22} color="green" />
                        </View>
                        <View>
                            <Text style={styles.activityTitle}>Pass Approved</Text>
                            <Text style={styles.activityText}>
                                Weekend Outing • #GP-88321
                            </Text>
                        </View>
                    </View>

                    <View style={styles.activityItem}>
                        <View style={[styles.iconBox, { backgroundColor: "#fff4e5" }]}>
                            <MaterialIcons name="pending" size={22} color="orange" />
                        </View>
                        <View>
                            <Text style={styles.activityTitle}>Awaiting Warden</Text>
                            <Text style={styles.activityText}>
                                Library Late Night • #GP-88402
                            </Text>
                        </View>
                    </View>

                    <View style={styles.activityItem}>
                        <View style={[styles.iconBox, { backgroundColor: "#e6edff" }]}>
                            <MaterialIcons name="qr-code" size={22} color="#0040a1" />
                        </View>
                        <View>
                            <Text style={styles.activityTitle}>Entry Successful</Text>
                            <Text style={styles.activityText}>
                                Main Gate • #GP-88100
                            </Text>
                        </View>
                    </View>

                    {/* Bottom Button */}
                    <View style={styles.viewAllContainer}>
                        <Text style={styles.viewAllText}>View All Requests</Text>
                        <MaterialIcons name="arrow-forward" size={18} color="#0040a1" />
                    </View>

                </View>

                {/* Policy */}
                <View style={styles.policyCard}>
                    {/* Image */}
                    <Image
                        source={{
                            uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJiYCDLN07tx51sxKJvgkpRW6665WoPfDsreoF6IynhOSdJ_qZoX3p84qY6Kcl4eTLwp2CY3Dg1HA8hrBuwKlgHQbDIYlFd2x44FBlegrAPqtdHRXwmEnzzlvB1FvWIs3bDLDinbBSf9s74BFHmTvsGY5lkVai5Fr-LSzliiITThSl9Gbzw7cpbIftdDvO87RmCDAa__I7YAHtddlcv0ntgVP25bt3-SArsrhYIeNgBKAkXrVns5TPC6-pqJOdo_Y6YyTYfjkF5Mfs",
                        }}
                        style={styles.policyImg}
                    />
                    {/* Text Content */}
                    <View style={styles.policyContent}>
                        <Text style={styles.policyTitle}>Campus Policy Update</Text>
                        <Text style={styles.policyText}>
                            Gate passes will require 2FA authentication soon.
                        </Text>
                        <Text style={styles.learnMore}>Learn More</Text>
                    </View>

                </View>
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>© 2026 @TechVortex</Text>
                </View>

            </ScrollView>

            <Footer />
        </View>
    );

}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#faf8ff" },
    validity: {
        backgroundColor: "#1b6d24",
        margin: 15,
        padding: 12,
        borderRadius: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    validityText: { color: "#fff", fontSize: 12 },
    validityTime: { color: "#fff", fontWeight: "bold" },

    welcome: { paddingHorizontal: 15 },

    title: { fontSize: 45, fontWeight: "bold" },
    highlight: { color: "#0040a1" },

    subtitle: { color: "gray", marginTop: 5, fontSize: 15 },

    createPass: {
        backgroundColor: "#0040a1",
        margin: 15,
        padding: 20,
        borderRadius: 15,
    },

    createTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
    createDesc: { color: "#ddd" },

    row: { flexDirection: "row", gap: 10, paddingHorizontal: 15 },

    card: {
        flex: 1,
        backgroundColor: "#f2f3fe",
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 5,
    },

    cardTitle: { fontWeight: "bold", marginTop: 5 },
    cardText: { fontSize: 12, color: "gray" },

    activityCard: {
        margin: 15,
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },

    activityItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },

    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    activityTitle: {
        fontWeight: "600",
        fontSize: 14,
    },

    activityText: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 2,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },

    history: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#0040a1",
        backgroundColor: "#e6edff",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },

    viewAllContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        paddingTop: 12,
        borderTopWidth: 1,
        borderColor: "#eee",
    },

    viewAllText: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#0040a1",
        marginRight: 6,
    },

    policyCard: {
        margin: 15,
        borderRadius: 16,
        backgroundColor: "#ffffff",
        overflow: "hidden",

        // Shadow (iOS)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,

        // Shadow (Android)
        elevation: 5,
    },

    policyImg: {
        width: "100%",
        height: 180,
    },

    policyContent: {
        padding: 15,
    },

    policyTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 6,
    },

    policyText: {
        fontSize: 13,
        color: "#6b7280",
        lineHeight: 18,
    },
    learnMore: {
        marginTop: 10,
        backgroundColor: "#0040a1",
        color: "#fff",
        paddingVertical: 8,
        textAlign: "center",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: "bold",
    },
    footerContainer: {
        width: '100%',
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#faf8ff',
    },
    footerText: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center', // ensure text is centered
    },
});
