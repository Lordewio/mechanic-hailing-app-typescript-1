// src/services/firestoreService.ts
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

// Export Timestamp for use in slices/components
export const Timestamp = firestore.Timestamp;
export type OrderByDirection = 'asc' | 'desc';

// --- Type Definitions for Firestore Data Structures ---

// Define base type for location data
export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string; // Optional address string
}

// Define base type for vehicle data stored in Firestore
export interface VehicleData {
  make: string;
  model: string;
  year: number;
  vin?: string;
  licensePlate?: string;
  nickname?: string;
  // Add other relevant vehicle fields
}

// Define type for periodic diagnostic data records
export interface PeriodicDataRecord {
  id: string; // Make ID required
  timestamp: FirebaseFirestoreTypes.Timestamp | Date; // Store as Timestamp, might convert to Date
  location?: LocationData | FirebaseFirestoreTypes.GeoPoint | null;
  speed_obd?: number | null;
  rpm?: number | null;
  throttle_pos?: number | null;
  coolant_temp?: number | null;
  fuel_level?: number | null;
  engine_load?: number | null;
  // Add other OBD2 parameters as needed
}

// Define type for Diagnostic Trouble Code (DTC) records
export interface DTCRecord {
  id: string; // Make ID required
  timestamp: FirebaseFirestoreTypes.Timestamp | Date;
  codes: string[]; // Array of DTC codes read at this time
  status?: string; // e.g., "Active", "Pending", "Cleared"
}

// Define type for Trip data (summary/details)
export interface TripData {
  id: string; // Make ID required
  startTime: FirebaseFirestoreTypes.Timestamp | Date;
  endTime: FirebaseFirestoreTypes.Timestamp | Date;
  startLocation?: LocationData | FirebaseFirestoreTypes.GeoPoint | null;
  endLocation?: LocationData | FirebaseFirestoreTypes.GeoPoint | null;
  distanceKm?: number;
  durationSeconds?: number;
  averageSpeedKmh?: number;
  maxSpeedKmh?: number;
  fuelConsumedLitersEstimate?: number;
  // Add other summary fields
}

export interface TripDetailsData extends TripData {
  routePath?: FirebaseFirestoreTypes.GeoPoint[] | LocationData[]; // Path as array of points
  drivingEvents?: {
    harshAccelerationCount?: number;
    harshBrakingCount?: number;
    // Add other event counts
  };
}

// Define type for Maintenance Schedule items
export interface MaintenanceSchedule {
  id: string; // Make ID required
  serviceItem: string;
  dueDate?: FirebaseFirestoreTypes.Timestamp | Date | null;
  dueMileageKm?: number | null;
  notes?: string;
  status: "Scheduled" | "Completed" | "Overdue" | "Cancelled" | "Recommended";
  creationDate?: FirebaseFirestoreTypes.Timestamp | Date;
  isRecommendation?: boolean; // Flag for manufacturer recommendations
}

// Define type for Service History logs
export interface ServiceLog {
  id: string; // Make ID required
  serviceDate: FirebaseFirestoreTypes.Timestamp | Date;
  serviceItem: string;
  mileageKm?: number;
  providerName?: string;
  cost?: number;
  notes?: string;
  receiptUrl?: string; // Link to uploaded receipt
  scheduleId?: string; // Optional link to the schedule it fulfilled
}

// --- Firestore Service Functions with Types ---

// Type helper for Firestore query options
interface QueryOptions {
  orderBy?: [string, OrderByDirection | undefined];
  limit?: number;
}

/**
 * Get a specific document from a Firestore collection.
 */
