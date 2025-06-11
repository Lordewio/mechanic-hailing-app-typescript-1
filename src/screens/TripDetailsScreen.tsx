// src/screens/TripDetailsScreen.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
} from "react-native";
import { useSelector, useDispatch, TypedUseSelectorHook } from "react-redux";
import { useRoute, RouteProp } from "@react-navigation/native";
import { fetchTripDetails, clearCurrentTripDetails, TripDetails } from "../store/slices/tripSlice";
import MapView, { Marker, Polyline } from "react-native-maps"; // Import MapView
import { RootState, AppDispatch } from "../store";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

// Define route params interface
interface TripDetailsParams {
  vehicleId: string;
  tripId: string;
}

// Define navigation stack param list
type RootStackParamList = {
  TripDetails: TripDetailsParams;
  // Add other screens as needed
};

// Typed Redux hooks
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const TripDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TripDetails'>>();
  const dispatch = useAppDispatch();
  const { vehicleId, tripId } = route.params; // Get params passed from navigation

  const { currentTripDetails, loading, error } = useAppSelector((state) => state.trip);

  useEffect(() => {
    if (vehicleId && tripId) {
      dispatch(fetchTripDetails({ vehicleId, tripId }));
    }

    // Clear details when the component unmounts
    return () => {
      dispatch(clearCurrentTripDetails());
    };
  }, [dispatch, vehicleId, tripId]);

  const handleExportTrip = () => {
    Alert.alert(
      "Export Trip Data",
      "This feature would export trip data (e.g., to PDF or CSV). For now, this is a simulation.",
      [{ text: "OK" }]
    );
  };

  if (loading) {
    return (
      <View style={styles.containerCentered}>
        <ActivityIndicator size="large" />
        <Text>Loading Trip Details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.errorText}>Error loading trip details: {error}</Text>
        <Button title="Retry" onPress={() => dispatch(fetchTripDetails({ vehicleId, tripId }))} />
      </View>
    );
  }

  if (!currentTripDetails) {
    return (
      <View style={styles.containerCentered}>
        <Text>No trip details available.</Text>
      </View>
    );
  }

  // Prepare data for display
  const trip = currentTripDetails;
  const startTime = trip.startTime instanceof Date ? trip.startTime : new Date(trip.startTime);
  const endTime = trip.endTime instanceof Date ? trip.endTime : new Date(trip.endTime);

  // Prepare coordinates for MapView Polyline if routePath exists
  const routeCoordinates = trip.routePath?.map((point: { latitude: number; longitude: number }) => ({
    latitude: point.latitude,
    longitude: point.longitude,
  })) || [];

  // Determine map region based on start/end points or route path
  let initialRegion = {
    latitude: 37.78825, // Default fallback region
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  if (trip.startLocation?.latitude && trip.startLocation?.longitude) {
    initialRegion = {
      latitude: trip.startLocation.latitude,
      longitude: trip.startLocation.longitude,
      latitudeDelta: 0.05, // Zoom level
      longitudeDelta: 0.02,
    };
  } else if (routeCoordinates.length > 0) {
    initialRegion = {
      latitude: routeCoordinates[0].latitude,
      longitude: routeCoordinates[0].longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.02,
    };
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Trip Details</Text>
      <Text style={styles.date}>{startTime.toLocaleDateString()}</Text>

      {/* Map View */}
      {(trip.startLocation || routeCoordinates.length > 0) && (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          provider="google" // Optional: Use Google Maps
        >
          {/* Start Marker */}
          {trip.startLocation?.latitude && (
            <Marker
              coordinate={{
                latitude: trip.startLocation.latitude,
                longitude: trip.startLocation.longitude,
              }}
              title="Start Location"
              pinColor="green"
            />
          )}
          {/* End Marker */}
          {trip.endLocation?.latitude && (
            <Marker
              coordinate={{
                latitude: trip.endLocation.latitude,
                longitude: trip.endLocation.longitude,
              }}
              title="End Location"
              pinColor="red"
            />
          )}
          {/* Route Polyline */}
          {routeCoordinates.length > 1 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#007bff" // Blue color for the route
              strokeWidth={4}
            />
          )}
        </MapView>
      )}

      {/* Trip Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Start Time:</Text>
          <Text style={styles.statValue}>{startTime.toLocaleTimeString()}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>End Time:</Text>
          <Text style={styles.statValue}>{endTime.toLocaleTimeString()}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Duration:</Text>
          <Text style={styles.statValue}>{trip.durationSeconds ? `${Math.round(trip.durationSeconds / 60)} min` : "N/A"}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Distance:</Text>
          <Text style={styles.statValue}>{trip.distanceKm?.toFixed(1) ?? "N/A"} km</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Average Speed:</Text>
          <Text style={styles.statValue}>{trip.averageSpeedKmh?.toFixed(1) ?? "N/A"} km/h</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Max Speed:</Text>
          <Text style={styles.statValue}>{trip.maxSpeedKmh?.toFixed(1) ?? "N/A"} km/h</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Fuel Estimate:</Text>
          <Text style={styles.statValue}>{trip.fuelConsumedLitersEstimate?.toFixed(2) ?? "N/A"} L</Text>
        </View>
      </View>

      {/* Driving Behavior (Optional) */}
      {trip.drivingEvents && (
        <View style={styles.behaviorContainer}>
          <Text style={styles.sectionTitle}>Driving Behavior</Text>
          <Text>Harsh Acceleration: {trip.drivingEvents.harshAccelerationCount ?? 0}</Text>
          <Text>Harsh Braking: {trip.drivingEvents.harshBrakingCount ?? 0}</Text>
        </View>
      )}

      {/* Start/End Addresses (Optional) */}
      {(trip.startLocation?.address || trip.endLocation?.address) && (
        <View style={styles.addressContainer}>
          <Text style={styles.sectionTitle}>Locations</Text>
          {trip.startLocation?.address && <Text>Start: {trip.startLocation.address}</Text>}
          {trip.endLocation?.address && <Text>End: {trip.endLocation.address}</Text>}
        </View>
      )}

      <TouchableOpacity style={styles.exportButton} onPress={handleExportTrip}>
        <Text style={styles.exportButtonText}>Export Trip Data</Text>
      </TouchableOpacity>

    </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
  },
  date: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 15,
  },
  map: {
    height: 250,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  statsContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statLabel: {
    fontSize: 15,
    color: "#555",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 5,
  },
  behaviorContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  addressContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  exportButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TripDetailsScreen;
