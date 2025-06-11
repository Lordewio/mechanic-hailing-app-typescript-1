import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ListRenderItemInfo,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Document {
  id: string;
  name: string;
  type: string; // e.g., "Registration", "Insurance", "Maintenance Record"
  dateAdded: string;
  url: string; // Mock URL for now
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Vehicle Registration 2025",
    type: "Registration",
    dateAdded: "2025-01-15",
    url: "https://example.com/reg2025.pdf",
  },
  {
    id: "2",
    name: "Insurance Policy 2025",
    type: "Insurance",
    dateAdded: "2025-02-01",
    url: "https://example.com/insurance2025.pdf",
  },
  {
    id: "3",
    name: "Oil Change Receipt 2024-12",
    type: "Maintenance Record",
    dateAdded: "2024-12-10",
    url: "https://example.com/oilchange.jpg",
  },
];

const DocumentVaultScreen: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  const handleViewDocument = (document: Document) => {
    Alert.alert(
      "View Document",
      `Opening ${document.name} (${document.type}).\nURL: ${document.url}\n\n(In a real app, this would open a PDF viewer or image viewer.)`
    );
  };

  const handleAddDocument = () => {
    Alert.alert(
      "Add Document",
      "(This would open a file picker to upload a new document.)"
    );
  };

  const handleDeleteDocument = (id: string) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            setDocuments(documents.filter((doc) => doc.id !== id));
            Alert.alert("Deleted", "Document deleted successfully.");
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderDocumentItem = ({ item }: ListRenderItemInfo<Document>) => (
    <View style={styles.documentItem}>
      <View style={styles.documentInfo}>
        <Ionicons
          name={item.type === "Registration" ? "car-outline" : item.type === "Insurance" ? "shield-checkmark-outline" : "document-text-outline"}
          size={24}
          color="#007bff"
          style={styles.documentIcon}
        />
        <View>
          <Text style={styles.documentName}>{item.name}</Text>
          <Text style={styles.documentType}>{item.type} - Added: {item.dateAdded}</Text>
        </View>
      </View>
      <View style={styles.documentActions}>
        <TouchableOpacity onPress={() => handleViewDocument(item)} style={styles.actionButton}>
          <Ionicons name="eye-outline" size={24} color="#28a745" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteDocument(item.id)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Document Vault</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddDocument}>
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Document</Text>
      </TouchableOpacity>

      {documents.length > 0 ? (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          renderItem={renderDocumentItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No documents found.</Text>
          <Text style={styles.emptySubText}>Add your vehicle-related documents here.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  documentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  documentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  documentIcon: {
    marginRight: 10,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  documentType: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  documentActions: {
    flexDirection: "row",
  },
  actionButton: {
    marginLeft: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
});

export default DocumentVaultScreen;


