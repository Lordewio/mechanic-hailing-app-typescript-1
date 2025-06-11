import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { deleteServiceLog } from '../store/slices/maintenanceSlice';
import { RootState, AppDispatch } from '../store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, ParamListBase } from '@react-navigation/native';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// Define MainStackParamList here since it's not exported from AppNavigator
interface MainStackParamList extends ParamListBase {
  ServiceLogDetails: { item: ServiceLogItem };
  MaintenanceDetails: { scheduleId: string };
  // Add other screens as needed
}

// Define the service log item interface
interface ServiceLogItem {
  id: string;
  serviceDate: Date | FirebaseFirestoreTypes.Timestamp | null;
  serviceItem: string;
  mileageKm?: number;
  cost?: number;
  mechanicName?: string;
  notes?: string;
  receiptUrl?: string;
  relatedScheduleId?: string;
}

type ServiceLogDetailsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'ServiceLogDetails'>;
type ServiceLogDetailsScreenRouteProp = RouteProp<MainStackParamList, 'ServiceLogDetails'>;

interface ServiceLogDetailsScreenProps {
  route: ServiceLogDetailsScreenRouteProp;
  navigation: ServiceLogDetailsScreenNavigationProp;
}

const ServiceLogDetailsScreen: React.FC<ServiceLogDetailsScreenProps> = ({ route, navigation }) => {
  const { item } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const selectedVehicleId = useSelector((state: RootState) => state.vehicle.selectedVehicleId);

  const formatDate = (date: Date | FirebaseFirestoreTypes.Timestamp | null | undefined): string => {
    if (!date) return 'Not specified';
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    // Handle Timestamp
    if ('seconds' in date) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    return 'Invalid date';
  };

  const handleDelete = () => {
    if (!selectedVehicleId) {
      Alert.alert('Error', 'No vehicle selected');
      return;
    }

    Alert.alert(
      'Delete Service Log',
      'Are you sure you want to delete this service log?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteServiceLog({
                vehicleId: selectedVehicleId,
                itemId: item.id
              })).unwrap();
              
              Alert.alert('Success', 'Service log deleted');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.toString());
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Log Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.serviceItem}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{formatDate(item.serviceDate)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mileage:</Text>
              <Text style={styles.detailValue}>{item.mileageKm ? `${item.mileageKm} km` : 'Not specified'}</Text>
            </View>
            
            {item.cost && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cost:</Text>
                <Text style={styles.detailValue}>${item.cost.toFixed(2)}</Text>
              </View>
            )}
            
            {item.mechanicName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Provider:</Text>
                <Text style={styles.detailValue}>{item.mechanicName}</Text>
              </View>
            )}
            
            {item.relatedScheduleId && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Related to:</Text>
                <TouchableOpacity onPress={() => {
                  if (item.relatedScheduleId) {
                    navigation.navigate('MaintenanceDetails', { scheduleId: item.relatedScheduleId });
                  }
                }}>
                  <Text style={styles.linkText}>View Maintenance Schedule</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {item.notes && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}

          {item.receiptUrl && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Receipt</Text>
              <Image 
                source={{ uri: item.receiptUrl }} 
                style={styles.receiptImage}
                resizeMode="contain"
              />
              <TouchableOpacity style={styles.viewImageButton}>
                <Text style={styles.viewImageText}>View Full Image</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  linkText: {
    color: '#007bff',
    fontSize: 14,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    marginBottom: 10,
  },
  viewImageButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  viewImageText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 5,
  },
});

export default ServiceLogDetailsScreen;
