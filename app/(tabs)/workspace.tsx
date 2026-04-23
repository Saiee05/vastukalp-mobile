import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "https://vastukalp.onrender.com";

export default function WorkspaceScreen() {
  const router = useRouter();

  const {
    id,
    name,
    client,
    status,
    amount,
    assignedEmployee,
    deadline,
    pdf_file,
    cad_file,
  } = useLocalSearchParams();

  const totalAmount = Number(amount || 0);

  const formatDate = (dateString: any) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const openFile = async (filename: any) => {
    if (!filename) {
      Alert.alert("File not available");
      return;
    }

    const fileUrl = `${BASE_URL}/uploads/${filename}`;

    try {
      const supported = await Linking.canOpenURL(fileUrl);
      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        Alert.alert("Could not open file");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not open file");
    }
  };

  const hasPdf = !!pdf_file;
  const hasCad = !!cad_file;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{name || "Project Workspace"}</Text>
      <Text style={styles.subtitle}>Workspace</Text>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Project Name</Text>
        <Text style={styles.value}>{name || "-"}</Text>

        <Text style={styles.label}>Client</Text>
        <Text style={styles.value}>{client || "-"}</Text>

        <Text style={styles.label}>Assigned Employee</Text>
        <Text style={styles.value}>{assignedEmployee || "-"}</Text>

        <Text style={styles.label}>Deadline</Text>
        <Text style={styles.value}>{formatDate(deadline)}</Text>

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{status || "-"}</Text>
        </View>

        <Text style={styles.label}>Total Amount</Text>
        <Text style={styles.value}>₹ {totalAmount}</Text>
      </View>

      <View style={styles.grid}>
        {/* FINANCE */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/project-finance",
              params: {
                id: String(id || ""),
                name: String(name || ""),
                amount: String(totalAmount),
              },
            })
          }
        >
          <Text style={styles.cardTitle}>Project Finance</Text>
          <Text style={styles.cardHighlight}>View finance details</Text>
          <Text style={styles.cardDesc}>
            Update total amount and add payments.
          </Text>
        </TouchableOpacity>

        {/* FILES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Project Files</Text>

          <Text style={styles.cardHighlight}>
            PDF: {hasPdf ? "Available" : "Not uploaded"} | CAD:{" "}
            {hasCad ? "Available" : "Not uploaded"}
          </Text>

          <View style={styles.fileButtonsRow}>
            {hasPdf ? (
              <TouchableOpacity
                style={[styles.fileButton, styles.pdfButton]}
                onPress={() => openFile(pdf_file)}
              >
                <Text style={styles.fileButtonText}>Open PDF</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.fileButton, styles.disabledButton]}>
                <Text style={styles.disabledButtonText}>No PDF</Text>
              </View>
            )}

            {hasCad ? (
              <TouchableOpacity
                style={[styles.fileButton, styles.cadButton]}
                onPress={() => openFile(cad_file)}
              >
                <Text style={styles.fileButtonText}>Open CAD</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.fileButton, styles.disabledButton]}>
                <Text style={styles.disabledButtonText}>No CAD</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f1ea",
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#3e2c23",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#7a6254",
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: "#8a7467",
    marginTop: 10,
    marginBottom: 4,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    color: "#3e2c23",
    fontWeight: "700",
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#efe3d3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    color: "#5c3b2e",
    fontWeight: "700",
    fontSize: 13,
  },
  grid: {
    gap: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    minHeight: 130,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3e2c23",
  },
  cardHighlight: {
    fontSize: 13,
    color: "#5c3b2e",
    fontWeight: "700",
    marginTop: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: "#7a6254",
    marginTop: 4,
  },
  fileButtonsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  fileButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  pdfButton: {
    backgroundColor: "#6b4f43",
  },
  cadButton: {
    backgroundColor: "#7d5a50",
  },
  fileButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  disabledButton: {
    backgroundColor: "#e8ddd3",
  },
  disabledButtonText: {
    color: "#8a7467",
    fontWeight: "600",
    fontSize: 13,
  },
  backButton: {
    backgroundColor: "#5c3b2e",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});