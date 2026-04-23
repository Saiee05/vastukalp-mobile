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
    addEmployeeApi,
    deleteEmployeeApi,
    getEmployeesApi,
    updateEmployeeApi,
} from "../lib/api";

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeeContact, setEmployeeContact] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");

  const fetchEmployees = async () => {
    try {
      const data = await getEmployeesApi();

      if (data.success && Array.isArray(data.employees)) {
        setEmployees(data.employees);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not fetch employees from backend");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setEmployeeName("");
    setEmployeeEmail("");
    setEmployeeContact("");
    setEmployeePassword("");
    setModalVisible(true);
  };

  const openEditModal = (employee: any) => {
    setEditingId(employee.user_id);
    setEmployeeName(employee.name || "");
    setEmployeeEmail(employee.email || "");
    setEmployeeContact(employee.contact || "");
    setEmployeePassword("");
    setModalVisible(true);
  };

  const saveEmployee = async () => {
    if (!employeeName.trim() || !employeeEmail.trim() || !employeeContact.trim()) {
      Alert.alert("Error", "Fill all required fields");
      return;
    }

    if (!editingId && !employeePassword.trim()) {
      Alert.alert("Error", "Password is required for new employee");
      return;
    }

    try {
      let response;

      if (editingId) {
        response = await updateEmployeeApi(editingId, {
          name: employeeName,
          email: employeeEmail,
          contact: employeeContact,
        });
      } else {
        response = await addEmployeeApi({
          name: employeeName,
          email: employeeEmail,
          contact: employeeContact,
          password: employeePassword,
        });
      }

      if (!response.success) {
        Alert.alert("Error", response.message || "Could not save employee");
        return;
      }

      setModalVisible(false);
      setEditingId(null);
      setEmployeeName("");
      setEmployeeEmail("");
      setEmployeeContact("");
      setEmployeePassword("");

      await fetchEmployees();
      Alert.alert("Success", editingId ? "Employee updated" : "Employee added");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not save employee");
    }
  };

  const handleDeleteEmployee = (id: number) => {
    Alert.alert("Delete Employee", "Are you sure you want to delete this employee?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await deleteEmployeeApi(id);
            if (!response.success) {
              Alert.alert("Error", response.message || "Could not delete employee");
              return;
            }
            await fetchEmployees();
            Alert.alert("Deleted", "Employee deleted successfully");
          } catch (err) {
            console.log(err);
            Alert.alert("Error", "Could not delete employee");
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
            <Text style={styles.title}>Employees</Text>
            <Text style={styles.subtitle}>Manage all employees</Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#5c3b2e" style={{ marginTop: 40 }} />
        ) : employees.length === 0 ? (
          <Text style={styles.emptyText}>No employees found.</Text>
        ) : (
          employees.map((employee) => (
            <View key={employee.user_id} style={styles.card}>
              <Text style={styles.employeeName}>{employee.name}</Text>
              <Text style={styles.employeeText}>ID: {employee.user_id}</Text>
              <Text style={styles.employeeText}>Email: {employee.email || "-"}</Text>
              <Text style={styles.employeeText}>Contact: {employee.contact || "-"}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => openEditModal(employee)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteEmployee(employee.user_id)}
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
              {editingId ? "Edit Employee" : "Add Employee"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Employee Name"
              value={employeeName}
              onChangeText={setEmployeeName}
            />

            <TextInput
              style={styles.input}
              placeholder="Employee Email"
              value={employeeEmail}
              onChangeText={setEmployeeEmail}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Employee Contact"
              value={employeeContact}
              onChangeText={setEmployeeContact}
              keyboardType="phone-pad"
            />

            {!editingId && (
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={employeePassword}
                onChangeText={setEmployeePassword}
                secureTextEntry
              />
            )}

            <TouchableOpacity style={styles.saveButton} onPress={saveEmployee}>
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
  employeeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3e2c23",
    marginBottom: 8,
  },
  employeeText: {
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