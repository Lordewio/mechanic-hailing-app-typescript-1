import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AdminDashboardScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <View style={styles.card}>
        <Ionicons name="car-outline" size={30} color="#007bff" />
        <Text style={styles.cardTitle}>Vehicle Management</Text>
        <Text style={styles.cardDescription}>Manage registered vehicles, view details, and assign mechanics.</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Go to Vehicles</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Ionicons name="people-outline" size={30} color="#28a745" />
        <Text style={styles.cardTitle}>User Management</Text>
        <Text style={styles.cardDescription}>Oversee user accounts, roles, and permissions.</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Go to Users</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Ionicons name="build-outline" size={30} color="#ffc107" />
        <Text style={styles.cardTitle}>Mechanic Management</Text>
        <Text style={styles.cardDescription}>Approve new mechanics, manage profiles, and track performance.</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Go to Mechanics</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Ionicons name="document-text-outline" size={30} color="#dc3545" />
        <Text style={styles.cardTitle}>Reports & Analytics</Text>
        <Text style={styles.cardDescription}>Access system reports, performance metrics, and usage statistics.</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Reports</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminDashboardScreen;


