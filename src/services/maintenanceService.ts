// src/services/maintenanceService.ts
import { firestoreService, MaintenanceSchedule, ServiceLog } from "./firestoreService";
import { storageService } from "./storageService";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { Timestamp } from "./firestoreService"; // Import Timestamp directly

// Helper to convert Date to Timestamp if needed
const ensureTimestamp = (date: Date | FirebaseFirestoreTypes.Timestamp | undefined | null): FirebaseFirestoreTypes.Timestamp | undefined => {
  if (!date) return undefined;
  if (date instanceof Date) {
    return Timestamp.fromDate(date);
  }
  return date as FirebaseFirestoreTypes.Timestamp; // Assume it's already a Timestamp
};

/**
 * Service class for maintenance-related operations
 */
class MaintenanceService {
  private getSchedulesPath(vehicleId: string): string {
    return `vehicleData/${vehicleId}/maintenanceSchedules`;
  }

  private getHistoryPath(vehicleId: string): string {
    return `vehicleData/${vehicleId}/serviceHistory`;
  }

  /**
   * Fetch upcoming maintenance schedules for a vehicle
   */
  async fetchUpcomingMaintenance(vehicleId: string): Promise<MaintenanceSchedule[]> {
    if (!vehicleId) throw new Error("Vehicle ID is required");

    try {
      const schedules = await firestoreService.getDocumentsByQuery<MaintenanceSchedule>(
        this.getSchedulesPath(vehicleId),
        [["status", "in", ["Scheduled", "Overdue"]]],
        { orderBy: ["dueDate", "asc"] }
      );
      // TODO: Fetch and merge manufacturer recommendations
      return schedules;
    } catch (error) {
      console.error("Error fetching upcoming maintenance:", error);
      throw error;
    }
  }

  /**
   * Fetch service history for a vehicle
   */
  async fetchServiceHistory(vehicleId: string, limit: number = 100): Promise<ServiceLog[]> {
    if (!vehicleId) throw new Error("Vehicle ID is required");

    try {
      const history = await firestoreService.getDocumentsByQuery<ServiceLog>(
        this.getHistoryPath(vehicleId),
        [],
        { orderBy: ["serviceDate", "desc"], limit }
      );
      return history;
    } catch (error) {
      console.error("Error fetching service history:", error);
      throw error;
    }
  }

  /**
   * Add a custom maintenance schedule
   */
  async addCustomSchedule(vehicleId: string, scheduleData: Omit<MaintenanceSchedule, "id" | "creationDate" | "status">): Promise<MaintenanceSchedule> {
    if (!vehicleId || !scheduleData) throw new Error("Vehicle ID and schedule data are required");

    try {
      const dataToSave: Partial<MaintenanceSchedule> = {
        ...scheduleData,
        status: "Scheduled", // Default status
        dueDate: ensureTimestamp(scheduleData.dueDate),
        creationDate: Timestamp.now(),
      };

      const docId = await firestoreService.addDocument(
        this.getSchedulesPath(vehicleId),
        dataToSave
      );

      return { id: docId, ...dataToSave } as MaintenanceSchedule;
    } catch (error) {
      console.error("Error adding custom schedule:", error);
      throw error;
    }
  }

  /**
   * Update an existing maintenance schedule
   */
  async updateMaintenanceSchedule(vehicleId: string, scheduleId: string, dataToUpdate: Partial<Omit<MaintenanceSchedule, "id" | "creationDate">>): Promise<void> {
    if (!vehicleId || !scheduleId || !dataToUpdate) {
      throw new Error("Vehicle ID, schedule ID, and data are required");
    }
    try {
      const updatePayload = { ...dataToUpdate };
      // Ensure dueDate is a Timestamp if provided
      if (updatePayload.dueDate) {
        updatePayload.dueDate = ensureTimestamp(updatePayload.dueDate);
      }

      await firestoreService.updateDocument(
        this.getSchedulesPath(vehicleId),
        scheduleId,
        updatePayload
      );
    } catch (error) {
      console.error("Error updating maintenance schedule:", error);
      throw error;
    }
  }

