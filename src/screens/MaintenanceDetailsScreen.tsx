import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { updateScheduleStatus, deleteSchedule, MaintenanceSchedule } from '../store/slices/maintenanceSlice';
import { RootState, AppDispatch } from '../store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MaintenanceStackParamList } from '../navigation/AppNavigator';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

type MaintenanceDetailsScreenNavigationProp = StackNavigationProp<MaintenanceStackParamList, 'MaintenanceDetails'>;
type MaintenanceDetailsScreenRouteProp = RouteProp<MaintenanceStackParamList, 'MaintenanceDetails'>;

interface MaintenanceDetailsScreenProps {
  route: MaintenanceDetailsScreenRouteProp;
  navigation: MaintenanceDetailsScreenNavigationProp;
}

const MaintenanceDetailsScreen: React.FC<MaintenanceDetailsScreenProps> = ({ route, navigation }) => {
  const { scheduleId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  
  const selectedVehicleId = useSelector((state: RootState) => state.vehicle.selectedVehicleId);
  const upcomingMaintenance = useSelector((state: RootState) => state.maintenance.upcomingMaintenance);
  const item = upcomingMaintenance.find(item => item.id === scheduleId);

  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Maintenance Details</Text>
        </View>
        <View style={styles.loaderContainer}>
          <Text>Maintenance item not found</Text>
        </View>
      </View>
    );
  }

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

  const handleMarkComplete = () => {
    if (!selectedVehicleId) {
      Alert.alert('Error', 'No vehicle selected');
      return;
    }

    Alert.alert(
      'Mark as Completed',
      'Do you want to mark this maintenance item as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete & Log', 
          onPress: () => {
            // Navigate to log service screen with pre-filled data
            navigation.navigate('LogService', { 
              scheduleId: item.id
            });
          }
        },
        { 
          text: 'Just Complete', 
          onPress: async () => {
            if (!selectedVehicleId) return;
            
            setLoading(true);
            try {
              await dispatch(updateScheduleStatus({
                vehicleId: selectedVehicleId,
                scheduleId: item.id,
                status: 'Completed'
              })).unwrap();
              
              Alert.alert('Success', 'Maintenance item marked as completed');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.toString());
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDelete = () => {
    if (!selectedVehicleId) {
      Alert.alert('Error', 'No vehicle selected');
      return;
    }

    Alert.alert(
      'Delete Maintenance Item',
      'Are you sure you want to delete this maintenance item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await dispatch(deleteSchedule({
                vehicleId: selectedVehicleId,
                itemId: item.id
              })).unwrap();
              
              Alert.alert('Success', 'Maintenance item deleted');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.toString());
            } finally {
              setLoading(false);
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
        <Text style={styles.headerTitle}>Maintenance Details</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.serviceItem}</Text>
              <View style={[
                styles.statusBadge, 
                item.status === 'Overdue' ? styles.overdueBadge : styles.scheduledBadge
              ]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Schedule Details</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={styles.detailValue}>{formatDate(item.dueDate)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due Mileage:</Text>
                <Text style={styles.detailValue}>{item.dueMileageKm ? `${item.dueMileageKm} km` : 'Not specified'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created:</Text>
                <Text style={styles.detailValue}>{formatDate(item.creationDate)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Recurring:</Text>
                <Text style={styles.detailValue}>{item.isRecurring ? 'Yes' : 'No'}</Text>
              </View>
              
              {item.isRecurring && (
                <>
                  {item.recurringIntervalMonths && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Repeat Every:</Text>
                      <Text style={styles.detailValue}>{item.recurringIntervalMonths} months</Text>
                    </View>
                  )}
                  
                  {item.recurringIntervalKm && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Repeat Every:</Text>
                      <Text style={styles.detailValue}>{item.recurringIntervalKm} km</Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {item.notes && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.editButton]}
                onPress={() => navigation.navigate('EditMaintenance', { scheduleId: item.id })}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.completeButton]}
                onPress={handleMarkComplete}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Complete</Text>
              </TouchableOpacity>
              
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
      )}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  scheduledBadge: {
    backgroundColor: '#e6f2ff',
  },
  overdueBadge: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
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
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#6c757d',
  },
  completeButton: {
    backgroundColor: '#28a745',
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

export default MaintenanceDetailsScreen;
