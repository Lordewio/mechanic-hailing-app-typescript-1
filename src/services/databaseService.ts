// src/services/databaseService.ts
import database, { FirebaseDatabaseTypes } from "@react-native-firebase/database";

// --- Type Definitions ---

// Define the structure of the live data expected from the Realtime Database
// This should match the data structure being pushed by the backend/device
export interface LiveVehicleData {
  timestamp?: number | string; // Unix timestamp or ISO string
  location?: {
    latitude: number;
    longitude: number;
    altitude?: number;
    speed?: number;
    heading?: number;
  } | null;
  speed_obd?: number | null;
  rpm?: number | null;
  throttle_pos?: number | null;
  coolant_temp?: number | null;
  fuel_level?: number | null;
  battery_voltage?: number | null;
  engine_load?: number | null;
  // Add other relevant OBD2 or sensor fields
}

// --- Database Service Functions with Types ---

/**
 * Subscribe to real-time updates for a specific vehicle's live data.
 */
const subscribeToVehicleLiveData = (
  vehicleId: string,
  callback: (data: LiveVehicleData | null) => void
): (() => void) => { // Returns an unsubscribe function
  if (!vehicleId) {
    console.error("Vehicle ID is required to subscribe to live data.");
    return () => {}; // Return an empty unsubscribe function
  }

  const vehicleDataRef = database().ref(`/liveData/${vehicleId}`);

  const onDataChange = (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val() as LiveVehicleData; // Assert the type
      // console.log(`Live data received for vehicle ${vehicleId}:`, data);
      callback(data);
    } else {
      console.log(`No live data found for vehicle ${vehicleId}.`);
      callback(null); // Indicate no data
    }
  };

  // Define the error callback type
  const onError = (error: Error) => {
    console.error(`Error subscribing to live data for vehicle ${vehicleId}:`, error);
    // Optionally, call the callback with an error indicator or null
    // callback(null); 
  };

  vehicleDataRef.on("value", onDataChange, onError);

  console.log(`Subscribed to live data for vehicle ${vehicleId}`);

  // Return the unsubscribe function
  return () => {
    vehicleDataRef.off("value", onDataChange);
    console.log(`Unsubscribed from live data for vehicle ${vehicleId}`);
  };
};

/**
 * Fetch the latest live data for a vehicle once.
 */
const getVehicleLiveDataOnce = async (vehicleId: string): Promise<LiveVehicleData | null> => {
  if (!vehicleId) {
    console.error("Vehicle ID is required to fetch live data.");
    return null;
  }
  try {
    const snapshot = await database().ref(`/liveData/${vehicleId}`).once("value");
    if (snapshot.exists()) {
      return snapshot.val() as LiveVehicleData; // Assert the type
    } else {
      return null;
    }
  } catch (error: any) {
    console.error(`Error fetching live data once for vehicle ${vehicleId}:`, error);
    throw error;
  }
};

export const databaseService = {
  subscribeToVehicleLiveData,
  getVehicleLiveDataOnce,
};

