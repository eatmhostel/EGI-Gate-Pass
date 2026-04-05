import { React, useState } from "react";
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
import { Picker } from '@react-native-picker/picker';
import Navbar from "../components/Navbar";
import Footer from "../components/FooterStudent";
import { useRoute } from "@react-navigation/native";
import { EXPO_PUBLIC_API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
const COLORS = {
    primary: "#0040a1",
    primaryContainer: "#0056d2",
    secondary: "#1b6d24",
    secondaryContainer: "#a0f399",
    surface: "#faf8ff",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerHigh: "#e7e7f2",
    surfaceContainerHighest: "#e1e2ec",
    onSurface: "#191b23",
    onSurfaceVariant: "#424654",
    onPrimary: "#ffffff",
    outline: "#737785",
    outlineVariant: "#c3c6d6",
};

export default function Request() {
    const navigation = useNavigation();
    const [outTime, setOutTime] = useState(new Date());
    const [returnTime, setReturnTime] = useState(new Date());
    const [destination, setDestination] = useState("");
    const [showOut, setShowOut] = useState(false);
    const [showReturn, setShowReturn] = useState(false);
    const [returnDate, setReturnDate] = useState(new Date());
    const [showReturnDate, setShowReturnDate] = useState(false);
    const [studentId, setStudentId] = useState("");
    useEffect(() => {
        const getStudentId = async () => {
            try {
                const id = await AsyncStorage.getItem("studentId");
                setStudentId(id);
                if (!id) {
                    console.log("No studentId in storage");
                    return;
                }
                setStudentId(id);
            } catch (err) {
                console.log(err);
            }
        };
        getStudentId();
    }, []);
    const handleSubmit = async () => {
    if (!studentId) {
        console.log("Student ID not found");
        return;
    }

    try {
        const res = await fetch(`${EXPO_PUBLIC_API_URL}/gatepass/request`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                studentId,
                destination,
                outTime: outTime.toISOString(),       
                returnTime: returnTime.toISOString(), 
                returnDate: returnDate.toISOString()  
            })
        });

        const data = await res.json();

        if (data.success) {
            navigation.replace("RequestSuccess", {
                requestId: data.requestId,
                studentId: studentId,
            });
        } else {
            console.log(data.message);
        }

    } catch (err) {
        console.log(err);
    }
};
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
                        <View style={{ flex: 1 }}>
                            <Picker
                                selectedValue={destination}
                                onValueChange={(itemValue) => setDestination(itemValue)}
                                dropdownIconColor={COLORS.outline}
                            >
                                <Picker.Item label="Select Destination" value="" />
                                <Picker.Item label="Market" value="Market" />
                                <Picker.Item label="Khordha" value="Khordha" />
                                <Picker.Item label="Home" value="Home" />
                            </Picker>
                        </View>
                    </View>

                    {/* OUT TIME */}
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

                    {/* RETURN DATE (only for Home) */}
                    {destination === "Home" && (
                        <>
                            <Text style={styles.label}>EXPECTED RETURN DATE</Text>
                            <TouchableOpacity
                                style={styles.inputBox}
                                onPress={() => setShowReturnDate(true)}
                            >
                                <MaterialIcons name="event" size={20} color="#777" />
                                <Text style={styles.inputText}>
                                    {returnDate.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>

                            {showReturnDate && (
                                <DateTimePicker
                                    value={returnDate}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowReturnDate(false);
                                        if (selectedDate) setReturnDate(selectedDate);
                                    }}
                                />
                            )}
                        </>
                    )}

                    {/* RETURN TIME */}
                    <Text style={styles.label}>EXPECTED RETURN TIME</Text>
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

                    {/* Submit */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSubmit}
                    >
                        <MaterialIcons name="send" size={20} color="#fff" />
                        <Text style={styles.buttonText}>
                            Submit Request
                        </Text>
                    </TouchableOpacity>

                </View>

                {/* Footer text inside ScrollView */}
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
    inputText: {
        marginLeft: 10,
        color: "#000",
        fontSize: 16,
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