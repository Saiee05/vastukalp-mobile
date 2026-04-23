import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  addProjectPaymentApi,
  getProjectFinanceApi,
  updateProjectFinanceApi,
} from "../lib/api";

export default function ProjectFinanceScreen() {
  const router = useRouter();
  const { id, name, amount } = useLocalSearchParams();

  const projectId = Number(id || 0);

  const [totalAmount, setTotalAmount] = useState(String(amount || "0"));
  const [receivedAmount, setReceivedAmount] = useState("0");
  const [newPayment, setNewPayment] = useState("");
  const [financeNotes, setFinanceNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const balance = (
    parseFloat(totalAmount || "0") - parseFloat(receivedAmount || "0")
  ).toFixed(2);

  const fetchFinance = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const data = await getProjectFinanceApi(projectId);

      if (data.success && data.finance) {
        setTotalAmount(String(data.finance.total_amount || "0"));
        setReceivedAmount(String(data.finance.received_amount || "0"));
        setFinanceNotes(data.finance.finance_notes || "");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not fetch finance details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, [projectId]);

  const updateTotalAmount = async () => {
    if (!totalAmount.trim()) {
      Alert.alert("Error", "Enter valid amount");
      return;
    }

    try {
      const response = await updateProjectFinanceApi(projectId, {
        total_amount: totalAmount,
        finance_notes: financeNotes,
      });

      if (!response.success) {
        Alert.alert("Error", response.message || "Could not update finance");
        return;
      }

      await fetchFinance();
      Alert.alert("Updated", "Total amount updated successfully");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not update finance");
    }
  };

  const addReceivedAmount = async () => {
    if (!newPayment.trim()) {
      Alert.alert("Missing amount", "Please enter payment amount");
      return;
    }

    try {
      const response = await addProjectPaymentApi(projectId, {
        amount: newPayment,
        remark: financeNotes,
      });

      if (!response.success) {
        Alert.alert("Error", response.message || "Could not add payment");
        return;
      }

      setNewPayment("");
      await fetchFinance();
      Alert.alert("Added", "Payment added successfully");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not add payment");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{name || "Project"}</Text>
      <Text style={styles.subtitle}>Project Finance</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={styles.summaryValue}>₹ {totalAmount}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Received</Text>
          <Text style={styles.summaryValue}>₹ {receivedAmount}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={[styles.summaryValue, { color: "#a94442" }]}>
            ₹ {balance}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Notes</Text>
          <Text style={styles.summaryValueSmall}>
            {financeNotes || "No notes yet"}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Total Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter total amount"
          keyboardType="numeric"
          value={totalAmount}
          onChangeText={setTotalAmount}
        />
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Finance notes"
          multiline
          value={financeNotes}
          onChangeText={setFinanceNotes}
        />
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={updateTotalAmount}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Update Total Amount</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Payment</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter payment amount"
          keyboardType="numeric"
          value={newPayment}
          onChangeText={setNewPayment}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={addReceivedAmount}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Save Payment</Text>
        </TouchableOpacity>
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
    marginBottom: 22,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#8a7467",
    marginBottom: 8,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 20,
    color: "#3e2c23",
    fontWeight: "700",
  },
  summaryValueSmall: {
    fontSize: 14,
    color: "#3e2c23",
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3e2c23",
    marginBottom: 14,
  },
  input: {
    backgroundColor: "#f7f1ea",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#5c3b2e",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#8b6b5c",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 18,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});