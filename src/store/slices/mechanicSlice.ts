// src/store/slices/mechanicSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// Removed unused import: import { firestoreService } from "../../services/firestoreService";
import { RootState } from "../index";

// --- Interfaces ---

// Define structure for a Mechanic
export interface Mechanic {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  location: { latitude: number; longitude: number }; // Or GeoPoint
  // Add other relevant fields like address, phone, reviews, etc.
}

// Define structure for a Service Request
export interface ServiceRequest {
  id: string;
  userId: string;
  vehicleId: string;
  problemType: string;
  location: { latitude: number; longitude: number };
  status: "Searching" | "Found" | "En Route" | "Arrived" | "InProgress" | "Completed" | "Cancelled";
  mechanicId?: string | null;
  mechanicDetails?: Partial<Mechanic> | null; // Store basic details when found
  requestTime: string; // ISO string or Timestamp
  estimatedArrivalTime?: string | null;
  dtcCodes?: string[]; // Optional DTCs that triggered the request
  // Add other fields like notes, etc.
}

// Define structure for Service History Item related to mechanic services
export interface MechanicServiceHistoryItem {
  id: string;
  requestId: string; // Link to the original service request
  mechanicId: string;
  mechanicName: string;
  serviceDate: string; // ISO string or Timestamp
  cost?: number;
  rating?: number;
  feedback?: string;
  // Add other relevant fields
}

// Define the state structure
export interface MechanicState {
  mechanics: Mechanic[]; // General list (maybe fetched based on area?)
  nearbyMechanics: Mechanic[]; // Mechanics near user/vehicle
  selectedMechanic: Mechanic | null;
  currentServiceRequest: ServiceRequest | null;
  serviceHistory: MechanicServiceHistoryItem[];
  loading: boolean;
  error: string | null;
}

// --- Initial State ---

const initialState: MechanicState = {
  mechanics: [],
  nearbyMechanics: [],
  selectedMechanic: null,
  currentServiceRequest: null,
  serviceHistory: [],
  loading: false,
  error: null,
};

// --- Thunk API Config ---

interface ThunkApiConfig {
  rejectValue: string;
  state: RootState;
}

// --- Async Thunks (Example structure - adapt based on actual service functions) ---

// Example: Fetch nearby mechanics based on location and problem type
export const fetchNearbyMechanics = createAsyncThunk<
  Mechanic[], // Return type
  { latitude: number; longitude: number; problemType?: string }, // Argument type
  ThunkApiConfig
>("mechanic/fetchNearby", async ({ latitude, longitude, problemType }, { rejectWithValue }) => {
  try {
    // Replace with actual service call
    // const mechanics = await firestoreService.findNearbyMechanics(latitude, longitude, problemType);
    // Mock implementation:
    const mockMechanics: Mechanic[] = [
      { id: "mech1", name: "Speedy Auto Repair", specialties: ["Engine", "Brakes"], rating: 4.5, location: { latitude: latitude + 0.01, longitude: longitude + 0.01 } },
      { id: "mech2", name: "Reliable Mechanics", specialties: ["Tires", "Battery", "Engine"], rating: 4.8, location: { latitude: latitude - 0.01, longitude: longitude - 0.01 } },
    ];
    const filteredMechanics = problemType 
      ? mockMechanics.filter(m => m.specialties.includes(problemType))
      : mockMechanics;
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return filteredMechanics;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch nearby mechanics");
  }
});

// Example: Create a new service request
export const createServiceRequest = createAsyncThunk<
  ServiceRequest, // Return type
  Omit<ServiceRequest, "id" | "status" | "requestTime" | "mechanicId" | "mechanicDetails">, // Argument type
  ThunkApiConfig
>("mechanic/createRequest", async (requestData, { rejectWithValue }) => {
  try {
    const newRequest: ServiceRequest = {
      ...requestData,
      id: `req-${Date.now()}`, // Generate mock ID
      status: "Searching",
      requestTime: new Date().toISOString(),
    };
    // Replace with actual service call to save the request
    // await firestoreService.saveServiceRequest(newRequest);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return newRequest;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to create service request");
  }
});

// Example: Cancel a service request
export const cancelServiceRequest = createAsyncThunk<
  string, // Return type (request ID)
  string, // Argument type (requestId)
  ThunkApiConfig
>("mechanic/cancelRequest", async (requestId, { rejectWithValue }) => {
  try {
    // Replace with actual service call to update request status to Cancelled
    // await firestoreService.updateServiceRequestStatus(requestId, "Cancelled");
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return requestId;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to cancel service request");
  }
});

// --- Slice Definition ---

const mechanicSlice = createSlice({
  name: "mechanic",
  initialState,
  reducers: {
    // Simple reducer to select a mechanic from the list
    selectMechanic: (state, action: PayloadAction<Mechanic | null>) => {
      state.selectedMechanic = action.payload;
    },
    // Reducer to update request status locally (e.g., based on simulation or push notifications)
    updateRequestStatusLocally: (state, action: PayloadAction<{ requestId: string; status: ServiceRequest["status"]; mechanicDetails?: Partial<Mechanic> }>) => {
      if (state.currentServiceRequest?.id === action.payload.requestId) {
        state.currentServiceRequest.status = action.payload.status;
        if (action.payload.mechanicDetails) {
          state.currentServiceRequest.mechanicDetails = action.payload.mechanicDetails;
        }
      }
    },
    clearMechanicState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Nearby Mechanics
      .addCase(fetchNearbyMechanics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyMechanics.fulfilled, (state, action: PayloadAction<Mechanic[]>) => {
        state.loading = false;
        state.nearbyMechanics = action.payload;
      })
      .addCase(fetchNearbyMechanics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch mechanics";
      })
      // Create Service Request
      .addCase(createServiceRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createServiceRequest.fulfilled, (state, action: PayloadAction<ServiceRequest>) => {
        state.loading = false;
        state.currentServiceRequest = action.payload;
      })
      .addCase(createServiceRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to create request";
      })
      // Cancel Service Request
      .addCase(cancelServiceRequest.pending, (state) => {
        state.loading = true; // Or a specific loading flag for cancellation
      })
      .addCase(cancelServiceRequest.fulfilled, (state, action: PayloadAction<string>) => {
        if (state.currentServiceRequest?.id === action.payload) {
          state.currentServiceRequest = null; // Clear the request
        }
        state.loading = false;
      })
      .addCase(cancelServiceRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to cancel request";
      });
      // Add cases for other thunks (fetch history, rate mechanic, etc.) if implemented
  },
});

export const {
  selectMechanic,
  updateRequestStatusLocally,
  clearMechanicState,
} = mechanicSlice.actions;

export default mechanicSlice.reducer;
