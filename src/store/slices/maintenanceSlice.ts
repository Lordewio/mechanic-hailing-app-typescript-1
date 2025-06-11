// src/store/slices/maintenanceSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { firestoreService } from "../../services/firestoreService"; 
import { Timestamp } from "../../services/firestoreService"; // Import Timestamp separately
import { RootState } from "../index"; // Import RootState for thunk typings

// --- Type Definitions ---

// Define the structure for a maintenance schedule item
export interface MaintenanceSchedule {
  id: string;
  serviceItem: string;
  dueDate: Date | null; // Use JS Date in Redux state
  dueMileageKm: number | null;
  notes?: string;
  status: "Scheduled" | "Completed" | "Overdue" | "Skipped" | "Recommended"; // Add more statuses as needed
  creationDate: Date; // Use JS Date
  isRecommendation?: boolean;
  isRecurring?: boolean;
  recurringIntervalMonths?: number;
  recurringIntervalKm?: number;
}

// Define the structure for a service history log item
export interface ServiceHistoryLog {
  id: string;
  serviceItem: string;
  serviceDate: Date; // Use JS Date
  mileageKm: number | null;
  cost: number | null;
  notes?: string;
  mechanicName?: string;
  receiptUrl?: string; // URL to the uploaded receipt in storage
  relatedScheduleId?: string; // Link back to the schedule if applicable
}

// Define the structure for the maintenance state
export interface MaintenanceState {
  upcomingMaintenance: MaintenanceSchedule[];
  serviceHistory: ServiceHistoryLog[];
  loadingUpcoming: boolean;
  loadingHistory: boolean;
  loadingAction: boolean; // For add/update/delete actions
  error: string | null;
}

// Define types for async thunk arguments
interface AddSchedulePayload {
  vehicleId: string;
  scheduleData: Omit<MaintenanceSchedule, "id" | "status" | "creationDate">; // Data needed to create a schedule
}

interface LogServicePayload {
  vehicleId: string;
  logData: Omit<ServiceHistoryLog, "id">; // Data needed to log service
}

interface UpdateStatusPayload {
  vehicleId: string;
  scheduleId: string;
  status: MaintenanceSchedule["status"];
  completionData?: Omit<ServiceHistoryLog, "id">; // Optional data if marking as complete
}

interface UpdateSchedulePayload {
  vehicleId: string;
  scheduleId: string;
  data: Partial<Omit<MaintenanceSchedule, "id" | "creationDate" | "status">>; // Allow partial updates
}

interface DeleteItemPayload {
  vehicleId: string;
  itemId: string; // Can be scheduleId or logId
}

// --- Helper Functions ---

const getSchedulesPath = (vehicleId: string) => `vehicleData/${vehicleId}/maintenanceSchedules`;
const getHistoryPath = (vehicleId: string) => `vehicleData/${vehicleId}/serviceHistory`;

// Helper to convert Firestore data (with Timestamps) to Redux state data (with JS Dates)
const convertScheduleFromFirestore = (doc: any): MaintenanceSchedule => {
    const data = doc.data();
    return {
        ...data,
        id: doc.id,
        dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : null,
        creationDate: data.creationDate?.toDate ? data.creationDate.toDate() : new Date(), // Default if missing
    } as MaintenanceSchedule;
};

const convertHistoryLogFromFirestore = (doc: any): ServiceHistoryLog => {
    const data = doc.data();
    return {
        ...data,
        id: doc.id,
        serviceDate: data.serviceDate?.toDate ? data.serviceDate.toDate() : new Date(), // Default if missing
    } as ServiceHistoryLog;
};

// Helper to convert Redux state data (with JS Dates) to Firestore data (with Timestamps)
const convertScheduleToFirestore = (scheduleData: Partial<MaintenanceSchedule>): any => {
    const dataToUpdate = { ...scheduleData };
    if (dataToUpdate.dueDate instanceof Date) {
        // Use as any to avoid type error during conversion
        (dataToUpdate as any).dueDate = Timestamp.fromDate(dataToUpdate.dueDate);
    }
    // Remove id if present, as it shouldn't be part of the document data itself
    delete dataToUpdate.id;
    return dataToUpdate;
};

