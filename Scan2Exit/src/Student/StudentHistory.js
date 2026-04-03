import React from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
} from "react-native";

import Navbar from "../components/Navbar";
import Footer from "../components/FooterStudent";

export default function StudentHistory() {
    return (
        <View style={styles.container}>
            <Navbar />

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Heading */}
                <Text style={styles.title}>History</Text>
                <Text style={styles.subtitle}>
                    View your past gate pass requests and activity logs.
                </Text>

                {/* Example Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>No History Available</Text>
                    <Text style={styles.cardText}>
                        Your previous requests will appear here once you start using the system.
                    </Text>
                </View>

                {/* Footer Text */}
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
        paddingTop: 30,
    },

    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 6,
    },

    subtitle: {
        color: "#666",
        marginBottom: 20,
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
        marginBottom: 6,
    },

    cardText: {
        fontSize: 13,
        color: "#666",
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
        textAlign: 'center',
    },
});