const getDocument = async <T extends { id: string }>(collectionPath: string, docId: string): Promise<T | null> => {
  if (!collectionPath || !docId) {
    console.error("Collection path and document ID are required.");
    return null;
  }
  try {
    const docSnapshot = await firestore().collection(collectionPath).doc(docId).get();
    if (docSnapshot.exists()) {
      // Combine ID with data and cast to the expected type T
      return { id: docSnapshot.id, ...docSnapshot.data() } as T;
    } else {
      console.log(`Document not found at ${collectionPath}/${docId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting document ${collectionPath}/${docId}:`, error);
    throw error;
  }
};

/**
 * Add a new document to a Firestore collection.
 */
const addDocument = async (collectionPath: string, data: Record<string, any>): Promise<string> => {
  if (!collectionPath || !data) {
    console.error("Collection path and data are required.");
    throw new Error("Missing required parameters for addDocument.");
  }
  try {
    const docRef = await firestore().collection(collectionPath).add({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Document added to ${collectionPath} with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Update an existing document in a Firestore collection.
 */
const updateDocument = async (collectionPath: string, docId: string, dataToUpdate: Record<string, any>): Promise<void> => {
  if (!collectionPath || !docId || !dataToUpdate) {
    console.error("Collection path, document ID, and data are required.");
    throw new Error("Missing required parameters for updateDocument.");
  }
  try {
    await firestore().collection(collectionPath).doc(docId).update({
      ...dataToUpdate,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Document ${collectionPath}/${docId} updated successfully.`);
  } catch (error) {
    console.error(`Error updating document ${collectionPath}/${docId}:`, error);
    throw error;
  }
};

/**
 * Set (overwrite) data for a document in a Firestore collection.
 */
const setDocument = async (collectionPath: string, docId: string, data: Record<string, any>): Promise<void> => {
  if (!collectionPath || !docId || !data) {
    console.error("Collection path, document ID, and data are required.");
    throw new Error("Missing required parameters for setDocument.");
  }
  try {
    await firestore().collection(collectionPath).doc(docId).set(data);
    console.log(`Document ${collectionPath}/${docId} set successfully.`);
  } catch (error) {
    console.error(`Error setting document ${collectionPath}/${docId}:`, error);
    throw error;
  }
};

/**
 * Delete a document from a Firestore collection.
 */
const deleteDocument = async (collectionPath: string, docId: string): Promise<void> => {
  if (!collectionPath || !docId) {
    console.error("Collection path and document ID are required.");
    throw new Error("Missing required parameters for deleteDocument.");
  }
  try {
    await firestore().collection(collectionPath).doc(docId).delete();
    console.log(`Document ${collectionPath}/${docId} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting document ${collectionPath}/${docId}:`, error);
    throw error;
  }
};

/**
 * Fetch documents from a collection based on a query.
 */
const getDocumentsByQuery = async <T>(collectionPath: string, queryParams: [string, FirebaseFirestoreTypes.WhereFilterOp, any][] = [], options: QueryOptions = {}): Promise<T[]> => {
  if (!collectionPath) {
    console.error("Collection path is required.");
    return [];
  }
  try {
    let query: FirebaseFirestoreTypes.Query = firestore().collection(collectionPath);

    queryParams.forEach(param => {
      if (param && param.length === 3) {
        query = query.where(param[0], param[1], param[2]);
      }
    });

    if (options.orderBy) {
      const [field, direction = "asc"] = options.orderBy;
      query = query.orderBy(field, direction as 'asc' | 'desc');
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const querySnapshot = await query.get();
    const documents: T[] = [];
    querySnapshot.forEach(doc => {
      documents.push({ id: doc.id, ...doc.data() } as unknown as T);
    });
    console.log(`Fetched ${documents.length} documents from ${collectionPath} with query.`);
    return documents;
  } catch (error) {
    console.error(`Error querying collection ${collectionPath}:`, error);
    throw error;
  }
};

// --- Specific Data Fetching Functions Typed ---

const getPeriodicVehicleData = async (vehicleId: string, limit: number = 50): Promise<PeriodicDataRecord[]> => {
  const path = `vehicleData/${vehicleId}/periodic`;
  const results = await getDocumentsByQuery<Omit<PeriodicDataRecord, 'id'> & { id: string }>(path, [], { orderBy: ["timestamp", "desc"], limit });
  return results;
};

const getVehicleDTCs = async (vehicleId: string, limit: number = 50): Promise<DTCRecord[]> => {
  const path = `vehicleData/${vehicleId}/dtcs`;
  const results = await getDocumentsByQuery<Omit<DTCRecord, 'id'> & { id: string }>(path, [], { orderBy: ["timestamp", "desc"], limit });
  return results;
};

// Define Vehicle type including id and ownerUserId
interface Vehicle extends VehicleData {
  id: string;
  ownerUserId: string;
}

const getUserVehicles = async (userId: string): Promise<Vehicle[]> => {
  return getDocumentsByQuery<Vehicle>("vehicles", [["ownerUserId", "==", userId]]);
};

export const firestoreService = {
  getDocument,
  addDocument,
  updateDocument,
  setDocument,
  deleteDocument,
  getDocumentsByQuery,
  getPeriodicVehicleData,
  getVehicleDTCs,
  getUserVehicles,
};