const convertHistoryLogToFirestore = (logData: Partial<ServiceHistoryLog>): any => {
    const dataToUpdate = { ...logData };
    if (dataToUpdate.serviceDate instanceof Date) {
        // Use as any to avoid type error during conversion
        (dataToUpdate as any).serviceDate = Timestamp.fromDate(dataToUpdate.serviceDate);
    }
    delete dataToUpdate.id;
    return dataToUpdate;
};

// --- Async Thunks ---

export const fetchUpcomingMaintenance = createAsyncThunk<
  MaintenanceSchedule[], // Return type
  string, // Argument type (vehicleId)
  { rejectValue: string; state: RootState } // Thunk config
>(
  "maintenance/fetchUpcomingMaintenance",
  async (vehicleId, { rejectWithValue }) => {
    if (!vehicleId) return rejectWithValue("Vehicle ID required");
    try {
      const schedulesDocs = await firestoreService.getDocumentsByQuery(
        getSchedulesPath(vehicleId),
        [["status", "==", "Scheduled"]],
        { orderBy: ["dueDate", "asc"] }
      );

      const schedules = schedulesDocs.map(convertScheduleFromFirestore);

      // TODO: Add logic for recommendations
      const recommendations: MaintenanceSchedule[] = [];

      // Simulate overdue status check
      const now = new Date();
      const upcoming = schedules.map(s => {
        let status = s.status;
        if (status === "Scheduled" && s.dueDate && s.dueDate < now) {
          status = "Overdue";
        }
        return { ...s, status };
      });

      return [...upcoming, ...recommendations];
    } catch (error: any) {
      console.error("Error fetching upcoming maintenance:", error);
      return rejectWithValue(error.message || "Failed to fetch upcoming maintenance");
    }
  }
);

export const fetchServiceHistory = createAsyncThunk<
  ServiceHistoryLog[], // Return type
  string, // Argument type (vehicleId)
  { rejectValue: string; state: RootState } // Thunk config
>(
  "maintenance/fetchServiceHistory",
  async (vehicleId, { rejectWithValue }) => {
    if (!vehicleId) return rejectWithValue("Vehicle ID required");
    try {
      const historyDocs = await firestoreService.getDocumentsByQuery(
        getHistoryPath(vehicleId),
        [],
        { orderBy: ["serviceDate", "desc"], limit: 100 }
      );
      return historyDocs.map(convertHistoryLogFromFirestore);
    } catch (error: any) {
      console.error("Error fetching service history:", error);
      return rejectWithValue(error.message || "Failed to fetch service history");
    }
  }
);

export const addCustomSchedule = createAsyncThunk<
  MaintenanceSchedule, // Return type
  AddSchedulePayload, // Argument type
  { rejectValue: string; state: RootState } // Thunk config
>(
  "maintenance/addCustomSchedule",
  async ({ vehicleId, scheduleData }, { rejectWithValue }) => {
    if (!vehicleId || !scheduleData) return rejectWithValue("Vehicle ID and schedule data required");
    try {
      const dataWithStatus = {
        ...scheduleData,
        status: "Scheduled" as const,
        creationDate: new Date(), // Use JS Date for consistency before conversion
      };
      const firestoreData = convertScheduleToFirestore(dataWithStatus);
      // Add creationDate as Timestamp here
      firestoreData.creationDate = Timestamp.fromDate(dataWithStatus.creationDate);

      const docId = await firestoreService.addDocument(getSchedulesPath(vehicleId), firestoreData);
      // Return the complete object with the generated ID and JS Dates
      const result: MaintenanceSchedule = { 
          ...dataWithStatus, 
          id: docId, 
          dueDate: scheduleData.dueDate instanceof Date ? scheduleData.dueDate : null, // Ensure dueDate is Date or null
          dueMileageKm: scheduleData.dueMileageKm ?? null,
          notes: scheduleData.notes ?? undefined
      };
      return result;
    } catch (error: any) {
      console.error("Error adding custom schedule:", error);
      return rejectWithValue(error.message || "Failed to add schedule");
    }
  }
);

