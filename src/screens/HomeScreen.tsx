// src/screens/HomeScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../store"; // Import RootState for typing useSelector
import { StackNavigationProp } from "@react-navigation/stack"; // Import navigation types
import { MainTabParamList } from "../navigation/AppNavigator"; // Import Param lists

// Define navigation prop type for this screen
type HomeScreenNavigationProp = StackNavigationProp<MainTabParamList, "Home">;

// Define props for the HomeScreen component
interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

// Define types for mock data (replace with actual types from store/services later)
interface VehicleInfo {
  name: string;
  status: string;
  lastCheck: string;
  fuelLevel: number;
  batteryHealth: number;
  engineStatus: string;
}

interface RecentTrip {
  id: number;
  date: string;
  from: string;
  to: string;
  distance: string;
  duration: string;
}

interface Alert {
  id: number;
  type: "warning" | "error" | "info";
  message: string;
  time: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // Get user data from Redux store (example)
  const user = useSelector((state: RootState) => state.auth.user);
  const userProfile = useSelector((state: RootState) => state.auth.profile);

  // TODO: Replace mock data with data fetched from Redux store or services
  const vehicleInfo: VehicleInfo = {
    name: "My Toyota Camry", // Should come from selected vehicle in state
    status: "Good",
    lastCheck: "2 hours ago",
    fuelLevel: 75,
    batteryHealth: 90,
    engineStatus: "Normal",
  };

  const recentTrips: RecentTrip[] = [
    {
      id: 1,
      date: "Today",
      from: "Home",
      to: "Office",
      distance: "12.5 km",
      duration: "25 min",
    },
    {
      id: 2,
      date: "Yesterday",
      from: "Office",
      to: "Home",
      distance: "13.2 km",
      duration: "30 min",
    },
  ];

  const alerts: Alert[] = [
    {
      id: 1,
      type: "warning",
      message: "Oil change due in 500 km",
      time: "2 days ago",
    },
  ];

  // Navigation handlers
  const navigateToDiagnostics = () => {
    navigation.navigate("Diagnostics");
  };

  const navigateToMechanic = () => {
    navigation.navigate("Mechanic");
  };

  const navigateToTrips = () => {
    navigation.navigate("Trips");
  };

  // Placeholder for document navigation
  const navigateToDocuments = () => {
    // navigation.navigate("Documents"); // Assuming a Documents screen exists
    console.log("Navigate to Documents (Not Implemented)");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning</Text>
        <Text style={styles.username}>{userProfile?.name || user?.email || "User"}</Text>
      </View>

      {/* Vehicle Status Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{vehicleInfo.name}</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.vehicleStatusContainer}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={[styles.statusValue, { color: "#4CAF50" }]}>
              {vehicleInfo.status}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Last Check</Text>
            <Text style={styles.statusValue}>{vehicleInfo.lastCheck}</Text>
          </View>
        </View>

        <View style={styles.gaugesContainer}>
          <View style={styles.gauge}>
            <View style={styles.gaugeInner}>
              <Text style={styles.gaugeValue}>{vehicleInfo.fuelLevel}%</Text>
            </View>
            <Text style={styles.gaugeLabel}>Fuel</Text>
          </View>
          <View style={styles.gauge}>
            <View style={styles.gaugeInner}>
              <Text style={styles.gaugeValue}>{vehicleInfo.batteryHealth}%</Text>
            </View>
            <Text style={styles.gaugeLabel}>Battery</Text>
          </View>
          <View style={styles.gauge}>
            <View style={styles.gaugeInner}>
              <Text style={styles.gaugeValue}>OK</Text>
            </View>
            <Text style={styles.gaugeLabel}>Engine</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToDiagnostics}
        >
          <Text style={styles.actionButtonText}>View Diagnostics</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.quickAction} onPress={navigateToMechanic}>
          <View style={[styles.quickActionIcon, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="construct" size={24} color="#2196F3" />
          </View>
          <Text style={styles.quickActionText}>Call Mechanic</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={navigateToTrips}>
          <View style={[styles.quickActionIcon, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons name="map" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.quickActionText}>Start Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={navigateToDocuments}>
          <View style={[styles.quickActionIcon, { backgroundColor: "#FFF3E0" }]}>
            <Ionicons name="document-text" size={24} color="#FF9800" />
          </View>
          <Text style={styles.quickActionText}>Documents</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Trips */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          <TouchableOpacity onPress={navigateToTrips}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentTrips.map((trip) => (
          <View key={trip.id} style={styles.tripItem}>
            <View style={styles.tripIconContainer}>
              <Ionicons name="navigate" size={20} color="#fff" />
            </View>
            <View style={styles.tripDetails}>
              <Text style={styles.tripRoute}>
                {trip.from} to {trip.to}
              </Text>
              <Text style={styles.tripDate}>{trip.date}</Text>
            </View>
            <View style={styles.tripStats}>
              <Text style={styles.tripDistance}>{trip.distance}</Text>
              <Text style={styles.tripDuration}>{trip.duration}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Alerts */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alerts</Text>
        </View>

        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <View key={alert.id} style={styles.alertItem}>
              <View
                style={[
                  styles.alertIconContainer,
                  { backgroundColor: "#FFF3E0" }, // Adjust color based on alert.type
                ]}
              >
                <Ionicons name="warning" size={20} color="#FF9800" />
              </View>
              <View style={styles.alertDetails}>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noAlertsText}>No alerts at this time</Text>
        )}
      </View>

      {/* Bottom padding */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingTop: 40, // Adjust as needed for status bar
    backgroundColor: "#007bff",
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginTop: -20, // Overlap header slightly
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  moreButton: {
    padding: 4,
  },
  vehicleStatusContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statusItem: {
    marginRight: 24,
  },
  statusLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  gaugesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gauge: {
    alignItems: "center",
    width: "30%",
  },
  gaugeInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 3,
    borderColor: "#007bff", // Example border color
  },
  gaugeValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  gaugeLabel: {
    fontSize: 14,
    color: "#666",
  },
  actionButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  quickAction: {
    alignItems: "center",
    width: "30%",
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#007bff",
  },
  tripItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tripIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tripDetails: {
    flex: 1,
  },
  tripRoute: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 12,
    color: "#666",
  },
  tripStats: {
    alignItems: "flex-end",
  },
  tripDistance: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  tripDuration: {
    fontSize: 12,
    color: "#666",
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  alertIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  alertDetails: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: "#666",
  },
  noAlertsText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 10,
  },
});

export default HomeScreen;

