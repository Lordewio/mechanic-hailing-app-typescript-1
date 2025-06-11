// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";

// Import slices
import authReducer from "./slices/authSlice";
import vehicleReducer from "./slices/vehicleSlice";
import diagnosticsReducer from "./slices/diagnosticsSlice";
import mechanicReducer from "./slices/mechanicSlice";
import tripReducer from "./slices/tripSlice";
import notificationReducer from "./slices/notificationSlice";
import maintenanceReducer from "./slices/maintenanceSlice";

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  vehicle: vehicleReducer,
  diagnostics: diagnosticsReducer,
  mechanic: mechanicReducer,
  trip: tripReducer,
  notification: notificationReducer,
  maintenance: maintenanceReducer,
});

// Configure store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific non-serializable actions/paths if needed, especially with Firebase Timestamps
        // It's often better to handle non-serializable data transformation within the slice/thunk
        ignoredActions: [
          "auth/setUser", // Firebase User object might not be fully serializable
          "maintenance/fetchUpcomingMaintenance/fulfilled", // Timestamps
          "maintenance/fetchServiceHistory/fulfilled", // Timestamps
          "maintenance/addCustomSchedule/fulfilled", // Timestamps
          "maintenance/logCompletedService/fulfilled", // Timestamps
          "maintenance/updateMaintenanceSchedule/fulfilled", // Timestamps
        ],
        ignoredPaths: [
          "auth.user", // Contains non-serializable parts of Firebase User
          "maintenance.upcomingMaintenance", // Items might contain Date objects
          "maintenance.serviceHistory", // Items might contain Date objects
        ],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState, vehicle: VehicleState, ...}
export type AppDispatch = typeof store.dispatch;

export default store;

