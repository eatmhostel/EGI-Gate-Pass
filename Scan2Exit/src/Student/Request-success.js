import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Animated,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/FooterStudent";
import QRCode from "react-native-qrcode-svg";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { EXPO_PUBLIC_API_URL } from "@env";
import { useRoute } from "@react-navigation/native";

function formatDateTime(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function clientSideExpired(validUntil) {
    if (!validUntil) return false;
    try {
        const expiry = new Date(validUntil);
        if (isNaN(expiry.getTime())) return false;
        return new Date() > expiry;
    } catch (e) {
        return false;
    }
}

function InfoTile({ icon, label, value }) {
    return (
        <View style={styles.infoTile}>
            <View style={styles.infoTileIconWrap}>
                <MaterialIcons name={icon} size={16} color="#7c3aed" />
            </View>
            <View style={styles.infoTileContent}>
                <Text style={styles.infoTileLabel}>{label}</Text>
                <Text style={styles.infoTileValue} numberOfLines={1}>
                    {value || "—"}
                </Text>
            </View>
        </View>
    );
}

function MetaRow({ icon, label, value }) {
    return (
        <View style={styles.metaRow}>
            <MaterialIcons name={icon} size={16} color="#a78bfa" />
            <Text style={styles.metaLabel}>{label}</Text>
            <Text style={styles.metaValue}>{value}</Text>
        </View>
    );
}

function ScanStatusBadge({ scanned, label, time }) {
    return (
        <View style={[styles.scanBadge, scanned && styles.scanBadgeDone]}>
            <MaterialIcons
                name={scanned ? "check-circle" : "radio-button-unchecked"}
                size={16}
                color={scanned ? "#16a34a" : "#94a3b8"}
            />
            <View style={styles.scanBadgeContent}>
                <Text style={[styles.scanBadgeLabel, scanned && styles.scanBadgeLabelDone]}>
                    {label}
                </Text>
                {time ? (
                    <Text style={styles.scanBadgeTime}>{time}</Text>
                ) : (
                    <Text style={styles.scanBadgeWaiting}>Waiting</Text>
                )}
            </View>
        </View>
    );
}

function LivePulse() {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.4,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [pulseAnim]);

    return (
        <View style={styles.liveIndicator}>
            <Animated.View
                style={[
                    styles.liveDot,
                    { opacity: pulseAnim },
                ]}
            />
            <Text style={styles.liveText}>LIVE TRACKING</Text>
        </View>
    );
}

