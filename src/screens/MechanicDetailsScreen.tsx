// src/screens/MechanicDetailsScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ListRenderItemInfo,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";
import { MechanicStackParamList } from "../navigation/AppNavigator"; // Assuming a stack navigator for Mechanic related screens

// --- Type Definitions ---

type MechanicDetailsScreenRouteProp = RouteProp<
  MechanicStackParamList,
  "MechanicDetails"
>;
type MechanicDetailsScreenNavigationProp = NavigationProp<MechanicStackParamList>;

interface MechanicDetailsScreenProps {
  // Props if needed
}

// Define types for the data structures (align with Firestore/Supabase models eventually)
interface MechanicRating {
  average: number;
  count: number;
}

interface MechanicLocation {
  latitude: number;
  longitude: number;
  address: string;
}

interface WorkingHours {
  start: string;
  end: string;
}

interface MechanicWorkingHours {
  monday: WorkingHours;
  tuesday: WorkingHours;
  wednesday: WorkingHours;
  thursday: WorkingHours;
  friday: WorkingHours;
  saturday: WorkingHours;
  sunday: WorkingHours;
}

interface MechanicContactInfo {
  phone: string;
  email: string;
}

interface MechanicService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
}

interface MechanicReview {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  comment: string;
  date: string; // Consider using Date type
  serviceType: string;
}

interface MechanicDetails {
  id: string;
  name: string;
  photo: string;
  specializations: string[];
  experience: number;
  certifications: string[];
  rating: MechanicRating;
  distance: number;
  location: MechanicLocation;
  workingHours: MechanicWorkingHours;
  contactInfo: MechanicContactInfo;
  services: MechanicService[];
  isAvailable: boolean;
  reviews: MechanicReview[];
}

// Mock data (replace with API call)
const mockMechanicDetails: MechanicDetails = {
  id: "1",
  name: "John Smith",
  photo: "https://randomuser.me/api/portraits/men/1.jpg",
  specializations: ["Engine Repair", "Transmission", "Diagnostics"],
  experience: 12,
  certifications: ["ASE Master Technician", "BMW Certified", "Honda Factory Trained"],
  rating: { average: 4.8, count: 124 },
  distance: 1.2,
  location: {
    latitude: 37.7858,
    longitude: -122.4064,
    address: "123 Auto Lane, San Francisco, CA 94103",
  },
  workingHours: {
    monday: { start: "8:00 AM", end: "6:00 PM" },
    tuesday: { start: "8:00 AM", end: "6:00 PM" },
    wednesday: { start: "8:00 AM", end: "6:00 PM" },
    thursday: { start: "8:00 AM", end: "6:00 PM" },
    friday: { start: "8:00 AM", end: "6:00 PM" },
    saturday: { start: "9:00 AM", end: "3:00 PM" },
    sunday: { start: "Closed", end: "Closed" },
  },
  contactInfo: {
    phone: "(555) 123-4567",
    email: "john.smith@automechanic.com",
  },
  services: [
    { id: "s1", name: "Oil Change", description: "Full synthetic oil change with filter replacement", price: 49.99, duration: 30 },
    { id: "s2", name: "Brake Service", description: "Brake pad replacement and rotor inspection", price: 199.99, duration: 90 },
    { id: "s3", name: "Engine Diagnostics", description: "Full computer diagnostics with OBD2 scan", price: 89.99, duration: 60 },
    { id: "s4", name: "Transmission Service", description: "Transmission fluid flush and filter replacement", price: 149.99, duration: 120 },
  ],
  isAvailable: true,
  reviews: [
    { id: "r1", userId: "u1", userName: "Michael Wilson", userPhoto: "https://randomuser.me/api/portraits/men/32.jpg", rating: 5, comment: "John did an excellent job diagnosing and fixing my check engine light issue. Very professional and knowledgeable.", date: "2025-05-10", serviceType: "Engine Diagnostics" },
    { id: "r2", userId: "u2", userName: "Emily Johnson", userPhoto: "https://randomuser.me/api/portraits/women/28.jpg", rating: 4, comment: "Good service, fixed my brake issue quickly. A bit pricey but worth it for the quality work.", date: "2025-05-05", serviceType: "Brake Service" },
    { id: "r3", userId: "u3", userName: "Robert Davis", userPhoto: "https://randomuser.me/api/portraits/men/45.jpg", rating: 5, comment: "Very thorough and explained everything clearly. Will definitely use again for future maintenance.", date: "2025-04-28", serviceType: "Oil Change" },
  ],
};

// --- Screen Component ---

