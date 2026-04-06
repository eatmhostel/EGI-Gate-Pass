import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Vibration,
    ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { EXPO_PUBLIC_API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Import AuthContext
import { AuthContext } from "../context/AuthContext";

/* ── Helpers ─────────────────────────────────────────── */
const getInitials = (name) =>
    name
        ? name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "?";

const fmtTime = (d) =>
    d
        ? new Date(d).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
          })
        : "";

const fmtDT = (d) =>
    d
        ? new Date(d).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
          })
        : "";

/* ── Component ───────────────────────────────────────── */
export default function Scanner() {
    const [permission, requestPermission] = useCameraPermissions();
    const [flashEnabled, setFlashEnabled] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // ✅ Get user from AuthContext
    const { user, token } = useContext(AuthContext);
    const navigation = useNavigation();
    const scanLineAnim = useRef(new Animated.Value(0)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const cardTranslate = useRef(new Animated.Value(600)).current;

    /* scan line loop */
    useEffect(() => {
        const loop = () => {
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
            ]).start(loop);
        };
        loop();
    }, []);

    /* result overlay anim */
    useEffect(() => {
        if (result) {
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.spring(cardTranslate, {
                    toValue: 0,
                    tension: 60,
                    friction: 12,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            overlayOpacity.setValue(0);
            cardTranslate.setValue(600);
        }
    }, [result]);

    const reset = useCallback(() => {
        setResult(null);
        setScanned(false);
        setLoading(false);
    }, []);

    /* ── Scan handler ─────────────────────────────────── */
    const handleBarCodeScanned = async ({ data }) => {
        if (scanned) return;
        setScanned(true);
        setLoading(true);
        Vibration.vibrate(80);

        try {
            // ✅ FIX: Get token from AsyncStorage if not in context
            const authToken = token || await AsyncStorage.getItem("authToken");
            
            if (!authToken) {
                setLoading(false);
                setResult({
                    success: false,
                    message: "Authentication error. Please login again.",
                });
                return;
            }

            const res = await fetch(
                `${EXPO_PUBLIC_API_URL}/security-scans/verify`,
                {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        // ✅ FIX: Add Authorization header with token
                        "Authorization": `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        qrData: data,
                        scannedBy: user?.name || "Security",
                    }),
                }
            );

            // ✅ FIX: Safe JSON parsing (read body only once)
            const responseText = await res.text();
            let json;
            try {
                json = JSON.parse(responseText);
            } catch (parseError) {
                console.log("Invalid response:", responseText.substring(0, 100));
                setLoading(false);
                setResult({
                    success: false,
                    message: "Invalid response from server",
                });
                return;
            }

            setLoading(false);

            if (json.success) {
                Vibration.vibrate([80, 40, 80]);
            } else {
                Vibration.vibrate([200, 100, 200]);
            }
            setResult(json);
        } catch (error) {
            console.log("Scan error:", error.message);
            setLoading(false);
            setResult({
                success: false,
                message: "Network error. Please check your connection and try again.",
            });
        }
    };

    /* ── Permission screens ───────────────────────────── */
    if (!permission) return <View style={s.fill} />;

    if (!permission.granted) {
        return (
            <View style={s.permBox}>
                <View style={s.permCard}>
                    <MaterialCommunityIcons
                        name="camera-off"
                        size={64}
                        color="#1a237e"
                    />
                    <Text style={s.permTitle}>Camera Access Required</Text>
                    <Text style={s.permText}>
                        This app needs camera access to scan QR codes for security
                        verification.
                    </Text>
                    <TouchableOpacity
                        style={s.permBtn}
                        onPress={requestPermission}
                    >
                        <Text style={s.permBtnText}>Enable Camera</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    /* ── Color helpers ────────────────────────────────── */
    const isExit = result?.success && result.action === "exit";
    const isEnter = result?.success && result.action === "enter";
    const isDenied = result?.success === false;

    const accent = isExit ? "#f59e0b" : isEnter ? "#16a34a" : "#dc2626";
    const accentBg = isExit
        ? "#fffbeb"
        : isEnter
        ? "#f0fdf4"
        : "#fef2f2";
    const accentBorder = isExit
        ? "#fde68a"
        : isEnter
        ? "#bbf7d0"
        : "#fecaca";

    /* ── Render ───────────────────────────────────────── */
    return (
        <View style={s.fill}>
            {/* Camera first, NO children inside */}
            <CameraView
                style={s.fill}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                flash={flashEnabled ? "on" : "off"}
            />

            {/* All overlays OUTSIDE the CameraView */}
            {/* Dark overlay with transparent centre */}
            <View style={s.overlay}>
                <View style={s.topOverlay} />
                <View style={s.midOverlay}>
                    <View style={s.sideOverlay} />
                    <View style={s.scanArea}>
                        <View style={[s.corner, s.tl]} />
                        <View style={[s.corner, s.tr]} />
                        <View style={[s.corner, s.bl]} />
                        <View style={[s.corner, s.br]} />
                        <Animated.View
                            style={[
                                s.scanLine,
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
                    <View style={s.sideOverlay} />
                </View>
                <View style={s.botOverlay} />
            </View>

            {/* Top bar */}
            <View style={s.topBar}>
                <TouchableOpacity
                    style={s.iconBtn}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={s.topTitle}>Security Scanner</Text>
                <TouchableOpacity
                    style={s.iconBtn}
                    onPress={() => setFlashEnabled((v) => !v)}
                >
                    <MaterialIcons
                        name={flashEnabled ? "flash-on" : "flash-off"}
                        size={24}
                        color="#fff"
                    />
                </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View style={s.instrBox}>
                <Text style={s.instrText}>
                    Position QR code within the frame
                </Text>
                <Text style={s.instrSub}>
                    Scanner will detect automatically
                </Text>
            </View>

            {/* ── Loading overlay ──────────────────────── */}
            {loading && (
                <View style={s.loadOverlay}>
                    <ActivityIndicator size="large" color="#00e5ff" />
                    <Text style={s.loadText}>Verifying QR code…</Text>
                </View>
            )}

            {/* ── Result overlay ───────────────────────── */}
            {result && (
                <Animated.View
                    style={[s.resOverlay, { opacity: overlayOpacity }]}
                >
                    <Animated.View
                        style={[
                            s.resCard,
                            { transform: [{ translateY: cardTranslate }] },
                        ]}
                    >
                        {/* Accent strip */}
                        <View style={[s.resStrip, { backgroundColor: accent }]} />

                        {/* Icon */}
                        <View style={[s.resIconWrap, { backgroundColor: accentBg }]}>
                            <MaterialCommunityIcons
                                name={
                                    isExit
                                        ? "logout"
                                        : isEnter
                                        ? "login"
                                        : "alert-circle-outline"
                                }
                                size={40}
                                color={accent}
                            />
                        </View>

                        {/* Action label */}
                        <Text style={[s.resAction, { color: accent }]}>
                            {isExit
                                ? "STUDENT EXIT"
                                : isEnter
                                ? "STUDENT ENTRY"
                                : "ACCESS DENIED"}
                        </Text>
                        <Text style={s.resMessage}>{result.message}</Text>

                        {/* Student card (show when we have student info) */}
                        {result.student && (
                            <View
                                style={[
                                    s.stuCard,
                                    {
                                        borderColor: accentBorder,
                                        backgroundColor: accentBg,
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        s.stuAvatar,
                                        { backgroundColor: accent },
                                    ]}
                                >
                                    <Text style={s.stuAvatarText}>
                                        {getInitials(result.student.fullName)}
                                    </Text>
                                </View>
                                <View style={s.stuInfo}>
                                    <Text style={s.stuName}>
                                        {result.student.fullName}
                                    </Text>
                                    <Text style={s.stuReg}>
                                        {result.student.regNo}
                                    </Text>
                                    {result.student.course && (
                                        <Text style={s.stuBranch}>
                                            {result.student.course}
                                            {result.student.branch
                                                ? " • " + result.student.branch
                                                : ""}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Gate pass details (only for allowed scans) */}
                        {result.success && result.gatePass && (
                            <View style={s.detailsRow}>
                                <View style={s.detailItem}>
                                    <Text style={s.detailLabel}>Destination</Text>
                                    <Text style={s.detailVal}>
                                        {result.gatePass.destination}
                                    </Text>
                                </View>
                                <View style={s.detailSep} />
                                <View style={s.detailItem}>
                                    <Text style={s.detailLabel}>Valid Until</Text>
                                    <Text style={s.detailVal}>
                                        {fmtTime(result.gatePass.validUntil)}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Timestamp */}
                        {result.scannedAt && (
                            <Text style={s.resTimestamp}>
                                Recorded at {fmtDT(result.scannedAt)}
                            </Text>
                        )}

                        {/* Scan again button */}
                        <TouchableOpacity
                            style={[s.resBtn, { backgroundColor: accent }]}
                            onPress={reset}
                            activeOpacity={0.85}
                        >
                            <MaterialIcons
                                name="qr-code-scanner"
                                size={20}
                                color="#fff"
                            />
                            <Text style={s.resBtnText}>Scan Again</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            )}
        </View>
    );
}

/* ── Styles ─────────────────────────────────────────── */
const s = StyleSheet.create({
    fill: { flex: 1, backgroundColor: "#000" },

    /* overlay */
    overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    topOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)" },
    midOverlay: { flexDirection: "row", height: 250 },
    sideOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)" },
    scanArea: { width: 250, height: 250, position: "relative" },
    botOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)" },
    corner: {
        position: "absolute",
        width: 20,
        height: 20,
        borderColor: "#00e5ff",
    },
    tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
    tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
    bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
    br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
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

    /* top bar */
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
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    topTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },

    /* instructions */
    instrBox: {
        position: "absolute",
        top: "45%",
        left: 0,
        right: 0,
        alignItems: "center",
    },
    instrText: { color: "#fff", fontSize: 16, fontWeight: "500" },
    instrSub: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        marginTop: 4,
    },

    /* permission */
    permBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f7fa",
        padding: 20,
    },
    permCard: {
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
    permTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a237e",
        marginTop: 20,
        marginBottom: 10,
        textAlign: "center",
    },
    permText: {
        fontSize: 14,
        color: "#5c6bc0",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 25,
    },
    permBtn: {
        backgroundColor: "#1a237e",
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    permBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },

    /* loading */
    loadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.75)",
        justifyContent: "center",
        alignItems: "center",
        gap: 14,
    },
    loadText: { color: "#e0e0e0", fontSize: 14, fontWeight: "500" },

    /* result overlay */
    resOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
        paddingHorizontal: 12,
        paddingBottom: 40,
    },
    resCard: {
        backgroundColor: "#fff",
        borderRadius: 24,
        paddingBottom: 28,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
        paddingHorizontal: 24,
    },
    resStrip: { height: 5, width: "100%", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    resIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginTop: -40,
        borderWidth: 4,
        borderColor: "#fff",
    },
    resAction: {
        fontSize: 22,
        fontWeight: "800",
        letterSpacing: 1.5,
        marginTop: 16,
    },
    resMessage: {
        fontSize: 14,
        color: "#64748b",
        marginTop: 6,
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 8,
    },

    /* student card */
    stuCard: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginTop: 20,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
    },
    stuAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    stuAvatarText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    stuInfo: { flex: 1 },
    stuName: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
    stuReg: { fontSize: 13, color: "#64748b", marginTop: 2 },
    stuBranch: { fontSize: 12, color: "#94a3b8", marginTop: 1 },

    /* details row */
    detailsRow: {
        flexDirection: "row",
        width: "100%",
        marginTop: 16,
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        padding: 14,
    },
    detailItem: { flex: 1 },
    detailLabel: { fontSize: 10, fontWeight: "700", color: "#94a3b8", letterSpacing: 0.6, textTransform: "uppercase" },
    detailVal: { fontSize: 14, fontWeight: "600", color: "#1e293b", marginTop: 2 },
    detailSep: { width: 1, backgroundColor: "#e2e8f0" },

    /* timestamp */
    resTimestamp: {
        fontSize: 11,
        color: "#94a3b8",
        marginTop: 14,
    },

    /* button */
    resBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: 20,
        gap: 8,
    },
    resBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});