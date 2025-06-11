import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList } from '../navigation/AppNavigator';

type MechanicJobScreenRouteProp = RouteProp<MainTabParamList, 'MechanicJob'>;
type MechanicJobScreenNavigationProp = StackNavigationProp<MainTabParamList, 'MechanicJob'>;

interface MechanicJobScreenProps {
  route: MechanicJobScreenRouteProp;
  navigation: MechanicJobScreenNavigationProp;
}

const MechanicJobScreen: React.FC<MechanicJobScreenProps> = ({ route, navigation }) => {
  const { jobId } = route.params; // Assuming jobId is passed
  const [jobDetails, setJobDetails] = useState<any>(null); // Replace 'any' with actual job details interface
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'Pending' | 'Accepted' | 'Rejected' | 'En Route' | 'Arrived' | 'Completed'>('Pending');

  useEffect(() => {
    // Simulate fetching job details
    setTimeout(() => {
      setJobDetails({
        id: jobId,
        customerName: 'Alice Smith',
        customerLocation: '123 Main St, Anytown, USA',
        problemDescription: 'Car not starting, check engine light on.',
        estimatedTime: '30 min',
        estimatedDistance: '5 km',
        customerContact: '555-123-4567',
        // Add more details as needed
      });
      setLoading(false);
    }, 1500);
  }, [jobId]);

  const handleAcceptJob = () => {
    Alert.alert(
      'Accept Job',
      'Are you sure you want to accept this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: () => {
            setStatus('Accepted');
            Alert.alert('Job Accepted', 'You have accepted the job. Customer will be notified.');
            // In a real app, you'd update Firestore here
          }
        },
      ]
    );
  };

  const handleRejectJob = () => {
    Alert.alert(
      'Reject Job',
      'Are you sure you want to reject this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', onPress: () => {
            setStatus('Rejected');
            Alert.alert('Job Rejected', 'You have rejected the job. Customer will be notified.');
            navigation.goBack(); // Go back after rejecting
          }
        },
      ]
    );
  };

  const handleUpdateStatus = (newStatus: 'En Route' | 'Arrived' | 'Completed') => {
    Alert.alert(
      'Update Status',
      `Mark job as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => {
            setStatus(newStatus);
            Alert.alert("Status Updated", `Job status updated to ${newStatus}.`);
            // Simulate sending a notification to the customer
            Alert.alert("Notification Sent", `Customer notified: Mechanic is ${newStatus}.`);
            // In a real app, you'd update Firestore here
            if (newStatus === 'Completed') {
              navigation.goBack(); // Go back after completing
            }
          }
        },
      ]
    );
  };

  const handleNavigateToCustomer = () => {
    const customerAddress = jobDetails?.customerLocation;
    if (customerAddress) {
      const url = Platform.select({
        ios: `maps:0,0?q=${customerAddress}`,
        android: `geo:0,0?q=${customerAddress}`,
      });
      if (url) {
        Linking.openURL(url).catch(err => console.error("An error occurred", err));
      }
    } else {
      Alert.alert("Error", "Customer location not available.");
    }
  };

  const handleClearDTCs = () => {
    Alert.alert(
      "Clear DTCs",
      "Are you sure you want to clear all Diagnostic Trouble Codes? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", onPress: () => {
            // Simulate clearing DTCs
            setJobDetails({ ...jobDetails, faultCodes: [] });
            Alert.alert("DTCs Cleared", "Diagnostic Trouble Codes have been successfully cleared.");
            // In a real app, you would send a command to the OBD-II device
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.containerCentered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading Job Details...</Text>
      </View>
    );
  }

  if (!jobDetails) {
    return (
      <View style={styles.containerCentered}>
        <Text>No job details found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Customer: {jobDetails.customerName}</Text>
        <Text style={styles.detailText}>Location: {jobDetails.customerLocation}</Text>
        <Text style={styles.detailText}>Problem: {jobDetails.problemDescription}</Text>
        {jobDetails.faultCodes && jobDetails.faultCodes.length > 0 && (
          <View style={styles.faultCodeContainer}>
            <Text style={styles.faultCodeTitle}>Reported Fault Codes:</Text>
            {jobDetails.faultCodes.map((code: string, index: number) => (
              <Text key={index} style={styles.faultCodeText}>- {code}</Text>
            ))}
          </View>
        )}
        <Text style={styles.detailText}>Estimated Time: {jobDetails.estimatedTime}</Text>
        <Text style={styles.detailText}>Estimated Distance: {jobDetails.estimatedDistance}</Text>
        <Text style={styles.detailText}>Contact: {jobDetails.customerContact}</Text>
        <TouchableOpacity style={styles.navigateButton} onPress={handleNavigateToCustomer}>
          <Ionicons name="navigate-circle-outline" size={24} color="#fff" />
          <Text style={styles.navigateButtonText}>Navigate to Customer</Text>
        </TouchableOpacity>
        <Text style={styles.statusText}>Current Status: {status}</Text>

        {jobDetails.faultCodes && jobDetails.faultCodes.length > 0 && (
          <TouchableOpacity style={styles.clearDTCButton} onPress={handleClearDTCs}>
            <Text style={styles.clearDTCButtonText}>Clear DTCs</Text>
          </TouchableOpacity>
        )}
      </View>

      {status === 'Pending' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={handleAcceptJob}>
            <Text style={styles.buttonText}>Accept Job</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={handleRejectJob}>
            <Text style={styles.buttonText}>Reject Job</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'Accepted' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={() => handleUpdateStatus('En Route')}>
            <Text style={styles.buttonText}>Mark En Route</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'En Route' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={() => handleUpdateStatus('Arrived')}>
            <Text style={styles.buttonText}>Mark Arrived</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'Arrived' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.completeButton]} onPress={() => handleUpdateStatus('Completed')}>
            <Text style={styles.buttonText}>Mark Completed</Text>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
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
    padding: 20,
  },
  header: {
    backgroundColor: '#007bff',
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    margin: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#007bff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 15,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  updateButton: {
    backgroundColor: '#007bff',
  },
  completeButton: {
    backgroundColor: '#28a745',
  },
  faultCodeContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8d7da',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  faultCodeTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#721c24',
  },
  faultCodeText: {
    fontSize: 14,
    color: '#721c24',
  },
});

export default MechanicJobScreen;


