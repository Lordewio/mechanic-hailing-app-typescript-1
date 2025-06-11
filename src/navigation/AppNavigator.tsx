import React from "react";
import { View, Text } from "react-native"; // Keep for placeholders
import { NavigationContainer, RouteProp } from "@react-navigation/native";
import { createStackNavigator, StackNavigationProp } from "@react-navigation/stack";
import { createBottomTabNavigator, BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../store"; // Import RootState for useSelector typing

// Import Screens (assuming they are now .tsx)
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import DiagnosticsScreen from "../screens/DiagnosticsScreen";
import MechanicScreen from "../screens/MechanicScreen";
import TripsScreen from "../screens/TripsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MaintenanceScreen from "../screens/MaintenanceScreen";
import MaintenanceDetailsScreen from "../screens/MaintenanceDetailsScreen";
import ServiceLogDetailsScreen from "../screens/ServiceLogDetailsScreen";
import AddMaintenanceScreen from "../screens/AddMaintenanceScreen";
import LogServiceScreen from "../screens/LogServiceScreen";
import EditMaintenanceScreen from "../screens/EditMaintenanceScreen"; // Import the edit screen
import ChatScreen from "../screens/ChatScreen"; // Import the chat screen
import MechanicJobScreen from "../screens/MechanicJobScreen"; // Import the mechanic job screen
import DocumentVaultScreen from "../screens/DocumentVaultScreen"; // Import the document vault screen
import LiveTrackingScreen from "../screens/LiveTrackingScreen"; // Import the live tracking screen
import MechanicProfileScreen from "../screens/MechanicProfileScreen"; // Import the mechanic profile screen

// --- Type Definitions for Navigation Params ---

// Undefined means no params passed to the screen
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined; // Define params if needed, e.g., { initialEmail?: string }
  ForgotPassword: undefined;
};

export type MaintenanceStackParamList = {
  MaintenanceList: undefined;
  MaintenanceDetails: { scheduleId: string }; // Example param
  ServiceLogDetails: { logId: string }; // Example param
  AddMaintenance: undefined;
  LogService: { scheduleId?: string }; // Optional param if logging from a schedule
  EditMaintenance: { scheduleId: string }; // Param for editing
};

export type MainTabParamList = {
  Home: undefined;
  Diagnostics: undefined;
  Mechanic: { triggerReason?: "dtc" | "manual"; problemDescription?: string; dtcCodes?: string[] };
  Maintenance: undefined; // The tab itself doesn\'t take params, the stack inside does
  Trips: undefined;
  Profile: undefined;
  Chat: { mechanicName: string };
  Geofence: undefined;
  DocumentVault: undefined;
  LiveTracking: { mechanicId: string; customerLocation: { latitude: number; longitude: number } };
};

export type MechanicStackParamList = {
  MechanicList: undefined;
  MechanicDetails: { mechanicId: string };
  MechanicProfile: { mechanicId: string };
  MechanicMap: { mechanicId?: string };
  MechanicReviews: { mechanicId: string };
  WriteReview: { mechanicId: string; serviceId: string; bookingId: string };
  BookService: { mechanicId: string; serviceId?: string; isRescheduling?: boolean };
  ServiceDetails: { bookingId: string };
  ServiceHistory: undefined;
  MechanicJob: { jobId: string };
  MechanicWallet: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  // Add other root-level screens/modals here if needed
};

// --- Prop Types for Screens (Optional but good practice) ---
// Example for a screen in AuthStack
export type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, "Login">;

// Example for a screen in MaintenanceStack
export type MaintenanceDetailsScreenRouteProp = RouteProp<MaintenanceStackParamList, "MaintenanceDetails">;
export type MaintenanceDetailsScreenNavigationProp = StackNavigationProp<MaintenanceStackParamList, "MaintenanceDetails">;

// --- Placeholder Screens ---
const RegisterScreen: React.FC = () => <View><Text>Register Screen</Text></View>;
const ForgotPasswordScreen: React.FC = () => <View><Text>Forgot Password Screen</Text></View>;