export const logCompletedService = createAsyncThunk<
  ServiceHistoryLog, // Return type
  LogServicePayload, // Argument type
  { rejectValue: string; state: RootState } // Thunk config
>(
  "maintenance/logCompletedService",
  async ({ vehicleId, logData }, { rejectWithValue }) => {
    if (!vehicleId || !logData) return rejectWithValue("Vehicle ID and log data required");
    try {
      const firestoreData = convertHistoryLogToFirestore(logData);
      const docId = await firestoreService.addDocument(getHistoryPath(vehicleId), firestoreData);
      // Return the complete object with the generated ID and JS Dates
      const result: ServiceHistoryLog = {
          ...logData,
          id: docId,
          serviceDate: logData.serviceDate instanceof Date ? logData.serviceDate : new Date(), // Ensure serviceDate is Date
          mileageKm: logData.mileageKm ?? null,
          cost: logData.cost ?? null,
          notes: logData.notes ?? undefined,
          mechanicName: logData.mechanicName ?? undefined,
          receiptUrl: logData.receiptUrl ?? undefined,
          relatedScheduleId: logData.relatedScheduleId ?? undefined
      };
      return result;
    } catch (error: any) {
      console.error("Error logging completed service:", error);
      return rejectWithValue(error.message || "Failed to log service");
    }
  }
);

export const updateScheduleStatus = createAsyncThunk<
  { scheduleId: string; status: MaintenanceSchedule["status"] }, // Return type
  UpdateStatusPayload, // Argument type
  { rejectValue: string; state: RootState; dispatch: any } // Thunk config with any for dispatch
>(
  "maintenance/updateScheduleStatus",
  async ({ vehicleId, scheduleId, status, completionData }, { rejectWithValue, dispatch }) => {
    if (!vehicleId || !scheduleId || !status) return rejectWithValue("Vehicle ID, Schedule ID, and Status required");
    try {
      await firestoreService.updateDocument(getSchedulesPath(vehicleId), scheduleId, { status });
      if (status === "Completed" && completionData) {
        // Ensure completionData has a serviceDate before logging
        const logDataWithDate = { 
            ...completionData, 
            serviceDate: completionData.serviceDate instanceof Date ? completionData.serviceDate : new Date() 
        };
        await dispatch(logCompletedService({ vehicleId, logData: logDataWithDate }));
      }
      return { scheduleId, status };
    } catch (error: any) {
      console.error("Error updating schedule status:", error);
      return rejectWithValue(error.message || "Failed to update status");
    }
  }
);

export const updateMaintenanceSchedule = createAsyncThunk<
  { scheduleId: string; updatedData: MaintenanceSchedule }, // Return type
  UpdateSchedulePayload, // Argument type
  { rejectValue: string; state: RootState } // Thunk config
>(
  "maintenance/updateMaintenanceSchedule",
  async ({ vehicleId, scheduleId, data }, { rejectWithValue, getState }) => {
    if (!vehicleId || !scheduleId || !data) {
      return rejectWithValue("Vehicle ID, Schedule ID, and data are required.");
    }
    try {
      const firestoreData = convertScheduleToFirestore(data);
      await firestoreService.updateDocument(getSchedulesPath(vehicleId), scheduleId, firestoreData);
      
      // Get the current state to merge updates correctly
      const currentState = getState().maintenance.upcomingMaintenance.find(s => s.id === scheduleId);
      if (!currentState) {
          return rejectWithValue("Original schedule not found in state");
      }

      // Construct the return data with JS Dates, merging with existing state
      const updatedDataWithId: MaintenanceSchedule = {
          ...currentState, // Start with existing data
          ...data, // Apply updates from payload
          id: scheduleId, // Ensure ID is present
          // Ensure dueDate is a Date object or null
          dueDate: data.dueDate instanceof Date ? data.dueDate : 
                   (data.dueDate as any)?.toDate ? (data.dueDate as any).toDate() : 
                   currentState.dueDate, // Fallback to existing if update is invalid/missing
      };
      return { scheduleId, updatedData: updatedDataWithId };
    } catch (error: any) {
      console.error("Error updating maintenance schedule:", error);
      return rejectWithValue(error.message || "Failed to update schedule");
    }
  }
);

