// App.tsx
import React, { useState, useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import store, { AppDispatch, RootState } from "./src/store"; // Import AppDispatch and RootState
import RootNavigator from "./src/navigation/AppNavigator";
import { authService } from "./src/services/authService";
import { setUser, setProfile, setAuthLoading, logout, UserState } from "./src/store/slices/authSlice"; // Import UserState type if defined
import { fetchUserVehicles, clearVehicleState } from "./src/store/slices/vehicleSlice";
import { clearDiagnosticsState } from "./src/store/slices/diagnosticsSlice";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { User as FirebaseUser } from "firebase/auth"; // Import Firebase User type

// Initialize Firebase if not already done (handled in firebaseConfig.ts)
import "./src/services/firebaseConfig";

const AppContent: React.FC = () => {
  // Explicitly type the dispatch hook
  const dispatch = useDispatch<AppDispatch>();
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    dispatch(setAuthLoading(true));
    const subscriber = authService.onAuthStateChanged(async (user: FirebaseUser | null) => {
      if (user) {
        console.log("User is logged in:", user.uid);
        // User is signed in, set user state
        // Ensure the payload matches the expected type in setUser reducer
        // Firebase User object is complex, extract serializable parts or define a suitable interface
        const serializableUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          // Add other necessary serializable fields
        };
        dispatch(setUser(serializableUser as any)); // Cast or use a defined interface matching UserState
        
        // Fetch profile and vehicles
        try {
          const profile = await authService.getUserProfile(user.uid);
          if (profile) { // Check if profile exists
             dispatch(setProfile(profile));
          }
          dispatch(fetchUserVehicles(user.uid));
        } catch (error) {
          console.error("Error fetching initial user data:", error);
          // Handle error appropriately, maybe sign out user?
        }
      } else {
        console.log("User is logged out");
        // User is signed out, clear relevant state
        dispatch(logout());
        dispatch(clearVehicleState());
        dispatch(clearDiagnosticsState());
        // Add other state clearing actions as needed (e.g., maintenance, trip)
      }
      if (initializing) {
        setInitializing(false);
      }
      dispatch(setAuthLoading(false));
    });

    // Unsubscribe on unmount
    return subscriber;
  }, [dispatch, initializing]);

  if (initializing) {
    // Show a loading indicator while checking auth state
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <RootNavigator />;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;

