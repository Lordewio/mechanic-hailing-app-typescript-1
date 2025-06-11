// src/screens/TripHistoryScreen.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Button
} from "react-native";
import { useSelector, useDispatch, TypedUseSelectorHook } from "react-redux";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { fetchTripHistory, clearTripState, TripHistoryItem } from "../store/slices/tripSlice";
import { RootState, AppDispatch } from "../store";

// Define navigation types
interface RootStackParamList {
  TripDetails: { vehicleId: string; tripId: string };
  // Add other screens as needed
}

type TripHistoryScreenNavigationProp = NavigationProp<RootStackParamList>;

// Typed Redux hooks
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const TripHistoryScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<TripHistoryScreenNavigationProp>();
  const { tripHistory, loading, error } = useAppSelector((state) => state.trip);
  const selectedVehicleId = useAppSelector((state) => state.vehicle.selectedVehicleId);

  useEffect(() => {
    if (selectedVehicleId) {
      dispatch(fetchTripHistory(selectedVehicleId));
    } else {
      // Clear history if no vehicle is selected
      dispatch(clearTripState());
    }

    // Optional: Clear state on unmount if desired
    // return () => dispatch(clearTripState());

  }, [dispatch, selectedVehicleId]);

  const handleTripPress = (tripId: string): void => {
    if (selectedVehicleId && tripId) {
      // Navigate to Trip Details screen, passing vehicleId and tripId
      navigation.navigate("TripDetails", { vehicleId: selectedVehicleId, tripId });
    } else {
      console.warn("Cannot navigate to trip details without vehicleId or tripId");
    }
  };

  const renderTripItem = ({ item }: { item: TripHistoryItem }) => {
    const startTime = item.startTime instanceof Date ? item.startTime : new Date(item.startTime);
    const endTime = item.endTime instanceof Date ? item.endTime : new Date(item.endTime);

    return (
      <TouchableOpacity onPress={() => handleTripPress(item.id)} style={styles.tripItem}>
        <Text style={styles.tripDate}>{startTime.toLocaleDateString()}</Text>
        <Text>Start: {startTime.toLocaleTimeString()}</Text>
        <Text>End: {endTime.toLocaleTimeString()}</Text>
        <Text>Distance: {item.distanceKm?.toFixed(1) ?? "N/A"} km</Text>
        <Text>Duration: {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : "N/A"}</Text>
        {/* Add more summary info if needed */}
      </TouchableOpacity>
    );
  };

  if (!selectedVehicleId) {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.infoText}>Please select a vehicle to view trip history.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.containerCentered}>
        <ActivityIndicator size="large" />
        <Text>Loading Trip History...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.errorText}>Error loading trip history: {error}</Text>
        <Button title="Retry" onPress={() => dispatch(fetchTripHistory(selectedVehicleId))} />
      </View>
    );
  }

  return (
    <View style={styles.container}> 
      <FlatList
        data={tripHistory}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyListText}>No trip history found for this vehicle.</Text>}
        contentContainerStyle={styles.listContentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  containerCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  listContentContainer: {
    padding: 15,
  },
  tripItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 50,
    color: "#888",
  },
});

export default TripHistoryScreen;
