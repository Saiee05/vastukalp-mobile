import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    addClientApi,
    deleteClientApi,
    getClientsApi,
    updateClientApi,
} from "../lib/api";

export default function ClientsScreen() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientContact, setClientContact] = useState("");

  const fetchClients = async () => {
    try {
      const data = await getClientsApi();

      if (data.success && Array.isArray(data.clients)) {
        setClients(data.clients);
      } else {
        setClients([]);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not fetch clients from backend");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setClientName("");
    setClientEmail("");
    setClientContact("");
    setModalVisible(true);
  };

  const openEditModal = (client: any) => {
    setEditingId(client.client_id);
    setClientName(client.name);
    setClientEmail(client.email || "");
    setClientContact(client.contact || "");
    setModalVisible(true);
  };

  const saveClient = async () => {
    if (!clientName.trim() || !clientEmail.trim() || !clientContact.trim()) {
      Alert.alert("Error", "Fill all fields");
      return;
    }

    try {
      let response;

      if (editingId) {
        response = await updateClientApi(editingId, {
          name: clientName,
          email: clientEmail,
          contact: clientContact,
        });
      } else {
        response = await addClientApi({
          name: clientName,
          email: clientEmail,
          contact: clientContact,
        });
      }

      if (!response.success) {
        Alert.alert("Save failed", response.message || "Could not save client");
        return;
      }

      setModalVisible(false);
      setClientName("");
      setClientEmail("");
      setClientContact("");
      setEditingId(null);

      await fetchClients();
      Alert.alert("Success", response.message || "Client saved successfully");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not connect properly to backend");
    }
  };

  const deleteClient = async (id: number) => {
    Alert.alert("Delete Client", "Are you sure you want to delete this client?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await deleteClientApi(id);
            if (!response.success) {
              Alert.alert("Delete failed", response.message || "Could not delete client");
              return;
            }
            await fetchClients();
          } catch (err) {
            console.log(err);
            Alert.alert("Error", "Could not delete client");
          }
        },
      },
    ]);
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Clients</Text>
            <Text style={styles.subtitle}>Connected with web app clients</Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#5c3b2e" style={{ marginTop: 40 }} />
        ) : clients.length === 0 ? (
          <Text style={styles.emptyText}>No clients found.</Text>
        ) : (
          clients.map((client) => (
            <View key={client.client_id} style={styles.card}>
              <Text style={styles.clientName}>{client.name}</Text>
              <Text style={styles.clientText}>Email: {client.email || "-"}</Text>
              <Text style={styles.clientText}>Contact: {client.contact || "-"}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => openEditModal(client)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteClient(client.client_id)}
                >
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Client" : "Add Client"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Client Name"
              value={clientName}
              onChangeText={setClientName}
            />

            <TextInput
              style={styles.input}
              placeholder="Client Email"
              value={clientEmail}
              onChangeText={setClientEmail}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Client Contact"
              value={clientContact}
              onChangeText={setClientContact}
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveClient}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#3e2c23",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#7a6254",
  },
  addButton: {
    backgroundColor: "#5c3b2e",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3e2c23",
    marginBottom: 8,
  },
  clientText: {
    fontSize: 14,
    color: "#6f5b4f",
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#8b6b5c",
  },
  deleteButton: {
    backgroundColor: "#a94442",
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  emptyText: {
    marginTop: 40,
    color: "#7a6254",
    fontSize: 15,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3e2c23",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#f7f1ea",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: "#5c3b2e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  cancelButton: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: "#7a6254",
    fontSize: 15,
    fontWeight: "600",
  },
});