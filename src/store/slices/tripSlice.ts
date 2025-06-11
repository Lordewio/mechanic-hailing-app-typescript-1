// src/store/slices/tripSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { firestoreService } from "../../services/firestoreService"; // Import service only
import { RootState } from "../index";

// --- Interfaces ---

// Define base types for trip data to match Firestore types
interface BaseTripData {
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  startLocation?: { latitude: number; longitude: number; address?: string } | null;
  endLocation?: { latitude: number; longitude: number; address?: string } | null;
  distanceKm?: number;
  durationSeconds?: number;
  averageSpeedKmh?: number;
  maxSpeedKmh?: number;
  fuelConsumedLitersEstimate?: number;
}

// Interface for a trip summary item in the history list
export interface TripHistoryItem extends BaseTripData {
  // Additional properties specific to history items can be added here
}

// Interface for detailed trip data
export interface TripDetails extends BaseTripData {
  routePath?: { latitude: number; longitude: number }[]; // Path as array of points
  drivingEvents?: {
    harshAccelerationCount?: number;
    harshBrakingCount?: number;
    // Add other event counts
  };
}

// Interface for the trip state
export interface TripState {
  tripHistory: TripHistoryItem[];
  currentTripDetails: TripDetails | null;
  loading: boolean;
  error: string | null;
}

// --- Initial State ---

const initialState: TripState = {
  tripHistory: [],
  currentTripDetails: null,
  loading: false,
  error: null,
};

// --- Helper Function to Convert Timestamps ---

// Converts Firestore Timestamps within trip data to JS Date objects
// Note: Storing Date objects in Redux state is generally discouraged due to non-serializability.
// Consider storing ISO strings instead.
const convertTripTimestamps = (trip: any): any => {
  const converted = { ...trip };
  if (converted.startTime && 'toDate' in converted.startTime) {
    converted.startTime = converted.startTime.toDate();
  }
  if (converted.endTime && 'toDate' in converted.endTime) {
    converted.endTime = converted.endTime.toDate();
  }
  // Convert other timestamp fields if they exist
  return converted;
};

// --- Thunk API Config ---

interface ThunkApiConfig {
  rejectValue: string;
  state: RootState;
}

// --- Async Thunks with Types ---

export const fetchTripHistory = createAsyncThunk<
  { vehicleId: string; trips: TripHistoryItem[] }, // Return type
  string, // Argument type (vehicleId)
  ThunkApiConfig
>("trip/fetchTripHistory", async (vehicleId, { rejectWithValue }) => {
  if (!vehicleId) {
    return rejectWithValue("Vehicle ID is required to fetch trip history.");
  }
  try {
    const path = `vehicleData/${vehicleId}/trips`;
    const tripsRaw = await firestoreService.getDocumentsByQuery(path, [], {
      orderBy: ["endTime", "desc"],
      limit: 100,
    });
    // Convert timestamps before returning
    const trips = tripsRaw.map(doc => {
      const tripData = convertTripTimestamps(doc);
      return {
        ...tripData,
        id: tripData.id // ID is already required in the type
      };
    }) as TripHistoryItem[];
    return { vehicleId, trips };
  } catch (error: any) {
    console.error(`Error fetching trip history for vehicle ${vehicleId}:`, error);
    return rejectWithValue(error.message || "Failed to fetch trip history");
  }
});

export const fetchTripDetails = createAsyncThunk<
  TripDetails, // Return type
  { vehicleId: string; tripId: string }, // Argument type
  ThunkApiConfig
>("trip/fetchTripDetails", async ({ vehicleId, tripId }, { rejectWithValue }) => {
  if (!vehicleId || !tripId) {
    return rejectWithValue("Vehicle ID and Trip ID are required.");
  }
  try {
    const path = `vehicleData/${vehicleId}/trips`;
    const tripDetailsRaw = await firestoreService.getDocument(path, tripId);
    if (!tripDetailsRaw) {
      throw new Error("Trip not found");
    }
    // Convert timestamps before returning
    const tripDetails = convertTripTimestamps(tripDetailsRaw) as TripDetails;
    // Simulate driving events data for demonstration
    tripDetails.drivingEvents = {
      harshAccelerationCount: Math.floor(Math.random() * 5),
      harshBrakingCount: Math.floor(Math.random() * 5),
    };
  } catch (error: any) {
    console.error(`Error fetching trip details for trip ${tripId}:`, error);
    return rejectWithValue(error.message || "Failed to fetch trip details");
  }
});

// --- Slice Definition ---

const tripSlice = createSlice({
  name: "trip",
  initialState,
  reducers: {
    clearTripState: (state) => {
      state.tripHistory = [];
      state.currentTripDetails = null;
      state.loading = false;
      state.error = null;
    },
    clearCurrentTripDetails: (state) => {
      state.currentTripDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Trip History
      .addCase(fetchTripHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTripHistory.fulfilled, (state, action: PayloadAction<{ vehicleId: string; trips: TripHistoryItem[] }>) => {
        state.loading = false;
        state.tripHistory = action.payload.trips;
      })
      .addCase(fetchTripHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch trip history";
      })
      // Fetch Trip Details
      .addCase(fetchTripDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentTripDetails = null;
      })
      .addCase(fetchTripDetails.fulfilled, (state, action: PayloadAction<TripDetails>) => {
        state.loading = false;
        state.currentTripDetails = action.payload;
      })
      .addCase(fetchTripDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch trip details";
      });
  },
});

export const { clearTripState, clearCurrentTripDetails } = tripSlice.actions;

export default tripSlice.reducer;
