import React from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/FooterStudent";

export default function Request() {
    const navigation = useNavigation();
    const [outTime, setOutTime] = useState(new Date());
    const [returnTime, setReturnTime] = useState(new Date());

    const [showOut, setShowOut] = useState(false);
    const [showReturn, setShowReturn] = useState(false);
    return (
        <View style={styles.container}>
            <Navbar />
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Heading */}
                <Text style={styles.title}>Request Pass</Text>
                <Text style={styles.subtitle}>
                    Specify your journey details for swift institutional approval.
                </Text>

                {/* Form Card */}
                <View style={styles.card}>

                    {/* Destination */}
                    <Text style={styles.label}>DESTINATION</Text>
                    <View style={styles.inputBox}>
                        <MaterialIcons name="location-on" size={20} color="#777" />
                        <TextInput
                            placeholder="Where are you heading?"
                            style={styles.input}
                        />
                    </View>
                    {/* Time */}
                    <View style={styles.flex1}>
                        <Text style={styles.label}>OUT TIME</Text>

                        <TouchableOpacity
                            style={styles.inputBox}
                            onPress={() => setShowOut(true)}
                        >
                            <MaterialIcons name="schedule" size={20} color="#777" />
                            <Text style={styles.inputText}>
                                {outTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </TouchableOpacity>

                        {showOut && (
                            <DateTimePicker
                                value={outTime}
                                mode="time"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowOut(false);
                                    if (selectedDate) setOutTime(selectedDate);
                                }}
                            />
                        )}
                    </View>
                    <View style={styles.flex1}>
                        <Text style={styles.label}>EXPECTED RETURN</Text>

                        <TouchableOpacity
                            style={styles.inputBox}
                            onPress={() => setShowReturn(true)}
                        >
                            <MaterialIcons name="event-repeat" size={20} color="#777" />
                            <Text style={styles.inputText}>
                                {returnTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </TouchableOpacity>

                        {showReturn && (
                            <DateTimePicker
                                value={returnTime}
                                mode="time"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowReturn(false);
                                    if (selectedDate) setReturnTime(selectedDate);
                                }}
                            />
                        )}
                    </View>
                    {/* Submit */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.replace("RequestSuccess")}
                    >
                        <MaterialIcons name="send" size={20} color="#fff" />
                        <Text style={styles.buttonText}>
                            Submit Request
                        </Text>
                    </TouchableOpacity>

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

    label: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#777",
        marginBottom: 6,
        marginTop: 10,
    },

    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eee",
        padding: 12,
        borderRadius: 10,
    },
    input: {
        marginLeft: 10,
        flex: 1,
    },
    row: {
        flexDirection: "row",
        gap: 10,
    },
    flex1: {
        flex: 1,
    },

    button: {
        marginTop: 20,
        backgroundColor: "#0040a1",
        padding: 16,
        borderRadius: 30,
        flexDirection: "row",
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