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
import Navbar from "../components/Navbar";
import Footer from "../components/FooterStudent";

export default function RequestSuccess() {
    return (
        <View style={styles.container}>
            <Navbar />

            <ScrollView contentContainerStyle={styles.scroll}>

                {/* Status Bar */}
                <View style={styles.statusBar}>
                    <View style={styles.statusLeft}>
                        <View style={styles.dot} />
                        <Text style={styles.statusLabel}>CURRENT PASS VALIDITY</Text>
                    </View>
                    <Text style={styles.statusTime}>Exp: 18:30 PM</Text>
                </View>

                {/* Heading */}
                <View style={{ marginBottom: 30 }}>
                    <Text style={styles.title}>
                        Gate Access
                    </Text>
                    <Text style={styles.subtitle}>
                        Present this QR code at the main security terminal.
                    </Text>
                </View>

                {/* QR Card */}
                <View style={styles.cardWrapper}>
                    <View style={styles.card}>

                        {/* Approved Badge */}
                        <View style={styles.badgeContainer}>
                            <View style={styles.badge}>
                                <MaterialIcons name="check-circle" size={14} color="#217128" />
                                <Text style={styles.badgeText}>Approved</Text>
                            </View>
                        </View>

                        {/* QR */}
                        <View style={styles.qrBox}>
                            <View style={styles.qrInner}>
                                <Image
                                    source={{
                                        uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTunGlB28MAJ7ynoi7XJY81--142BCwxnqTOwyY36sH7uCCKvIwGd6fbYEcwvKgOYIK1EGpaaOFsbSxbkiSvas78SnK2BhOjf_Cdt7DwAoe4PWyW6IQ_VsGU_wn4KVjJMm2d04OTOE0USNES17CfIYlJ29h7Xi1fERbWQzbYLzZqpePhso-H-rGQ5AbLA1CqHcuex7ncQrHPaUfOfXsd_3UDLF8TnmU8rM_as-3M59l0aLl57mxUJ_6QB94Ey-oE6uuUgOjQj0Jydt",
                                    }}
                                    style={styles.qrImage}
                                />
                            </View>
                        </View>

                        {/* Student Info */}
                        <View style={styles.infoSection}>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={styles.label}>STUDENT NAME</Text>
                                <Text style={styles.name}>Alex Rivers</Text>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.flex1}>
                                    <Text style={styles.label}>STUDENT ID</Text>
                                    <Text style={styles.value}>2024-8832</Text>
                                </View>
                                <View style={styles.flex1}>
                                    <Text style={styles.label}>Course</Text>
                                    <Text style={styles.value}>B.Tech</Text>
                                </View>

                                <View style={styles.flex1}>
                                    <Text style={styles.label}>BRANCH</Text>
                                    <Text style={styles.value}>Comp. Science</Text>
                                </View>
                            </View>
                        </View>

                    </View>
                </View>

                {/* Metadata */}
                <View style={styles.metaBox}>
                    <View style={styles.metaIcon}>
                        <MaterialIcons name="schedule" size={20} color="#0040a1" />
                    </View>
                    <View>
                        <Text style={styles.label}>REQUESTED ON</Text>
                        <Text style={styles.metaText}>
                            Oct 24, 2023 • 08:45 AM
                        </Text>
                    </View>
                </View>

                {/* Button */}
                <TouchableOpacity style={styles.button}>
                    <MaterialIcons name="download" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Save to Device</Text>
                </TouchableOpacity>
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>© 2026 @TechVortex</Text>
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
        paddingTop: 20,
        paddingBottom: 80,
    },

    statusBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#e6f6e6",
        padding: 10,
        borderRadius: 20,
        marginBottom: 20,
    },
    statusLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#1b6d24",
        marginRight: 6,
    },
    statusLabel: {
        fontSize: 10,
        fontWeight: "bold",
    },
    statusTime: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#1b6d24",
    },

    title: {
        fontSize: 40,
        fontWeight: "bold",
    },
    subtitle: {
        color: "#666",
        marginTop: 6,
    },

    cardWrapper: {
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 30,
        padding: 20,
    },

    badgeContainer: {
        alignItems: "flex-end",
        marginBottom: 10,
    },
    badge: {
        flexDirection: "row",
        backgroundColor: "#e6f6e6",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignItems: "center",
    },
    badgeText: {
        marginLeft: 5,
        fontSize: 10,
        fontWeight: "bold",
        color: "#217128",
    },

    qrBox: {
        backgroundColor: "#f2f3fe",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        marginBottom: 20,
    },
    qrInner: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 10,
    },
    qrImage: {
        width: 180,
        height: 180,
        resizeMode: "contain",
    },

    infoSection: {},
    label: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#777",
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
    },
    value: {
        fontWeight: "600",
    },

    row: {
        flexDirection: "row",
        gap: 10,
    },
    flex1: {
        flex: 1,
    },

    metaBox: {
        flexDirection: "row",
        backgroundColor: "#f2f3fe",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 20,
    },
    metaIcon: {
        marginRight: 10,
    },
    metaText: {
        fontWeight: "600",
    },

    button: {
        flexDirection: "row",
        backgroundColor: "#0040a1",
        padding: 16,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    buttonText: {
        color: "#fff",
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