// src/screens/BookServiceScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'; // For date selection
import { useAppSelector, useAppDispatch } from '../../store'; // Use typed hooks
import { RootStackParamList } from '../../navigation/AppNavigator'; // Import ParamList
import { Vehicle } from '../../store/slices/vehicleSlice'; // Import Vehicle type
import { Mechanic } from '../../store/slices/mechanicSlice'; // Import Mechanic type (assuming it exists)
import { Service } from '../../store/slices/mechanicSlice'; // Import Service type (assuming it exists)
import { addBooking } from '../../store/slices/tripSlice'; // Assuming booking action exists
import { Booking } from '../../store/slices/tripSlice'; // Import Booking type

// --- Type Definitions ---

type BookServiceScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BookService'
>;

type BookServiceScreenRouteProp = RouteProp<
  RootStackParamList,
  'BookService'
>;

// --- Mock Data (Replace with Redux/API data) ---
// TODO: Fetch actual mechanic and vehicle data from Redux store or API
const mockMechanic: Mechanic = {
  id: '1',
  name: 'John Smith',
  photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
  specializations: ['Engine Repair', 'Transmission', 'Diagnostics'],
  rating: 4.5,
  location: { latitude: 37.7749, longitude: -122.4194 }, // Example location
  services: [
    {
      id: 's1',
      name: 'Oil Change',
      description: 'Full synthetic oil change with filter replacement',
      price: 49.99,
      duration: 30 // minutes
    },
    {
      id: 's2',
      name: 'Brake Service',
      description: 'Brake pad replacement and rotor inspection',
      price: 199.99,
      duration: 90
    },
    {
      id: 's3',
      name: 'Engine Diagnostics',
      description: 'Full computer diagnostics with OBD2 scan',
      price: 89.99,
      duration: 60
    },
    {
      id: 's4',
      name: 'Transmission Service',
      description: 'Transmission fluid flush and filter replacement',
      price: 149.99,
      duration: 120
    }
  ],
};

const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    userId: 'user1',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    licensePlate: 'ABC123',
    vin: 'VIN123',
    color: 'Silver',
    nickname: 'My Camry',
    currentMileage: 50000,
    // photoUrl: 'https://example.com/toyota-camry.jpg'
  },
  {
    id: 'v2',
    userId: 'user1',
    make: 'Honda',
    model: 'Civic',
    year: 2019,
    licensePlate: 'XYZ789',
    vin: 'VIN456',
    color: 'Blue',
    nickname: 'Blue Honda',
    currentMileage: 35000,
    // photoUrl: 'https://example.com/honda-civic.jpg'
  }
];

