import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/FooterStudent";
import QRCode from "react-native-qrcode-svg";
import React, { useEffect, useState } from "react";
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

function formatTime(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

// ✅ Safe client-side expiry check as fallback
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
                    {value}
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

export default function RequestSuccess() {
    const [requestData, setRequestData] = useState(null);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    const route = useRoute();
    const { requestId } = route.params;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(
                    `${EXPO_PUBLIC_API_URL}/gatepass/${requestId}`
                );

                if (!res.ok) {
                    const text = await res.text();
                    console.log("SERVER ERROR:", text);
                    return;
                }

                const data = await res.json();

                if (data.success) {
                    setRequestData(data.request);
                    setStudent(data.request.student);
                }
            } catch (err) {
                console.log("ERROR:", err);
            } finally {
                setLoading(false);
            }
        };

        if (requestId) {
            fetchData();
        }
    }, [requestId]);

    // ✅ Use backend isExpired first, fallback to client-side check
    const isExpired =
        requestData?.isExpired === true ||
        (requestData?.isExpired !== false &&
            clientSideExpired(requestData?.validUntil));

    const isActive = !isExpired && requestData?.status === "approved";
    const isPending = requestData?.status === "pending";
    const isRejected = requestData?.status === "rejected";

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Navbar />

                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Loading State */}
                    {loading && (
                        <View style={styles.centerBox}>
                            <ActivityIndicator
                                size="large"
                                color="#7c3aed"
                            />
                            <Text style={styles.loadingText}>
                                Loading pass details...
                            </Text>
                        </View>
                    )}

                    {/* Main Content */}
                    {!loading && requestData && student && (
                        <>
                            {/* ✅ Status Banner — changes color per state */}
                            <View
                                style={[
                                    styles.statusBanner,
                                    isExpired && styles.statusBannerExpired,
                                    isPending && styles.statusBannerPending,
                                    isRejected && styles.statusBannerRejected,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.statusBannerDot,
                                        isExpired &&
                                            styles.statusBannerDotExpired,
                                        isPending &&
                                            styles.statusBannerDotPending,
                                        isRejected &&
                                            styles.statusBannerDotRejected,
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.statusBannerText,
                                        isExpired &&
                                            styles.statusBannerTextExpired,
                                        isPending &&
                                            styles.statusBannerTextPending,
                                        isRejected &&
                                            styles.statusBannerTextRejected,
                                    ]}
                                >
                                    {isExpired
                                        ? "PASS EXPIRED"
                                        : isPending
                                        ? "AWAITING APPROVAL"
                                        : isRejected
                                        ? "PASS REJECTED"
                                        : "PASS IS ACTIVE"}
                                </Text>
                            </View>

                            {/* Header */}
                            <View style={styles.headerSection}>
                                <Text style={styles.title}>Gate Access Pass</Text>
                                <Text style={styles.subtitle}>
                                    {isActive
                                        ? "Present this QR code at the security terminal for scanning."
                                        : isExpired
                                        ? "This pass has passed its validity window."
                                        : isPending
                                        ? "Your request is being reviewed by the administration."
                                        : "This gatepass request was not approved."}
                                </Text>
                            </View>

                            {/* Pass Card */}
                            <View style={styles.passCard}>
                                {/* Card Top Accent — color per state */}
                                <View
                                    style={[
                                        styles.passCardAccent,
                                        isExpired &&
                                            styles.passCardAccentExpired,
                                        isPending &&
                                            styles.passCardAccentPending,
                                        isRejected &&
                                            styles.passCardAccentRejected,
                                    ]}
                                />

                                {/* Card Header */}
                                <View style={styles.passCardHeader}>
                                    <View>
                                        <Text style={styles.passIdLabel}>
                                            PASS ID
                                        </Text>
                                        <Text style={styles.passIdValue}>
                                            #
                                            {requestData._id
                                                .slice(-6)
                                                .toUpperCase()}
                                        </Text>
                                    </View>

                                    {/* ✅ Status Badge — color per state */}
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            isExpired &&
                                                styles.statusBadgeExpired,
                                            isPending &&
                                                styles.statusBadgePending,
                                            isRejected &&
                                                styles.statusBadgeRejected,
                                        ]}
                                    >
                                        <MaterialIcons
                                            name={
                                                isExpired
                                                    ? "cancel"
                                                    : isPending
                                                    ? "hourglass-top"
                                                    : isRejected
                                                    ? "highlight-off"
                                                    : "check-circle"
                                            }
                                            size={14}
                                            color={
                                                isExpired
                                                    ? "#64748b"
                                                    : isPending
                                                    ? "#ca8a04"
                                                    : isRejected
                                                    ? "#dc2626"
                                                    : "#16a34a"
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.statusBadgeText,
                                                isExpired &&
                                                    styles.statusBadgeTextExpired,
                                                isPending &&
                                                    styles.statusBadgeTextPending,
                                                isRejected &&
                                                    styles.statusBadgeTextRejected,
                                            ]}
                                        >
                                            {isExpired
                                                ? "Expired"
                                                : isPending
                                                ? "Pending"
                                                : isRejected
                                                ? "Rejected"
                                                : "Active"}
                                        </Text>
                                    </View>
                                </View>

                                {/* Divider */}
                                <View style={styles.cardDivider} />

                                {/* QR Code */}
                                <View style={styles.qrWrap}>
                                    <View style={styles.qrContainer}>
                                        <View
                                            style={{
                                                opacity: isExpired ? 0.25 : 1,
                                            }}
                                        >
                                            <QRCode
                                                value={requestData.qrData}
                                                size={190}
                                                color="#1e1b4b"
                                                backgroundColor="#ffffff"
                                            />
                                        </View>

                                        {isExpired && (
                                            <View
                                                style={styles.expiredOverlay}
                                            >
                                                <Text
                                                    style={styles.expiredText}
                                                >
                                                    EXPIRED
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.qrHint}>
                                        {isExpired
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

                                {/* Student Info Grid */}
                                <View style={styles.infoGrid}>
                                    <InfoTile
                                        icon="person"
                                        label="Name"
                                        value={student.fullName}
                                    />
                                    <InfoTile
                                        icon="badge"
                                        label="Regd No"
                                        value={student.regNo}
                                    />
                                    <InfoTile
                                        icon="school"
                                        label="Course"
                                        value={student.course}
                                    />
                                    <InfoTile
                                        icon="engineering"
                                        label="Branch"
                                        value={student.branch}
                                    />
                                    <InfoTile
                                        icon="location-on"
                                        label="Destination"
                                        value={requestData.destination}
                                    />
                                    <InfoTile
                                        icon="flag"
                                        label="Purpose"
                                        value={
                                            requestData.purpose || "General"
                                        }
                                    />
                                </View>
                            </View>

                            {/* Timing Details */}
                            <View style={styles.timingCard}>
                                <Text style={styles.timingTitle}>
                                    Schedule Details
                                </Text>

                                <MetaRow
                                    icon="schedule"
                                    label="Out Time"
                                    value={formatDateTime(requestData.outTime)}
                                />
                                <View style={styles.timingDivider} />
                                <MetaRow
                                    icon="event"
                                    label="Return Time"
                                    value={formatDateTime(
                                        requestData.returnTime
                                    )}
                                />
                                <View style={styles.timingDivider} />
                                <MetaRow
                                    icon="history"
                                    label="Requested On"
                                    value={formatDateTime(
                                        requestData.createdAt
                                    )}
                                />
                                <View style={styles.timingDivider} />
                                <MetaRow
                                    icon="timer"
                                    label="Valid Until"
                                    value={formatDateTime(
                                        requestData.validUntil
                                    )}
                                />
                            </View>

                            {/* Reason (if exists) */}
                            {requestData.reason && (
                                <View style={styles.reasonCard}>
                                    <Text style={styles.reasonTitle}>
                                        Reason
                                    </Text>
                                    <Text style={styles.reasonText}>
                                        {requestData.reason}
                                    </Text>
                                </View>
                            )}

                            {/* Footer Note */}
                            {isActive && (
                                <View style={styles.noteBox}>
                                    <MaterialIcons
                                        name="info-outline"
                                        size={16}
                                        color="#8b8ba7"
                                    />
                                    <Text style={styles.noteText}>
                                        This pass is digitally verified. Do not
                                        share a screenshot.
                                    </Text>
                                </View>
                            )}
                        </>
                    )}

                    {/* Error / Not Found */}
                    {!loading && !requestData && (
                        <View style={styles.centerBox}>
                            <View style={styles.errorIconWrap}>
                                <MaterialIcons
                                    name="error-outline"
                                    size={40}
                                    color="#dc2626"
                                />
                            </View>
                            <Text style={styles.errorTitle}>Pass Not Found</Text>
                            <Text style={styles.errorSubtitle}>
                                The requested gatepass could not be loaded.
                                Please try again.
                            </Text>
                        </View>
                    )}

                    {/* Page Footer */}
                    <View style={styles.pageFooter}>
                        <View style={styles.pageFooterLine} />
                        <Text style={styles.pageFooterText}>
                            © 2026 @TechVortex
                        </Text>
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
        paddingTop: 24,
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
    statusBannerDotExpired: { backgroundColor: "#64748b" },
    statusBannerDotPending: { backgroundColor: "#ca8a04" },
    statusBannerDotRejected: { backgroundColor: "#dc2626" },

    statusBannerText: {
        fontSize: 11,
        fontWeight: "800",
        color: "#16a34a",
        letterSpacing: 0.8,
    },
    statusBannerTextExpired: { color: "#64748b" },
    statusBannerTextPending: { color: "#ca8a04" },
    statusBannerTextRejected: { color: "#dc2626" },

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
    qrHint: {
        marginTop: 12,
        fontSize: 12,
        color: "#a78bfa",
        fontWeight: "600",
        letterSpacing: 0.3,
    },
    expiredOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    expiredText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#dc2626",
        backgroundColor: "#fff",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
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