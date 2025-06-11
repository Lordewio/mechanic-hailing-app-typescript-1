// src/screens/MechanicScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput,
  ListRenderItemInfo,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useRoute, RouteProp } from "@react-navigation/native";
import { MainTabParamList } from "../navigation/AppNavigator"; // Import navigation types

// --- Type Definitions ---

interface MechanicScreenRouteParams {
  triggerReason?: "dtc" | "manual";
  problemDescription?: string;
  dtcCodes?: string[];
}

type MechanicScreenRouteProp = RouteProp<MainTabParamList & {
  Mechanic: MechanicScreenRouteParams;
}, "Mechanic">;

interface MechanicScreenProps {
  // Props if needed, currently using hooks for route/navigation
}

interface NearbyMechanic {
  id: number;
  name: string;
  rating: number;
  distance: string;
  specialties: string[];
  latitude: number;
  longitude: number;
}

interface ServiceHistoryItem {
  id: number;
  date: string;
  mechanic: string;
  service: string;
  status: "Completed" | "Cancelled" | "In Progress";
  cost: string;
}

type RequestStatus = null | "searching" | "found" | "en-route" | "arrived";
type ProblemType = "Check Engine Light" | "Battery/Electrical" | "Overheating" | "Other Issue" | null;

// --- Screen Component ---

