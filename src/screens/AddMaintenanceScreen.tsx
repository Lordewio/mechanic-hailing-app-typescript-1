import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Switch, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addCustomSchedule } from '../store/slices/maintenanceSlice';
import { AppDispatch } from '../store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/AppNavigator';

type AddMaintenanceScreenNavigationProp = StackNavigationProp<MainStackParamList, 'AddMaintenance'>;
type AddMaintenanceScreenRouteProp = RouteProp<MainStackParamList, 'AddMaintenance'>;

interface AddMaintenanceScreenProps {
  route: AddMaintenanceScreenRouteProp;
  navigation: AddMaintenanceScreenNavigationProp;
}

const AddMaintenanceScreen: React.FC<AddMaintenanceScreenProps> = ({ route, navigation }) => {
  const { vehicleId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [serviceItem, setServiceItem] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [useDueDate, setUseDueDate] = useState(false);
  const [dueMileage, setDueMileage] = useState('');
  const [useDueMileage, setUseDueMileage] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringMonths, setRecurringMonths] = useState('');
  const [recurringMileage, setRecurringMileage] = useState('');
  const [notes, setNotes] = useState('');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const validateForm = () => {
    if (!serviceItem.trim()) {
      Alert.alert('Error', 'Please enter a service item name');
      return false;
    }
    
    if (!useDueDate && !useDueMileage) {
      Alert.alert('Error', 'Please specify either a due date or mileage');
      return false;
    }
    
    if (useDueMileage && !dueMileage) {
      Alert.alert('Error', 'Please enter a due mileage');
      return false;
    }
    
    if (isRecurring && !recurringMonths && !recurringMileage) {
      Alert.alert('Error', 'Please specify a recurring interval');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !vehicleId) return;
    
    setLoading(true);
    
    try {
      const scheduleData: any = {
        serviceItem,
        notes,
        isRecurring,
      };
      
      if (useDueDate) {
        scheduleData.dueDate = dueDate;
      } else {
        scheduleData.dueDate = null;
      }
      
      if (useDueMileage) {
        scheduleData.dueMileageKm = parseInt(dueMileage, 10);
      } else {
        scheduleData.dueMileageKm = null;
      }
      
      if (isRecurring) {
        if (recurringMonths) {
          scheduleData.recurringIntervalMonths = parseInt(recurringMonths, 10);
        }
        
        if (recurringMileage) {
          scheduleData.recurringIntervalKm = parseInt(recurringMileage, 10);
        }
      }
      
      await dispatch(addCustomSchedule({ vehicleId, scheduleData })).unwrap();
      
      Alert.alert(
        'Success',
        'Maintenance schedule added successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.toString());
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Add Maintenance Schedule</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Service Item *</Text>
              <TextInput
                style={styles.input}
                value={serviceItem}
                onChangeText={setServiceItem}
                placeholder="e.g., Oil Change, Tire Rotation"
              />
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Set Due Date</Text>
              <Switch
                value={useDueDate}
                onValueChange={setUseDueDate}
                trackColor={{ false: '#ccc', true: '#007bff' }}
                thumbColor="#fff"
              />
            </View>
            
            {useDueDate && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Due Date</Text>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>{dueDate.toLocaleDateString()}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>
            )}
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Set Due Mileage</Text>
              <Switch
                value={useDueMileage}
                onValueChange={setUseDueMileage}
                trackColor={{ false: '#ccc', true: '#007bff' }}
                thumbColor="#fff"
              />
            </View>
            
            {useDueMileage && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Due Mileage (km)</Text>
                <TextInput
                  style={styles.input}
                  value={dueMileage}
                  onChangeText={setDueMileage}
                  placeholder="e.g., 10000"
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>
          
          <View style={styles.formSection}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Recurring Maintenance</Text>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: '#ccc', true: '#007bff' }}
                thumbColor="#fff"
              />
            </View>
            
            {isRecurring && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Repeat Every (months)</Text>
                  <TextInput
                    style={styles.input}
                    value={recurringMonths}
                    onChangeText={setRecurringMonths}
                    placeholder="e.g., 6"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Repeat Every (km)</Text>
                  <TextInput
                    style={styles.input}
                    value={recurringMileage}
                    onChangeText={setRecurringMileage}
                    placeholder="e.g., 10000"
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes or instructions"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Add Maintenance Schedule</Text>
          </TouchableOpacity>
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
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  dateInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AddMaintenanceScreen;
