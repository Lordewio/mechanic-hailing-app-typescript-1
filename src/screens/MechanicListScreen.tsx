// src/screens/MechanicListScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ListRenderItemInfo,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { MechanicStackParamList } from "../navigation/AppNavigator"; // Adjust path if needed

// --- Type Definitions ---

type MechanicListScreenNavigationProp = NavigationProp<MechanicStackParamList>;

interface MechanicListScreenProps {
  // Props if needed
}

interface MechanicLocation {
  latitude: number;
  longitude: number;
}

interface MechanicRating {
  average: number;
  count: number;
}

interface Mechanic {
  id: string;
  name: string;
  photo: string;
  specializations: string[];
  rating: MechanicRating;
  distance: number;
  location: MechanicLocation;
  isAvailable: boolean;
}

type SortByType = "distance" | "rating" | "name";

// Mock data (replace with API call)
const mockMechanics: Mechanic[] = [
  { id: "1", name: "John Smith", photo: "https://randomuser.me/api/portraits/men/1.jpg", specializations: ["Engine Repair", "Transmission", "Diagnostics"], rating: { average: 4.8, count: 124 }, distance: 1.2, location: { latitude: 37.7858, longitude: -122.4064 }, isAvailable: true },
  { id: "2", name: "Maria Rodriguez", photo: "https://randomuser.me/api/portraits/women/2.jpg", specializations: ["Electrical Systems", "Computer Diagnostics"], rating: { average: 4.6, count: 98 }, distance: 2.5, location: { latitude: 37.7958, longitude: -122.3964 }, isAvailable: true },
  { id: "3", name: "David Chen", photo: "https://randomuser.me/api/portraits/men/3.jpg", specializations: ["Brake Systems", "Suspension", "Wheel Alignment"], rating: { average: 4.9, count: 156 }, distance: 3.1, location: { latitude: 37.7758, longitude: -122.4164 }, isAvailable: true },
  { id: "4", name: "Sarah Johnson", photo: "https://randomuser.me/api/portraits/women/4.jpg", specializations: ["Oil Change", "Filters", "Maintenance"], rating: { average: 4.5, count: 87 }, distance: 3.8, location: { latitude: 37.7658, longitude: -122.4264 }, isAvailable: false },
  { id: "5", name: "Michael Brown", photo: "https://randomuser.me/api/portraits/men/5.jpg", specializations: ["Engine Overhaul", "Performance Tuning"], rating: { average: 4.7, count: 112 }, distance: 4.2, location: { latitude: 37.7558, longitude: -122.4364 }, isAvailable: true },
];

// --- Screen Component ---

const MechanicListScreen: React.FC<MechanicListScreenProps> = () => {
  const navigation = useNavigation<MechanicListScreenNavigationProp>();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [filteredMechanics, setFilteredMechanics] = useState<Mechanic[]>([]);
  const [sortBy, setSortBy] = useState<SortByType>("distance");
  const [loading, setLoading] = useState<boolean>(true);

  // Simulate fetching mechanics
  useEffect(() => {
    setLoading(true);
    // TODO: Replace with actual API call to fetch mechanics
    setTimeout(() => {
      setMechanics(mockMechanics);
      setFilteredMechanics(mockMechanics); // Initialize filtered list
      setLoading(false);
    }, 500);
  }, []);

  // Filter and Sort mechanics
  useEffect(() => {
    let processedMechanics = [...mechanics];

    // Filter based on search query
    if (searchQuery.trim() !== "") {
      const lowerCaseQuery = searchQuery.toLowerCase();
      processedMechanics = processedMechanics.filter(
        (mechanic) =>
          mechanic.name.toLowerCase().includes(lowerCaseQuery) ||
          mechanic.specializations.some((spec) =>
            spec.toLowerCase().includes(lowerCaseQuery)
          )
      );
    }

    // Sort based on sortBy
    processedMechanics.sort((a, b) => {
      if (sortBy === "distance") {
        return a.distance - b.distance;
      } else if (sortBy === "rating") {
        return b.rating.average - a.rating.average; // Descending rating
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    setFilteredMechanics(processedMechanics);
  }, [searchQuery, mechanics, sortBy]);

  const handleMechanicPress = useCallback((mechanic: Mechanic) => {
    navigation.navigate("MechanicDetails", { mechanicId: mechanic.id });
  }, [navigation]);

  const handleFilterPress = useCallback(() => {
    // navigation.navigate("MechanicFilter"); // Assuming filter screen exists
    console.log("Navigate to Filter Screen (Not Implemented)");
  }, [navigation]);

  const handleMapViewPress = useCallback(() => {
    navigation.navigate("MechanicMap");
  }, [navigation]);

  // --- Render Functions ---

  const renderSortButton = useCallback((label: string, value: SortByType) => (
    <TouchableOpacity
      style={[styles.sortButton, sortBy === value && styles.sortButtonActive]}
      onPress={() => setSortBy(value)}
    >
      <Text style={[styles.sortButtonText, sortBy === value && styles.sortButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  ), [sortBy]);

  const renderMechanicCard = useCallback(({ item }: ListRenderItemInfo<Mechanic>) => (
    <TouchableOpacity
      style={styles.mechanicCard}
      onPress={() => handleMechanicPress(item)}
    >
      <Image source={{ uri: item.photo }} style={styles.mechanicPhoto} />
      <View style={styles.mechanicInfo}>
        <Text style={styles.mechanicName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating.average} ({item.rating.count})</Text>
        </View>
        <Text style={styles.specializations} numberOfLines={1}>{item.specializations.join(", ")}</Text>
        <View style={styles.distanceContainer}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.distanceText}>{item.distance} miles away</Text>
        </View>
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.bookButton, !item.isAvailable && styles.bookButtonDisabled]}
          disabled={!item.isAvailable}
          onPress={() => navigation.navigate("BookService", { mechanicId: item.id })}
        >
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
        <Text style={[styles.availabilityText, !item.isAvailable && styles.unavailableText]}>
          {item.isAvailable ? "Available" : "Unavailable"}
        </Text>
      </View>
    </TouchableOpacity>
  ), [navigation, handleMechanicPress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mechanics List</Text>
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
          <Ionicons name="options-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search mechanics or services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.mapViewButton} onPress={handleMapViewPress}>
          <Ionicons name="map-outline" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {renderSortButton("Distance", "distance")}
        {renderSortButton("Rating", "rating")}
        {renderSortButton("Name", "name")}
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {loading ? "Loading..." : `${filteredMechanics.length} mechanics found`}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#007bff" />
      ) : (
        <FlatList
          data={filteredMechanics}
          renderItem={renderMechanicCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.mechanicsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>No mechanics found matching your criteria.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

// Styles remain largely the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
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
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  mapViewButton: {
    padding: 8,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sortLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#e0e0e0", // Inactive color
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: "#007bff",
  },
  sortButtonText: {
    fontSize: 12,
    color: "#333", // Darker text for inactive
  },
  sortButtonTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  resultsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mechanicsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  mechanicCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12, // Reduced margin
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  },
  mechanicName: {
    fontSize: 16,
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
  specializations: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  actionContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  bookButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  bookButtonDisabled: {
    backgroundColor: "#ccc",
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  availabilityText: {
    fontSize: 10,
    color: "#4CAF50", // Green for available
    fontWeight: "bold",
  },
  unavailableText: {
    color: "#F44336", // Red for unavailable
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 16,
    color: "#888",
  },
});

export default MechanicListScreen;

