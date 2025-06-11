import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList } from '../navigation/AppNavigator';

type LiveTrackingScreenRouteProp = RouteProp<MainTabParamList, 'LiveTracking'>;
type LiveTrackingScreenNavigationProp = StackNavigationProp<MainTabParamList, 'LiveTracking'>;

interface LiveTrackingScreenProps {
  route: LiveTrackingScreenRouteProp;
  navigation: LiveTrackingScreenNavigationProp;
}

interface MechanicLocation {
  latitude: number;
  longitude: number;
}

const LiveTrackingScreen: React.FC<LiveTrackingScreenProps> = ({ route, navigation }) => {
  const { mechanicId, customerLocation } = route.params;
  const [mechanicLocation, setMechanicLocation] = useState<MechanicLocation | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const mapRef = useRef<MapView>(null);

  // Mock mechanic data (replace with actual fetch from Redux/API)
  const mockMechanic = {
    id: mechanicId,
    name: 'John Smith', // This should be fetched based on mechanicId
    initialLocation: { latitude: 37.7958, longitude: -122.3964 }, // Starting point for simulation
  };

  useEffect(() => {
    if (!mechanicId || !customerLocation) {
      Alert.alert('Error', 'Mechanic ID or customer location is missing.');
      navigation.goBack();
      return;
    }

    // Simulate mechanic moving towards customer
    let currentLat = mockMechanic.initialLocation.latitude;
    let currentLon = mockMechanic.initialLocation.longitude;

    const interval = setInterval(() => {
      // Simple linear movement simulation
      const latDiff = customerLocation.latitude - currentLat;
      const lonDiff = customerLocation.longitude - currentLon;
      const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);

      if (distance < 0.001) { // Mechanic is very close
        clearInterval(interval);
        setEta('Arrived');
        setLoading(false);
        return;
      }

      const step = 0.0005; // Smaller step for slower movement
      currentLat += (latDiff / distance) * step;
      currentLon += (lonDiff / distance) * step;

      setMechanicLocation({ latitude: currentLat, longitude: currentLon });

      // Simple ETA calculation (distance / speed)
      // Assuming a constant speed for simulation
      const remainingDistance = Math.sqrt(
        Math.pow(customerLocation.latitude - currentLat, 2) +
        Math.pow(customerLocation.longitude - currentLon, 2)
      );
      const simulatedSpeedKmPerHour = 20; // km/h
      const distanceInKm = remainingDistance * 111; // Approx 111 km per degree of latitude
      const timeInHours = distanceInKm / simulatedSpeedKmPerHour;
      const timeInMinutes = Math.round(timeInHours * 60);

      if (timeInMinutes < 1) {
        setEta('Arriving soon');
      } else if (timeInMinutes < 60) {
        setEta(`${timeInMinutes} min`);
      } else {
        const hours = Math.floor(timeInMinutes / 60);
        const minutes = timeInMinutes % 60;
        setEta(`${hours} hr ${minutes} min`);
      }

      setLoading(false);

      // Adjust map region to keep both mechanic and customer in view
      if (mapRef.current && mechanicLocation && customerLocation) {
        mapRef.current.fitToCoordinates([
          mechanicLocation,
          customerLocation,
        ], {
          edgePadding: {
            top: 50, right: 50, bottom: 50, left: 50
          },
          animated: true,
        });
      }

    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [mechanicId, customerLocation]);

  if (loading || !mechanicLocation) {
    return (
      <View style={styles.containerCentered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading mechanic location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Mechanic Tracking</Text>
        <View style={{ width: 40 }} />
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: (mechanicLocation.latitude + customerLocation.latitude) / 2,
          longitude: (mechanicLocation.longitude + customerLocation.longitude) / 2,
          latitudeDelta: Math.abs(mechanicLocation.latitude - customerLocation.latitude) * 1.5,
          longitudeDelta: Math.abs(mechanicLocation.longitude - customerLocation.longitude) * 1.5,
        }}
      >
        <Marker
          coordinate={mechanicLocation}
          title={mockMechanic.name}
          description="Mechanic's Current Location"
          pinColor="blue"
        />
        <Marker
          coordinate={customerLocation}
          title="Your Location"
          description="Customer's Location"
          pinColor="red"
        />
        <Polyline
          coordinates={[mechanicLocation, customerLocation]}
          strokeColor="#007bff"
          strokeWidth={3}
        />
      </MapView>

      <View style={styles.infoPanel}>
        <Text style={styles.infoText}>Mechanic: {mockMechanic.name}</Text>
        <Text style={styles.infoText}>ETA: {eta || 'Calculating...'}</Text>
        <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('Chat', { mechanicName: mockMechanic.name })}>
          <Ionicons name="chatbox-outline" size={20} color="#fff" />
          <Text style={styles.chatButtonText}>Chat with Mechanic</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    backgroundColor: '#007bff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  map: {
    flex: 1,
  },
  infoPanel: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  chatButton: {
    flexDirection: 'row',
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default LiveTrackingScreen;