export default function RequestSuccess() {
    const [requestData, setRequestData] = useState(null);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pollingCount, setPollingCount] = useState(0);
    const [justCompleted, setJustCompleted] = useState(false);
    const blurAnim = useRef(new Animated.Value(0)).current;
    const intervalRef = useRef(null);
    const prevStatusRef = useRef(null);

    const route = useRoute();
    const { requestId } = route.params;

    // ✅ Fetch data
    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(
                `${EXPO_PUBLIC_API_URL}/gatepass/${requestId}`
            );

            if (!res.ok) return;

            const data = await res.json();

            if (data.success) {
                const req = data.request;

                // ✅ Detect transition to completed
                if (
                    prevStatusRef.current &&
                    prevStatusRef.current !== "completed" &&
                    req.status === "completed"
                ) {
                    setJustCompleted(true);
                    // Animate blur in
                    Animated.timing(blurAnim, {
                        toValue: 10,
                        duration: 600,
                        useNativeDriver: true,
                    }).start();
                }

                prevStatusRef.current = req.status;
                setRequestData(req);
                setStudent(req.student);
                setPollingCount((c) => c + 1);
            }
        } catch (err) {
            console.log("POLL ERROR:", err);
        }
    }, [requestId]);

    // ✅ Initial fetch
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchData();
            setLoading(false);
        };
        if (requestId) init();
    }, [requestId, fetchData]);

    // ✅ Polling — only when active
    useEffect(() => {
        if (!requestData) return;

        const isActive = requestData.status === "approved";
        const isCompleted = requestData.status === "completed";
        const isExpired =
            requestData.status === "expired" ||
            (requestData.status === "approved" &&
                clientSideExpired(requestData.validUntil));

        // Stop polling if completed, expired, rejected, or pending
        if (!isActive || isCompleted || isExpired) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

            // If already completed/expired on first load, set blur immediately
            if ((isCompleted || isExpired) && blurAnim._value === 0) {
                Animated.timing(blurAnim, {
                    toValue: 10,
                    duration: 0,
                    useNativeDriver: true,
                }).start();
            }
            return;
        }

        // Start polling every 3 seconds
        if (!intervalRef.current) {
            intervalRef.current = setInterval(fetchData, 3000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [requestData?.status, requestData?.validUntil, fetchData]);

    // ✅ Derived states
    const scannedOut = requestData?.scannedOut === true;
    const scannedIn = requestData?.scannedIn === true;
    const isCompleted = scannedIn && scannedOut;

    const isTimeExpired =
        requestData?.status === "expired" ||
        (requestData?.status !== "expired" &&
            requestData?.status !== "completed" &&
            clientSideExpired(requestData?.validUntil));
    const isExpired = isTimeExpired && !isCompleted;

    const isActive = !isCompleted && !isExpired && requestData?.status === "approved";
    const isPending = requestData?.status === "pending";
    const isRejected = requestData?.status === "rejected";

    const displayState = isCompleted
        ? "completed"
        : isExpired
        ? "expired"
        : isPending
        ? "pending"
        : isRejected
        ? "rejected"
        : "active";

    const isQrDisabled = isCompleted || isExpired || isPending || isRejected;
    const shouldPoll = isActive;

    const formatScanTime = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return d.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
            <View style={styles.container}>
                <Navbar />

                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Loading State */}
                    {loading && (
                        <View style={styles.centerBox}>
                            <ActivityIndicator size="large" color="#7c3aed" />
                            <Text style={styles.loadingText}>
                                Loading pass details...
                            </Text>
                        </View>
                    )}

                    {/* Main Content */}
                    {!loading && requestData && student && (
                        <>
                            {/* ✅ Status Banner */}
                            <View
                                style={[
                                    styles.statusBanner,
                                    displayState === "completed" && styles.statusBannerCompleted,
                                    displayState === "expired" && styles.statusBannerExpired,
                                    displayState === "pending" && styles.statusBannerPending,
                                    displayState === "rejected" && styles.statusBannerRejected,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.statusBannerDot,
                                        displayState === "completed" && styles.statusBannerDotCompleted,
                                        displayState === "expired" && styles.statusBannerDotExpired,
                                        displayState === "pending" && styles.statusBannerDotPending,
                                        displayState === "rejected" && styles.statusBannerDotRejected,
                                        shouldPoll && styles.statusBannerDotPulse,
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.statusBannerText,
                                        displayState === "completed" && styles.statusBannerTextCompleted,
                                        displayState === "expired" && styles.statusBannerTextExpired,
                                        displayState === "pending" && styles.statusBannerTextPending,
                                        displayState === "rejected" && styles.statusBannerTextRejected,
                                    ]}
                                >
                                    {displayState === "completed"
                                        ? "PASS COMPLETED"
                                        : displayState === "expired"
                                        ? "PASS EXPIRED"
                                        : displayState === "pending"
                                        ? "AWAITING APPROVAL"
                                        : displayState === "rejected"
                                        ? "PASS REJECTED"
                                        : "PASS IS ACTIVE"}
                                </Text>

                                {/* ✅ Live indicator when polling */}
                                {shouldPoll && <LivePulse />}
                            </View>

                            {/* Header */}
                            <View style={styles.headerSection}>
                                <Text style={styles.title}>Gate Access Pass</Text>
                                <Text style={styles.subtitle}>
                                    {displayState === "completed"
                                        ? "Entry and exit both recorded. This pass is now complete."
                                        : displayState === "expired"
                                        ? "This pass has passed its validity window."
                                        : displayState === "pending"
                                        ? "Your request is being reviewed by the administration."
                                        : displayState === "rejected"
                                        ? "This gatepass request was not approved."
                                        : "Present this QR code at the security terminal for scanning."}
                                </Text>
                            </View>

                            {/* Pass Card */}
                            <View style={styles.passCard}>
                                {/* Card Top Accent */}
                                <View
                                    style={[
                                        styles.passCardAccent,
                                        displayState === "completed" && styles.passCardAccentCompleted,
                                        displayState === "expired" && styles.passCardAccentExpired,
                                        displayState === "pending" && styles.passCardAccentPending,
                                        displayState === "rejected" && styles.passCardAccentRejected,
                                    ]}
                                />

                                {/* Card Header */}
                                <View style={styles.passCardHeader}>
                                    <View>
                                        <Text style={styles.passIdLabel}>PASS ID</Text>
                                        <Text style={styles.passIdValue}>
                                            #{requestData._id.slice(-6).toUpperCase()}
                                        </Text>
                                    </View>

                                    {/* Status Badge */}
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            displayState === "completed" && styles.statusBadgeCompleted,
                                            displayState === "expired" && styles.statusBadgeExpired,
                                            displayState === "pending" && styles.statusBadgePending,
                                            displayState === "rejected" && styles.statusBadgeRejected,
                                        ]}
                                    >
                                        <MaterialIcons
                                            name={
                                                displayState === "completed"
                                                    ? "task-alt"
                                                    : displayState === "expired"
                                                    ? "cancel"
                                                    : displayState === "pending"
                                                    ? "hourglass-top"
                                                    : displayState === "rejected"
                                                    ? "highlight-off"
                                                    : "check-circle"
                                            }
                                            size={14}
                                            color={
                                                displayState === "completed"
                                                    ? "#6366f1"
                                                    : displayState === "expired"
                                                    ? "#64748b"
                                                    : displayState === "pending"
                                                    ? "#ca8a04"
                                                    : displayState === "rejected"
                                                    ? "#dc2626"
                                                    : "#16a34a"
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.statusBadgeText,
                                                displayState === "completed" && styles.statusBadgeTextCompleted,
                                                displayState === "expired" && styles.statusBadgeTextExpired,
                                                displayState === "pending" && styles.statusBadgeTextPending,
                                                displayState === "rejected" && styles.statusBadgeTextRejected,
                                            ]}
                                        >
                                            {displayState === "completed"
                                                ? "Completed"
                                                : displayState === "expired"
                                                ? "Expired"
                                                : displayState === "pending"
                                                ? "Pending"
                                                : displayState === "rejected"
                                                ? "Rejected"
                                                : "Active"}
                                        </Text>
                                    </View>
                                </View>

                                {/* Divider */}
                                <View style={styles.cardDivider} />

                                {/* ✅ QR Code with BLUR */}
                                <View style={styles.qrWrap}>
                                    <View style={styles.qrContainer}>
                                        {/* QR with animated blur */}
                                        <Animated.View
                                            style={[
                                                styles.qrInnerWrap,
                                                {
                                                    opacity: isQrDisabled ? 0.15 : 1,
                                                },
                                            ]}
                                        >
                                            <QRCode
                                                value={requestData.qrData}
                                                size={190}
                                                color="#1e1b4b"
                                                backgroundColor="#ffffff"
                                            />
                                        </Animated.View>

                                        {/* ✅ COMPLETED Overlay with blur feel */}
                                        {isCompleted && (
                                            <View style={styles.completedOverlay}>
                                                <View style={styles.completedOverlayIconWrap}>
                                                    <MaterialIcons
                                                        name="task-alt"
                                                        size={36}
                                                        color="#6366f1"
                                                    />
                                                </View>
                                                <Text style={styles.completedOverlayTitle}>
                                                    COMPLETED
                                                </Text>
                                                <Text style={styles.completedOverlaySub}>
                                                    Exit & Entry Recorded
                                                </Text>
                                                <View style={styles.completedOverlayTimes}>
                                                    <Text style={styles.completedOverlayTimeText}>
                                                        Out: {formatScanTime(requestData?.scannedOutAt)}
                                                    </Text>
                                                    <Text style={styles.completedOverlayTimeText}>
                                                        In: {formatScanTime(requestData?.scannedInAt)}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        {/* EXPIRED Overlay */}
                                        {isExpired && (
                                            <View style={styles.expiredOverlay}>
                                                <MaterialIcons
                                                    name="schedule"
                                                    size={28}
                                                    color="#dc2626"
                                                />
                                                <Text style={styles.expiredOverlayTitle}>EXPIRED</Text>
                                            </View>
                                        )}

                                        {/* PENDING Overlay */}
                                        {isPending && (
                                            <View style={styles.pendingOverlay}>
                                                <MaterialIcons
                                                    name="hourglass-top"
                                                    size={28}
                                                    color="#ca8a04"
                                                />
                                                <Text style={styles.pendingOverlayTitle}>PENDING</Text>
                                            </View>
                                        )}

                                        {/* REJECTED Overlay */}
                                        {isRejected && (
                                            <View style={styles.rejectedOverlay}>
                                                <MaterialIcons
                                                    name="highlight-off"
                                                    size={28}
                                                    color="#dc2626"
                                                />
                                                <Text style={styles.rejectedOverlayTitle}>REJECTED</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.qrHint}>
                                        {isCompleted
                                            ? "Pass has been fully used"
                                            : isExpired
                                            ? "This pass is no longer valid"
                                            : isPending
                                            ? "QR will activate after approval"
                                            : isRejected
                                            ? "QR not generated"
                                            : "Scan at security gate"}
                                    </Text>
                                </View>

                                {/* Divider */}
                                <View style={styles.cardDivider} />

                                {/* ✅ Scan Status Tracker */}
                                {!isPending && !isRejected && (
                                    <View style={styles.scanTracker}>
                                        <View style={styles.scanTrackerHeader}>
                                            <Text style={styles.scanTrackerTitle}>
                                                Scan Progress
                                            </Text>
                                            {shouldPoll && (
                                                <View style={styles.scanTrackerLive}>
                                                    <View style={styles.scanTrackerLiveDot} />
                                                    <Text style={styles.scanTrackerLiveText}>
                                                        Live
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        <View style={styles.scanTrackerRow}>
                                            <ScanStatusBadge
                                                scanned={scannedOut}
                                                label="Exit Scan"
                                                time={formatScanTime(requestData?.scannedOutAt)}
                                            />

                                            {/* Connector Line */}
                                            <View style={styles.scanTrackerLine}>
                                                <View
                                                    style={[
                                                        styles.scanTrackerLineFill,
                                                        scannedOut &&
                                                            styles.scanTrackerLineFillHalf,
                                                        scannedIn &&
                                                            styles.scanTrackerLineFillFull,
                                                    ]}
                                                />
                                            </View>

                                            <ScanStatusBadge
                                                scanned={scannedIn}
                                                label="Entry Scan"
                                                time={formatScanTime(requestData?.scannedInAt)}
                                            />
                                        </View>

                                        {/* ✅ Step descriptions */}
                                        <View style={styles.scanStepDesc}>
                                            <Text style={styles.scanStepText}>
                                                {scannedOut
                                                    ? "Student exited campus"
                                                    : "Waiting for exit scan"}
                                            </Text>
                                            <Text style={styles.scanStepText}>
                                                {scannedIn
                                                    ? "Student entered campus"
                                                    : scannedOut
                                                    ? "Waiting for return"
                                                    : "—"}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {/* Divider */}
                                {!isPending && !isRejected && <View style={styles.cardDivider} />}

                                {/* Student Info Grid */}
                                <View style={styles.infoGrid}>
                                    <InfoTile icon="person" label="Name" value={student.fullName} />
                                    <InfoTile icon="badge" label="Regd No" value={student.regNo} />
                                    <InfoTile icon="call" label="Mobile" value={student.phone} />
                                    <InfoTile icon="school" label="Course" value={student.course} />
                                    <InfoTile icon="engineering" label="Branch" value={student.branch} />
                                    <InfoTile icon="location-on" label="Destination" value={requestData.destination} />
                                    <InfoTile icon="flag" label="Purpose" value={requestData.purpose || "General"} />
                                </View>
                            </View>

                            {/* Timing Details */}
                            <View style={styles.timingCard}>
                                <Text style={styles.timingTitle}>Schedule Details</Text>

                                <MetaRow icon="schedule" label="Out Time" value={formatDateTime(requestData.outTime)} />
                                <View style={styles.timingDivider} />
                                <MetaRow icon="event" label="Return Time" value={formatDateTime(requestData.returnTime)} />
                                <View style={styles.timingDivider} />
                                <MetaRow icon="history" label="Requested On" value={formatDateTime(requestData.createdAt)} />
                                <View style={styles.timingDivider} />
                                <MetaRow icon="timer" label="Valid Until" value={formatDateTime(requestData.validUntil)} />

                                {requestData?.scannedOutAt && (
                                    <>
                                        <View style={styles.timingDivider} />
                                        <MetaRow
                                            icon="logout"
                                            label="Scanned Out"
                                            value={formatDateTime(requestData.scannedOutAt)}
                                        />
                                    </>
                                )}
                                {requestData?.scannedInAt && (
                                    <>
                                        <View style={styles.timingDivider} />
                                        <MetaRow
                                            icon="login"
                                            label="Scanned In"
                                            value={formatDateTime(requestData.scannedInAt)}
                                        />
                                    </>
                                )}
                            </View>

                            {/* Reason */}
                            {requestData.reason && (
                                <View style={styles.reasonCard}>
                                    <Text style={styles.reasonTitle}>Reason</Text>
                                    <Text style={styles.reasonText}>{requestData.reason}</Text>
                                </View>
                            )}

                            {/* ✅ Just Completed Celebration */}
                            {justCompleted && (
                                <View style={styles.celebrationBox}>
                                    <MaterialIcons name="celebration" size={20} color="#6366f1" />
                                    <Text style={styles.celebrationText}>
                                        Your gatepass journey is complete! You've safely returned to campus.
                                    </Text>
                                </View>
                            )}

                            {/* ✅ Completed Note */}
                            {isCompleted && !justCompleted && (
                                <View style={styles.completedNoteBox}>
                                    <MaterialIcons name="verified" size={18} color="#6366f1" />
                                    <Text style={styles.completedNoteText}>
                                        This gatepass has been successfully used for both exit and entry.
                                    </Text>
                                </View>
                            )}

                            {/* Active Note */}
                            {isActive && (
                                <View style={styles.noteBox}>
                                    <MaterialIcons name="info-outline" size={16} color="#8b8ba7" />
                                    <Text style={styles.noteText}>
                                        This pass updates automatically. Do not share a screenshot — the QR may be rescanned.
                                    </Text>
                                </View>
                            )}
                        </>
                    )}

                    {/* Error / Not Found */}
                    {!loading && !requestData && (
                        <View style={styles.centerBox}>
                            <View style={styles.errorIconWrap}>
                                <MaterialIcons name="error-outline" size={40} color="#dc2626" />
                            </View>
                            <Text style={styles.errorTitle}>Pass Not Found</Text>
                            <Text style={styles.errorSubtitle}>
                                The requested gatepass could not be loaded. Please try again.
                            </Text>
                        </View>
                    )}

                    {/* Page Footer */}
                    <View style={styles.pageFooter}>
                        <View style={styles.pageFooterLine} />
                        <Text style={styles.pageFooterText}>© 2026 @TechVortex</Text>
                    </View>
                </ScrollView>

                <Footer />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f5f3ff",
    },
    container: {
        flex: 1,
        backgroundColor: "#f5f3ff",
    },
    scroll: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 100,
    },

    /* ── Loading ── */
    centerBox: {
        alignItems: "center",
        paddingVertical: 80,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#8b8ba7",
        fontWeight: "500",
    },

    /* ── Status Banner ── */
    statusBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#dcfce7",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    statusBannerCompleted: {
        backgroundColor: "#eef2ff",
        borderColor: "#c7d2fe",
    },
    statusBannerExpired: {
        backgroundColor: "#f1f5f9",
        borderColor: "#e2e8f0",
    },
    statusBannerPending: {
        backgroundColor: "#fef9c3",
        borderColor: "#fef08a",
    },
    statusBannerRejected: {
        backgroundColor: "#fee2e2",
        borderColor: "#fecaca",
    },

    statusBannerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#16a34a",
        marginRight: 10,
    },
    statusBannerDotCompleted: { backgroundColor: "#6366f1" },
    statusBannerDotExpired: { backgroundColor: "#64748b" },
    statusBannerDotPending: { backgroundColor: "#ca8a04" },
    statusBannerDotRejected: { backgroundColor: "#dc2626" },
    statusBannerDotPulse: {
        // Additional styling if needed
    },

    statusBannerText: {
        fontSize: 11,
        fontWeight: "800",
        color: "#16a34a",
        letterSpacing: 0.8,
        flexShrink: 1,
    },
    statusBannerTextCompleted: { color: "#6366f1" },
    statusBannerTextExpired: { color: "#64748b" },
    statusBannerTextPending: { color: "#ca8a04" },
    statusBannerTextRejected: { color: "#dc2626" },

    /* ── Live Indicator ── */
    liveIndicator: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: "auto",
        paddingLeft: 10,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#16a34a",
        marginRight: 5,
    },
    liveText: {
        fontSize: 9,
        fontWeight: "800",
        color: "#16a34a",
        letterSpacing: 0.8,
    },

    /* ── Header ── */
    headerSection: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1e1b4b",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: "#8b8ba7",
        marginTop: 6,
        lineHeight: 20,
        fontWeight: "500",
    },

    /* ── Pass Card ── */
    passCard: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 16,
        shadowColor: "#7c3aed",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#ede9fe",
    },

    passCardAccent: {
        height: 5,
        backgroundColor: "#16a34a",
    },
    passCardAccentCompleted: { backgroundColor: "#6366f1" },
    passCardAccentExpired: { backgroundColor: "#64748b" },
    passCardAccentPending: { backgroundColor: "#ca8a04" },
    passCardAccentRejected: { backgroundColor: "#dc2626" },

    passCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 18,
    },
    passIdLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: "#a78bfa",
        letterSpacing: 1.2,
        marginBottom: 2,
    },
    passIdValue: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1e1b4b",
    },

    /* ── Status Badge ── */
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#dcfce7",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    statusBadgeCompleted: {
        backgroundColor: "#eef2ff",
        borderColor: "#c7d2fe",
    },
    statusBadgeExpired: {
        backgroundColor: "#f1f5f9",
        borderColor: "#e2e8f0",
    },
    statusBadgePending: {
        backgroundColor: "#fef9c3",
        borderColor: "#fef08a",
    },
    statusBadgeRejected: {
        backgroundColor: "#fee2e2",
        borderColor: "#fecaca",
    },

    statusBadgeText: {
        marginLeft: 5,
        fontSize: 12,
        fontWeight: "700",
        color: "#16a34a",
    },
    statusBadgeTextCompleted: { color: "#6366f1" },
    statusBadgeTextExpired: { color: "#64748b" },
    statusBadgeTextPending: { color: "#ca8a04" },
    statusBadgeTextRejected: { color: "#dc2626" },

    cardDivider: {
        height: 1,
        backgroundColor: "#f1f0fb",
        marginHorizontal: 20,
    },

    /* ── QR Code ── */
    qrWrap: {
        alignItems: "center",
        paddingVertical: 24,
    },
    qrContainer: {
        padding: 16,
        backgroundColor: "#faf9ff",
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#ede9fe",
        borderStyle: "dashed",
        position: "relative",
    },
    qrInnerWrap: {
        // Wrapper for opacity animation
    },
    qrHint: {
        marginTop: 12,
        fontSize: 12,
        color: "#a78bfa",
        fontWeight: "600",
        letterSpacing: 0.3,
    },

    /* ── Completed Overlay ── */
    completedOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 14,
    },
    completedOverlayIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#eef2ff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    completedOverlayTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#6366f1",
        letterSpacing: 1.5,
    },
    completedOverlaySub: {
        fontSize: 11,
        color: "#818cf8",
        fontWeight: "600",
        marginTop: 2,
    },
    completedOverlayTimes: {
        marginTop: 10,
        backgroundColor: "#f5f3ff",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    completedOverlayTimeText: {
        fontSize: 10,
        color: "#6366f1",
        fontWeight: "600",
    },

    /* ── Expired Overlay ── */
    expiredOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.93)",
        borderRadius: 14,
        gap: 6,
    },
    expiredOverlayTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#dc2626",
        letterSpacing: 1.5,
    },

    /* ── Pending Overlay ── */
    pendingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.93)",
        borderRadius: 14,
        gap: 6,
    },
    pendingOverlayTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#ca8a04",
        letterSpacing: 1.5,
    },

    /* ── Rejected Overlay ── */
    rejectedOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.93)",
        borderRadius: 14,
        gap: 6,
    },
    rejectedOverlayTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#dc2626",
        letterSpacing: 1.5,
    },

    /* ── Scan Tracker ── */
    scanTracker: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    scanTrackerHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    scanTrackerTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#a78bfa",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    scanTrackerLive: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0fdf4",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    scanTrackerLiveDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: "#16a34a",
        marginRight: 4,
    },
    scanTrackerLiveText: {
        fontSize: 9,
        fontWeight: "800",
        color: "#16a34a",
        letterSpacing: 0.5,
    },
    scanTrackerRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    scanTrackerLine: {
        flex: 1,
        height: 3,
        backgroundColor: "#e2e8f0",
        borderRadius: 2,
        marginHorizontal: 8,
        overflow: "hidden",
    },
    scanTrackerLineFill: {
        height: "100%",
        width: "0%",
        backgroundColor: "#16a34a",
        borderRadius: 2,
    },
    scanTrackerLineFillHalf: {
        width: "50%",
    },
    scanTrackerLineFillFull: {
        width: "100%",
    },
    scanBadge: {
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        minWidth: 90,
    },
    scanBadgeDone: {
        backgroundColor: "#f0fdf4",
        borderColor: "#bbf7d0",
    },
    scanBadgeContent: {
        alignItems: "center",
        marginTop: 4,
    },
    scanBadgeLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: "#94a3b8",
        letterSpacing: 0.5,
    },
    scanBadgeLabelDone: {
        color: "#16a34a",
    },
    scanBadgeTime: {
        fontSize: 11,
        fontWeight: "600",
        color: "#1e1b4b",
        marginTop: 2,
    },
    scanBadgeWaiting: {
        fontSize: 10,
        color: "#cbd5e1",
        fontWeight: "500",
        marginTop: 2,
    },

    /* ── Step Descriptions ── */
    scanStepDesc: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
        paddingHorizontal: 4,
    },
    scanStepText: {
        fontSize: 10,
        color: "#94a3b8",
        fontWeight: "500",
        flex: 1,
        textAlign: "center",
    },

    /* ── Info Grid ── */
    infoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        padding: 16,
        gap: 10,
    },
    infoTile: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        minWidth: "45%",
        backgroundColor: "#faf9ff",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#f1f0fb",
    },
    infoTileIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#ede9fe",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    infoTileContent: {
        flex: 1,
    },
    infoTileLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: "#a78bfa",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        marginBottom: 2,
    },
    infoTileValue: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1e1b4b",
    },

    /* ── Timing Card ── */
    timingCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#ede9fe",
        shadowColor: "#7c3aed",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    timingTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1e1b4b",
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 2,
    },
    metaLabel: {
        fontSize: 13,
        color: "#8b8ba7",
        fontWeight: "500",
        marginLeft: 10,
        width: 100,
    },
    metaValue: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1e1b4b",
        flex: 1,
    },
    timingDivider: {
        height: 1,
        backgroundColor: "#f5f3ff",
        marginVertical: 10,
    },

    /* ── Reason Card ── */
    reasonCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#ede9fe",
    },
    reasonTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1e1b4b",
        marginBottom: 8,
    },
    reasonText: {
        fontSize: 14,
        color: "#4b5563",
        lineHeight: 22,
    },

    /* ── Celebration Box ── */
    celebrationBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eef2ff",
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#c7d2fe",
        gap: 10,
    },
    celebrationText: {
        flex: 1,
        fontSize: 13,
        color: "#4338ca",
        fontWeight: "700",
        lineHeight: 20,
    },

    /* ── Completed Note ── */
    completedNoteBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eef2ff",
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#c7d2fe",
        gap: 10,
    },
    completedNoteText: {
        flex: 1,
        fontSize: 12,
        color: "#4338ca",
        fontWeight: "600",
        lineHeight: 18,
    },

    /* ── Note ── */
    noteBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fefce8",
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#fef08a",
        gap: 10,
    },
    noteText: {
        flex: 1,
        fontSize: 12,
        color: "#854d0e",
        fontWeight: "600",
        lineHeight: 18,
    },

    /* ── Error State ── */
    errorIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#fee2e2",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1e1b4b",
        marginBottom: 6,
    },
    errorSubtitle: {
        fontSize: 14,
        color: "#8b8ba7",
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 20,
    },

    /* ── Page Footer ── */
    pageFooter: {
        alignItems: "center",
        paddingTop: 16,
        paddingBottom: 10,
    },
    pageFooterLine: {
        width: 60,
        height: 3,
        borderRadius: 2,
        backgroundColor: "#e0dafb",
        marginBottom: 12,
    },
    pageFooterText: {
        fontSize: 11,
        color: "#b0adc4",
        fontWeight: "500",
    },
});