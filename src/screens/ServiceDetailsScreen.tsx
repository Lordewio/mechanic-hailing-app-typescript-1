// src/screens/ServiceDetailsScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";
import { MechanicStackParamList } from "../navigation/AppNavigator"; // Adjust path if needed

// --- Type Definitions ---

type ServiceDetailsScreenRouteProp = RouteProp<
  MechanicStackParamList,
  "ServiceDetails"
>;
type ServiceDetailsScreenNavigationProp = NavigationProp<MechanicStackParamList>;

interface ServiceDetailsScreenProps {
  // Props if needed
}

// Define types for the data structures
interface ServiceLocation {
  address: string;
  latitude: number;
  longitude: number;
}

interface DiagnosticData {
  codes: string[];
  descriptions: string[];
  readDate: string; // Consider using Date type
}

type ServiceStatus = "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";

interface ServiceDetailsData {
  id: string;
  mechanicId: string;
  mechanicName: string;
  mechanicPhoto: string;
  mechanicPhone: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  date: string; // Consider using Date type
  time: string;
  description: string | null;
  attachedDiagnostics: boolean;
  status: ServiceStatus;
  bookingId: string;
  createdAt: string; // Consider using Date type
  updatedAt: string; // Consider using Date type
  location: ServiceLocation;
  diagnosticData: DiagnosticData | null;
}

// Mock data (replace with API call)
const mockServiceDetails: ServiceDetailsData = {
  id: "b1",
  mechanicId: "1",
  mechanicName: "John Smith",
  mechanicPhoto: "https://randomuser.me/api/portraits/men/1.jpg",
  mechanicPhone: "(555) 123-4567",
  serviceId: "s2",
  serviceName: "Brake Service",
  servicePrice: 199.99,
  vehicleId: "v1",
  vehicleName: "2020 Toyota Camry",
  vehiclePlate: "ABC123",
  date: "2025-05-25",
  time: "10:00 AM",
  description: "My brakes are squeaking and the pedal feels soft when pressed.",
  attachedDiagnostics: true,
  status: "confirmed",
  bookingId: "BK1234",
  createdAt: "2025-05-20T14:30:00Z",
  updatedAt: "2025-05-20T15:00:00Z",
  location: {
    address: "123 Auto Lane, San Francisco, CA 94103",
    latitude: 37.7858,
    longitude: -122.4064,
  },
  diagnosticData: {
    codes: ["C0046", "P0420"],
    descriptions: ["Brake Pressure Sensor Circuit", "Catalyst System Efficiency Below Threshold (Bank 1)"],
    readDate: "2025-05-19T10:15:00Z",
  },
};

// --- Helper Functions ---

const getStatusColor = (status: ServiceStatus): string => {
  switch (status) {
    case "pending": return "#FFA500"; // Orange
    case "confirmed": return "#007bff"; // Blue
    case "in-progress": return "#9C27B0"; // Purple
    case "completed": return "#4CAF50"; // Green
    case "cancelled": return "#F44336"; // Red
    default: return "#999"; // Gray
  }
};

const getStatusText = (status: ServiceStatus): string => {
  switch (status) {
    case "pending": return "Pending Confirmation";
    case "confirmed": return "Confirmed";
    case "in-progress": return "In Progress";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    default: return "Unknown";
  }
};

