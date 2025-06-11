// src/store/slices/vehicleSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { firestoreService, VehicleData } from "../../services/firestoreService"; // Assuming VehicleData type is defined
import { RootState } from "../index";

// Define interfaces for the state
export interface Vehicle extends VehicleData {
  id: string; // Ensure ID is part of the vehicle type
  ownerUserId: string;
}

export interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  loading: boolean;
  error: string | null;
}

// Define the initial state using the interface
const initialState: VehicleState = {
  vehicles: [],
  selectedVehicleId: null,
  loading: false,
  error: null,
};

// Define ThunkAPI config type
interface ThunkApiConfig {
  rejectValue: string;
  state: RootState;
}

// --- Async Thunks with Types ---

export const fetchUserVehicles = createAsyncThunk<
  Vehicle[], // Return type
  string, // Argument type (userId)
  ThunkApiConfig
>("vehicle/fetchUserVehicles", async (userId, { rejectWithValue }) => {
  if (!userId) {
    return rejectWithValue("User ID is required to fetch vehicles.");
  }
  try {
    // Assuming getUserVehicles returns an array of objects matching VehicleData & includes id
    const vehicles = await firestoreService.getUserVehicles(userId);
    return vehicles as Vehicle[]; // Cast or ensure the service returns the correct type
  } catch (error: any) {
    console.error("Error fetching user vehicles:", error);
    return rejectWithValue(error.message || "Failed to fetch vehicles");
  }
});

export const addVehicle = createAsyncThunk<
  Vehicle, // Return type
  { userId: string; vehicleData: Omit<Vehicle, "id" | "ownerUserId"> }, // Argument type
  ThunkApiConfig
>("vehicle/addVehicle", async ({ userId, vehicleData }, { rejectWithValue }) => {
  if (!userId || !vehicleData) {
    return rejectWithValue("User ID and vehicle data are required.");
  }
  try {
    const dataToAdd = { ...vehicleData, ownerUserId: userId };
    const docId = await firestoreService.addDocument("vehicles", dataToAdd);
    return { id: docId, ...dataToAdd } as Vehicle; // Return the full vehicle object
  } catch (error: any) {
    console.error("Error adding vehicle:", error);
    return rejectWithValue(error.message || "Failed to add vehicle");
  }
});

export const updateVehicle = createAsyncThunk<
  { vehicleId: string; dataToUpdate: Partial<VehicleData> }, // Return type
  { vehicleId: string; dataToUpdate: Partial<VehicleData> }, // Argument type
  ThunkApiConfig
>("vehicle/updateVehicle", async ({ vehicleId, dataToUpdate }, { rejectWithValue }) => {
  if (!vehicleId || !dataToUpdate) {
    return rejectWithValue("Vehicle ID and data are required.");
  }
  try {
    await firestoreService.updateDocument("vehicles", vehicleId, dataToUpdate);
    return { vehicleId, dataToUpdate };
  } catch (error: any) {
    console.error("Error updating vehicle:", error);
    return rejectWithValue(error.message || "Failed to update vehicle");
  }
});

export const deleteVehicle = createAsyncThunk<
  string, // Return type (vehicleId)
  string, // Argument type (vehicleId)
  ThunkApiConfig
>("vehicle/deleteVehicle", async (vehicleId, { rejectWithValue }) => {
  if (!vehicleId) {
    return rejectWithValue("Vehicle ID is required.");
  }
  try {
    await firestoreService.deleteDocument("vehicles", vehicleId);
    return vehicleId;
  } catch (error: any) {
    console.error("Error deleting vehicle:", error);
    return rejectWithValue(error.message || "Failed to delete vehicle");
  }
});

// --- Slice Definition ---

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    setSelectedVehicle: (state, action: PayloadAction<string | null>) => {
      state.selectedVehicleId = action.payload;
    },
    clearVehicleState: (state) => {
      state.vehicles = [];
      state.selectedVehicleId = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Vehicles
      .addCase(fetchUserVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserVehicles.fulfilled, (state, action: PayloadAction<Vehicle[]>) => {
        state.loading = false;
        state.vehicles = action.payload;
        if (!state.selectedVehicleId && state.vehicles.length > 0) {
          state.selectedVehicleId = state.vehicles[0].id;
        }
      })
      .addCase(fetchUserVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch vehicles";
      })
      // Add Vehicle
      .addCase(addVehicle.pending, (state) => {
        state.loading = true;
      })
      .addCase(addVehicle.fulfilled, (state, action: PayloadAction<Vehicle>) => {
        state.loading = false;
        state.vehicles.push(action.payload);
        state.selectedVehicleId = action.payload.id;
      })
      .addCase(addVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to add vehicle";
      })
      // Update Vehicle
      .addCase(updateVehicle.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateVehicle.fulfilled, (state, action: PayloadAction<{ vehicleId: string; dataToUpdate: Partial<VehicleData> }>) => {
        state.loading = false;
        const index = state.vehicles.findIndex(v => v.id === action.payload.vehicleId);
        if (index !== -1) {
          // Create a safe update object without potentially problematic properties
          const updateData = { ...action.payload.dataToUpdate };
          // Ensure we're not trying to update these properties
          delete (updateData as any).ownerUserId;
          delete (updateData as any).id;
          
          state.vehicles[index] = { ...state.vehicles[index], ...updateData };
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update vehicle";
      })
      // Delete Vehicle
      .addCase(deleteVehicle.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteVehicle.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.vehicles = state.vehicles.filter(v => v.id !== action.payload);
        if (state.selectedVehicleId === action.payload) {
          state.selectedVehicleId = state.vehicles.length > 0 ? state.vehicles[0].id : null;
        }
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to delete vehicle";
      });
  },
});

export const { setSelectedVehicle, clearVehicleState } = vehicleSlice.actions;

export default vehicleSlice.reducer;