// --- Navigators ---

const AuthStack = createStackNavigator<AuthStackParamList>();
const AuthNavigator: React.FC = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const MaintenanceStackNav = createStackNavigator<MaintenanceStackParamList>();
const MaintenanceStackNavigator: React.FC = () => (
  <MaintenanceStackNav.Navigator screenOptions={{ headerShown: false }}>
    <MaintenanceStackNav.Screen name="MaintenanceList" component={MaintenanceScreen} />
    <MaintenanceStackNav.Screen name="MaintenanceDetails" component={MaintenanceDetailsScreen} />
    <MaintenanceStackNav.Screen name="ServiceLogDetails" component={ServiceLogDetailsScreen} />
    <MaintenanceStackNav.Screen name="AddMaintenance" component={AddMaintenanceScreen} />
    <MaintenanceStackNav.Screen name="LogService" component={LogServiceScreen} />
    <MaintenanceStackNav.Screen name="EditMaintenance" component={EditMaintenanceScreen} />
  </MaintenanceStackNav.Navigator>
);

const MechanicStackNav = createStackNavigator<MechanicStackParamList>();
const MechanicStackNavigator: React.FC = () => (
  <MechanicStackNav.Navigator screenOptions={{ headerShown: false }}>
    <MechanicStackNav.Screen name="MechanicList" component={MechanicScreen} />
    <MechanicStackNav.Screen name="MechanicDetails" component={MechanicDetailsScreen} />
    <MechanicStackNav.Screen name="MechanicProfile" component={MechanicProfileScreen} />
    <MechanicStackNav.Screen name="MechanicMap" component={MechanicMapScreen} />
    <MechanicStackNav.Screen name="MechanicReviews" component={MechanicReviewsScreen} />
    <MechanicStackNav.Screen name="WriteReview" component={WriteReviewScreen} />
    <MechanicStackNav.Screen name="BookService" component={BookServiceScreen} />
    <MechanicStackNav.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
    <MechanicStackNav.Screen name="ServiceHistory" component={ServiceHistoryScreen} />
    <MechanicStackNav.Screen name="MechanicJob" component={MechanicJobScreen} />
    <MechanicStackNav.Screen name="MechanicWallet" component={MechanicWalletScreen} />
  </MechanicStackNav.Navigator>
);

const Tab = createBottomTabNavigator<MainTabParamList>();
const MainTabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = "help-circle"; // Default icon

        switch (route.name) {
          case "Home":
            iconName = focused ? "home" : "home-outline";
            break;
          case "Diagnostics":
            iconName = focused ? "analytics" : "analytics-outline";
            break;
          case "Mechanic":
            iconName = focused ? "construct" : "construct-outline";
            break;
          case "Maintenance":
            iconName = focused ? "build" : "build-outline";
            break;
          case "Trips":
            iconName = focused ? "map" : "map-outline";
            break;
          case "Profile":
            iconName = focused ? "person" : "person-outline";
            break;
          case "Geofence":
            iconName = focused ? "map" : "map-outline"; // Using map icon for geofence
            break;
          case "DocumentVault":
            iconName = focused ? "folder-open" : "folder-open-outline";
            break;
          case "LiveTracking":
            iconName = focused ? "navigate" : "navigate-outline";
            break;
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#007bff",
      tabBarInactiveTintColor: "gray",
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Diagnostics" component={DiagnosticsScreen} />
    <Tab.Screen name="Mechanic" component={MechanicScreen} />
    <Tab.Screen name="Maintenance" component={MaintenanceStackNavigator} />
    <Tab.Screen name="Trips" component={TripsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="Geofence" component={GeofenceScreen} />
    <Tab.Screen name="DocumentVault" component={DocumentVaultScreen} />
    <Tab.Screen name="LiveTracking" component={LiveTrackingScreen} />
  </Tab.Navigator>
);

const RootStack = createStackNavigator<RootStackParamList>();
const RootNavigator: React.FC = () => {
  // Type the state selection
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.user);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;


