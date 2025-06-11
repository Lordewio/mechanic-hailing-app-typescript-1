// src/store/slices/diagnosticsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// Remove unused import: import { databaseService, LiveVehicleData } from "../../services/databaseService";
import { LiveVehicleData } from "../../services/databaseService"; 
import { firestoreService, PeriodicDataRecord, DTCRecord } from "../../services/firestoreService";
import { RootState } from "../index";

// --- Interfaces for State ---

// Interface for the live data snapshot - redefine instead of extending to avoid type conflicts
export interface LiveDiagnosticsData {
  timestamp: string | null; // ISO string or null
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
}

// Interface for periodic data history items (assuming structure from firestoreService)
export interface PeriodicHistoryItem extends PeriodicDataRecord {
  id: string; // Ensure ID is included if fetched with ID
}

// Interface for DTC history items (assuming structure from firestoreService)
export interface DTCHistoryItem extends DTCRecord {
  id: string; // Ensure ID is included if fetched with ID
}

export interface VehicleHealthSummary {
  overallHealthScore: number;
  engineHealth: string;
  batteryHealth: string;
  tireHealth: string;
  lastAnalyzedDate: string;
  predictedMaintenance: Array<{ item: string; estimatedDate: string; severity: string }>;
}

// Interface for the overall diagnostics state
export interface DiagnosticsState {
  liveData: LiveDiagnosticsData;
  periodicHistory: PeriodicHistoryItem[];
  dtcHistory: DTCHistoryItem[];
  vehicleHealthSummary: VehicleHealthSummary | null;
  isConnected: boolean;
  loading: {
    live: boolean; // Might not be needed if updates are pushed
    periodic: boolean;
    dtc: boolean;
  };
  error: {
    live: string | null;
    periodic: string | null;
    dtc: string | null;
  };
}

// --- Initial State ---

const initialState: DiagnosticsState = {
  liveData: {
    timestamp: null,
    location: null,
    speed_obd: null,
    rpm: null,
    throttle_pos: null,
    coolant_temp: null,
    fuel_level: null,
    battery_voltage: null,
    engine_load: null,
  },
  periodicHistory: [],
  dtcHistory: [],
  vehicleHealthSummary: null,
  isConnected: false,
  loading: {
    live: false,
    periodic: false,
    dtc: false,
  },
  error: {
    live: null,
    periodic: null,
    dtc: null,
  },
};

// --- Thunk API Config ---

interface ThunkApiConfig {
  rejectValue: string;
  state: RootState;
}

// --- Async Thunks with Types ---

export const fetchPeriodicData = createAsyncThunk<
  { vehicleId: string; data: PeriodicHistoryItem[] }, // Return type
  string, // Argument type (vehicleId)
  ThunkApiConfig
>("diagnostics/fetchPeriodicData", async (vehicleId, { rejectWithValue }) => {
  if (!vehicleId) return rejectWithValue("Vehicle ID required");
  try {
    const data = await firestoreService.getPeriodicVehicleData(vehicleId, 100);
    // Ensure the fetched data conforms to PeriodicHistoryItem structure
    return { vehicleId, data: data as PeriodicHistoryItem[] };
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch periodic data");
  }
});

export const fetchDTCHistory = createAsyncThunk<
  { vehicleId: string; data: DTCHistoryItem[] }, // Return type
  string, // Argument type (vehicleId)
  ThunkApiConfig
>("diagnostics/fetchDTCHistory", async (vehicleId, { rejectWithValue }) => {
  if (!vehicleId) return rejectWithValue("Vehicle ID required");
  try {
    const data = await firestoreService.getVehicleDTCs(vehicleId, 100);
    // Ensure the fetched data conforms to DTCHistoryItem structure
    return { vehicleId, data: data as DTCHistoryItem[] };
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch DTC history");
  }
});

export const fetchVehicleHealthSummary = createAsyncThunk<
  { vehicleId: string; summary: VehicleHealthSummary }, // Return type
  string, // Argument type (vehicleId)
  ThunkApiConfig