const BookServiceScreen = () => {
  const navigation = useNavigation<BookServiceScreenNavigationProp>();
  const route = useRoute<BookServiceScreenRouteProp>();
  const dispatch = useAppDispatch();
  const { mechanicId, serviceId } = route.params || {};

  // TODO: Replace mock data with data fetched from Redux/API
  // const vehicles = useAppSelector(state => state.vehicle.vehicles);
  // const mechanic = useAppSelector(state => state.mechanic.mechanics.find(m => m.id === mechanicId));
  const vehicles = mockVehicles; // Using mock for now
  const [mechanic, setMechanic] = useState<Mechanic | null>(null);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('10:00'); // Use 24hr format internally?
  const [description, setDescription] = useState<string>('');
  const [attachDiagnostics, setAttachDiagnostics] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Available time slots (adjust as needed)
  const timeSlots: string[] = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  useEffect(() => {
    // Fetch mechanic details (using mock for now)
    // In real app: dispatch(fetchMechanicDetails(mechanicId));
    setMechanic(mockMechanic);

    // Pre-select service if passed via params
    if (serviceId && mockMechanic) {
      const service = mockMechanic.services?.find(s => s.id === serviceId);
      if (service) {
        setSelectedService(service);
      }
    }

    // Default to first vehicle
    if (vehicles.length > 0) {
      setSelectedVehicle(vehicles[0]);
    }
  }, [mechanicId, serviceId, vehicles]); // Add vehicles dependency

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS until dismissed
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeSelection = (time: string) => {
    setSelectedTime(time);
  };

  const handleServiceSelection = (service: Service) => {
    setSelectedService(service);
  };

  const handleVehicleSelection = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleBookService = () => {
    if (!selectedService) {
      Alert.alert('Error', 'Please select a service');
      return;
    }
    if (!selectedVehicle) {
      Alert.alert('Error', 'Please select a vehicle');
      return;
    }
    if (!mechanic) {
      Alert.alert('Error', 'Mechanic details not found');
      return;
    }

    // Combine date and time
    const [hour, minute] = selectedTime.split(':').map(Number);
    const bookingDateTime = new Date(selectedDate);
    bookingDateTime.setHours(hour, minute, 0, 0);

    const bookingDetails: Omit<Booking, 'id' | 'createdAt'> = {
      mechanicId: mechanic.id,
      mechanicName: mechanic.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      vehicleId: selectedVehicle.id,
      vehicleMake: selectedVehicle.make,
      vehicleModel: selectedVehicle.model,
      vehicleYear: selectedVehicle.year,
      bookingTime: bookingDateTime.toISOString(), // Store as ISO string
      userDescription: description,
      attachDiagnosticsData: attachDiagnostics,
      status: 'Pending',
      // Add userId from auth state
      userId: 'mockUserId', // Replace with actual user ID
    };

    // Dispatch action to save the booking (replace with actual thunk)
    // dispatch(addBooking(bookingDetails));
    console.log("Booking Details:", bookingDetails);

    Alert.alert(
      'Booking Successful',
      `Your service for ${selectedVehicle.make} ${selectedVehicle.model} has been booked with ${mechanic.name} for ${formatDate(selectedDate)} at ${formatTime(selectedTime)}.`, // Use formatted time
      [
        {
          text: 'View Bookings',
          onPress: () => navigation.navigate('Trips') // Navigate to bookings/trips screen
        },
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  if (!mechanic) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading mechanic details...</Text>
      </View>
    );
  }

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Format time for display (e.g., 14:00 -> 2:00 PM)
  const formatTime = (time24: string): string => {
      const [hour, minute] = time24.split(':').map(Number);
      const date = new Date();
      date.setHours(hour, minute);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Generate dates for the next 7 days
  const getNextSevenDays = (): Date[] => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start from today
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const renderDateOption = (date: Date) => {
    const isSelected = selectedDate.toDateString() === date.toDateString();
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = date.getDate();

    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[styles.dateOption, isSelected && styles.dateOptionSelected]}
        onPress={() => setSelectedDate(date)} // Directly set date
      >
        <Text style={[styles.dayName, isSelected && styles.dateTextSelected]}>{dayName}</Text>
        <Text style={[styles.dayNumber, isSelected && styles.dateTextSelected]}>{dayNumber}</Text>
      </TouchableOpacity>
    );
  };

  const renderTimeOption = (time: string) => {
    const isSelected = selectedTime === time;

    return (
      <TouchableOpacity
        key={time}
        style={[styles.timeOption, isSelected && styles.timeOptionSelected]}
        onPress={() => handleTimeSelection(time)}
      >
        <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>{formatTime(time)}</Text>
      </TouchableOpacity>
    );
  };

  const renderServiceOption = (service: Service) => {
    const isSelected = selectedService?.id === service.id;

    return (
      <TouchableOpacity
        key={service.id}
        style={[styles.serviceOption, isSelected && styles.serviceOptionSelected]}
        onPress={() => handleServiceSelection(service)}
      >
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.servicePrice}>${service.price.toFixed(2)}</Text>
        </View>
        <Text style={styles.serviceDescription}>{service.description}</Text>
        <View style={styles.serviceMeta}>
          <View style={styles.durationContainer}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.durationText}>{service.duration} min</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderVehicleOption = (vehicle: Vehicle) => {
    const isSelected = selectedVehicle?.id === vehicle.id;

    return (
      <TouchableOpacity
        key={vehicle.id}
        style={[styles.vehicleOption, isSelected && styles.vehicleOptionSelected]}
        onPress={() => handleVehicleSelection(vehicle)}
      >
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>{vehicle.year} {vehicle.make} {vehicle.model}</Text>
          <Text style={styles.vehiclePlate}>{vehicle.licensePlate}</Text>
          {vehicle.color && <Text style={styles.vehicleColor}>{vehicle.color}</Text>}
        </View>
        {isSelected && (
          <View style={styles.selectedCheck}>
            <Ionicons name="checkmark-circle" size={24} color="#007bff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Mechanic Info */}
        <View style={styles.mechanicSection}>
          <Image source={{ uri: mechanic.photoUrl }} style={styles.mechanicPhoto} />
          <View style={styles.mechanicInfo}>
            <Text style={styles.mechanicName}>{mechanic.name}</Text>
            <Text style={styles.mechanicSpecialties}>{mechanic.specializations?.join(', ')}</Text>
          </View>
        </View>

        {/* Service Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Service</Text>
          {mechanic.services?.map(service => renderServiceOption(service))}
        </View>

        {/* Vehicle Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Vehicle</Text>
          {vehicles.map(vehicle => renderVehicleOption(vehicle))}
          <TouchableOpacity
            style={styles.addVehicleButton}
            // onPress={() => navigation.navigate('AddVehicle')} // Assuming AddVehicle screen exists
          >
            <Ionicons name="add-circle-outline" size={20} color="#007bff" />
            <Text style={styles.addVehicleText}>Add New Vehicle</Text>
          </TouchableOpacity>
        </View>

        {/* Date Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateDisplay}>
             <Text style={styles.dateDisplayText}>{formatDate(selectedDate)}</Text>
             <Ionicons name="calendar-outline" size={20} color="#007bff" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()} // Cannot select past dates
            />
          )}
          {/* Optional: Keep horizontal scroll for quick selection */}
          {/* <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateOptions}
          >
            {getNextSevenDays().map(date => renderDateOption(date))}
          </ScrollView> */}
        </View>

        {/* Time Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeOptions}>
            {timeSlots.map(time => renderTimeOption(time))}
          </View>
        </View>

        {/* Problem Description */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Describe Your Problem (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe the issue with your vehicle..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Attach Diagnostics */}
        <TouchableOpacity
          style={styles.attachDiagnosticsContainer}
          onPress={() => setAttachDiagnostics(!attachDiagnostics)}
        >
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, attachDiagnostics && styles.checkboxChecked]}>
              {attachDiagnostics && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </View>
          <View style={styles.attachDiagnosticsInfo}>
            <Text style={styles.attachDiagnosticsTitle}>Attach Diagnostic Data</Text>
            <Text style={styles.attachDiagnosticsDescription}>
              Share your vehicle's diagnostic data with the mechanic to help diagnose the issue.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Price Summary */}
        {selectedService && (
          <View style={styles.priceSummary}>
            <Text style={styles.priceSummaryTitle}>Price Summary</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{selectedService.name}</Text>
              <Text style={styles.priceValue}>${selectedService.price.toFixed(2)}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${selectedService.price.toFixed(2)}</Text>
            </View>
            <Text style={styles.priceNote}>
              * Final price may vary based on additional parts or services required.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bookNowButton}
          onPress={handleBookService}
          disabled={!selectedService || !selectedVehicle} // Disable if service or vehicle not selected
        >
          <Text style={styles.bookNowButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Styles (Keep existing styles, add new ones as needed) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
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
    paddingTop: Platform.OS === 'android' ? 25 : 40, // Adjust for status bar
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
  scrollContent: {
    paddingBottom: 80, // Space for bottom bar
  },
  mechanicSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  mechanicPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  mechanicInfo: {
    marginLeft: 12,
    justifyContent: 'center',
    flex: 1, // Allow text to wrap
  },
  mechanicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mechanicSpecialties: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  serviceOption: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  serviceOptionSelected: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1, // Allow wrapping
    marginRight: 8,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  vehicleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  vehicleOptionSelected: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  vehicleColor: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  selectedCheck: {
    marginLeft: 10,
  },
  addVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 5,
  },
  addVehicleText: {
    marginLeft: 8,
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
  dateDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  dateDisplayText: {
    fontSize: 16,
    color: '#333',
  },
  dateOptions: {
    paddingBottom: 10, // Add some padding
  },
  dateOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    minWidth: 60,
  },
  dateOptionSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dateTextSelected: {
    color: '#fff',
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    minWidth: '30%', // Adjust for layout
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  timeTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top', // For multiline
    minHeight: 100,
    marginBottom: 10,
  },
  attachDiagnosticsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  attachDiagnosticsInfo: {
    flex: 1,
  },
  attachDiagnosticsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  attachDiagnosticsDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  priceSummary: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  priceSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#555',
  },
  priceValue: {
    fontSize: 16,
    color: '#333',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  priceNote: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bookNowButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookNowButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookServiceScreen;

