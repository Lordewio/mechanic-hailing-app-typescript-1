import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

const GeofenceScreen: React.FC = () => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [newGeofenceName, setNewGeofenceName] = useState('');
  const [newGeofenceLat, setNewGeofenceLat] = useState('');
  const [newGeofenceLon, setNewGeofenceLon] = useState('');
  const [newGeofenceRadius, setNewGeofenceRadius] = useState('');

  const handleAddGeofence = () => {
    if (!newGeofenceName || !newGeofenceLat || !newGeofenceLon || !newGeofenceRadius) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    const lat = parseFloat(newGeofenceLat);
    const lon = parseFloat(newGeofenceLon);
    const radius = parseFloat(newGeofenceRadius);

    if (isNaN(lat) || isNaN(lon) || isNaN(radius)) {
      Alert.alert('Error', 'Latitude, Longitude, and Radius must be numbers.');
      return;
    }

    const newGeofence: Geofence = {
      id: Date.now().toString(),
      name: newGeofenceName,
      latitude: lat,
      longitude: lon,
      radius: radius,
    };

    setGeofences([...geofences, newGeofence]);
    setNewGeofenceName('');
    setNewGeofenceLat('');
    setNewGeofenceLon('');
    setNewGeofenceRadius('');
    Alert.alert('Success', `Geofence '${newGeofence.name}' added.`);
  };

  const handleDeleteGeofence = (id: string) => {
    Alert.alert(
      'Delete Geofence',
      'Are you sure you want to delete this geofence?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => setGeofences(geofences.filter((g) => g.id !== id)) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Geofencing Management</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Geofence Name"
          value={newGeofenceName}
          onChangeText={setNewGeofenceName}
        />
        <TextInput
          style={styles.input}
          placeholder="Latitude"
          keyboardType="numeric"
          value={newGeofenceLat}
          onChangeText={setNewGeofenceLat}
        />
        <TextInput
          style={styles.input}
          placeholder="Longitude"
          keyboardType="numeric"
          value={newGeofenceLon}
          onChangeText={setNewGeofenceLon}
        />
        <TextInput
          style={styles.input}
          placeholder="Radius (meters)"
          keyboardType="numeric"
          value={newGeofenceRadius}
          onChangeText={setNewGeofenceRadius}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddGeofence}>
          <Text style={styles.addButtonText}>Add Geofence</Text>
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {geofences.map((geofence) => (
          <Circle
            key={geofence.id}
            center={{ latitude: geofence.latitude, longitude: geofence.longitude }}
            radius={geofence.radius}
            strokeColor="rgba(0, 0, 255, 0.5)"
            fillColor="rgba(0, 0, 255, 0.2)"
          />
        ))}
      </MapView>

      <FlatList
        data={geofences}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.geofenceItem}>
            <Text style={styles.geofenceText}>{item.name} (Lat: {item.latitude.toFixed(4)}, Lon: {item.longitude.toFixed(4)}, Radius: {item.radius}m)</Text>
            <TouchableOpacity onPress={() => handleDeleteGeofence(item.id)}>
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyListText}>No geofences defined yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  map: {
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
  },
  geofenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  geofenceText: {
    fontSize: 16,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default GeofenceScreen;


