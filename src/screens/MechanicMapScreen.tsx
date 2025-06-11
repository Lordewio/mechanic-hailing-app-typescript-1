// src/screens/MechanicMapScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  FlatList,
  Image,
  Animated,
  ListRenderItemInfo,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import {
  useNavigation,
  NavigationProp,
  RouteProp,
  useRoute,
} from "@react-navigation/native";
import { MechanicStackParamList } from "../navigation/AppNavigator"; // Adjust path if needed

// --- Type Definitions ---

type MechanicMapScreenNavigationProp = NavigationProp<MechanicStackParamList>;
type MechanicMapScreenRouteProp = RouteProp<MechanicStackParamList, "MechanicMap">;

interface MechanicMapScreenProps {
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

// Mock data (replace with API call)
const mockMechanics: Mechanic[] = [
  { id: "1", name: "John Smith", photo: "https://randomuser.me/api/portraits/men/1.jpg", specializations: ["Engine Repair", "Transmission", "Diagnostics"], rating: { average: 4.8, count: 124 }, distance: 1.2, location: { latitude: 37.7858, longitude: -122.4064 }, isAvailable: true },
  { id: "2", name: "Maria Rodriguez", photo: "https://randomuser.me/api/portraits/women/2.jpg", specializations: ["Electrical Systems", "Computer Diagnostics"], rating: { average: 4.6, count: 98 }, distance: 2.5, location: { latitude: 37.7958, longitude: -122.3964 }, isAvailable: true },
  { id: "3", name: "David Chen", photo: "https://randomuser.me/api/portraits/men/3.jpg", specializations: ["Brake Systems", "Suspension", "Wheel Alignment"], rating: { average: 4.9, count: 156 }, distance: 3.1, location: { latitude: 37.7758, longitude: -122.4164 }, isAvailable: true },
  { id: "4", name: "Sarah Johnson", photo: "https://randomuser.me/api/portraits/women/4.jpg", specializations: ["Oil Change", "Filters", "Maintenance"], rating: { average: 4.5, count: 87 }, distance: 3.8, location: { latitude: 37.7658, longitude: -122.4264 }, isAvailable: false },
  { id: "5", name: "Michael Brown", photo: "https://randomuser.me/api/portraits/men/5.jpg", specializations: ["Engine Overhaul", "Performance Tuning"], rating: { average: 4.7, count: 112 }, distance: 4.2, location: { latitude: 37.7558, longitude: -122.4364 }, isAvailable: true },
];

const userLocation: MechanicLocation = { latitude: 37.7858, longitude: -122.4064 };
const screenHeight = Dimensions.get("window").height;

// --- Screen Component ---

const MechanicMapScreen: React.FC<MechanicMapScreenProps> = () => {
  const navigation = useNavigation<MechanicMapScreenNavigationProp>();
  const route = useRoute<MechanicMapScreenRouteProp>();
  const initialMechanicId = route.params?.mechanicId;

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [filteredMechanics, setFilteredMechanics] = useState<Mechanic[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [showList, setShowList] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const bottomSheetHeight = useRef(new Animated.Value(100)).current;
  const mapRef = useRef<MapView>(null);

  // Simulate fetching mechanics
  useEffect(() => {
    setLoading(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      setMechanics(mockMechanics);
      setFilteredMechanics(mockMechanics);
      setLoading(false);
      // If an initial mechanic ID was passed, select them
      if (initialMechanicId) {
        const initialMechanic = mockMechanics.find(m => m.id === initialMechanicId);
        if (initialMechanic) {
          handleMechanicSelect(initialMechanic, true); // Select and focus map
        }
      }
    }, 500);
  }, [initialMechanicId]);

  // Filter mechanics based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMechanics(mechanics);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = mechanics.filter(
        (mechanic) =>
          mechanic.name.toLowerCase().includes(lowerCaseQuery) ||
          mechanic.specializations.some((spec) =>
            spec.toLowerCase().includes(lowerCaseQuery)
          )
      );
      setFilteredMechanics(filtered);
    }
  }, [searchQuery, mechanics]);

  const animateBottomSheet = (toValue: number) => {
    Animated.timing(bottomSheetHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const expandBottomSheet = useCallback(() => {
    animateBottomSheet(screenHeight * 0.6);
    setShowList(true);
  }, []);

  const collapseBottomSheet = useCallback(() => {
    animateBottomSheet(100);
    setShowList(false);
    setSelectedMechanic(null); // Deselect mechanic when collapsing
  }, []);

  const toggleBottomSheet = useCallback(() => {
    if (showList) {
      collapseBottomSheet();
    } else {
      expandBottomSheet();
    }
  }, [showList, collapseBottomSheet, expandBottomSheet]);

  const handleMechanicSelect = useCallback((mechanic: Mechanic, focusMap: boolean = false) => {
    setSelectedMechanic(mechanic);
    if (focusMap && mapRef.current) {
        const region: Region = {
            latitude: mechanic.location.latitude,
            longitude: mechanic.location.longitude,
            latitudeDelta: 0.0122,
            longitudeDelta: 0.0121,
        };
        mapRef.current.animateToRegion(region, 500); // Animate map focus
    }
    if (!showList) {
        expandBottomSheet(); // Expand sheet if selecting from map marker
    }
  }, [showList, expandBottomSheet]);

  const handleMechanicPress = useCallback((mechanic: Mechanic) => {
    navigation.navigate("MechanicDetails", { mechanicId: mechanic.id });
  }, [navigation]);

  const handleFilterPress = useCallback(() => {
    // navigation.navigate("MechanicFilter"); // Assuming filter screen exists
    console.log("Navigate to Filter Screen (Not Implemented)");
  }, [navigation]);

  const handleListViewPress = useCallback(() => {
    navigation.navigate("MechanicList");
  }, [navigation]);

  // --- Render Functions ---

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
        <Text style={styles.headerTitle}>Find Mechanics</Text>
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
        <TouchableOpacity style={styles.listViewButton} onPress={handleListViewPress}>
          <Ionicons name="list-outline" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={mapRegion}
        onRegionChangeComplete={setMapRegion} // Update region state on map move
        showsUserLocation={true}
        onPress={collapseBottomSheet} // Collapse sheet when map is pressed
      >
        {filteredMechanics.map((mechanic) => (
          <Marker
            key={mechanic.id}
            coordinate={mechanic.location}
            title={mechanic.name}
            description={`${mechanic.rating.average} ★ (${mechanic.distance} mi)`}
            pinColor={selectedMechanic?.id === mechanic.id ? "#007bff" : "#F44336"}
            onPress={() => handleMechanicSelect(mechanic, false)} // Select without focusing map
          />
        ))}
      </MapView>

      <Animated.View style={[styles.bottomSheet, { height: bottomSheetHeight }]}>
        <TouchableOpacity style={styles.bottomSheetHandle} onPress={toggleBottomSheet} activeOpacity={0.8}>
          <View style={styles.handle} />
          <Text style={styles.nearbyText}>
            {loading ? "Loading..." : `${filteredMechanics.length} Mechanics Nearby`}
          </Text>
          <Ionicons name={showList ? "chevron-down" : "chevron-up"} size={20} color="#666" />
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator style={styles.listLoader} size="large" color="#007bff" />
        ) : (
          <FlatList
            data={filteredMechanics}
            renderItem={renderMechanicCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.mechanicsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </View>
  );
};

// Styles remain largely the same, adjusted slightly
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
    marginBottom: 8, // Reduced margin
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
  listViewButton: {
    padding: 8,
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden", // Ensure content stays within bounds
  },
  bottomSheetHandle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12, // Reduced padding
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    height: 50, // Fixed height for handle area
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    position: "absolute",
    top: 8,
    alignSelf: "center",
  },
  nearbyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    // Removed marginTop to align better
  },
  mechanicsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listLoader: {
    marginTop: 30,
  },
  mechanicCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 12, // Reduced margin
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    alignItems: "center", // Align items vertically
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
});

export default MechanicMapScreen;