export const deleteSchedule = createAsyncThunk<
  string, // Return type (scheduleId)
  DeleteItemPayload, // Argument type
  { rejectValue: string; state: RootState } // Thunk config
>(
  "maintenance/deleteSchedule",
  async ({ vehicleId, itemId }, { rejectWithValue }) => {
    if (!vehicleId || !itemId) return rejectWithValue("Vehicle ID and Schedule ID required");
    try {
      await firestoreService.deleteDocument(getSchedulesPath(vehicleId), itemId);
      return itemId;
    } catch (error: any) {
      console.error("Error deleting schedule:", error);
      return rejectWithValue(error.message || "Failed to delete schedule");
    }
  }
);

export const deleteServiceLog = createAsyncThunk<
  string, // Return type (logId)
  DeleteItemPayload, // Argument type
  { rejectValue: string; state: RootState } // Thunk config
>(
  "maintenance/deleteServiceLog",
  async ({ vehicleId, itemId }, { rejectWithValue }) => {
    if (!vehicleId || !itemId) return rejectWithValue("Vehicle ID and Log ID required");
    try {
      await firestoreService.deleteDocument(getHistoryPath(vehicleId), itemId);
      return itemId;
    } catch (error: any) {
      console.error("Error deleting service log:", error);
      return rejectWithValue(error.message || "Failed to delete service log");
    }
  }
);

// --- Initial State ---

const initialState: MaintenanceState = {
  upcomingMaintenance: [],
  serviceHistory: [],
  loadingUpcoming: false,
  loadingHistory: false,
  loadingAction: false,
  error: null,
};

