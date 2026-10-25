import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { authGet, authPut } from "../../utils/api";

import Navbar from "../components/Navbar";
import FooterAdmin from "../components/FooterAdmin";

export default function RequestDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const fetchDetails = async () => {
    try {
      const data = await authGet(`/admin/student/${id}`);
      if (data.success) {
        setStudent(data.student);
      }
    } catch (err) {
      console.log("fetchDetails error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  // ✅ Approve
  const handleApprove = () => {
    Alert.alert(
      "Approve Student",
      `Are you sure you want to approve ${student.fullName}? An email will be sent to the student.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            setActing(true);
            try {
              const data = await authPut(`/admin/approve/${student._id}`);
              if (data.success) {
                Alert.alert("Approved", data.message || "Student approved & email sent.", [
                  { text: "OK", onPress: () => navigation.goBack() },
                ]);
              } else {
                Alert.alert("Error", data.message || "Failed to approve");
              }
            } catch (err) {
              Alert.alert("Error", "Network error");
            } finally {
              setActing(false);
            }
          },
        },
      ]
    );
  };

  // ✅ Reject
  const handleReject = () => {
    Alert.alert(
      "Reject Student",
      `Are you sure you want to reject ${student.fullName}? An email will be sent to the student.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setActing(true);
            try {
              const data = await authPut(`/admin/reject/${student._id}`);
              if (data.success) {
                Alert.alert("Rejected", data.message || "Student rejected & email sent.", [
                  { text: "OK", onPress: () => navigation.goBack() },
                ]);
              } else {
                Alert.alert("Error", data.message || "Failed to reject");
              }
            } catch (err) {
              Alert.alert("Error", "Network error");
            } finally {
              setActing(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#003080" />
        <Navbar />
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#0040a1" />
        </View>
        <FooterAdmin />
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#003080" />
        <Navbar />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <MaterialIcons name="error-outline" size={60} color="#ccc" />
          <Text style={{ fontSize: 16, color: "#777", marginTop: 12 }}>
            Student not found.
          </Text>
          <TouchableOpacity
            style={[styles.backBtn, { marginTop: 16 }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={20} color="#1a237e" />
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
        <FooterAdmin />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#003080" />
      <Navbar />

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={20} color="#1a237e" />
          <Text style={styles.backBtnText}>Back to Requests</Text>
        </TouchableOpacity>

        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {student.fullName?.charAt(0)?.toUpperCase() || "S"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.studentName}>{student.fullName}</Text>
            <Text style={styles.studentReg}>{student.regNo}</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    student.status === "approved"
                      ? "#e8f5e9"
                      : student.status === "rejected"
                      ? "#ffebee"
                      : "#fff3e0",
                },
              ]}
            >
              <Text
                style={{
                  color:
                    student.status === "approved"
                      ? "#2e7d32"
                      : student.status === "rejected"
                      ? "#c62828"
                      : "#ef6c00",
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                {student.status?.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.card}>
          <DetailRow icon="person" label="Full Name" value={student.fullName} />
          <DetailRow icon="badge" label="Registration No" value={student.regNo} />
          <DetailRow icon="email" label="Email" value={student.email} />
          <DetailRow icon="phone" label="Phone" value={student.phone || "—"} />
          <DetailRow icon="school" label="Course" value={student.course || "—"} />
          <DetailRow icon="category" label="Branch" value={student.branch || "—"} />
          {student.year && <DetailRow icon="event" label="Year" value={student.year} />}
          {student.semester && (
            <DetailRow icon="menu-book" label="Semester" value={student.semester} />
          )}
          {student.fatherName && (
            <DetailRow icon="family-restroom" label="Father's Name" value={student.fatherName} />
          )}
          {student.motherName && (
            <DetailRow icon="family-restroom" label="Mother's Name" value={student.motherName} />
          )}
          {student.address && (
            <DetailRow icon="home" label="Address" value={student.address} />
          )}
        </View>

        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.card}>
          <DetailRow icon="verified-user" label="Status" value={student.status} />
          <DetailRow
            icon="date-range"
            label="Registered On"
            value={fmtDate(student.createdAt)}
          />
          <DetailRow
            icon="update"
            label="Last Updated"
            value={fmtDate(student.updatedAt)}
          />
        </View>

        {/* ✅ Approve / Reject Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.approveBtn, acting && { opacity: 0.6 }]}
            onPress={handleApprove}
            disabled={acting}
          >
            {acting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rejectBtn, acting && { opacity: 0.6 }]}
            onPress={handleReject}
            disabled={acting}
          >
            {acting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="cancel" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Reject</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <FooterAdmin />
    </View>
  );
}

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIconWrap}>
      <MaterialIcons name={icon} size={18} color="#1a237e" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "—"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  content: { padding: 16, paddingBottom: 100 },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 12,
    gap: 4,
  },
  backBtnText: { color: "#1a237e", fontWeight: "600", fontSize: 14, marginLeft: 4 },

  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    elevation: 3,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0040a1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  studentName: { fontSize: 20, fontWeight: "bold", color: "#1a237e" },
  studentReg: { fontSize: 13, color: "#78909c", marginTop: 2 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1a237e",
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  detailLabel: { fontSize: 11, color: "#90a4ae", textTransform: "uppercase" },
  detailValue: { fontSize: 14, color: "#263238", marginTop: 2 },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});