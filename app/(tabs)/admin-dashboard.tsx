import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vastukalp</Text>
      <Text style={styles.subtitle}>Admin Dashboard</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(tabs)/projects")}
        >
          <Text style={styles.cardText}>Projects</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(tabs)/clients")}
        >
          <Text style={styles.cardText}>Clients</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(tabs)/employees")}
        >
          <Text style={styles.cardText}>Employees</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(tabs)/project-finance")}
        >
          <Text style={styles.cardText}>Finance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(tabs)/notifications")}
        >
          <Text style={styles.cardText}>Notifications</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f1ea",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    color: "#3e2c23",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#7a6254",
    marginBottom: 30,
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#5c3b2e",
    width: "48%",
    paddingVertical: 25,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});