  /**
   * Log a completed service
   */
  async logCompletedService(vehicleId: string, logData: Omit<ServiceLog, "id" | "receiptUrl"> & { relatedScheduleId?: string }, receiptImageUri?: string | null): Promise<ServiceLog> {
    if (!vehicleId || !logData) throw new Error("Vehicle ID and log data are required");

    try {
      const dataToSave: Partial<ServiceLog> = {
        ...logData,
        serviceDate: ensureTimestamp(logData.serviceDate) as FirebaseFirestoreTypes.Timestamp,
      };

      let receiptUrl: string | undefined;
      
      if (receiptImageUri) {
        const fileExtension = receiptImageUri.split(".").pop() || "jpg";
        const imagePath = `receipts/${vehicleId}/${Date.now()}.${fileExtension}`;
        receiptUrl = await storageService.uploadFile(receiptImageUri, imagePath);
        dataToSave.receiptUrl = receiptUrl;
      }

      const docId = await firestoreService.addDocument(
        this.getHistoryPath(vehicleId),
        dataToSave
      );

      // If this log completes a schedule, update the schedule status
      if (logData.relatedScheduleId) {
        await this.updateScheduleStatus(vehicleId, logData.relatedScheduleId, "Completed");
      }

      const result = { id: docId, ...dataToSave } as ServiceLog;
      
      // Handle error cleanup
      try {
        // Error handling code
      } catch (error) {
        console.error("Error in cleanup:", error);
        if (result.receiptUrl) {
          try {
            await storageService.deleteFileByUrl(result.receiptUrl);
          } catch (deleteError) {
            console.error("Failed to clean up uploaded receipt after error:", deleteError);
          }
        }
      }

      return result;
    } catch (error) {
      console.error("Error logging completed service:", error);
      throw error;
    }
  }

  /**
   * Update a maintenance schedule status
   */
  async updateScheduleStatus(vehicleId: string, scheduleId: string, status: MaintenanceSchedule["status"]): Promise<void> {
    if (!vehicleId || !scheduleId || !status) {
      throw new Error("Vehicle ID, schedule ID, and status are required");
    }

    try {
      await firestoreService.updateDocument(
        this.getSchedulesPath(vehicleId),
        scheduleId,
        { status }
      );
    } catch (error) {
      console.error("Error updating schedule status:", error);
      throw error;
    }
  }

  /**
   * Delete a maintenance schedule
   */
  async deleteSchedule(vehicleId: string, scheduleId: string): Promise<void> {
    if (!vehicleId || !scheduleId) throw new Error("Vehicle ID and schedule ID are required");

    try {
      await firestoreService.deleteDocument(
        this.getSchedulesPath(vehicleId),
        scheduleId
      );
    } catch (error) {
      console.error("Error deleting schedule:", error);
      throw error;
    }
  }

  /**
   * Delete a service log
   */
  async deleteServiceLog(vehicleId: string, logId: string): Promise<void> {
    if (!vehicleId || !logId) throw new Error("Vehicle ID and log ID are required");

    try {
      const log = await firestoreService.getDocument<ServiceLog>(
        this.getHistoryPath(vehicleId),
        logId
      );

      // Delete receipt image if exists
      if (log?.receiptUrl) {
        try {
            await storageService.deleteFileByUrl(log.receiptUrl);
        } catch (storageError: any) {
            // Log error but continue trying to delete Firestore doc
            console.warn(`Failed to delete receipt image ${log.receiptUrl}:`, storageError.message);
        }
      }

      // Delete the log document
      await firestoreService.deleteDocument(
        this.getHistoryPath(vehicleId),
        logId
      );
    } catch (error) {
      console.error("Error deleting service log:", error);
      throw error;
    }
  }

  /**
   * Check for overdue maintenance items and update their status
   */
  async checkOverdueMaintenance(vehicleId: string, currentMileage?: number): Promise<number> {
    if (!vehicleId) throw new Error("Vehicle ID is required");

    try {
      const schedules = await firestoreService.getDocumentsByQuery<MaintenanceSchedule>(
        this.getSchedulesPath(vehicleId),
        [["status", "==", "Scheduled"]]
      );

      const today = new Date();
      let overdueCount = 0;
      const updates: Promise<void>[] = [];

      for (const schedule of schedules) {
        let isOverdue = false;

        if (schedule.dueDate) {
          const dueDate = (schedule.dueDate as FirebaseFirestoreTypes.Timestamp).toDate();
          if (dueDate < today) {
            isOverdue = true;
          }
        }

        if (schedule.dueMileageKm && currentMileage && currentMileage >= schedule.dueMileageKm) {
          isOverdue = true;
        }

        if (isOverdue) {
          updates.push(this.updateScheduleStatus(vehicleId, schedule.id, "Overdue"));
          overdueCount++;
        }
      }

      await Promise.all(updates);
      return overdueCount;
    } catch (error) {
      console.error("Error checking overdue maintenance:", error);
      throw error;
    }
  }
}

export const maintenanceService = new MaintenanceService();