// --- Slice Definition ---

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {
    clearMaintenanceState: (state) => {
      state.upcomingMaintenance = [];
      state.serviceHistory = [];
      state.loadingUpcoming = false;
      state.loadingHistory = false;
      state.loadingAction = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Upcoming
      .addCase(fetchUpcomingMaintenance.pending, (state) => {
        state.loadingUpcoming = true;
        state.error = null;
      })
      .addCase(fetchUpcomingMaintenance.fulfilled, (state, action: PayloadAction<MaintenanceSchedule[]>) => {
        state.loadingUpcoming = false;
        state.upcomingMaintenance = action.payload;
      })
      .addCase(fetchUpcomingMaintenance.rejected, (state, action) => {
        state.loadingUpcoming = false;
        state.error = action.payload ?? "Failed to fetch upcoming maintenance";
      })
      // Fetch History
      .addCase(fetchServiceHistory.pending, (state) => {
        state.loadingHistory = true;
        state.error = null;
      })
      .addCase(fetchServiceHistory.fulfilled, (state, action: PayloadAction<ServiceHistoryLog[]>) => {
        state.loadingHistory = false;
        state.serviceHistory = action.payload;
      })
      .addCase(fetchServiceHistory.rejected, (state, action) => {
        state.loadingHistory = false;
        state.error = action.payload ?? "Failed to fetch service history";
      })
      // Add Schedule
      .addCase(addCustomSchedule.pending, (state) => {
        state.loadingAction = true;
        state.error = null;
      })
      .addCase(addCustomSchedule.fulfilled, (state, action: PayloadAction<MaintenanceSchedule>) => {
        state.loadingAction = false;
        state.upcomingMaintenance.push(action.payload);
        // Sort by due date (handle null dates)
        state.upcomingMaintenance.sort((a, b) => {
            const dateA = a.dueDate?.getTime() ?? Infinity;
            const dateB = b.dueDate?.getTime() ?? Infinity;
            return dateA - dateB;
        });
      })
      .addCase(addCustomSchedule.rejected, (state, action) => {
        state.loadingAction = false;
        state.error = action.payload ?? "Failed to add schedule";
      })
      // Log Service
      .addCase(logCompletedService.pending, (state) => {
        state.loadingAction = true;
        state.error = null;
      })
      .addCase(logCompletedService.fulfilled, (state, action: PayloadAction<ServiceHistoryLog>) => {
        state.loadingAction = false;
        state.serviceHistory.unshift(action.payload); // Add to beginning of array
      })
      .addCase(logCompletedService.rejected, (state, action) => {
        state.loadingAction = false;
        state.error = action.payload ?? "Failed to log service";
      })
      // Update Status
      .addCase(updateScheduleStatus.pending, (state) => {
        state.loadingAction = true;
        state.error = null;
      })
      .addCase(updateScheduleStatus.fulfilled, (state, action: PayloadAction<{ scheduleId: string; status: MaintenanceSchedule["status"] }>) => {
        state.loadingAction = false;
        const { scheduleId, status } = action.payload;
        // Update status in state
        const index = state.upcomingMaintenance.findIndex(s => s.id === scheduleId);
        if (index !== -1) {
          state.upcomingMaintenance[index].status = status;
          // If completed, remove from upcoming
          if (status === "Completed") {
            state.upcomingMaintenance.splice(index, 1);
          }
        }
      })
      .addCase(updateScheduleStatus.rejected, (state, action) => {
        state.loadingAction = false;
        state.error = action.payload ?? "Failed to update status";
      })
      // Update Schedule
      .addCase(updateMaintenanceSchedule.pending, (state) => {
        state.loadingAction = true;
        state.error = null;
      })
      .addCase(updateMaintenanceSchedule.fulfilled, (state, action: PayloadAction<{ scheduleId: string; updatedData: MaintenanceSchedule }>) => {
        state.loadingAction = false;
        const { scheduleId, updatedData } = action.payload;
        // Update in state
        const index = state.upcomingMaintenance.findIndex(s => s.id === scheduleId);
        if (index !== -1) {
          state.upcomingMaintenance[index] = updatedData;
          // Re-sort by due date
          state.upcomingMaintenance.sort((a, b) => {
              const dateA = a.dueDate?.getTime() ?? Infinity;
              const dateB = b.dueDate?.getTime() ?? Infinity;
              return dateA - dateB;
          });
        }
      })
      .addCase(updateMaintenanceSchedule.rejected, (state, action) => {
        state.loadingAction = false;
        state.error = action.payload ?? "Failed to update schedule";
      })
      // Delete Schedule
      .addCase(deleteSchedule.pending, (state) => {
        state.loadingAction = true;
        state.error = null;
      })
      .addCase(deleteSchedule.fulfilled, (state, action: PayloadAction<string>) => {
        state.loadingAction = false;
        const scheduleId = action.payload;
        // Remove from state
        state.upcomingMaintenance = state.upcomingMaintenance.filter(s => s.id !== scheduleId);
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.loadingAction = false;
        state.error = action.payload ?? "Failed to delete schedule";
      })
      // Delete Service Log
      .addCase(deleteServiceLog.pending, (state) => {
        state.loadingAction = true;
        state.error = null;
      })
      .addCase(deleteServiceLog.fulfilled, (state, action: PayloadAction<string>) => {
        state.loadingAction = false;
        const logId = action.payload;
        // Remove from state
        state.serviceHistory = state.serviceHistory.filter(log => log.id !== logId);
      })
      .addCase(deleteServiceLog.rejected, (state, action) => {
        state.loadingAction = false;
        state.error = action.payload ?? "Failed to delete service log";
      });
  },
});

export const { clearMaintenanceState } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
