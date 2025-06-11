// src/services/authService.ts
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

// --- Type Definitions ---

// Define structure for additional data during signup
export interface AdditionalSignupData {
  name?: string;
  role?: "driver" | "mechanic" | "admin"; // Example roles
  // Add other fields collected during signup
}

// Define structure for user profile data stored in Firestore
export interface UserProfileData {
  uid: string;
  email: string | null;
  createdAt: FirebaseFirestoreTypes.Timestamp | Date;
  updatedAt?: FirebaseFirestoreTypes.Timestamp | Date;
  role: string;
  name?: string;
  // Add other profile fields
}

// Full user profile with ID for use in the app
export interface UserProfile extends UserProfileData {
  id: string; // Required ID field
}

// --- Auth Service Functions with Types ---

/**
 * Sign in a user with email and password.
 */
const signIn = async (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    console.log("User signed in successfully:", userCredential.user.uid);
    return userCredential;
  } catch (error: any) {
    console.error("Error signing in:", error.code, error.message);
    throw error; // Re-throw for handling in the slice/component
  }
};

/**
 * Sign up a new user with email and password.
 * Creates a corresponding user document in Firestore.
 */
const signUp = async (email: string, password: string, additionalData: AdditionalSignupData = {}): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    console.log("User signed up successfully:", user.uid);

    // Prepare profile data
    const profileData: Omit<UserProfileData, "createdAt" | "updatedAt"> = {
      uid: user.uid,
      email: user.email,
      role: additionalData.role || "driver", // Default role
      name: additionalData.name,
      // Spread other fields from additionalData if needed
    };

    // Create user document in Firestore
    await firestore().collection("users").doc(user.uid).set({
      ...profileData,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    console.log("User document created in Firestore for:", user.uid);

    return userCredential;
  } catch (error: any) {
    console.error("Error signing up:", error.code, error.message);
    // Consider more specific error handling or re-throwing
    throw error;
  }
};

/**
 * Sign out the current user.
 */
const signOut = async (): Promise<void> => {
  try {
    await auth().signOut();
    console.log("User signed out successfully");
  } catch (error: any) {
    console.error("Error signing out:", error.code, error.message);
    throw error;
  }
};

/**
 * Get the currently authenticated user.
 */
const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  return auth().currentUser;
};

/**
 * Set up an observer for authentication state changes.
 */
const onAuthStateChanged = (callback: (user: FirebaseAuthTypes.User | null) => void): (() => void) => {
  const subscriber = auth().onAuthStateChanged(user => {
    console.log("Auth state changed. User:", user ? user.uid : null);
    callback(user);
  });
  return subscriber; // Unsubscribe function
};

/**
 * Send a password reset email.
 */
const sendPasswordResetEmail = async (email: string): Promise<void> => {
  try {
    await auth().sendPasswordResetEmail(email);
    console.log("Password reset email sent to:", email);
    // Consider returning success/failure instead of alerting
  } catch (error: any) {
    console.error("Error sending password reset email:", error.code, error.message);
    // Consider returning success/failure instead of alerting
    throw error;
  }
};

/**
 * Get user profile data from Firestore.
 */
const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) return null;
  try {
    const userDoc = await firestore().collection("users").doc(userId).get();
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as UserProfile;
    } else {
      console.log("No user profile found for UID:", userId);
      return null;
    }
  } catch (error: any) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

/**
 * Update user profile data in Firestore.
 */
const updateUserProfile = async (userId: string, dataToUpdate: Partial<UserProfileData>): Promise<void> => {
  if (!userId) throw new Error("User ID is required to update profile.");
  try {
    await firestore().collection("users").doc(userId).update({
      ...dataToUpdate,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    console.log("User profile updated successfully for:", userId);
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Export the service object
export const authService = {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  getUserProfile,
  updateUserProfile,
};
