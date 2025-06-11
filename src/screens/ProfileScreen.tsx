// src/screens/ProfileScreen.tsx
import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import {
  useSelector,
  useDispatch,
  TypedUseSelectorHook,
} from "react-redux";
import { RootState, AppDispatch } from "../store"; // Adjust path if needed
import { logout } from "../store/slices/authSlice"; // Adjust path if needed
import { Vehicle as ReduxVehicle } from "../store/slices/vehicleSlice"; // Import the actual Vehicle type from Redux
import { MainTabParamList } from "../navigation/AppNavigator"; // Import from AppNavigator

// --- Type Definitions ---
type ProfileScreenNavigationProp = NavigationProp<MainTabParamList, 'Profile'>;

interface ProfileScreenProps {
  // Props if needed
}

// Define a mock user profile type for when Redux data isn't available
interface MockUserProfile {
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  profileImage: string | null;
}

// Define a mock vehicle type for when Redux data isn't available
interface MockVehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  isDefault: boolean;
}

// Typed Redux hooks
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// --- Screen Component ---

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useAppDispatch();

  // Get user and vehicle data from Redux store
  const userProfile = useAppSelector((state) => state.auth.user);
  const vehicles = useAppSelector((state) => state.vehicle.vehicles);
  const selectedVehicleId = useAppSelector((state) => state.vehicle.selectedVehicleId);

  // Mock data if Redux state is empty/not implemented yet
  const mockUser: MockUserProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    memberSince: "May 2025",
    profileImage: null,
  };

  const mockVehicles: MockVehicle[] = [
    { id: "v1", make: "Toyota", model: "Camry", year: "2020", licensePlate: "ABC 123", isDefault: true },
    { id: "v2", make: "Honda", model: "Civic", year: "2018", licensePlate: "XYZ 789", isDefault: false },
  ];

  // Use mock data if real data is not available
  const displayUser = userProfile || mockUser;
  const displayVehicles = vehicles.length > 0 ? vehicles : mockVehicles;

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            dispatch(logout());
            // Navigation to Auth stack is usually handled by the main AppNavigator based on auth state
          },
        },
      ]
    );
  }, [dispatch]);

  const handleEditProfile = useCallback(() => {
    // navigation.navigate("EditProfile"); // Navigate to Edit Profile screen
    console.log("Navigate to Edit Profile (Not Implemented)");
  }, [navigation]);

  const handleAddVehicle = useCallback(() => {
    // navigation.navigate("AddVehicle"); // Navigate to Add Vehicle screen
    console.log("Navigate to Add Vehicle (Not Implemented)");
  }, [navigation]);

  const handleVehicleOptions = useCallback((vehicleId: string) => {
    // Show options menu for the vehicle (Set as Default, Edit, Delete)
    console.log(`Show options for vehicle ${vehicleId} (Not Implemented)`);
  }, []);

  const handleNavigateToSettings = useCallback((setting: string) => {
    // navigation.navigate(setting); // Navigate to specific setting screen
    console.log(`Navigate to ${setting} Settings (Not Implemented)`);
  }, [navigation]);

  // Helper function to get vehicle name from make and model
  const getVehicleName = (vehicle: ReduxVehicle | MockVehicle): string => {
    if ('make' in vehicle && 'model' in vehicle) {
      return `${vehicle.make} ${vehicle.model}`;
    }
    // Fallback for Redux Vehicle type that might have different properties
    return vehicle.id || 'Unknown Vehicle';
  };

  // Helper function to get user initials
  const getUserInitials = (name: string): string => {
    return name.split(" ").map((n: string) => n[0]).join("");
  };

  // Helper function to safely get user name
  const getUserName = (): string => {
    if ('name' in displayUser) {
      return displayUser.name;
    }
    return 'User';
  };

  // Helper function to safely get member since
  const getMemberSince = (): string => {
    if ('memberSince' in displayUser) {
      return displayUser.memberSince;
    }
    return 'N/A';
  };

  // Helper function to safely get phone
  const getPhone = (): string => {
    if ('phone' in displayUser) {
      return displayUser.phone;
    }
    return 'N/A';
  };

  // Helper function to safely check for profile image
  const hasProfileImage = (): boolean => {
    return 'profileImage' in displayUser && !!displayUser.profileImage;
  };

  // Helper function to safely get profile image
  const getProfileImage = (): string | null => {
    if ('profileImage' in displayUser) {
      return displayUser.profileImage;
    }
    return null;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.profileContainer}>
        <View style={styles.profileHeader}>
          {hasProfileImage() && getProfileImage() ? (
            <Image source={{ uri: getProfileImage()! }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitials}>{getUserInitials(getUserName())}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{getUserName()}</Text>
            <Text style={styles.profileMemberSince}>Member since {getMemberSince()}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="pencil" size={20} color="#007bff" />
          </TouchableOpacity>
        </View>
        <View style={styles.profileDetails}>
          <View style={styles.profileDetailItem}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.profileDetailIcon} />
            <Text style={styles.profileDetailText}>{displayUser.email}</Text>
          </View>
          <View style={styles.profileDetailItem}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.profileDetailIcon} />
            <Text style={styles.profileDetailText}>{getPhone()}</Text>
          </View>
        </View>
      </View>

      {/* My Vehicles */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Vehicles</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddVehicle}>
            <Ionicons name="add" size={20} color="#007bff" />
            <Text style={styles.addButtonText}>Add Vehicle</Text>
          </TouchableOpacity>
        </View>
        {displayVehicles.map((vehicle) => (
          <View key={vehicle.id} style={styles.vehicleItem}>
            <View style={styles.vehicleIcon}>
              <Ionicons name="car-sport-outline" size={24} color="#007bff" />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{getVehicleName(vehicle)}</Text>
              <Text style={styles.vehicleDetails}>{vehicle.year} • {vehicle.licensePlate}</Text>
            </View>
            {vehicle.id === selectedVehicleId && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Selected</Text>
              </View>
            )}
            <TouchableOpacity style={styles.vehicleMenuButton} onPress={() => handleVehicleOptions(vehicle.id)}>
              <Ionicons name="ellipsis-vertical" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
        {displayVehicles.length === 0 && (
            <Text style={styles.noVehiclesText}>No vehicles added yet.</Text>
        )}
      </View>

      {/* Settings */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {[
          { icon: "notifications-outline", title: "Notifications", desc: "Manage notification preferences", screen: "NotificationSettings" },
          { icon: "lock-closed-outline", title: "Privacy & Security", desc: "Manage your data and security", screen: "PrivacySettings" },
          { icon: "card-outline", title: "Payment Methods", desc: "Manage your payment options", screen: "PaymentSettings" },
          { icon: "language-outline", title: "Language", desc: "Change app language", screen: "LanguageSettings" },
        ].map((item) => (
          <TouchableOpacity key={item.screen} style={styles.settingItem} onPress={() => handleNavigateToSettings(item.screen)}>
            <Ionicons name={item.icon as any} size={24} color="#666" style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingDescription}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Support */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Support</Text>
        {[
          { icon: "help-circle-outline", title: "Help Center", desc: "Get help with the app", screen: "HelpCenter" },
          { icon: "chatbubble-ellipses-outline", title: "Contact Support", desc: "Reach out to our support team", screen: "ContactSupport" },
          { icon: "document-text-outline", title: "Terms & Policies", desc: "Review our terms and policies", screen: "TermsPolicies" },
        ].map((item) => (
          <TouchableOpacity key={item.screen} style={styles.settingItem} onPress={() => handleNavigateToSettings(item.screen)}>
            <Ionicons name={item.icon as any} size={24} color="#666" style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingDescription}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Version 1.0.0 (TS)</Text>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

// Styles remain largely the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 45, // Adjust for status bar
    backgroundColor: "#007bff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  profileContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    marginTop: -20, // Overlap header slightly
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007bff",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profileMemberSince: {
    fontSize: 12,
    color: "#666",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileDetails: {
    marginTop: 8,
  },
  profileDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileDetailIcon: {
    marginRight: 12,
  },
  profileDetailText: {
    fontSize: 14,
    color: "#333",
  },
  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: "#007bff",
    marginLeft: 4,
    fontWeight: "500",
  },
  vehicleItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 12,
    color: "#666",
  },
  defaultBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginHorizontal: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  vehicleMenuButton: {
    padding: 4,
  },
  noVehiclesText: {
      textAlign: 'center',
      color: '#888',
      marginTop: 10,
      marginBottom: 10,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingIcon: {
    marginRight: 16,
    width: 24, // Ensure consistent icon width
    textAlign: "center",
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: "#666",
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    color: "#F44336",
    fontWeight: "500",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    marginBottom: 16,
  },
});

export default ProfileScreen;
