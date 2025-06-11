// src/services/storageService.ts
import storage, { FirebaseStorageTypes } from "@react-native-firebase/storage";

// --- Storage Service Functions with Types ---

/**
 * Upload a file (e.g., image) to Firebase Storage.
 * @param uri - Local URI of the file to upload (e.g., from image picker).
 * @param path - Storage path where the file should be stored (e.g., `receipts/user123/receipt_abc.jpg`).
 * @param metadata - Optional metadata for the uploaded file.
 * @returns Download URL of the uploaded file.
 */
const uploadFile = async (
  uri: string,
  path: string,
  metadata?: FirebaseStorageTypes.SettableMetadata
): Promise<string> => {
  if (!uri || !path) {
    throw new Error("File URI and storage path are required");
  }

  try {
    // Create a reference to the file location
    const reference = storage().ref(path);

    // Upload the file
    const task = await reference.putFile(uri, metadata);

    // Check upload state (optional)
    if (task.state !== "success") {
        throw new Error(`File upload failed with state: ${task.state}`);
    }

    // Get the download URL
    const url = await reference.getDownloadURL();
    console.log(`File uploaded successfully to ${path}`);
    return url;
  } catch (error: any) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage using its download URL.
 * @param url - Download URL of the file to delete.
 * @returns Promise resolving on successful deletion.
 */
const deleteFileByUrl = async (url: string): Promise<void> => {
  if (!url) {
    throw new Error("File URL is required");
  }

  try {
    // Get reference from the URL
    const reference = storage().refFromURL(url);

    // Delete the file
    await reference.delete();
    console.log(`File deleted successfully from path: ${reference.fullPath}`);
  } catch (error: any) {
    // Handle specific errors like object-not-found if needed
    console.error(`Error deleting file with URL ${url}:`, error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage using its storage path.
 * @param path - Storage path of the file to delete.
 * @returns Promise resolving on successful deletion.
 */
const deleteFileByPath = async (path: string): Promise<void> => {
    if (!path) {
      throw new Error("File path is required");
    }
  
    try {
      // Get reference from the path
      const reference = storage().ref(path);
  
      // Delete the file
      await reference.delete();
      console.log(`File deleted successfully from path: ${path}`);
    } catch (error: any) {
      // Handle specific errors like object-not-found if needed
      console.error(`Error deleting file with path ${path}:`, error);
      throw error;
    }
  };

export const storageService = {
  uploadFile,
  deleteFileByUrl,
  deleteFileByPath,
};

