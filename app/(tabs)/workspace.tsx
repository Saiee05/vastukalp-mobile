import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  BASE_URL,
  deleteProjectFileApi,
  getProjectFilesApi,
} from "../lib/api";

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
  } = useLocalSearchParams();

  const projectId = Number(id || 0);
  const totalAmount = Number(amount || 0);

  const [files, setFiles] = useState<any[]>([]);

  const fetchFiles = async () => {
    if (!projectId) return;

    try {
      const data = await getProjectFilesApi(projectId);
      if (data.success && Array.isArray(data.files)) {
        setFiles(data.files);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.log(err);
      setFiles([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFiles();
    }, [projectId])
  );

  const formatDate = (dateString: any) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const openFile = async (filename: string) => {
    if (!filename) {
      Alert.alert("File not available");
      return;
    }

    const fileUrl = filename.startsWith("http")
      ? filename
      : filename.startsWith("uploads/")
      ? `${BASE_URL}/${filename}`
      : `${BASE_URL}/uploads/${filename}`;

    try {
      await Linking.openURL(fileUrl);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not open file");
    }
  };

  const deleteFile = (fileId: number) => {
    Alert.alert("Delete File", "Are you sure you want to delete this file?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await deleteProjectFileApi(fileId, projectId);

            if (!response.success) {
              Alert.alert("Error", response.message || "Could not delete file");
              return;
            }

            await fetchFiles();
          } catch (err) {
            console.log(err);
            Alert.alert("Error", "Could not delete file");
          }
        },
      },
    ]);
  };

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

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Project Finance</Text>
        <Text style={styles.cardHighlight}>View finance details</Text>
        <Text style={styles.cardDesc}>Update total amount and add payments.</Text>

        <TouchableOpacity
          style={styles.financeButton}
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
          <Text style={styles.financeButtonText}>Open Finance</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Project Files</Text>
        <Text style={styles.cardDesc}>
          All uploaded PDF and CAD files for this project.
        </Text>

        {files.length === 0 ? (
          <Text style={styles.emptyText}>No files uploaded yet.</Text>
        ) : (
          files.map((file) => (
            <View key={file.file_id} style={styles.fileCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fileName}>
                  {file.file_type} File
                </Text>
                <Text style={styles.fileSub}>{file.file_name}</Text>
                <Text style={styles.fileDate}>
                  Uploaded: {formatDate(file.uploaded_at)}
                </Text>
              </View>

              <View style={styles.fileActions}>
                <TouchableOpacity
                  style={[styles.smallButton, styles.openButton]}
                  onPress={() => openFile(file.file_name)}
                >
                  <Text style={styles.smallButtonText}>Open</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallButton, styles.deleteButton]}
                  onPress={() => deleteFile(file.file_id)}
                >
                  <Text style={styles.smallButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
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
  financeButton: {
    backgroundColor: "#5c3b2e",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
  },
  financeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  fileCard: {
    backgroundColor: "#f7f1ea",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#3e2c23",
  },
  fileSub: {
    fontSize: 13,
    color: "#6f5b4f",
    marginTop: 4,
  },
  fileDate: {
    fontSize: 12,
    color: "#8a7467",
    marginTop: 4,
  },
  fileActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  smallButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  openButton: {
    backgroundColor: "#6b4f43",
  },
  deleteButton: {
    backgroundColor: "#a94442",
  },
  smallButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyText: {
    color: "#7a6254",
    marginTop: 14,
    fontSize: 14,
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