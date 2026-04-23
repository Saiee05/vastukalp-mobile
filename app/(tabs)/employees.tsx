import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
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
    addProjectApi,
    deleteProjectApi,
    getClientsApi,
    getEmployeesApi,
    getProjectsApi,
    updateProjectApi,
} from "../lib/api";

export default function ProjectsScreen() {
  const router = useRouter();

  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [clientPickerVisible, setClientPickerVisible] = useState(false);
  const [employeePickerVisible, setEmployeePickerVisible] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [projectClient, setProjectClient] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [projectAmount, setProjectAmount] = useState("");
  const [assignedEmployee, setAssignedEmployee] = useState("");
  const [projectDeadline, setProjectDeadline] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await getProjectsApi();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not fetch projects from backend");
      setProjects([]);
    }
  };

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
      setClients([]);
    }
  };

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
      setEmployees([]);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchProjects(), fetchClients(), fetchEmployees()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openAddModal = async () => {
    await Promise.all([fetchClients(), fetchEmployees()]);

    setEditingId(null);
    setProjectName("");
    setProjectClient("");
    setProjectStatus("Not Started");
    setProjectAmount("");
    setAssignedEmployee("");
    setProjectDeadline("");
    setModalVisible(true);
  };

  const openEditModal = async (project: any) => {
    await Promise.all([fetchClients(), fetchEmployees()]);

    setEditingId(project.project_id);
    setProjectName(project.project_name);
    setProjectClient(project.client_name);
    setProjectStatus(project.status);
    setProjectAmount(String(project.total_amount));
    setAssignedEmployee(project.employee_name || "");
    setProjectDeadline(project.deadline || "");
    setModalVisible(true);
  };

  const saveProject = async () => {
    if (
      !projectName.trim() ||
      !projectClient.trim() ||
      !projectStatus.trim() ||
      !projectAmount.trim() ||
      !assignedEmployee.trim() ||
      !projectDeadline.trim()
    ) {
      Alert.alert("Error", "Fill all fields");
      return;
    }

    try {
      let response;

      if (editingId) {
        response = await updateProjectApi(editingId, {
          project_name: projectName,
          client_name: projectClient,
          status: projectStatus,
          total_amount: projectAmount,
          employee_name: assignedEmployee,
          deadline: projectDeadline,
        });
      } else {
        response = await addProjectApi({
          project_name: projectName,
          client_name: projectClient,
          status: projectStatus,
          total_amount: projectAmount,
          employee_name: assignedEmployee,
          deadline: projectDeadline,
        });
      }

      if (!response.success) {
        Alert.alert("Save failed", response.message || "Backend did not save project");
        return;
      }

      setModalVisible(false);
      setProjectName("");
      setProjectClient("");
      setProjectStatus("");
      setProjectAmount("");
      setAssignedEmployee("");
      setProjectDeadline("");
      setEditingId(null);

      await Promise.all([fetchProjects(), fetchClients(), fetchEmployees()]);
      Alert.alert("Success", response.message || "Project saved successfully");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not connect properly to backend");
    }
  };

  const deleteProject = async (id: number) => {
    Alert.alert("Delete Project", "Are you sure you want to delete this project?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await deleteProjectApi(id);
            if (!response.success) {
              Alert.alert("Delete failed", response.message || "Could not delete project");
              return;
            }
            await fetchProjects();
          } catch (err) {
            console.log(err);
            Alert.alert("Error", "Could not delete project");
          }
        },
      },
    ]);
  };

  const openWorkspace = (project: any) => {
    router.push({
      pathname: "/(tabs)/workspace",
      params: {
        name: project.project_name,
        client: project.client_name,
        status: project.status,
        amount: String(project.total_amount),
        assignedEmployee: project.employee_name,
      },
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Projects</Text>
            <Text style={styles.subtitle}>Manage all projects</Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#5c3b2e" style={{ marginTop: 40 }} />
        ) : projects.length === 0 ? (
          <Text style={styles.emptyText}>No real projects found in backend.</Text>
        ) : (
          projects.map((project) => (
            <View key={project.project_id} style={styles.card}>
              <Text style={styles.projectName}>{project.project_name}</Text>
              <Text style={styles.projectText}>Client: {project.client_name}</Text>
              <Text style={styles.projectText}>Assigned To: {project.employee_name}</Text>
              <Text style={styles.projectText}>Deadline: {formatDate(project.deadline)}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{project.status}</Text>
              </View>
              <Text style={styles.projectText}>Amount: ₹ {project.total_amount}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.workspaceButton]}
                  onPress={() => openWorkspace(project)}
                >
                  <Text style={styles.actionText}>Workspace</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => openEditModal(project)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteProject(project.project_id)}
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
              {editingId ? "Edit Project" : "Add Project"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Project Name"
              value={projectName}
              onChangeText={setProjectName}
            />

            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setClientPickerVisible(true)}
            >
              <Text style={projectClient ? styles.selectText : styles.placeholderText}>
                {projectClient || "Select Client"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setEmployeePickerVisible(true)}
            >
              <Text style={assignedEmployee ? styles.selectText : styles.placeholderText}>
                {assignedEmployee || "Select Employee"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={projectDeadline ? styles.selectText : styles.placeholderText}>
                {projectDeadline ? formatDate(projectDeadline) : "Select Deadline"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={projectDeadline ? new Date(projectDeadline) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const formatted = selectedDate.toISOString().split("T")[0];
                    setProjectDeadline(formatted);
                  }
                }}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Status"
              value={projectStatus}
              onChangeText={setProjectStatus}
            />

            <TextInput
              style={styles.input}
              placeholder="Total Amount"
              keyboardType="numeric"
              value={projectAmount}
              onChangeText={setProjectAmount}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveProject}>
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

      <Modal visible={clientPickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.listModalBox}>
            <Text style={styles.modalTitle}>Select Client</Text>

            <ScrollView>
              {clients.map((client) => (
                <TouchableOpacity
                  key={client.client_id}
                  style={styles.listItem}
                  onPress={() => {
                    setProjectClient(client.name);
                    setClientPickerVisible(false);
                  }}
                >
                  <Text style={styles.listItemText}>{client.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setClientPickerVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={employeePickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.listModalBox}>
            <Text style={styles.modalTitle}>Select Employee</Text>

            <ScrollView>
              {employees.map((employee) => (
                <TouchableOpacity
                  key={employee.user_id}
                  style={styles.listItem}
                  onPress={() => {
                    setAssignedEmployee(employee.name);
                    setEmployeePickerVisible(false);
                  }}
                >
                  <Text style={styles.listItemText}>{employee.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEmployeePickerVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
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
  projectName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3e2c23",
    marginBottom: 8,
  },
  projectText: {
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
  workspaceButton: {
    backgroundColor: "#5c3b2e",
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
  listModalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    maxHeight: "70%",
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
  selectInput: {
    backgroundColor: "#f7f1ea",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  selectText: {
    color: "#3e2c23",
    fontSize: 15,
  },
  placeholderText: {
    color: "#8a7467",
    fontSize: 15,
  },
  listItem: {
    backgroundColor: "#f7f1ea",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  listItemText: {
    color: "#3e2c23",
    fontSize: 15,
    fontWeight: "600",
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
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#efe3d3",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  statusText: {
    color: "#5c3b2e",
    fontWeight: "700",
    fontSize: 13,
  },
});