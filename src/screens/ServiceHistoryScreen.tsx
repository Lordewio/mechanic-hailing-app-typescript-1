import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux';
import { RootState, AppDispatch } from '../store';

// Define navigation types
interface ServiceHistoryNavigationParams extends ParamListBase {
  ServiceDetails: { bookingId: string };
  WriteReview: { mechanicId: string; serviceId: string; bookingId: string };
  MechanicMap: undefined;
}

type ServiceHistoryNavigationProp = NavigationProp<ServiceHistoryNavigationParams>;

// Define service history item interface
interface ServiceHistoryItem {
  id: string;
  mechanicId: string;
  mechanicName: string;
  mechanicPhoto: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  vehicleName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  bookingId: string;
  hasReview: boolean;
  rating?: number;
}

// Typed Redux hooks
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Mock data for service history
const mockServiceHistory: ServiceHistoryItem[] = [
  {
    id: 'b1',
    mechanicId: '1',
    mechanicName: 'John Smith',
    mechanicPhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
    serviceId: 's2',
    serviceName: 'Brake Service',
    servicePrice: 199.99,
    vehicleName: '2020 Toyota Camry',
    date: '2025-05-15',
    time: '10:00 AM',
    status: 'completed',
    bookingId: 'BK1234',
    hasReview: true,
    rating: 5
  },
  {
    id: 'b2',
    mechanicId: '2',
    mechanicName: 'Maria Rodriguez',
    mechanicPhoto: 'https://randomuser.me/api/portraits/women/2.jpg',
    serviceId: 's1',
    serviceName: 'Oil Change',
    servicePrice: 49.99,
    vehicleName: '2020 Toyota Camry',
    date: '2025-05-25',
    time: '2:00 PM',
    status: 'confirmed',
    bookingId: 'BK1235',
    hasReview: false
  },
  {
    id: 'b3',
    mechanicId: '3',
    mechanicName: 'David Chen',
    mechanicPhoto: 'https://randomuser.me/api/portraits/men/3.jpg',
    serviceId: 's3',
    serviceName: 'Engine Diagnostics',
    servicePrice: 89.99,
    vehicleName: '2019 Honda Civic',
    date: '2025-05-10',
    time: '11:30 AM',
    status: 'completed',
    bookingId: 'BK1236',
    hasReview: false
  },
  {
    id: 'b4',
    mechanicId: '1',
    mechanicName: 'John Smith',
    mechanicPhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
    serviceId: 's4',
    serviceName: 'Transmission Service',
    servicePrice: 149.99,
    vehicleName: '2019 Honda Civic',
    date: '2025-06-05',
    time: '9:00 AM',
    status: 'pending',
    bookingId: 'BK1237',
    hasReview: false
  }
];

const ServiceHistoryScreen: React.FC = () => {
  const navigation = useNavigation<ServiceHistoryNavigationProp>();
  const dispatch = useAppDispatch();
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming'); // 'upcoming' or 'past'
  
  useEffect(() => {
    // In a real app, we would fetch the service history from an API
    // For now, we'll use mock data
    setServiceHistory(mockServiceHistory);
  }, []);
  
  const upcomingServices = serviceHistory.filter(service => 
    service.status === 'pending' || service.status === 'confirmed' || service.status === 'in-progress'
  );
  
  const pastServices = serviceHistory.filter(service => 
    service.status === 'completed' || service.status === 'cancelled'
  );
  
  const handleServicePress = (service: ServiceHistoryItem): void => {
    navigation.navigate('ServiceDetails', { bookingId: service.bookingId });
  };
  
  const handleWriteReview = (service: ServiceHistoryItem): void => {
    navigation.navigate('WriteReview', { 
      mechanicId: service.mechanicId,
      serviceId: service.serviceId,
      bookingId: service.bookingId
    });
  };
  
  const getStatusColor = (status: ServiceHistoryItem['status']): string => {
    switch (status) {
      case 'pending': return '#FFA500'; // Orange
      case 'confirmed': return '#007bff'; // Blue
      case 'in-progress': return '#9C27B0'; // Purple
      case 'completed': return '#4CAF50'; // Green
      case 'cancelled': return '#F44336'; // Red
      default: return '#999'; // Gray
    }
  };
  
  const getStatusText = (status: ServiceHistoryItem['status']): string => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };
  
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const renderServiceItem = ({ item }: { item: ServiceHistoryItem }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => handleServicePress(item)}
    >
      <View style={styles.serviceHeader}>
        <View style={styles.mechanicInfo}>
          <Image source={{ uri: item.mechanicPhoto }} style={styles.mechanicPhoto} />
          <View>
            <Text style={styles.mechanicName}>{item.mechanicName}</Text>
            <Text style={styles.serviceName}>{item.serviceName}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.serviceDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="car-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.vehicleName}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.detailText}>${item.servicePrice.toFixed(2)}</Text>
        </View>
      </View>
      
      {item.status === 'completed' && !item.hasReview && (
        <TouchableOpacity 
          style={styles.writeReviewButton}
          onPress={() => handleWriteReview(item)}
        >
          <Ionicons name="star-outline" size={16} color="#FFD700" />
          <Text style={styles.writeReviewText}>Write a Review</Text>
        </TouchableOpacity>
      )}
      
      {item.hasReview && (
        <View style={styles.reviewContainer}>
          <Text style={styles.reviewedText}>You rated:</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <Ionicons 
                key={star}
                name={star <= (item.rating || 0) ? "star" : "star-outline"} 
                size={16} 
                color="#FFD700" 
              />
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Service History</Text>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming ({upcomingServices.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past ({pastServices.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Service List */}
      <FlatList
        data={activeTab === 'upcoming' ? upcomingServices : pastServices}
        renderItem={renderServiceItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.serviceList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' 
                ? 'No upcoming services' 
                : 'No past services'}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity 
                style={styles.bookServiceButton}
                onPress={() => navigation.navigate('MechanicMap')}
              >
                <Text style={styles.bookServiceText}>Book a Service</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40, // For status bar
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  serviceList: {
    padding: 16,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mechanicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mechanicPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  mechanicName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  serviceDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 8,
  },
  writeReviewText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  reviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  reviewedText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 20,
  },
  bookServiceButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookServiceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ServiceHistoryScreen;
