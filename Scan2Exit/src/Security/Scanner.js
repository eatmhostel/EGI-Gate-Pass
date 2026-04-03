import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Vibration,
    Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Scanner() {
    const [permission, requestPermission] = useCameraPermissions();
    const [flashEnabled, setFlashEnabled] = useState(false);
    const [scanned, setScanned] = useState(false);
    const navigation = useNavigation();
    const scanLineAnim = useRef(new Animated.Value(0)).current;

    // Animate scan line
    useEffect(() => {
        const animateScanLine = () => {
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ]).start(() => animateScanLine());
        };
        animateScanLine();
    }, []);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <View style={styles.permissionCard}>
                    <MaterialCommunityIcons name="camera-off" size={64} color="#1a237e" />
                    <Text style={styles.permissionTitle}>Camera Access Required</Text>
                    <Text style={styles.permissionText}>
                        This app needs camera access to scan QR codes for security verification.
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionBtn}
                        onPress={requestPermission}
                    >
                        <Text style={styles.permissionBtnText}>Enable Camera</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const handleBarCodeScanned = ({ type, data }) => {
        if (scanned) return;
        
        setScanned(true);
        Vibration.vibrate(100);
        
        // Simulate processing
        setTimeout(() => {
            Alert.alert(
                "QR Code Scanned",
                `Data: ${data}\nType: ${type}`,
                [
                    {
                        text: "Cancel",
                        onPress: () => setScanned(false),
                        style: "cancel",
                    },
                    {
                        text: "Verify",
                        onPress: () => {
                            // Navigate to verification screen
                            console.log("Verifying:", data);
                            setScanned(false);
                        },
                    },
                ]
            );
        }, 500);
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            >
                {/* Overlay with transparent center */}
                <View style={styles.overlay}>
                    <View style={styles.topOverlay} />
                    <View style={styles.middleOverlay}>
                        <View style={styles.sideOverlay} />
                        <View style={styles.scanArea}>
                            {/* Corner Brackets */}
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                            
                            {/* Animated Scan Line */}
                            <Animated.View
                                style={[
                                    styles.scanLine,
                                    {
                                        transform: [
                                            {
                                                translateY: scanLineAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 240],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            />
                        </View>
                        <View style={styles.sideOverlay} />
                    </View>
                    <View style={styles.bottomOverlay} />
                </View>

                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Security Scanner</Text>

                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => setFlashEnabled(!flashEnabled)}
                    >
                        <MaterialIcons
                            name={flashEnabled ? "flash-on" : "flash-off"}
                            size={24}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>

                {/* Instructions */}
                <View style={styles.instructionContainer}>
                    <Text style={styles.instructionText}>
                        Position QR code within the frame
                    </Text>
                    <Text style={styles.subInstructionText}>
                        Scanner will detect automatically
                    </Text>
                </View>

            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    camera: {
        flex: 1,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    topOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    middleOverlay: {
        flexDirection: "row",
        height: 250,
    },
    sideOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    scanArea: {
        width: 250,
        height: 250,
        position: "relative",
    },
    bottomOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    corner: {
        position: "absolute",
        width: 20,
        height: 20,
        borderColor: "#00e5ff",
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderTopLeftRadius: 8,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderTopRightRadius: 8,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderBottomLeftRadius: 8,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderBottomRightRadius: 8,
    },
    scanLine: {
        position: "absolute",
        left: 10,
        right: 10,
        height: 2,
        backgroundColor: "#00e5ff",
        shadowColor: "#00e5ff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    topBar: {
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    instructionContainer: {
        position: "absolute",
        top: "45%",
        left: 0,
        right: 0,
        alignItems: "center",
    },
    instructionText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
    },
    subInstructionText: {
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: 14,
        marginTop: 4,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f7fa",
        padding: 20,
    },
    permissionCard: {
        backgroundColor: "#fff",
        padding: 30,
        borderRadius: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
        maxWidth: 320,
    },
    permissionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a237e",
        marginTop: 20,
        marginBottom: 10,
        textAlign: "center",
    },
    permissionText: {
        fontSize: 14,
        color: "#5c6bc0",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 25,
    },
    permissionBtn: {
        backgroundColor: "#1a237e",
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    permissionBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});