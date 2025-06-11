// src/constants/dtcCodes.ts

// Define the structure for DTC details
export interface DTCDetail {
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical" | "Unknown";
}

// Define the type for the main details object
export type DTCDetailsMap = {
  [key: string]: DTCDetail;
};

// A simplified mapping of common OBD2 DTC codes to descriptions and severity.
// In a real application, this would be much more extensive or use an external API.
export const dtcDetails: DTCDetailsMap = {
  "P0101": { description: "Mass Air Flow (MAF) Circuit Range/Performance Problem", severity: "Medium" },
  "P0102": { description: "Mass Air Flow (MAF) Circuit Low Input", severity: "Medium" },
  "P0113": { description: "Intake Air Temperature (IAT) Sensor Circuit High Input", severity: "Low" },
  "P0118": { description: "Engine Coolant Temperature (ECT) Sensor Circuit High Input", severity: "High" },
  "P0128": { description: "Coolant Thermostat (Coolant Temperature Below Thermostat Regulating Temperature)", severity: "Medium" },
  "P0135": { description: "O2 Sensor Heater Circuit Malfunction (Bank 1 Sensor 1)", severity: "Medium" },
  "P0171": { description: "System Too Lean (Bank 1)", severity: "High" },
  "P0174": { description: "System Too Lean (Bank 2)", severity: "High" },
  "P0300": { description: "Random/Multiple Cylinder Misfire Detected", severity: "High" },
  "P0301": { description: "Cylinder 1 Misfire Detected", severity: "High" },
  "P0302": { description: "Cylinder 2 Misfire Detected", severity: "High" },
  "P0303": { description: "Cylinder 3 Misfire Detected", severity: "High" },
  "P0304": { description: "Cylinder 4 Misfire Detected", severity: "High" },
  "P0305": { description: "Cylinder 5 Misfire Detected", severity: "High" },
  "P0306": { description: "Cylinder 6 Misfire Detected", severity: "High" },
  "P0401": { description: "Exhaust Gas Recirculation (EGR) Flow Insufficient Detected", severity: "Medium" },
  "P0420": { description: "Catalyst System Efficiency Below Threshold (Bank 1)", severity: "High" },
  "P0430": { description: "Catalyst System Efficiency Below Threshold (Bank 2)", severity: "High" },
  "P0440": { description: "Evaporative Emission Control System Malfunction", severity: "Low" },
  "P0442": { description: "Evaporative Emission Control System Leak Detected (Small Leak)", severity: "Low" },
  "P0455": { description: "Evaporative Emission Control System Leak Detected (Gross Leak/No Flow)", severity: "Medium" },
  "P0500": { description: "Vehicle Speed Sensor (VSS) Malfunction", severity: "Medium" },
  "P0700": { description: "Transmission Control System (MIL Request)", severity: "High" },
  "C0035": { description: "Left Front Wheel Speed Sensor Circuit Malfunction", severity: "Medium" },
  "C0040": { description: "Right Front Wheel Speed Sensor Circuit Malfunction", severity: "Medium" },
  "C0045": { description: "Left Rear Wheel Speed Sensor Circuit Malfunction", severity: "Medium" },
  "C0050": { description: "Right Rear Wheel Speed Sensor Circuit Malfunction", severity: "Medium" },
  "U0100": { description: "Lost Communication With ECM/PCM \"A\"", severity: "Critical" },
  "U0101": { description: "Lost Communication with TCM", severity: "Critical" },
  "U0121": { description: "Lost Communication With Anti-Lock Brake System (ABS) Control Module", severity: "Critical" },
  // Add more codes as needed
};

// Function to get details for a specific code
export const getDTCDetails = (code: string): DTCDetail => {
  return dtcDetails[code] || { description: "Unknown Code", severity: "Unknown" };
};

// Deprecated function - keep for compatibility if necessary, but prefer getDTCDetails
export const getDTCDescription = (code: string): string => {
  return dtcDetails[code]?.description || "Unknown Code";
};