const MechanicDetailsScreen: React.FC<MechanicDetailsScreenProps> = () => {
  const navigation = useNavigation<MechanicDetailsScreenNavigationProp>();
  const route = useRoute<MechanicDetailsScreenRouteProp>();
  const { mechanicId } = route.params || { mechanicId: "1" }; // Default ID for mock

  const [mechanic, setMechanic] = useState<MechanicDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate fetching data
    setLoading(true);
    setTimeout(() => {
      // TODO: Replace with actual API call using mechanicId
      setMechanic(mockMechanicDetails);
      setLoading(false);
    }, 500);
  }, [mechanicId]);

  const handleBookService = useCallback((service?: MechanicService) => {
    if (!mechanic) return;
    navigation.navigate("BookService", {
      mechanicId: mechanic.id,
      serviceId: service ? service.id : undefined, // Pass undefined if no specific service
    });
  }, [navigation, mechanic]);

  const handleViewAllReviews = useCallback(() => {
    if (!mechanic) return;
    navigation.navigate("MechanicReviews", { mechanicId: mechanic.id });
  }, [navigation, mechanic]);

  const handleContactMechanic = useCallback(() => {
    if (!mechanic) return;
    // TODO: Implement actual contact functionality (chat/call)
    Alert.alert(`Contact ${mechanic.name}`, `Phone: ${mechanic.contactInfo.phone}`);
  }, [mechanic]);

  const handleGetDirections = useCallback(() => {
    if (!mechanic) return;
    // TODO: Implement navigation to map/directions feature
    // navigation.navigate("MechanicMap", { mechanicId: mechanic.id });
    Alert.alert("Get Directions", `Navigate to ${mechanic.location.address}`);
  }, [mechanic]);

  // --- Render Functions ---

  const renderServiceCard = useCallback(({ item }: ListRenderItemInfo<MechanicService>) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.servicePrice}>${item.price.toFixed(2)}</Text>
      </View>
      <Text style={styles.serviceDescription}>{item.description}</Text>
      <View style={styles.serviceMeta}>
        <View style={styles.durationContainer}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.durationText}>{item.duration} min</Text>
        </View>
        <TouchableOpacity
          style={styles.bookServiceButton}
          onPress={() => handleBookService(item)}
        >
          <Text style={styles.bookServiceButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [handleBookService]);

  const renderReviewCard = useCallback(({ item }: ListRenderItemInfo<MechanicReview>) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.userPhoto }} style={styles.reviewerPhoto} />
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{item.userName}</Text>
          <Text style={styles.reviewDate}>{item.date}</Text>
        </View>
        <View style={styles.reviewRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? "star" : "star-outline"}
              size={16}
              color="#FFD700"
            />
          ))}
        </View>
      </View>
      <Text style={styles.serviceType}>{item.serviceType}</Text>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  ), []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading mechanic details...</Text>
      </View>
    );
  }

  if (!mechanic) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Mechanic not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mechanic Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image source={{ uri: mechanic.photo }} style={styles.mechanicPhoto} />
          <View style={styles.profileInfo}>
            <Text style={styles.mechanicName}>{mechanic.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{mechanic.rating.average} ({mechanic.rating.count} reviews)</Text>
            </View>
            <View style={styles.distanceContainer}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.distanceText}>{mechanic.distance} miles away</Text>
            </View>
            <View style={styles.availabilityContainer}>
              <View style={[styles.availabilityDot, { backgroundColor: mechanic.isAvailable ? "#4CAF50" : "#F44336" }]} />
              <Text style={styles.availabilityText}>{mechanic.isAvailable ? "Available Now" : "Unavailable"}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleBookService()}>
            <Ionicons name="calendar-outline" size={24} color="#007bff" />
            <Text style={styles.actionButtonText}>Book</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleContactMechanic}>
            <Ionicons name="chatbubble-outline" size={24} color="#007bff" />
            <Text style={styles.actionButtonText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
            <Ionicons name="navigate-outline" size={24} color="#007bff" />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutItem}>
            <Ionicons name="briefcase-outline" size={18} color="#666" style={styles.aboutIcon} />
            <Text style={styles.aboutText}>{mechanic.experience} years of experience</Text>
          </View>
          <View style={styles.aboutItem}>
            <Ionicons name="medal-outline" size={18} color="#666" style={styles.aboutIcon} />
            <Text style={styles.aboutText}>{mechanic.certifications.join(", ")}</Text>
          </View>
          <View style={styles.aboutItem}>
            <Ionicons name="construct-outline" size={18} color="#666" style={styles.aboutIcon} />
            <Text style={styles.aboutText}>{mechanic.specializations.join(", ")}</Text>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapPlaceholder}>
            {/* TODO: Replace with actual MapView component */}
            <Text style={styles.mapPlaceholderText}>Map View Placeholder</Text>
            <Text style={styles.addressText}>{mechanic.location.address}</Text>
          </View>
        </View>

        {/* Working Hours Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Working Hours</Text>
          {Object.entries(mechanic.workingHours).map(([day, hours]) => (
            <View key={day} style={styles.hoursItem}>
              <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
              <Text style={styles.hoursText}>{hours.start === "Closed" ? "Closed" : `${hours.start} - ${hours.end}`}</Text>
            </View>
          ))}
        </View>

        {/* Services Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Services</Text>
          <FlatList
            data={mechanic.services}
            renderItem={renderServiceCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // Disable scrolling if inside ScrollView
          />
        </View>

        {/* Reviews Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity onPress={handleViewAllReviews}>
              <Text style={styles.viewAllText}>View All ({mechanic.rating.count})</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={mechanic.reviews.slice(0, 3)} // Show first 3 reviews
            renderItem={renderReviewCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // Disable scrolling if inside ScrollView
          />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bookNowButton} onPress={() => handleBookService()}>
          <Text style={styles.bookNowButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles remain the same
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
    paddingBottom: 80, // Space for bottom bar
  },
  profileSection: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  mechanicPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  mechanicName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  distanceText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  availabilityText: {
    fontSize: 14,
    color: "#666",
  },
  quickActions: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actionButton: {
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#007bff",
    marginTop: 4,
  },
  sectionContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: "#007bff",
  },
  aboutItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  aboutIcon: {
    marginRight: 8,
  },
  aboutText: {
    fontSize: 14,
    color: "#666",
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: "#e1e4e8",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: "#666",
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  hoursItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dayText: {
    fontSize: 14,
    color: "#333",
  },
  hoursText: {
    fontSize: 14,
    color: "#666",
  },
  serviceCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  bookServiceButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bookServiceButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  reviewCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
  },
  reviewRating: {
    flexDirection: "row",
  },
  serviceType: {
    fontSize: 12,
    color: "#007bff",
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: "#666",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  bookNowButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  bookNowButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default MechanicDetailsScreen;