>("diagnostics/fetchVehicleHealthSummary", async (vehicleId, { rejectWithValue }) => {
  if (!vehicleId) return rejectWithValue("Vehicle ID required");
  try {
    // Simulate fetching vehicle health summary
    const simulatedSummary: VehicleHealthSummary = {
      overallHealthScore: Math.floor(Math.random() * 100) + 1, // 1-100
      engineHealth: Math.random() > 0.2 ? "Good" : "Needs Attention",
      batteryHealth: Math.random() > 0.1 ? "Good" : "Weak",
      tireHealth: Math.random() > 0.3 ? "Good" : "Worn",
      lastAnalyzedDate: new Date().toISOString().split("T")[0],
      predictedMaintenance: [
        { item: "Oil Change", estimatedDate: "2025-07-15", severity: "High" },
        { item: "Tire Rotation", estimatedDate: "2025-08-01", severity: "Medium" },
      ],
    };
    return { vehicleId, summary: simulatedSummary };
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch vehicle health summary");
  }
});

// --- Slice Definition ---

const diagnosticsSlice = createSlice({
  name: "diagnostics",
  initialState,
  reducers: {
    // Use PayloadAction for typed payloads
    updateLiveData: (state, action: PayloadAction<Partial<LiveDiagnosticsData> | LiveVehicleData>) => {
      // Merge partial updates into liveData
      state.liveData = { 
        ...state.liveData, 
        ...action.payload, 
        timestamp: (action.payload as any).timestamp || new Date().toISOString() 
      };
      state.isConnected = true;
      state.error.live = null;
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (!action.payload) {
        // state.liveData = initialState.liveData; // Optional: Clear on disconnect
      }
    },
    clearDiagnosticsState: (state) => {
      state.liveData = initialState.liveData;
      state.periodicHistory = [];
      state.dtcHistory = [];
      state.isConnected = false;
      state.loading = initialState.loading;
      state.error = initialState.error;
    },
    clearSimulatedDTCs: (state) => {
      state.dtcHistory = [];
      state.error.dtc = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Periodic Data
      .addCase(fetchPeriodicData.pending, (state) => {
        state.loading.periodic = true;
        state.error.periodic = null;
      })
      .addCase(fetchPeriodicData.fulfilled, (state, action: PayloadAction<{ vehicleId: string; data: PeriodicHistoryItem[] }>) => {
        state.loading.periodic = false;
        state.periodicHistory = action.payload.data;
      })
      .addCase(fetchPeriodicData.rejected, (state, action) => {
        state.loading.periodic = false;
        state.error.periodic = action.payload ?? "Failed to fetch periodic data";
      })
      // Fetch DTC History
      .addCase(fetchDTCHistory.pending, (state) => {
        state.loading.dtc = true;
        state.error.dtc = null;
      })
      .addCase(fetchDTCHistory.fulfilled, (state, action: PayloadAction<{ vehicleId: string; data: DTCHistoryItem[] }>) => {
        state.loading.dtc = false;
        state.dtcHistory = action.payload.data;
      })
      .addCase(fetchDTCHistory.rejected, (state, action) => {
        state.loading.dtc = false;
        state.error.dtc = action.payload ?? "Failed to fetch DTC history";
      })
      // Fetch Vehicle Health Summary
      .addCase(fetchVehicleHealthSummary.pending, (state) => {
        state.loading.vehicleHealth = true;
        state.error.vehicleHealth = null;
      })
      .addCase(fetchVehicleHealthSummary.fulfilled, (state, action: PayloadAction<{ vehicleId: string; summary: VehicleHealthSummary }>) => {
        state.loading.vehicleHealth = false;
        state.vehicleHealthSummary = action.payload.summary;
      })
      .addCase(fetchVehicleHealthSummary.rejected, (state, action) => {
        state.loading.vehicleHealth = false;
        state.error.vehicleHealth = action.payload ?? "Failed to fetch vehicle health summary";
      });
  },
});

export const { updateLiveData, setConnectionStatus, clearDiagnosticsState, clearSimulatedDTCs } = diagnosticsSlice.actions;

// Export a selector for better memoization
export const selectDiagnosticsState = (state: RootState): DiagnosticsState => state.diagnostics;

export default diagnosticsSlice.reducer;