const formatDate = (dateString: string): string => {
  try {
    const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

// --- Screen Component ---

const ServiceDetailsScreen: React.FC<ServiceDetailsScreenProps> = () => {
  const navigation = useNavigation<ServiceDetailsScreenNavigationProp>();
  const route = useRoute<ServiceDetailsScreenRouteProp>();
  // const dispatch = useDispatch(); // Uncomment if needed
  const { bookingId } = route.params || { bookingId: "BK1234" }; // Default for mock

  const [serviceDetails, setServiceDetails] = useState<ServiceDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    // TODO: Replace with actual API call using bookingId
    setTimeout(() => {
      // Simulate finding the booking (in real app, fetch by bookingId)
      if (bookingId === mockServiceDetails.bookingId) {
          setServiceDetails(mockServiceDetails);
      } else {
          setServiceDetails(null); // Or handle not found state
      }
      setLoading(false);
    }, 500);
  }, [bookingId]);

  // --- Event Handlers ---

  const handleSendMessage = useCallback(() => {
    if (message.trim() === "" || !serviceDetails) return;
    // TODO: Implement actual message sending via API
    Alert.alert(`Message Sent`, `To ${serviceDetails.mechanicName}: ${message}`);
    setMessage("");
  }, [message, serviceDetails]);

  const handleCancelService = useCallback(() => {
    if (!serviceDetails) return;
    Alert.alert(
      "Cancel Service",
      "Are you sure you want to cancel this service booking?",
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Cancel Service",
          style: "destructive",
          onPress: () => {
            // TODO: Implement actual cancellation via API
            console.log(`Cancelling booking ${serviceDetails.bookingId}`);
            Alert.alert("Service Cancelled", "Your booking has been cancelled.");
            navigation.goBack();
          },
        },
      ]
    );
  }, [serviceDetails, navigation]);

  const handleRescheduleService = useCallback(() => {
    if (!serviceDetails) return;
    navigation.navigate("BookService", {
      mechanicId: serviceDetails.mechanicId,
      serviceId: serviceDetails.serviceId,
      isRescheduling: true,
      bookingId: serviceDetails.bookingId,
    });
  }, [navigation, serviceDetails]);

  const handleCallMechanic = useCallback(() => {
    if (!serviceDetails) return;
    // TODO: Implement actual phone call functionality
    Alert.alert(`Call Mechanic`, `Calling ${serviceDetails.mechanicName} at ${serviceDetails.mechanicPhone}`);
  }, [serviceDetails]);

  const handleViewMechanic = useCallback(() => {
    if (!serviceDetails) return;
    navigation.navigate("MechanicDetails", { mechanicId: serviceDetails.mechanicId });
  }, [navigation, serviceDetails]);

  const handleGetDirections = useCallback(() => {
    if (!serviceDetails) return;
    // TODO: Implement map directions functionality
    Alert.alert(`Get Directions`, `Navigating to ${serviceDetails.location.address}`);
  }, [serviceDetails]);

  const handleWriteReview = useCallback(() => {
    if (!serviceDetails) return;
    navigation.navigate("WriteReview", {
      mechanicId: serviceDetails.mechanicId,
      serviceId: serviceDetails.serviceId,
      bookingId: serviceDetails.bookingId,
    });
  }, [navigation, serviceDetails]);

  // --- Render Logic ---

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading service details...</Text>
      </View>
    );
  }

  if (!serviceDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Service booking not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.statusBar, { backgroundColor: getStatusColor(serviceDetails.status) }]}>
          <Text style={styles.statusText}>{getStatusText(serviceDetails.status)}</Text>
          <Text style={styles.bookingIdText}>Booking #{serviceDetails.bookingId}</Text>
        </View>

        <View style={styles.mechanicSection}>
          <Image source={{ uri: serviceDetails.mechanicPhoto }} style={styles.mechanicPhoto} />
          <View style={styles.mechanicInfo}>
            <Text style={styles.mechanicName}>{serviceDetails.mechanicName}</Text>
            <TouchableOpacity style={styles.viewMechanicButton} onPress={handleViewMechanic}>
              <Text style={styles.viewMechanicText}>View Profile</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={handleCallMechanic}>
            <Ionicons name="call" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service</Text>
            <Text style={styles.detailValue}>{serviceDetails.serviceName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehicle</Text>
            <Text style={styles.detailValue}>{serviceDetails.vehicleName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>License Plate</Text>
            <Text style={styles.detailValue}>{serviceDetails.vehiclePlate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(serviceDetails.date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{serviceDetails.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>${serviceDetails.servicePrice.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapPlaceholder}>
            {/* TODO: Replace with actual MapView component */}
            <Text style={styles.mapPlaceholderText}>Map View Placeholder</Text>
            <Text style={styles.addressText}>{serviceDetails.location.address}</Text>
          </View>
          <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
            <Ionicons name="navigate" size={18} color="#fff" />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {serviceDetails.description && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Problem Description</Text>
            <Text style={styles.descriptionText}>{serviceDetails.description}</Text>
          </View>
        )}

        {serviceDetails.attachedDiagnostics && serviceDetails.diagnosticData && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Diagnostic Data</Text>
            <View style={styles.diagnosticCodes}>
              {serviceDetails.diagnosticData.codes.map((code, index) => (
                <View key={code} style={styles.diagnosticCodeItem}>
                  <Text style={styles.diagnosticCode}>{code}</Text>
                  <Text style={styles.diagnosticDescription}>
                    {serviceDetails.diagnosticData?.descriptions[index] || "No description"}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.diagnosticDate}>
              Read on {new Date(serviceDetails.diagnosticData.readDate).toLocaleString()}
            </Text>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Message Mechanic</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            multiline
            numberOfLines={3}
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Text style={styles.sendButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>

        {serviceDetails.status === "confirmed" && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.rescheduleButton} onPress={handleRescheduleService}>
              <Ionicons name="calendar-outline" size={18} color="#007bff" />
              <Text style={styles.rescheduleButtonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelService}>
              <Ionicons name="close-circle-outline" size={18} color="#F44336" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {serviceDetails.status === "completed" && (
          <TouchableOpacity style={styles.writeReviewButton} onPress={handleWriteReview}>
            <Ionicons name="star-outline" size={18} color="#fff" />
            <Text style={styles.writeReviewButtonText}>Write a Review</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

// Styles remain largely the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40, // For status bar
    backgroundColor: "#007bff",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  statusBar: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  bookingIdText: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  mechanicSection: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  mechanicPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  mechanicInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  mechanicName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  viewMechanicButton: {
    alignSelf: "flex-start",
  },
  viewMechanicText: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "500",
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  detailsSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 8, // Adjust padding
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10, // Adjust padding
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "right",
    flexShrink: 1, // Allow text to shrink
  },
  sectionContainer: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  directionsButton: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  directionsButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  diagnosticCodes: {
    marginBottom: 8,
  },
  diagnosticCodeItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  diagnosticCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  diagnosticDescription: {
    fontSize: 14,
    color: "#666",
  },
  diagnosticDate: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 4,
  },
  messageInput: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    fontSize: 14,
    color: "#333",
    minHeight: 80, // Use minHeight
    textAlignVertical: "top",
    marginBottom: 12,
  },
  sendButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#a0cfff", // Lighter blue when disabled
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  actionsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 16,
    justifyContent: "space-between",
  },
  rescheduleButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 8,
  },
  rescheduleButtonText: {
    fontSize: 14,
    color: "#007bff",
    marginLeft: 8,
    fontWeight: "500",
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#F44336",
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#F44336",
    marginLeft: 8,
    fontWeight: "500",
  },
  writeReviewButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFC107", // Use a distinct color for review
    marginTop: 12,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  writeReviewButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
});

export default ServiceDetailsScreen;

