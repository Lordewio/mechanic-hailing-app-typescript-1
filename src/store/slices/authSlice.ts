// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService, UserProfileData, AdditionalSignupData } from "../../services/authService"; // Assuming types are defined in authService
import { RootState } from "../index"; // Import RootState for thunk typings

// Define interfaces for the state
// Represents the serializable user data we store from Firebase Auth
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  // Add other relevant serializable fields
}

// Represents the user profile data fetched from Firestore
export interface UserProfile extends UserProfileData {}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Define the initial state using the interface
const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Define ThunkAPI config type
interface ThunkApiConfig {
  rejectValue: string;
  state: RootState;
}

// --- Async Thunks with Types ---

export const signInUser = createAsyncThunk<
  { user: User; profile: UserProfile | null }, // Return type
  { email: string; password: string }, // Argument type
  ThunkApiConfig // Thunk API config
>("auth/signInUser", async ({ email, password }, { rejectWithValue }) => {
  try {
    const userCredential = await authService.signIn(email, password);
    const profile = await authService.getUserProfile(userCredential.user.uid);
    const serializableUser: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      photoURL: userCredential.user.photoURL,
    };
    return { user: serializableUser, profile };
  } catch (error: any) {
    return rejectWithValue(error.message || "Sign in failed");
  }
});

export const signUpUser = createAsyncThunk<
  { user: User; profile: UserProfile }, // Return type
  { email: string; password: string; additionalData: AdditionalSignupData }, // Argument type
  ThunkApiConfig
>("auth/signUpUser", async ({ email, password, additionalData }, { rejectWithValue }) => {
  try {
    const userCredential = await authService.signUp(email, password, additionalData);
    const serializableUser: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      photoURL: userCredential.user.photoURL,
    };
    
    // Create a proper UserProfile with required fields
    const profileData = {
      uid: userCredential.user.uid,
      email: email,
      createdAt: new Date(),
      ...additionalData
    } as UserProfile;
    
    return { user: serializableUser, profile: profileData };
  } catch (error: any) {
    return rejectWithValue(error.message || "Sign up failed");
  }
});

export const signOutUser = createAsyncThunk<
  null, // Return type (null on success)
  void, // Argument type (no args)
  ThunkApiConfig
>("auth/signOutUser", async (_, { rejectWithValue }) => {
  try {
    await authService.signOut();
    return null;
  } catch (error: any) {
    return rejectWithValue(error.message || "Sign out failed");
  }
});

export const fetchUserProfile = createAsyncThunk<
  UserProfile | null, // Return type
  string, // Argument type (userId)
  ThunkApiConfig
>("auth/fetchUserProfile", async (userId, { rejectWithValue }) => {
  try {
    const profile = await authService.getUserProfile(userId);
    return profile;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch profile");
  }
});

export const updateUserProfileData = createAsyncThunk<
  Partial<UserProfile>, // Return type (updated data)
  { userId: string; dataToUpdate: Partial<UserProfile> }, // Argument type
  ThunkApiConfig
>("auth/updateUserProfile", async ({ userId, dataToUpdate }, { rejectWithValue }) => {
  try {
    await authService.updateUserProfile(userId, dataToUpdate);
    return dataToUpdate;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update profile");
  }
});

// --- Slice Definition ---

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Use PayloadAction to type the payload
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      // Reset loading/error on manual set?
      // state.loading = false;
      // state.error = null;
    },
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign In
      .addCase(signInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.isAuthenticated = true;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Sign in failed";
        state.user = null;
        state.profile = null;
        state.isAuthenticated = false;
      })
      // Sign Up
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.isAuthenticated = true;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Sign up failed";
        state.user = null;
        state.profile = null;
        state.isAuthenticated = false;
      })
      // Sign Out
      .addCase(signOutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signOutUser.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Sign out failed";
      })
      // Fetch Profile
      .addCase(fetchUserProfile.pending, () => {
        // Removed unused state parameter
        // Consider separate loading state for profile?
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (_, action) => {
        // Removed unused state parameter
        console.error("Failed to fetch profile:", action.payload);
        // state.error = action.payload ?? "Failed to fetch profile";
      })
      // Update Profile
      .addCase(updateUserProfileData.pending, () => {
        // Removed unused state parameter
        // Consider separate loading state?
      })
      .addCase(updateUserProfileData.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile = { ...state.profile, ...action.payload };
        }
      })
      .addCase(updateUserProfileData.rejected, (_, action) => {
        // Removed unused state parameter
        console.error("Failed to update profile:", action.payload);
        // state.error = action.payload ?? "Failed to update profile";
      });
  },
});

export const { setUser, setProfile, setAuthLoading, clearAuthError, logout } = authSlice.actions;

export default authSlice.reducer;
