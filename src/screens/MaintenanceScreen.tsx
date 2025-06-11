import React, { useState, useEffect } from 'react';
import { sendNotification } from "../services/notificationService";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchUpcomingMaintenance, fetchServiceHistory } from '../store/slices/maintenanceSlice';
import { MaintenanceSchedule, ServiceHistoryLog } from '../store/slices/maintenanceSlice';
import { RootState, AppDispatch } from '../store';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaintenanceStackParamList } from '../navigation/AppNavigator';

type MaintenanceScreenNavigationProp = StackNavigationProp<MaintenanceStackParamList>;

interface MaintenanceScreenProps {
  navigation: MaintenanceScreenNavigationProp;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const dispatch = useDispatch<AppDispatch>();
  
  const { 
    upcomingMaintenance, 
    serviceHistory, 
    loadingUpcoming, 
    loadingHistory,
    error 
  } = useSelector((state: RootState) => state.maintenance);
  
  const selectedVehicleId = useSelector((state: RootState) => state.vehicle.selectedVehicleId);
  const vehicles = useSelector((state: RootState) => state.vehicle.vehicles);
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  useEffect(() => {
    if (selectedVehicleId) {
      dispatch(fetchUpcomingMaintenance(selectedVehicleId));
      dispatch(fetchServiceHistory(selectedVehicleId));
    }
  }, [dispatch, selectedVehicleId]);

  // Effect to show alert for overdue and upcoming maintenance
  useEffect(() => {
    if (upcomingMaintenance.some(item => item.status === 'Overdue')) {
      sendNotification(
        "Overdue Maintenance!",
        "You have one or more maintenance items that are overdue. Please attend to them as soon as possible.",
        "warning"
      );
    } else if (selectedVehicle?.currentMileageKm !== undefined) {
      const now = new Date();
      const upcomingSoon = upcomingMaintenance.filter(item => {
        if (item.status === 'Scheduled') {
          // Check by date (e.g., within 7 days)
          if (item.dueDate) {
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(now.getDate() + 7);
            if (item.dueDate <= sevenDaysFromNow) {
              return true;
            }
          }
          // Check by mileage (e.g., within 1000 km)
          if (item.dueMileageKm && selectedVehicle.currentMileageKm) {
            if (item.dueMileageKm - selectedVehicle.currentMileageKm <= 1000) {
              return true;
            }
          }
        }
        return false;
      });

      if (upcomingSoon.length > 0) {
      sendNotification(
        "Upcoming Maintenance!",
        "You have maintenance items due soon. Check your upcoming maintenance schedule.",
        "info"
      );
      }
    }
  }, [upcomingMaintenance, selectedVehicle]);

  const renderUpcomingItem = ({ item }: { item: MaintenanceSchedule }) => (
    <TouchableOpacity 
      style={[styles.itemCard, item.status === 'Overdue' && styles.overdueCard]} 
      onPress={() => navigation.navigate('MaintenanceDetails', { scheduleId: item.id })}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.serviceItem}</Text>
        <View style={[styles.statusBadge, 
          item.status === 'Overdue' ? styles.overdueBadge : styles.scheduledBadge
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.itemDetails}>
        {item.dueDate && (
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        {item.dueMileageKm && (
          <View style={styles.detailRow}>
            <Ionicons name="speedometer-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.dueMileageKm} km</Text>
          </View>
        )}
        
        {item.notes && (
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>{item.notes}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: ServiceHistoryLog }) => (
    <TouchableOpacity 
      style={styles.itemCard} 
      onPress={() => navigation.navigate('ServiceLogDetails', { logId: item.id })}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.serviceItem}</Text>
      </View>
      
      <View style={styles.itemDetails}>
        {item.serviceDate && (
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {new Date(item.serviceDate).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        {item.mileageKm && (
          <View style={styles.detailRow}>
            <Ionicons name="speedometer-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.mileageKm} km</Text>
          </View>
        )}
        
        {item.mechanicName && (
          <View style={styles.detailRow}>
            <Ionicons name="build-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.mechanicName}</Text>
          </View>
        )}
        
        {item.cost && (
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.detailText}>${item.cost.toFixed(2)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={activeTab === 'upcoming' ? 'calendar-outline' : 'document-text-outline'} 
        size={64} 
        color="#ccc" 
      />
      <Text style={styles.emptyText}>
        {activeTab === 'upcoming' 
          ? 'No upcoming maintenance scheduled' 
          : 'No service history available'}
      </Text>
      {activeTab === 'upcoming' && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMaintenance')}
        >
          <Text style={styles.addButtonText}>Add Maintenance Schedule</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Maintenance</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]} 
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}
      
      {activeTab === 'upcoming' ? (
        <View style={styles.listContainer}>
          {loadingUpcoming ? (
            <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
          ) : (
            <FlatList
              data={upcomingMaintenance}
              renderItem={renderUpcomingItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={renderEmptyList}
            />
          )}
        </View>
      ) : (
        <View style={styles.listContainer}>
          {loadingHistory ? (
            <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
          ) : (
            <FlatList
              data={serviceHistory}
              renderItem={renderHistoryItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={renderEmptyList}
            />
          )}
        </View>
      )}
      
      {activeTab === 'upcoming' && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => navigation.navigate('AddMaintenance')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      
      {activeTab === 'history' && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => navigation.navigate('LogService')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 15,
    paddingBottom: 80, // Extra padding for FAB
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  itemDetails: {
    marginTop: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  errorText: {
    color: '#d32f2f',
  },
  loader: {
    marginTop: 20,
  },
});

export default MaintenanceScreen;
