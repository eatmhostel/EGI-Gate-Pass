import React from "react";
// 👈 add this at top
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import Navbar from "./components/Navbar";
import { useNavigation } from '@react-navigation/native'; 

export default function Index() {
    const navigation = useNavigation();
    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>

                <Navbar />


                {/* HERO */}
                <View style={styles.hero}>

                    {/* Badge */}
                    <View style={styles.badge}>
                        <MaterialIcons name="location-on" size={20} color="#0040a1" />
                        <Text style={styles.badgeText}>EATM · BHUBANESWAR</Text>
                    </View>

                    {/* Heading */}
                    <Text style={styles.heading}>
                        <Text style={styles.egiHighlight}>EGI</Text>
                        {"-"}
                        <Text style={{ color: "#0040a1" }}>Gate Pass</Text>
                        {" System"}
                    </Text>

                    {/* Subtext */}
                    <Text style={styles.subText}>
                        Digitally managing student movement at Einstein Group Of Institutions — fast, secure, and paperless.
                    </Text>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>5000+</Text>
                            <Text style={styles.statLabel}>Students</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>&lt;2s</Text>
                            <Text style={styles.statLabel}>Scan time</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>24/7</Text>
                            <Text style={styles.statLabel}>Monitoring</Text>
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={styles.btnRow}>
                        <TouchableOpacity style={styles.primaryBtn}>
                            <MaterialIcons name="rocket-launch" size={16} color="#fff" />
                            <Text style={styles.primaryText} onPress={() => navigation.navigate("Login")}>Get Started</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryBtn}>
                            <MaterialIcons name="info-outline" size={16} color="#0040a1" />
                            <Text style={styles.secondaryText}>Learn More</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Image with Overlay */}
                    <View style={styles.imageWrapper}>
                        <Image
                            source={{
                                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5CdM5fdeLwjW4CbBdB66UgtT32cWVcWdDYfngcgG0cpUTw-S_19vZyNIsSrvOUhhdgVrlRHpA9DqxT9E49DMcphAVZfFmMczB19E-q6ZfrPaQFKnKLrPKwhOVgrixBfA5yc0XR_W5wnoy5pEdBRccuESWtydzyo5gZQ6ojOaGE1XThWlWg_9BKa5vgqfRSVwtl5Rd78YCfxOXpxqdU8LR_Gb5VXQVIm49wGJO01EejhDEBgCM4nHj5D9mShC2BI7PJUmSBAlqD-mM",
                            }}
                            style={styles.image}
                        />

                        {/* Gradient Overlay */}
                        <View style={styles.imageGradient} />

                        {/* Floating Status Card */}
                        <View style={styles.floatingCard}>
                            <View style={styles.floatingIconBox}>
                                <MaterialIcons name="check" size={16} color="#1b6d24" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.floatingTitle}>Gate pass verified</Text>
                                <Text style={styles.floatingSubtitle}>EATM Main Gate · Exit logged 2s ago</Text>
                            </View>
                            <View style={styles.activeDot} />
                        </View>
                    </View>

                </View>

                {/* FEATURES SECTION - Redesigned */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTag}>EXCELLENCE</Text>
                        <Text style={styles.sectionTitle}>
                            Modern Features for Seamless Campus Flow
                        </Text>
                        <View style={styles.sectionDivider} />
                    </View>

                    {/* Main Feature Card */}
                    <View style={styles.mainFeatureCard}>
                        <View style={styles.featureIconContainer}>
                            <View style={styles.featureIconBg}>
                                <MaterialIcons name="qr-code-scanner" size={32} color="#0040a1" />
                            </View>
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>QR Code Gate Pass</Text>
                            <Text style={styles.featureDescription}>
                                Instantly generate and scan dynamic QR codes for secure entry and exit logging.
                            </Text>
                            <TouchableOpacity style={styles.featureLink}>
                                <Text style={styles.featureLinkText}>Learn more</Text>
                                <MaterialIcons name="arrow-forward" size={16} color="#0040a1" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Features Grid */}
                    <View style={styles.featuresGrid}>
                        <View style={styles.featureCard}>
                            <View style={styles.featureCardIcon}>
                                <MaterialIcons name="access-time" size={24} color="#0040a1" />
                            </View>
                            <Text style={styles.featureCardTitle}>Real-Time Tracking</Text>
                            <Text style={styles.featureCardDescription}>
                                Instant student movement alerts.
                            </Text>
                        </View>

                        <View style={styles.featureCard}>
                            <View style={styles.featureCardIcon}>
                                <MaterialIcons name="security" size={24} color="#0040a1" />
                            </View>
                            <Text style={styles.featureCardTitle}>Secure Access</Text>
                            <Text style={styles.featureCardDescription}>
                                Role-based encrypted login.
                            </Text>
                        </View>
                    </View>

                    {/* Highlight Feature */}
                    <View style={styles.highlightFeature}>
                        <View style={styles.highlightBadge}>
                            <MaterialIcons name="stars" size={16} color="#fff" />
                            <Text style={styles.highlightBadgeText}>POPULAR</Text>
                        </View>
                        <View style={styles.highlightContent}>
                            <Text style={styles.highlightTitle}>Easy Requests</Text>
                            <Text style={styles.highlightDescription}>
                                Submit digital gate pass requests in seconds from your mobile dashboard.
                            </Text>
                            <TouchableOpacity style={styles.highlightButton}>
                                <Text style={styles.highlightButtonText}>Try Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.howSection}>
                    <Text style={styles.howTitle}>How it works</Text>

                    <View style={styles.line} />

                    {/* Step 1 */}
                    <View style={styles.stepRow}>
                        <View style={styles.circle}>
                            <Text style={styles.circleText}>01</Text>
                        </View>

                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Student fills form</Text>
                            <Text style={styles.stepDesc}>
                                Quick digital submission with reason, destination, and return time directly in the app.
                            </Text>
                        </View>
                    </View>

                    {/* Step 2 */}
                    <View style={styles.stepRow}>
                        <View style={styles.circlePrimary}>
                            <MaterialIcons name="qr-code-scanner" size={22} color="#fff" />
                        </View>

                        <View style={styles.stepContent}>
                            <Text style={[styles.stepTitle, { color: "#0040a1" }]}>
                                QR code is generated
                            </Text>
                            <Text style={styles.stepDesc}>
                                Upon internal approval, a unique, encrypted QR code appears instantly on your mobile screen.
                            </Text>
                        </View>
                    </View>

                    {/* Step 3 */}
                    <View style={styles.stepRow}>
                        <View style={styles.circle}>
                            <Text style={styles.circleText}>03</Text>
                        </View>

                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Security scans QR</Text>
                            <Text style={styles.stepDesc}>
                                Gate security uses their tablet or dedicated scanner to verify the student's digital pass.
                            </Text>
                        </View>
                    </View>

                    {/* Step 4 */}
                    <View style={styles.stepRow}>
                        <View style={styles.circleSecondary}>
                            <Text style={{ color: "#fff" }}>✔</Text>
                        </View>

                        <View style={styles.stepContent}>
                            <Text style={[styles.stepTitle, { color: "#1b6d24" }]}>
                                Entry/Exit recorded
                            </Text>
                            <Text style={styles.stepDesc}>
                                Timestamp and location are instantly updated in the central server for real-time tracking.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* CTA */}
                <View style={styles.cta}>
                    <Text style={styles.ctaTitle}>
                        Ready to digitalize your campus?
                    </Text>

                    <Text style={styles.ctaSub}>
                        Join 50+ institutions already using Scan2Exit for smarter security.
                    </Text>

                    <TouchableOpacity style={styles.ctaBtn}>
                        <Text style={styles.ctaBtnText} onPress={() => navigation.navigate("Login")}>Get Started Now</Text>
                    </TouchableOpacity>
                </View>

                {/* FOOTER */}
                <View style={styles.footer}>

                    {/* Logo Row */}
                    <View style={styles.footerLogoRow}>
                        <MaterialIcons name="qr-code-scanner" size={26} color="#0040a1" />
                        <Text style={styles.footerLogoText}>Scan2Exit</Text>
                    </View>

                    {/* Links */}
                    <View style={styles.footerLinks}>
                        <Text style={styles.footerLink}>About</Text>
                        <Text style={styles.footerLink}>Contact</Text>
                        <Text style={styles.footerLink}>Privacy</Text>
                        <Text style={styles.footerLink}>Terms</Text>
                    </View>

                    {/* Copyright */}
                    <Text style={styles.footerText}>© 2026 @TechVortex</Text>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#faf8ff",
    },

    // HERO
    hero: {
        padding: 20,
        paddingBottom: 0,
    },

    // Badge
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        backgroundColor: "#eef3ff",
        borderWidth: 0.5,
        borderColor: "#c0d0f5",
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 12,
        marginBottom: 18,
    },

    badgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#0040a1",
        letterSpacing: 0.4,
    },

    // Heading
    heading: {
        fontSize: 26,
        fontWeight: "800",
        lineHeight: 36,
        color: "#1a1a1a",
        marginBottom: 12,
    },

    egiHighlight: {
        fontSize: 26,
        fontWeight: "900",
        color: "#0040a1",
        letterSpacing: 3,
    },

    // Subtext
    subText: {
        fontSize: 14,
        color: "#555",
        lineHeight: 22,
        marginBottom: 20,
    },

    // Stats
    statsRow: {
        flexDirection: "row",
        borderWidth: 0.5,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 20,
    },

    statItem: {
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
    },

    statDivider: {
        width: 0.5,
        backgroundColor: "#e0e0e0",
    },

    statNumber: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0040a1",
        marginBottom: 2,
    },

    statLabel: {
        fontSize: 11,
        color: "#888",
    },

    // Buttons
    btnRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 24,
    },

    primaryBtn: {
        flex: 1,
        backgroundColor: "#0040a1",
        paddingVertical: 14,
        borderRadius: 30,
        flexDirection: "row",       // 👈 added
        alignItems: "center",
        justifyContent: "center",
        gap: 6,                     // 👈 added
    },

    primaryText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14,
    },

    secondaryBtn: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: "#0040a1",
        paddingVertical: 14,
        borderRadius: 30,
        flexDirection: "row",       // 👈 added
        alignItems: "center",
        justifyContent: "center",
        gap: 6,                     // 👈 added
    },

    secondaryText: {
        color: "#0040a1",
        fontWeight: "700",
        fontSize: 14,
    },

    // Image
    imageWrapper: {
        position: "relative",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
        marginBottom:15,
        
    },

    image: {
        width: "100%",
        height: 210,
    },

    imageGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        backgroundColor: "rgba(0,0,0,0.45)",
    },

    // Floating Card
    floatingCard: {
        position: "absolute",
        bottom: 14,
        left: 14,
        right: 14,
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 12,
        padding: 10,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 0.5,
        borderColor: "rgba(0,64,161,0.15)",
    },

    floatingIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#e6f7ee",
        justifyContent: "center",
        alignItems: "center",
    },

    floatingTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: "#1a1a1a",
    },

    floatingSubtitle: {
        fontSize: 11,
        color: "#666",
        marginTop: 2,
    },

    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#1b6d24",
        borderWidth: 3,
        borderColor: "#d1f0d9",
    },
    section: {
        padding: 20,
    },

    sectionTag: {
        color: "#0040a1",
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 5,
    },

    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
    },

    howSection: {
        margin: 16,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 20,

        // iOS Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,

        // Android Shadow
        elevation: 5,

        position: "relative",
    },

    howTitle: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 30,
    },

    line: {
        position: "absolute",
        left: 36,
        top: 89,
        bottom: 68,
        width: 1,
        backgroundColor: "#ccc",
    },

    stepRow: {
        flexDirection: "row",
        marginBottom: 30,
        alignItems: "flex-start",
    },

    circle: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: "#e7e7f2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },

    circlePrimary: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: "#0040a1",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },

    circleSecondary: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: "#1b6d24",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },

    circleText: {
        fontWeight: "bold",
        color: "#0040a1",
    },

    stepContent: {
        flex: 1,
    },

    stepTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },

    stepDesc: {
        fontSize: 13,
        color: "#555",
    },
    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 20,
        marginBottom: 10,
        elevation: 2,
    },

    cardTitle: {
        fontWeight: "bold",
        fontSize: 16,
    },

    cardText: {
        color: "#555",
    },

    row: {
        flexDirection: "row",
        gap: 10,
        marginVertical: 10,
    },

    smallCard: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 20,
    },

    smallTitle: {
        fontWeight: "bold",
    },

    smallText: {
        fontSize: 12,
        color: "#555",
    },

    highlightCard: {
        backgroundColor: "#0040a1",
        padding: 20,
        borderRadius: 20,
    },

    highlightTitle: {
        color: "#fff",
        fontWeight: "bold",
    },

    highlightText: {
        color: "#eee",
    },

    cta: {
        backgroundColor: "#a0f399",
        padding: 25,
        borderRadius: 30,
        margin: 20,
        alignItems: "center",
    },

    ctaTitle: {
        fontWeight: "bold",
        fontSize: 18,
    },

    ctaSub: {
        marginVertical: 10,
        color: "#333",
        textAlign: "center",
    },

    ctaBtn: {
        backgroundColor: "#1b6d24",
        padding: 15,
        borderRadius: 30,
        width: "100%",
        marginTop: 10,
    },

    ctaBtnText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold",
    },

    footer: {
        backgroundColor: "#f5f7fb",
        paddingVertical: 25,
        paddingHorizontal: 20,
        alignItems: "center",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,

        // Shadow (Professional look)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 8,
    },

    footerLogoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },

    footerLogoText: {
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 8,
        color: "#1a1a1a",
    },

    footerLinks: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 12,
    },

    footerLink: {
        marginHorizontal: 10,
        color: "#555",
        fontSize: 14,
    },

    footerText: {
        fontSize: 12,
        color: "#888",
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#eaf1ff", // light blue background
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    // Add these styles to your StyleSheet.create({...})

    section: {
        padding: 24,
        backgroundColor: "#fff",
        marginHorizontal: 16,
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },

    sectionHeader: {
        marginBottom: 24,
    },

    sectionTag: {
        color: "#0040a1",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1,
        marginBottom: 8,
        textTransform: "uppercase",
    },

    sectionTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1a1a1a",
        lineHeight: 32,
        marginBottom: 12,
    },

    sectionDivider: {
        height: 3,
        width: 40,
        backgroundColor: "#0040a1",
        borderRadius: 2,
    },

    mainFeatureCard: {
        flexDirection: "row",
        backgroundColor: "#f8faff",
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#e6eaff",
    },

    featureIconContainer: {
        marginRight: 16,
        justifyContent: "center",
    },

    featureIconBg: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#0040a1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },

    featureContent: {
        flex: 1,
        justifyContent: "center",
    },

    featureTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 6,
    },

    featureDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 12,
    },

    featureLink: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
    },

    featureLinkText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0040a1",
        marginRight: 4,
    },

    featuresGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    featureCard: {
        width: "48%",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#f0f0f0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    featureCardIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f5ff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },

    featureCardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 6,
    },

    featureCardDescription: {
        fontSize: 13,
        color: "#666",
        lineHeight: 18,
    },

    highlightFeature: {
        backgroundColor: "#0040a1",
        padding: 20,
        borderRadius: 12,
        position: "relative",
        overflow: "hidden",
    },

    highlightBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: "#ff6b6b",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderBottomLeftRadius: 8,
    },

    highlightBadgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
        marginLeft: 4,
        letterSpacing: 0.5,
    },

    highlightContent: {
        marginTop: 8,
    },

    highlightTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 8,
    },

    highlightDescription: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
        lineHeight: 20,
        marginBottom: 16,
    },

    highlightButton: {
        backgroundColor: "#fff",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: "flex-start",
    },

    highlightButtonText: {
        color: "#0040a1",
        fontSize: 14,
        fontWeight: "700",
    },
});