const MechanicScreen: React.FC<MechanicScreenProps> = () => {
  const route = useRoute<MechanicScreenRouteProp>();
  
  // Use safe defaults with proper typing
  const initialParams: MechanicScreenRouteParams = route.params || {};

  const [activeTab, setActiveTab] = useState<"find" | "history">("find");
  const [requestStatus, setRequestStatus] = useState<RequestStatus>(null);
  const [problemDescription, setProblemDescription] = useState<string>(
    initialParams.problemDescription || ""
  );
  const [selectedProblemType, setSelectedProblemType] = useState<ProblemType>(
    initialParams.triggerReason === "dtc" ? "Check Engine Light" : null
  );
  const [nearbyMechanics, setNearbyMechanics] = useState<NearbyMechanic[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<NearbyMechanic | null>(null);

  // Mock user location
  const userLocation: Region = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  };

  // Mock service history
  const serviceHistory: ServiceHistoryItem[] = [
    {
      id: 1,
      date: "15 May 2025",
      mechanic: "John Smith",
      service: "Engine Diagnostics",
      status: "Completed",
      cost: "$85.00",
    },
    {
      id: 2,
      date: "28 Apr 2025",
      mechanic: "Maria Rodriguez",
      service: "Battery Replacement",
      status: "Completed",
      cost: "$120.00",
    },
  ];

  // Simulate filtering mechanics based on problem type
  const getFilteredMechanics = useCallback((problem: ProblemType): NearbyMechanic[] => {
    const baseMechanics: NearbyMechanic[] = [
      { id: 1, name: "John Smith", rating: 4.8, distance: "1.2 km", specialties: ["Engine", "Electrical"], latitude: 37.78925, longitude: -122.4344 },
      { id: 2, name: "Maria Rodriguez", rating: 4.9, distance: "2.5 km", specialties: ["Transmission", "Brakes"], latitude: 37.78625, longitude: -122.4304 },
      { id: 3, name: "David Chen", rating: 4.7, distance: "3.1 km", specialties: ["Diagnostics", "Electrical"], latitude: 37.79025, longitude: -122.4354 },
      { id: 4, name: "AutoCare Experts", rating: 4.6, distance: "1.8 km", specialties: ["Engine", "Diagnostics", "Brakes"], latitude: 37.78755, longitude: -122.4319 },
    ];

    if (!problem || problem === "Other Issue") return baseMechanics;

    let requiredSpecialty = "General";
    if (problem.includes("Engine")) requiredSpecialty = "Engine";
    if (problem.includes("Battery") || problem.includes("Electrical")) requiredSpecialty = "Electrical";
    if (problem.includes("Overheating")) requiredSpecialty = "Engine";
    if (problem.includes("Diagnostics")) requiredSpecialty = "Diagnostics";

    return baseMechanics.filter(
      (mech) =>
        mech.specialties.includes(requiredSpecialty) ||
        mech.specialties.includes("General")
    );
  }, []);

  // Update mechanics list when problem type changes
  useEffect(() => {
    setNearbyMechanics(getFilteredMechanics(selectedProblemType));
  }, [selectedProblemType, getFilteredMechanics]);

  // Effect to handle incoming parameters after initial render
  useEffect(() => {
    if (initialParams.triggerReason === "dtc" && initialParams.problemDescription) {
      setProblemDescription(initialParams.problemDescription);
      setSelectedProblemType("Check Engine Light");
      
      // Safely access dtcCodes with fallback
      const dtcCodesString = initialParams.dtcCodes?.join(", ") || "Unknown";
      
      Alert.alert(
        "Mechanic Request Initiated",
        `Request started due to detected DTCs: ${dtcCodesString}. Please confirm details and tap \'Request Mechanic\'.`
      );
    }
  }, [initialParams]);

  const handleProblemSelection = (problem: ProblemType) => {
    setSelectedProblemType(problem);
    // Update description only if it wasn't pre-filled by DTC
    if (initialParams.triggerReason !== "dtc") {
        setProblemDescription(problem || "");
    }
  };

  const handleRequestMechanic = () => {
    if (!selectedProblemType) {
      Alert.alert("Select Problem", "Please select the type of problem you are experiencing.");
      return;
    }
    setRequestStatus("searching");
    setTimeout(() => {
      const matchedMechanic = nearbyMechanics.length > 0 ? nearbyMechanics[0] : null;
      if (matchedMechanic) {
        setSelectedMechanic(matchedMechanic);
        setRequestStatus("found");
        setTimeout(() => setRequestStatus("en-route"), 3000);
        setTimeout(() => setRequestStatus("arrived"), 10000);
      } else {
        Alert.alert("No Mechanics Found", "Sorry, no mechanics specializing in this area are currently available.");
        setRequestStatus(null);
      }
    }, 2000);
  };

  const handleCallMechanic = () => {
    Alert.alert("Call Mechanic", "(Feature not fully implemented)");
  };

  const handleMessageMechanic = () => {
    if (selectedMechanic) {
      navigation.navigate("Chat", { mechanicName: selectedMechanic.name });
    } else {
      Alert.alert("Error", "No mechanic selected to message.");
    }
  };

  const handleCancelRequest = () => {
    setRequestStatus(null);
    setSelectedMechanic(null);
    // Reset problem type if needed, or keep it for potential re-request
    // setSelectedProblemType(null);
    // setProblemDescription("");
  };

  // --- Render Functions ---

  const renderFindTab = () => {
    if (requestStatus === "searching") {
      return (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.searchingText}>Searching for nearby mechanics...</Text>
          <Text style={styles.searchingSubtext}>
            Matching based on: {problemDescription || "General Request"}
          </Text>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRequest}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (selectedMechanic && requestStatus && ["found", "en-route", "arrived"].includes(requestStatus)) {
      return (
        <View style={styles.mechanicFoundContainer}>
          <View style={styles.mapContainer}>
            <MapView provider={PROVIDER_GOOGLE} style={styles.map} initialRegion={userLocation}>
              <Marker coordinate={userLocation} title="Your Location" pinColor="#007bff" />
              <Marker
                coordinate={{
                  latitude: selectedMechanic.latitude,
                  longitude: selectedMechanic.longitude,
                }}
                title={selectedMechanic.name}
                pinColor="#4CAF50"
              />
            </MapView>
          </View>

          <View style={styles.mechanicInfoCard}>
            <View style={styles.mechanicHeader}>
              <View style={styles.mechanicAvatar}>
                <Text style={styles.mechanicInitials}>
                  {selectedMechanic.name.split(" ").map((n) => n[0]).join("")}
                </Text>
              </View>
              <View style={styles.mechanicDetails}>
                <Text style={styles.mechanicName}>{selectedMechanic.name}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFC107" />
                  <Text style={styles.ratingText}>{selectedMechanic.rating}</Text>
                </View>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {requestStatus === "found" ? "Accepted" :
                   requestStatus === "en-route" ? "En Route" : "Arrived"}
                </Text>
              </View>
            </View>

            <View style={styles.etaContainer}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.etaText}>
                {requestStatus === "arrived" ? "Mechanic has arrived" : "ETA: 12 minutes (Simulated)"}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCallMechanic}>
                <Ionicons name="call" size={20} color="#007bff" />
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleMessageMechanic}>
                <Ionicons name="chatbubble" size={20} color="#007bff" />
                <Text style={styles.actionText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.cancelRequestButton]} onPress={handleCancelRequest}>
                <Ionicons name="close-circle" size={20} color="#F44336" />
                <Text style={[styles.actionText, styles.cancelText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // Initial state - Find Mechanic form
    return (
      <ScrollView style={styles.findContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.problemContainer}>
          <Text style={styles.sectionTitle}>What\s the problem?</Text>
          {initialParams.triggerReason === "dtc" && initialParams.dtcCodes && (
            <Text style={styles.dtcTriggerText}>
              Request initiated due to DTCs: {initialParams.dtcCodes.join(", ")}
            </Text>
          )}
          <View style={styles.problemOptions}>
            {/* Problem Type Buttons */}
            {(["Check Engine Light", "Battery/Electrical", "Overheating", "Other Issue"] as ProblemType[]).map((problem) => {
                let iconName: keyof typeof Ionicons.glyphMap = "help-circle";
                let iconColor = selectedProblemType === problem ? "#fff" : "#607D8B";
                if (problem === "Check Engine Light") { iconName = "warning"; iconColor = selectedProblemType === problem ? "#fff" : "#F44336"; }
                if (problem === "Battery/Electrical") { iconName = "battery-dead"; iconColor = selectedProblemType === problem ? "#fff" : "#FF9800"; }
                if (problem === "Overheating") { iconName = "thermometer"; iconColor = selectedProblemType === problem ? "#fff" : "#F44336"; }

                return (
                    <TouchableOpacity
                        key={problem}
                        style={[styles.problemOption, selectedProblemType === problem && styles.selectedProblemOption]}
                        onPress={() => handleProblemSelection(problem)}
                    >
                        <View style={styles.problemIconContainer}>
                            <Ionicons name={iconName} size={24} color={iconColor} />
                        </View>
                        <Text style={[styles.problemText, selectedProblemType === problem && styles.selectedProblemText]}>
                            {problem}
                        </Text>
                    </TouchableOpacity>
                );
            })}
          </View>
          {/* Optional: Text input for more details */}
          <TextInput
            style={styles.detailsInput}
            placeholder="Add more details (optional)"
            value={problemDescription}
            onChangeText={setProblemDescription}
            multiline
          />
        </View>

        <View style={styles.mapPreviewContainer}>
          <MapView provider={PROVIDER_GOOGLE} style={styles.mapPreview} initialRegion={userLocation} scrollEnabled={false} zoomEnabled={false}>
            <Marker coordinate={userLocation} title="Your Location" pinColor="#007bff" />
          </MapView>
          <TouchableOpacity style={styles.locationButton}>
            <Ionicons name="locate" size={20} color="#007bff" />
            <Text style={styles.locationButtonText}>Update Location</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.requestButton, !selectedProblemType && styles.disabledButton]}
          onPress={handleRequestMechanic}
          disabled={!selectedProblemType}
        >
          <Text style={styles.requestButtonText}>Request Mechanic</Text>
        </TouchableOpacity>

        <Text style={styles.nearbyTitle}>Nearby Mechanics (Filtered)</Text>
        {nearbyMechanics.map((mechanic) => (
          <View key={mechanic.id} style={styles.mechanicItem}>
            <View style={styles.mechanicItemAvatar}>
              <Text style={styles.mechanicItemInitials}>
                {mechanic.name.split(" ").map((n) => n[0]).join("")}
              </Text>
            </View>
            <View style={styles.mechanicItemDetails}>
              <Text style={styles.mechanicItemName}>{mechanic.name}</Text>
              <View style={styles.mechanicItemRating}>
                <Ionicons name="star" size={14} color="#FFC107" />
                <Text style={styles.mechanicItemRatingText}>{mechanic.rating}</Text>
                <Text style={styles.mechanicItemDistance}>{mechanic.distance}</Text>
              </View>
              <View style={styles.specialtiesContainer}>
                {mechanic.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyBadge}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
        {nearbyMechanics.length === 0 && (
          <Text style={styles.emptyListText}>No mechanics found matching the selected problem type.</Text>
        )}
        <View style={{ height: 20 }} /> {/* Bottom padding */}
      </ScrollView>
    );
  };

  const renderServiceHistoryItem = useCallback(({ item }: ListRenderItemInfo<ServiceHistoryItem>) => (
    <View style={styles.serviceItem}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceDate}>{item.date}</Text>
        <View style={[styles.serviceStatusBadge, { backgroundColor: item.status === "Completed" ? "#E8F5E9" : "#FFF3E0" }]}>
          <Text style={[styles.serviceStatusText, { color: item.status === "Completed" ? "#4CAF50" : "#FF9800" }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.serviceMechanic}>Mechanic: {item.mechanic}</Text>
      <Text style={styles.serviceDescription}>Service: {item.service}</Text>
      <Text style={styles.serviceCost}>Cost: {item.cost}</Text>
    </View>
  ), []);

  const renderHistoryTab = () => {
    return (
      <FlatList
        style={styles.historyContainer}
        data={serviceHistory}
        renderItem={renderServiceHistoryItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyListText}>No service history found.</Text>}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "find" && styles.activeTab]}
          onPress={() => setActiveTab("find")}
        >
          <Ionicons
            name={activeTab === "find" ? "construct" : "construct-outline"}
            size={24}
            color={activeTab === "find" ? "#007bff" : "#666"}
          />
          <Text style={[styles.tabText, activeTab === "find" && styles.activeTabText]}>
            Find Mechanic
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Ionicons
            name={activeTab === "history" ? "time" : "time-outline"}
            size={24}
            color={activeTab === "history" ? "#007bff" : "#666"}
          />
          <Text style={[styles.tabText, activeTab === "history" && styles.activeTabText]}>
            Service History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "find" ? renderFindTab() : renderHistoryTab()}
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  tabSelector: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingTop: 40, // For status bar
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007bff",
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#007bff",
    fontWeight: "bold",
  },
  findContainer: {
    flex: 1,
    padding: 16,
  },
  historyContainer: {
    flex: 1,
    padding: 16,
  },
  problemContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  dtcTriggerText: {
    fontSize: 14,
    color: "#F44336",
    marginBottom: 16,
    backgroundColor: "#FFEBEE",
    padding: 8,
    borderRadius: 4,
  },
  problemOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  problemOption: {
    width: "48%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedProblemOption: {
    backgroundColor: "#007bff",
  },
  problemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  problemText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  selectedProblemText: {
    color: "#fff",
    fontWeight: "bold",
  },
  detailsInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    height: 80,
    textAlignVertical: "top",
  },
  mapPreviewContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mapPreview: {
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
  },
  locationButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#007bff",
  },
  requestButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  nearbyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  mechanicItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mechanicItemAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  mechanicItemInitials: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
  },
  mechanicItemDetails: {
    flex: 1,
  },
  mechanicItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  mechanicItemRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  mechanicItemRatingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
    marginRight: 12,
  },
  mechanicItemDistance: {
    fontSize: 14,
    color: "#666",
  },
  specialtiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  specialtyBadge: {
    backgroundColor: "#E3F2FD",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    color: "#007bff",
  },
  emptyListText: {
    textAlign: "center",
    color: "#666",
    marginTop: 24,
  },
  serviceItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  serviceStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  serviceStatusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  serviceMechanic: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  serviceCost: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  searchingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  searchingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  searchingSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#F44336",
    fontWeight: "500",
  },
  mechanicFoundContainer: {
    flex: 1,
  },
  mapContainer: {
    height: 250,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mechanicInfoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: -20,
  },
  mechanicHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  mechanicAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  mechanicInitials: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007bff",
  },
  mechanicDetails: {
    flex: 1,
  },
  mechanicName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  statusBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  etaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  etaText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    padding: 8,
  },
  actionText: {
    fontSize: 12,
    color: "#007bff",
    marginTop: 4,
  },
  cancelRequestButton: {
    borderLeftWidth: 1,
    borderLeftColor: "#eee",
  },
  cancelText: {
    color: "#F44336",
  },
});

export default MechanicScreen;
