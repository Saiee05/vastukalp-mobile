import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { getNotificationsApi } from "../lib/api";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastShownId, setLastShownId] = useState<number | null>(null);

  const USER_ID = 1; // change if your admin id is different

  const fetchNotifications = async () => {
    try {
      const data = await getNotificationsApi(USER_ID);

      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);

        if (data.notifications.length > 0) {
          const latest = data.notifications[0];

          if (latest.log_id !== lastShownId) {
            Alert.alert("Notification", latest.message || "New update", [
              {
                text: "OK",
                onPress: () => setLastShownId(latest.log_id),
              },
            ]);
          }
        }
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not fetch notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [lastShownId]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>Live updates</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#5c3b2e"
          style={{ marginTop: 40 }}
        />
      ) : notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications</Text>
      ) : (
        notifications.map((n) => (
          <View key={String(n.log_id)} style={styles.card}>
            <Text style={styles.text}>{n.message}</Text>
            <Text style={styles.time}>{n.created_at}</Text>
          </View>
        ))
      )}
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#3e2c23",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#7a6254",
    marginBottom: 25,
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
  text: {
    fontSize: 15,
    color: "#3e2c23",
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: "#8a7467",
  },
  emptyText: {
    marginTop: 40,
    color: "#7a6254",
    fontSize: 15,
    textAlign: "center",
  },
});