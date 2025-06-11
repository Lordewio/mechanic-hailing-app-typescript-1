import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateMaintenanceSchedule, MaintenanceSchedule } from '../store/slices/maintenanceSlice';
import { RootState, AppDispatch } from '../store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/AppNavigator';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

type EditMaintenanceScreenNavigationProp = StackNavigationProp<MainStackParamList, 'EditMaintenance'>;
type EditMaintenanceScreenRouteProp = RouteProp<MainStackParamList, 'EditMaintenance'>;

interface EditMaintenanceScreenProps {
  route: EditMaintenanceScreenRouteProp;
  navigation: EditMaintenanceScreenNavigationProp;
}

const EditMaintenanceScreen: React.FC<EditMaintenanceScreenProps> = ({ route, navigation }) => {
  const { item: scheduleToEdit } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const { loadingAction: loading, error } = useSelector((state: RootState) => state.maintenance);
  const selectedVehicle = useSelector((state: RootState) => state.vehicle.selectedVehicle);

  const [serviceItem, setServiceItem] = useState(scheduleToEdit?.serviceItem || '');
  const [dueDate, setDueDate] = useState<Date>(() => {
    if (!scheduleToEdit?.dueDate) return new Date();
    
    if (scheduleToEdit.dueDate instanceof Date) {
      return scheduleToEdit.dueDate;
    }
    
    // Handle Firestore Timestamp
    if ('seconds' in scheduleToEdit.dueDate) {
      return new Date(scheduleToEdit.dueDate.seconds * 1000);
    }
    
    return new Date();
  });
  
  const [dueMileageKm, setDueMileageKm] = useState(scheduleToEdit?.dueMileageKm?.toString() || '');
  const [notes, setNotes] = useState(scheduleToEdit?.notes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!scheduleToEdit) {
      Alert.alert("Error", "No maintenance schedule data provided for editing.");
      navigation.goBack();
    }
  }, [scheduleToEdit, navigation]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleUpdateSchedule = () => {
    if (!selectedVehicle?.id || !scheduleToEdit?.id) {
      Alert.alert("Error", "Vehicle ID or Schedule ID is missing.");
      return;
    }
    if (!serviceItem) {
      Alert.alert("Validation Error", "Please enter the service item.");
      return;
    }

    const updatedScheduleData: Partial<MaintenanceSchedule> = {
      serviceItem,
      dueDate: dueDate,
      dueMileageKm: dueMileageKm ? parseInt(dueMileageKm, 10) : null,
      notes,
      // Keep other fields like status if needed, or let backend handle it
    };

    dispatch(updateMaintenanceSchedule({ 
      vehicleId: selectedVehicle.id, 
      scheduleId: scheduleToEdit.id, 
      data: updatedScheduleData 
    }))
      .unwrap()
      .then(() => {
        Alert.alert("Success", "Maintenance schedule updated successfully.");
        navigation.goBack(); // Go back to the previous screen (likely details or list)
      })
      .catch((updateError: any) => {
        Alert.alert("Error", `Failed to update schedule: ${updateError}`);
      });
  };

  if (!scheduleToEdit) {
    // Render loading or null while checking scheduleToEdit
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Maintenance Schedule</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Service Item *</Text>
        <TextInput
          style={styles.input}
          value={serviceItem}
          onChangeText={setServiceItem}
          placeholder="e.g., Oil Change, Tire Rotation"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>{dueDate.toLocaleDateString()}</Text>
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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Due Mileage (km)</Text>
        <TextInput
          style={styles.input}
          value={dueMileageKm}
          onChangeText={setDueMileageKm}
          placeholder="e.g., 150000"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional details or reminders"
          multiline
        />
      </View>

      {error && <Text style={styles.errorText}>Error: {error}</Text>}

      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleUpdateSchedule}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Schedule</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#a0cfff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditMaintenanceScreen;
