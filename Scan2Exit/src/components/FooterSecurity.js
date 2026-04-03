import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function FooterSecurity() {
    const navigation = useNavigation();
    const route = useRoute();

    const currentRoute = route.name;

    return (
        <>
            {/* Floating Scan Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("Scanner")}
            >
                <MaterialIcons name="qr-code-scanner" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>

                {/* Home */}
                <TouchableOpacity
                    style={styles.item}
                    onPress={() => navigation.navigate("SecurityDashboard")}
                >
                    <MaterialIcons
                        name="grid-view"
                        size={22}
                        color={currentRoute === "SecurityDashboard" ? "#0040a1" : "gray"}
                    />
                    <Text
                        style={
                            currentRoute === "SecurityDashboard"
                                ? styles.activeText
                                : styles.text
                        }
                    >
                        Home
                    </Text>

                    {currentRoute === "SecurityDashboard" && (
                        <View style={styles.activeIndicator} />
                    )}
                </TouchableOpacity>

                {/* History */}
                <TouchableOpacity
                    style={styles.item}
                    onPress={() => navigation.navigate("SecurityHistory")}
                >
                    <MaterialIcons
                        name="history"
                        size={22}
                        color={currentRoute === "SecurityHistory" ? "#0040a1" : "gray"}
                    />
                    <Text
                        style={
                            currentRoute === "SecurityHistory"
                                ? styles.activeText
                                : styles.text
                        }
                    >
                        History
                    </Text>

                    {currentRoute === "SecurityHistory" && (
                        <View style={styles.activeIndicator} />
                    )}
                </TouchableOpacity>

                {/* Profile */}
                <TouchableOpacity
                    style={styles.item}
                    onPress={() => navigation.navigate("SecurityProfile")}
                >
                    <MaterialIcons
                        name="person"
                        size={22}
                        color={currentRoute === "SecurityProfile" ? "#0040a1" : "gray"}
                    />
                    <Text
                        style={
                            currentRoute === "SecurityProfile"
                                ? styles.activeText
                                : styles.text
                        }
                    >
                        Profile
                    </Text>

                    {currentRoute === "SecurityProfile" && (
                        <View style={styles.activeIndicator} />
                    )}
                </TouchableOpacity>

            </View>
        </>
    );
}

const styles = StyleSheet.create({
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 12,
        paddingBottom: 18,
        backgroundColor: "rgba(255,255,255,0.9)",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 10,
    },

    item: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },

    activeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#0040a1",
        marginTop: 4,
    },

    text: {
        fontSize: 11,
        fontWeight: "600",
        color: "gray",
        marginTop: 4,
    },

    activeIndicator: {
        marginTop: 4,
        width: 20,
        height: 3,
        borderRadius: 2,
        backgroundColor: "#0040a1",
    },

    fab: {
        position: "absolute",
        bottom: 80,
        right: 20,
        width: 60,
        height: 60,
        backgroundColor: "#0040a1",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 10,
    },
});