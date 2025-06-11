// src/screens/DiagnosticsScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  ListRenderItemInfo,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import { databaseService } from "../services/databaseService";
import { PeriodicDataRecord, DTCRecord } from "../services/firestoreService"; // Import types
import {
  updateLiveData,
  setConnectionStatus,
  fetchPeriodicData,
  fetchDTCHistory,
  clearSimulatedDTCs,
  DiagnosticsState,
  LiveDiagnosticsData
} from "../store/slices/diagnosticsSlice";
import { RootState, AppDispatch } from "../store";
import { getDTCDetails, DTCDetail } from "../constants/dtcCodes";
import { Ionicons } from "@expo/vector-icons";
import { MainTabParamList } from "../navigation/AppNavigator"; // Import MainTabParamList

// --- Type Definitions ---

// Props for the Gauge component
interface GaugeProps {
  label: string;
  value: number | null | undefined;
  unit: string;
}

// Type for the navigation prop specific to this screen/tab
type DiagnosticsScreenNavigationProp = NavigationProp<MainTabParamList>;

// --- Components ---

const Gauge: React.FC<GaugeProps> = ({ label, value, unit }) => (
  <View style={styles.gaugeContainer}>
    <Text style={styles.gaugeLabel}>{label}</Text>
    <Text style={styles.gaugeValue}>
      {value !== null && value !== undefined ? value.toFixed(1) : "--"} {unit}
    </Text>
  </View>
);

const screenWidth = Dimensions.get("window").width;

// --- Helper Functions ---

const getSeverityColor = (severity: DTCDetail["severity"] | undefined): string => {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "#dc3545"; // Red
    case "high":
      return "#fd7e14"; // Orange
    case "medium":
      return "#ffc107"; // Yellow
    case "low":
      return "#198754"; // Green
    default:
      return "#6c757d"; // Gray
  }
};

// --- Screen Component ---

const DiagnosticsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<DiagnosticsScreenNavigationProp>();

  // Use selectors for better performance
  const diagnosticsState = useSelector((state: RootState) => state.diagnostics);
  const {
    liveData,
    periodicHistory,
    dtcHistory,
    isConnected,
    loading,
    error,
  } = diagnosticsState;
  
  const selectedVehicle = useSelector((state: RootState) => state.vehicle.selectedVehicle);
  const selectedVehicleId = selectedVehicle?.id;

  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);
  const [activeTab, setActiveTab] = useState<"Live" | "History" | "DTC" | "Health">("Live");

  // Memoize derived state
  const latestDTCs = React.useMemo(() => (
    dtcHistory.length > 0 ? dtcHistory[0].codes : []
  ), [dtcHistory]);

  const hasSevereDTCs = React.useMemo(() => (
    latestDTCs?.some(code => {
      const details = getDTCDetails(code);
      return details.severity === "High" || details.severity === "Critical";
    })
  ), [latestDTCs]);

  // Effect to subscribe/unsubscribe to live data
  useEffect(() => {
    let currentUnsubscribe: (() => void) | null = null;
    if (selectedVehicleId) {
      dispatch(setConnectionStatus(true)); // Assume connection initially
      currentUnsubscribe = databaseService.subscribeToVehicleLiveData(
        selectedVehicleId,
        (data) => {
          if (data) {
            dispatch(updateLiveData(data as LiveDiagnosticsData));
          } else {
            // Consider if we should immediately set to disconnected or wait
            // dispatch(setConnectionStatus(false));
            console.log("No live data received (or stream ended).");
          }
        }
      );
      setUnsubscribe(() => currentUnsubscribe);
      // Fetch initial history
      dispatch(fetchPeriodicData(selectedVehicleId));
      dispatch(fetchDTCHistory(selectedVehicleId));
      dispatch(fetchVehicleHealthSummary(selectedVehicleId));
    } else {
      dispatch(setConnectionStatus(false));
      if (unsubscribe) {
        unsubscribe();
        setUnsubscribe(null);
      }
    };
    // Only re-run if selectedVehicleId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicleId, dispatch]);

  // --- Handlers ---

  const handleFetchPeriodic = useCallback(() => {
    if (selectedVehicleId) dispatch(fetchPeriodicData(selectedVehicleId));
  }, [selectedVehicleId, dispatch]);

  const handleFetchDTC = useCallback(() => {
    if (selectedVehicleId) dispatch(fetchDTCHistory(selectedVehicleId));
  }, [selectedVehicleId, dispatch]);

  const handleClearDTCs = useCallback(() => {
    if (!selectedVehicleId) return;
    Alert.alert(
      "Confirm Clear DTCs",
      "This action attempts to clear Diagnostic Trouble Codes. Proceed? (Simulation only)",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear (Simulated)",
          onPress: () => {
            dispatch(clearSimulatedDTCs());
            Alert.alert("Success", "DTC clear command sent (Simulated). Refresh history to see changes.");
          },
        },
      ]
    );
  }, [selectedVehicleId, dispatch]);

  const handleRequestMechanicFromDTC = useCallback(() => {
    const severeCodes = latestDTCs?.filter(code => {
      const details = getDTCDetails(code);
      return details.severity === "High" || details.severity === "Critical";
    }) || [];

    // Navigate to the Mechanic tab, then potentially deeper
    // Note: The exact navigation structure depends on how Mechanic tab's stack is set up.
    // This assumes a structure like: Tab -> Stack -> Screen
    navigation.navigate("Mechanic", {
      triggerReason: "dtc",
      problemDescription: `Vehicle has severe DTCs: ${severeCodes.join(", ")}`,
      dtcCodes: severeCodes,
    });
  }, [navigation, latestDTCs]);

  // --- Chart Data Preparation ---
  const chartData = React.useMemo(() => {
    const dataSet = {
      labels: [] as (string | number)[],
      datasets: [
        {
          data: [] as number[],
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ["Coolant Temp (°C)"],
    };

    if (periodicHistory && periodicHistory.length > 0) {
      const historyToShow = [...periodicHistory].reverse().slice(-15);
      dataSet.labels = historyToShow.map((_, index) => index + 1);
      dataSet.datasets[0].data = historyToShow.map(item => item.coolant_temp ?? 0); // Use nullish coalescing
    }

    if (dataSet.datasets[0].data.length === 0) {
      dataSet.labels = ["N/A"];
      dataSet.datasets[0].data = [0];
    }
    return dataSet;
  }, [periodicHistory]);

  // --- Render Functions for Tabs ---

  const renderLiveTab = () => (
    <ScrollView>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isConnected ? "Connected" : "Disconnected"}
        </Text>
        {error.live && <Text style={styles.errorText}>Error: {error.live}</Text>}
      </View>
      <View style={styles.gaugesRow}>
        <Gauge label="Speed (OBD)" value={liveData.speed_obd} unit="km/h" />
        <Gauge label="RPM" value={liveData.rpm} unit="" />
      </View>
      <View style={styles.gaugesRow}>
        <Gauge label="Coolant Temp" value={liveData.coolant_temp} unit="°C" />
        <Gauge label="Fuel Level" value={liveData.fuel_level} unit="%" />
      </View>
      <View style={styles.gaugesRow}>
        <Gauge label="Throttle Pos" value={liveData.throttle_pos} unit="%" />
        <Gauge label="Engine Load" value={liveData.engine_load} unit="%" />
      </View>
      <View style={styles.gaugesRow}>
        <Gauge label="Battery" value={liveData.battery_voltage} unit="V" />
      </View>
      {liveData.location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationTitle}>Location</Text>
          <Text>Lat: {liveData.location.latitude?.toFixed(4)}</Text>
          <Text>Lon: {liveData.location.longitude?.toFixed(4)}</Text>
          <Text>GPS Speed: {liveData.location.speed?.toFixed(1)} km/h</Text>
        </View>
      )}
      <Text style={styles.timestamp}>
        Last Update:{" "}
        {liveData.timestamp ? new Date(liveData.timestamp).toLocaleString() : "N/A"}
      </Text>
    </ScrollView>
  );

  const renderPeriodicHistoryItem = useCallback(({ item }: ListRenderItemInfo<PeriodicDataRecord>) => {
    const timestamp = item.timestamp;
    const date = typeof timestamp === 'object' && 'toDate' in timestamp 
      ? timestamp.toDate() 
      : new Date(timestamp as any);
    
    return (
      <View style={styles.historyItem}>
        <Text style={styles.historyTimestamp}>{date.toLocaleString()}</Text>
        <Text>Coolant: {item.coolant_temp ?? "N/A"}°C, Fuel: {item.fuel_level ?? "N/A"}%</Text>
        {/* Add other relevant fields */}
      </View>
    );
  }, []);

  const renderHistoryTab = () => (
    <ScrollView style={styles.historyContainer}>
      <Button title="Refresh Periodic History" onPress={handleFetchPeriodic} disabled={loading.periodic} />
      {loading.periodic && <ActivityIndicator style={styles.loadingIndicator} />}
      {error.periodic && <Text style={styles.errorText}>Error: {error.periodic}</Text>}

      <Text style={styles.chartTitle}>Coolant Temperature Trend (Last 15 points)</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 30}
        height={220}
        yAxisSuffix="°C"
        chartConfig={{
          backgroundColor: "#007bff",
          backgroundGradientFrom: "#007bff",
          backgroundGradientTo: "#4dabf7",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#ffa726",
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />

      <Text style={styles.listTitle}>Recent Periodic Data</Text>
      <FlatList
        data={periodicHistory}
        keyExtractor={(item, index) => item.id || `periodic-${index}`}
        renderItem={renderPeriodicHistoryItem}
        ListEmptyComponent={<Text style={styles.emptyListText}>No periodic history available.</Text>}
        scrollEnabled={false} // Disable scrolling if inside ScrollView
      />
    </ScrollView>
  );

  const renderDTCHistoryItem = useCallback(({ item }: ListRenderItemInfo<DTCRecord>) => {
    const timestamp = item.timestamp;
    const date = typeof timestamp === 'object' && 'toDate' in timestamp 
      ? timestamp.toDate() 
      : new Date(timestamp as any);
    
    return (
      <View style={styles.historyItem}>
        <Text style={styles.historyTimestamp}>{date.toLocaleString()}</Text>
        {item.codes && item.codes.length > 0 ? (
          item.codes.map((code, idx) => {
            const details = getDTCDetails(code);
            const severityColor = getSeverityColor(details.severity);
            return (
              <View key={idx} style={[styles.dtcEntry, { borderLeftColor: severityColor }]}>
                <View style={styles.dtcCodeSeverityRow}>
                  <Text style={styles.dtcCode}>{code}</Text>
                  <Text style={[styles.dtcSeverity, { color: severityColor, borderColor: severityColor }]}>
                    {details.severity}
                  </Text>
                </View>
                <Text style={styles.dtcDescription}>{details.description}</Text>
              </View>
            );
          })
        ) : (
          <Text>No codes reported in this event.</Text>
        )}
      </View>
    );
  }, []);

  const renderDTCTab = () => (
    <View style={styles.historyContainer}>
      <View style={styles.dtcHeader}>
        <Button title="Refresh DTC History" onPress={handleFetchDTC} disabled={loading.dtc} />
        <Button title="Clear DTCs (Simulated)" onPress={handleClearDTCs} disabled={loading.dtc || dtcHistory.length === 0} color="#6c757d" />
      </View>
       {loading.dtc && <ActivityIndicator style={styles.loadingIndicator} />}
       {error.dtc && <Text style={styles.errorText}>Error: {error.dtc}</Text>}

       {hasSevereDTCs && (
         <TouchableOpacity
           style={styles.requestMechanicButton}
           onPress={handleRequestMechanicFromDTC}
         >
           <Ionicons name="warning" size={20} color="#fff" />
           <Text style={styles.requestMechanicButtonText}>Request Mechanic for Severe Codes</Text>
         </TouchableOpacity>
       )}

      <FlatList
        data={dtcHistory}
        keyExtractor={(item, index) => item.id || `dtc-${index}`}
        renderItem={renderDTCHistoryItem}
        ListEmptyComponent={<Text style={styles.emptyListText}>No DTC history available.</Text>}
      />
    </View>
  );

  const renderHealthTab = () => (
    <ScrollView style={styles.historyContainer}>
      <Button title="Refresh Health Summary" onPress={() => selectedVehicleId && dispatch(fetchVehicleHealthSummary(selectedVehicleId))} disabled={loading.vehicleHealth} />
      {loading.vehicleHealth && <ActivityIndicator style={styles.loadingIndicator} />}
      {error.vehicleHealth && <Text style={styles.errorText}>Error: {error.vehicleHealth}</Text>}

      {diagnosticsState.vehicleHealthSummary ? (
        <View style={styles.healthSummaryContainer}>
          <Text style={styles.sectionTitle}>Overall Health Score: {diagnosticsState.vehicleHealthSummary.overallHealthScore}</Text>
          <Text>Engine Health: {diagnosticsState.vehicleHealthSummary.engineHealth}</Text>
          <Text>Battery Health: {diagnosticsState.vehicleHealthSummary.batteryHealth}</Text>
          <Text>Tire Health: {diagnosticsState.vehicleHealthSummary.tireHealth}</Text>
          <Text>Last Analyzed: {diagnosticsState.vehicleHealthSummary.lastAnalyzedDate}</Text>

          <Text style={styles.sectionTitle}>Predicted Maintenance</Text>
          {diagnosticsState.vehicleHealthSummary.predictedMaintenance.length > 0 ? (
            diagnosticsState.vehicleHealthSummary.predictedMaintenance.map((item, index) => (
              <View key={index} style={styles.predictedMaintenanceItem}>
                <Text>Item: {item.item}</Text>
                <Text>Estimated Date: {item.estimatedDate}</Text>
                <Text>Severity: {item.severity}</Text>
              </View>
            ))
          ) : (
            <Text>No predicted maintenance at this time.</Text>
          )}
        </View>
      ) : (
        <Text style={styles.emptyListText}>No vehicle health summary available.</Text>
      )}
    </ScrollView>
  );

  // --- Main Render ---

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnostics</Text>

      {!selectedVehicleId ? (
        <Text style={styles.infoText}>Please select a vehicle first.</Text>
      ) : (
        <>
          <View style={styles.tabSelectorContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "Live" && styles.activeTabButton]}
              onPress={() => setActiveTab("Live")}
            >
              <Text style={[styles.tabButtonText, activeTab === "Live" && styles.activeTabButtonText]}>Live</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "History" && styles.activeTabButton]}
              onPress={() => setActiveTab("History")}
            >
              <Text style={[styles.tabButtonText, activeTab === "History" && styles.activeTabButtonText]}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "DTC" && styles.activeTabButton]}
              onPress={() => setActiveTab("DTC")}
            >
              <Text style={[styles.tabButtonText, activeTab === "DTC" && styles.activeTabButtonText]}>DTC</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "Health" && styles.activeTabButton]}
              onPress={() => setActiveTab("Health")}
            >
              <Text style={[styles.tabButtonText, activeTab === "Health" && styles.activeTabButtonText]}>Health</Text>
            </TouchableOpacity>
          </View>

          {activeTab === "Live" && renderLiveTab()}
          {activeTab === "History" && renderHistoryTab()}
          {activeTab === "DTC" && renderDTCTab()}
          {activeTab === "Health" && renderHealthTab()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#343a40",
    textAlign: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 50,
  },
  tabSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: "#007bff",
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
  },
  activeTabButtonText: {
    color: "#007bff",
  },
  statusContainer: {
    padding: 10,
    backgroundColor: "#e2e6ea",
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#343a40",
  },
  errorText: {
    color: "#dc3545",
    marginTop: 5,
    textAlign: "center",
  },
  gaugesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  gaugeContainer: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "48%", // Adjust width for two columns
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  gaugeLabel: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 5,
  },
  gaugeValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007bff",
  },
  locationContainer: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#343a40",
  },
  timestamp: {
    fontSize: 12,
    color: "#6c757d",
    textAlign: "right",
    marginTop: 10,
  },
  historyContainer: {
    flex: 1,
    marginTop: 10,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#343a40",
    textAlign: "center",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#343a40",
  },
  historyItem: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  historyTimestamp: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 5,
  },
  dtcHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  dtcEntry: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 5,
    marginBottom: 8,
  },
  dtcCodeSeverityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  dtcCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#343a40",
  },
  dtcSeverity: {
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  dtcDescription: {
    fontSize: 14,
    color: "#495057",
  },
  requestMechanicButton: {
    flexDirection: "row",
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  requestMechanicButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  emptyListText: {
    textAlign: "center",
    color: "#6c757d",
    marginTop: 20,
  },
  healthSummaryContainer: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#343a40",
  },
  predictedMaintenanceItem: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    borderLeftWidth: 3,
    borderLeftColor: "#007bff",
  },
});

export default DiagnosticsScreen;


