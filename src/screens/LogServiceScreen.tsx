import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { logCompletedService, updateScheduleStatus } from '../store/slices/maintenanceSlice';
import { AppDispatch } from '../store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/AppNavigator';

type LogServiceScreenNavigationProp = StackNavigationProp<MainStackParamList, 'LogService'>;
type LogServiceScreenRouteProp = RouteProp<MainStackParamList, 'LogService'>;

interface LogServiceScreenProps {
  route: LogServiceScreenRouteProp;
  navigation: LogServiceScreenNavigationProp;
}

interface PrefilledData {
  serviceItem?: string;
  notes?: string;
  scheduleId?: string;
}

const LogServiceScreen: React.FC<LogServiceScreenProps> = ({ route, navigation }) => {
  const { vehicleId, prefilledData } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [serviceItem, setServiceItem] = useState((prefilledData as PrefilledData)?.serviceItem || '');
  const [serviceDate, setServiceDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mileage, setMileage] = useState('');
  const [cost, setCost] = useState('');
  const [providerName, setProviderName] = useState('');
  const [notes, setNotes] = useState((prefilledData as PrefilledData)?.notes || '');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setServiceDate(selectedDate);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant camera roll permissions to upload a receipt image.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const validateForm = () => {
    if (!serviceItem.trim()) {
      Alert.alert('Error', 'Please enter a service item name');
      return false;
    }
    
    if (!mileage) {
      Alert.alert('Error', 'Please enter the current mileage');
      return false;
    }
    
    return true;
  };

  const uploadReceiptImage = async (uri: string) => {
    if (!uri) return null;
    
    setUploadingImage(true);
    try {
      // In a real implementation, this would upload to Firebase Storage
      // For now, we'll simulate a successful upload and return a fake URL
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      return `https://firebasestorage.example.com/receipts/${Date.now()}.jpg`;
    } catch (error: any) {
      throw new Error('Failed to upload receipt image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm() || !vehicleId) return;
    
    setLoading(true);
    
    try {
      let receiptImageUrl = null;
      
      if (receiptImage) {
        receiptImageUrl = await uploadReceiptImage(receiptImage);
      }
      
      const logData: any = {
        serviceItem,
        serviceDate,
        mileageKm: parseInt(mileage, 10),
        notes
      };
      
      if (cost) {
        logData.cost = parseFloat(cost);
      }
      
      if (providerName) {
        logData.mechanicName = providerName;
      }
      
      if (receiptImageUrl) {
        logData.receiptUrl = receiptImageUrl;
      }
      
      // If this was from a maintenance schedule, add the relation
      if ((prefilledData as PrefilledData)?.scheduleId) {
        logData.relatedScheduleId = (prefilledData as PrefilledData).scheduleId;
      }
      
      await dispatch(logCompletedService({ 
        vehicleId, 
        logData,
        receiptImageUri: receiptImage
      })).unwrap();
      
      // If this was from a maintenance schedule, mark it as completed
      if ((prefilledData as PrefilledData)?.scheduleId) {
        await dispatch(updateScheduleStatus({
          vehicleId,
          scheduleId: (prefilledData as PrefilledData).scheduleId as string,
          status: 'Completed'
        })).unwrap();
      }
      
      Alert.alert(
        'Success',
        'Service log added successfully',
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
        <Text style={styles.headerTitle}>Log Completed Service</Text>
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
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Service Date</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{serviceDate.toLocaleDateString()}</Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={serviceDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Mileage (km) *</Text>
              <TextInput
                style={styles.input}
                value={mileage}
                onChangeText={setMileage}
                placeholder="e.g., 15000"
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Service Provider</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Provider Name</Text>
              <TextInput
                style={styles.input}
                value={providerName}
                onChangeText={setProviderName}
                placeholder="e.g., City Auto Shop"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cost ($)</Text>
              <TextInput
                style={styles.input}
                value={cost}
                onChangeText={setCost}
                placeholder="e.g., 75.50"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes about the service"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Receipt Image</Text>
              
              {receiptImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image 
                    source={{ uri: receiptImage }} 
                    style={styles.imagePreview} 
                    resizeMode="cover"
                  />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => setReceiptImage(null)}
                  >
                    <Ionicons name="close-circle" size={24} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={pickImage}
                >
                  <Ionicons name="camera-outline" size={24} color="#007bff" />
                  <Text style={styles.uploadButtonText}>Upload Receipt</Text>
                </TouchableOpacity>
              )}
              
              {uploadingImage && (
                <ActivityIndicator size="small" color="#007bff" style={styles.uploadingIndicator} />
              )}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Log Completed Service</Text>
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
  uploadButton: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#007bff',
    fontSize: 16,
    marginLeft: 10,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: 5,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
  },
  uploadingIndicator: {
    marginTop: 10,
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

export default LogServiceScreen;
