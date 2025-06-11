// src/screens/TripsScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Button,
  ListRenderItemInfo,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useSelector,
  useDispatch,
  TypedUseSelectorHook,
} from "react-redux";
import {
  useNavigation,
  useIsFocused,
  NavigationProp,
} from "@react-navigation/native";
import { fetchTripHistory, TripHistoryItem } from "../store/slices/tripSlice"; // Import TripHistoryItem instead of Trip
import MapView, { Marker } from "react-native-maps";
import { RootState, AppDispatch } from "../store"; // Assuming these types are defined in store/index.ts

// Define MainTabsParamList here since it's not exported from AppNavigator
interface MainTabsParamList {
  Trips: undefined;
  TripDetails: { vehicleId: string; tripId: string };
  // Add other tab routes as needed
}

// --- Type Definitions ---

type TripsScreenNavigationProp = NavigationProp<MainTabsParamList, "Trips">;

interface TripsScreenProps {
  // Props if needed
}

// Typed Redux hooks
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// --- Helper Functions ---

// Removed unused formatDateTime function

const formatTime = (timestamp: any): string => {
  if (!timestamp) return "N/A";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid Time";
  }
};

const formatDate = (timestamp: any): string => {
  if (!timestamp) return "N/A";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

// --- Screen Component ---

const TripsScreen: React.FC<TripsScreenProps> = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<TripsScreenNavigationProp>();
  const isFocused = useIsFocused();

  const [activeTab, setActiveTab] = useState<"history" | "current">("history");
  const { tripHistory, loading, error } = useAppSelector((state) => state.trip);
  const selectedVehicleId = useAppSelector((state) => state.vehicle.selectedVehicleId);

  // Fetch history when the screen focuses or vehicle changes
  useEffect(() => {
    if (isFocused && selectedVehicleId) {
      dispatch(fetchTripHistory(selectedVehicleId));
    }
  }, [dispatch, selectedVehicleId, isFocused]);

  const handleTripPress = useCallback((tripId: string) => {
    if (!selectedVehicleId || !tripId) return;
    // Ensure TripDetails screen exists in a navigator accessible from here
    // Assuming it's in a stack nested within the Tabs or a separate stack
    // Adjust navigation parameters as needed based on your Navigator setup
    navigation.navigate("TripDetails", { // Check if TripDetails is part of MainTabsParamList or another navigator
      vehicleId: selectedVehicleId,
      tripId: tripId,
    });
  }, [navigation, selectedVehicleId]);

  const renderTripItem = useCallback(({ item }: ListRenderItemInfo<TripHistoryItem>) => (
    <TouchableOpacity
      style={styles.tripItem}
      onPress={() => handleTripPress(item.id)}
    >
      <View style={styles.tripHeader}>
        <Text style={styles.tripDate}>{formatDate(item.startTime)}</Text>
        <Text style={styles.tripTime}>
          {formatTime(item.startTime)} - {formatTime(item.endTime)}
        </Text>
      </View>

      <View style={styles.tripRouteSimple}>
        <Ionicons name="navigate-circle-outline" size={16} color="#4CAF50" />
        <Text style={styles.tripLocationText} numberOfLines={1}>{item.startLocation?.address || "Start Location"}</Text>
        <Ionicons name="arrow-forward" size={16} color="#666" style={{ marginHorizontal: 5 }} />
        <Ionicons name="location-outline" size={16} color="#F44336" />
        <Text style={styles.tripLocationText} numberOfLines={1}>{item.endLocation?.address || "End Location"}</Text>
      </View>

      <View style={styles.tripStats}>
        <View style={styles.tripStat}>
          <Ionicons name="speedometer-outline" size={16} color="#666" />
          <Text style={styles.tripStatText}>{item.distanceKm?.toFixed(1) ?? "N/A"} km</Text>
        </View>
        <View style={styles.tripStat}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.tripStatText}>{item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : "N/A"}</Text>
        </View>
        <View style={styles.tripStat}>
          <Ionicons name="flash-outline" size={16} color="#666" />
          <Text style={styles.tripStatText}>{item.fuelConsumedLitersEstimate?.toFixed(1) ?? "N/A"} L</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleTripPress]);

  const renderHistoryTab = () => {
    if (loading) {
      return <ActivityIndicator size="large" style={styles.loadingIndicator} />;
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading trip history: {error}</Text>
          {selectedVehicleId && (
            <Button title="Retry" onPress={() => dispatch(fetchTripHistory(selectedVehicleId))} />
          )}
        </View>
      );
    }

    return (
      <View style={styles.historyContainer}>
        <FlatList
          data={tripHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderTripItem}
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyListContainer}>
              <Ionicons name="map-outline" size={64} color="#ccc" />
              <Text style={styles.emptyListText}>No trip history found for this vehicle.</Text>
            </View>
          )}
        />
      </View>
    );
  };

  const renderCurrentTab = () => {
    // Placeholder for current trip - No WebSocket logic
    const currentVehicleLocation = {
      latitude: 37.78825,
      longitude: -122.4324,
    }; // Mock location

    return (
      <View style={styles.currentTripContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentVehicleLocation.latitude,
            longitude: currentVehicleLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={currentVehicleLocation}
            title="Current Vehicle Location"
          />
        </MapView>
        <View style={styles.emptyListContainer}>
          <Ionicons name="play-circle-outline" size={64} color="#ccc" />
          <Text style={styles.emptyListText}>Real-time trip tracking not yet fully implemented.</Text>
          <Text style={styles.emptyListSubText}>Map shows current vehicle location (mocked).</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trips</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={[styles.tabText, activeTab === "history" && styles.activeTabText]}>
            Trip History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "current" && styles.activeTab]}
          onPress={() => setActiveTab("current")}
        >
          <Text style={[styles.tabText, activeTab === "current" && styles.activeTabText]}>
            Current Trip
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {!selectedVehicleId ? (
          <View style={styles.emptyListContainer}>
            <Ionicons name="car-outline" size={64} color="#ccc" />
            <Text style={styles.emptyListText}>Please select a vehicle first</Text>
            <Text style={styles.emptyListSubText}>Go to the Profile or Home screen to select a vehicle.</Text>
          </View>
        ) : (
          activeTab === "history" ? renderHistoryTab() : renderCurrentTab()
        )}
      </View>
    </View>
  );
};

// Styles remain largely the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 45, // Adjust for status bar
    backgroundColor: "#007bff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#007bff",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#007bff",
  },
  content: {
    flex: 1,
  },
  historyContainer: {
    flex: 1,
  },
  listContentContainer: {
    paddingVertical: 8,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 30, // Adjusted margin
  },
  emptyListText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptyListSubText: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 4,
    textAlign: "center",
  },
  tripItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6, // Reduced vertical margin
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tripDate: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  tripTime: {
    fontSize: 12,
    color: "#666",
  },
  tripRouteSimple: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "nowrap", // Prevent wrapping for this layout
    overflow: "hidden",
  },
  tripLocationText: {
    fontSize: 13,
    color: "#555",
    marginHorizontal: 4,
    flexShrink: 1,
  },
  tripStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
    marginTop: 8,
  },
  tripStat: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Distribute space
    justifyContent: "center", // Center items in stat block
  },
  tripStatText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  currentTripContainer: {
    flex: 1,
  },
  map: {
    height: 250,
    width: "100%",
  },
});

export default TripsScreen;
