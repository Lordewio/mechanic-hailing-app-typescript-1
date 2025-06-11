// src/store/slices/paymentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index"; // Import RootState for thunk typings

// --- Mock/Placeholder Payment Service ---
// In a real app, this would interact with your backend and Stripe
const paymentService = {
  getPaymentMethods: async (): Promise<{ methods: PaymentMethod[]; defaultId: string | null }> => {
    console.log("[Mock Payment Service] Fetching payment methods...");
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return mock data
    return {
        methods: [
            { id: "pm_123", brand: "visa", last4: "4242", isDefault: true },
            { id: "pm_456", brand: "mastercard", last4: "5555", isDefault: false },
        ],
        defaultId: "pm_123",
    };
  },
  addPaymentMethod: async (paymentMethodData: any): Promise<PaymentMethod> => {
    console.log("[Mock Payment Service] Adding payment method:", paymentMethodData);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newMethod: PaymentMethod = {
        id: `pm_${Math.random().toString(36).substring(7)}`,
        brand: "visa", // Assume Visa for mock
        last4: "1111",
        isDefault: false, // Assume not default initially
    };
    return newMethod;
  },
  deletePaymentMethod: async (paymentMethodId: string): Promise<void> => {
    console.log(`[Mock Payment Service] Deleting payment method: ${paymentMethodId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<void> => {
    console.log(`[Mock Payment Service] Setting default payment method: ${paymentMethodId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  createPaymentIntent: async (data: { amount: number; currency: string; serviceLogId?: string }): Promise<{ clientSecret: string }> => {
    console.log("[Mock Payment Service] Creating payment intent:", data);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return a mock client secret
    return { clientSecret: `pi_${Math.random().toString(36).substring(2)}_secret_${Math.random().toString(36).substring(2)}` };
  },
};

// --- Type Definitions ---

export interface PaymentMethod {
  id: string;
  brand: string; // e.g., "visa", "mastercard"
  last4: string;
  isDefault?: boolean; // Optional, as default is tracked separately in state
  // Add other relevant fields like expiry month/year if needed
}

interface PaymentState {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId: string | null;
  clientSecret: string | null; // For the current payment attempt
  loadingMethods: boolean;
  loadingAction: boolean; // For add/delete/setDefault/createIntent
  error: string | null;
}

// Define types for async thunk arguments
interface AddPaymentPayload {
  // Define based on what your UI sends (e.g., Stripe token, SetupIntent ID)
  paymentMethodData: any; // Replace 'any' with a specific type
}

interface DeletePaymentPayload {
  paymentMethodId: string;
}

interface SetDefaultPaymentPayload {
  paymentMethodId: string;
}

interface CreateIntentPayload {
  amount: number; // Amount in smallest currency unit (e.g., cents)
  currency: string; // e.g., "usd"
  serviceLogId?: string; // Optional: link payment to a service
}

// --- Async Thunks ---

export const fetchPaymentMethods = createAsyncThunk<
  { methods: PaymentMethod[]; defaultId: string | null }, // Return type
  void, // Argument type (no argument needed)
  { rejectValue: string; state: RootState } // Thunk config
>(
  "payment/fetchPaymentMethods",
  async (_, { rejectWithValue }) => {
    try {
      const methods = await paymentService.getPaymentMethods();
      return methods;
    } catch (error: any) {
      console.error("Error fetching payment methods:", error);
      return rejectWithValue(error.message || "Failed to fetch payment methods");
    }
  }
);

export const addPaymentMethod = createAsyncThunk<
  PaymentMethod, // Return type
  AddPaymentPayload, // Argument type
  { rejectValue: string; state: RootState } // Thunk config
>(
  "payment/addPaymentMethod",
  async ({ paymentMethodData }, { rejectWithValue }) => {
    try {
      const newMethod = await paymentService.addPaymentMethod(paymentMethodData);
      return newMethod;
    } catch (error: any) {
      console.error("Error adding payment method:", error);
      return rejectWithValue(error.message || "Failed to add payment method");
    }
  }
);

export const deletePaymentMethod = createAsyncThunk<
  string, // Return type (ID of deleted method)
  DeletePaymentPayload, // Argument type
  { rejectValue: string; state: RootState } // Thunk config
>(
  "payment/deletePaymentMethod",
  async ({ paymentMethodId }, { rejectWithValue }) => {
    try {
      await paymentService.deletePaymentMethod(paymentMethodId);
      return paymentMethodId;
    } catch (error: any) {
      console.error("Error deleting payment method:", error);
      return rejectWithValue(error.message || "Failed to delete payment method");
    }
  }
);

export const setDefaultPaymentMethod = createAsyncThunk<
  string, // Return type (ID of new default method)
  SetDefaultPaymentPayload, // Argument type
  { rejectValue: string; state: RootState } // Thunk config
>(
  "payment/setDefaultPaymentMethod",
  async ({ paymentMethodId }, { rejectWithValue }) => {
    try {
      await paymentService.setDefaultPaymentMethod(paymentMethodId);
      return paymentMethodId;
    } catch (error: any) {
      console.error("Error setting default payment method:", error);
      return rejectWithValue(error.message || "Failed to set default payment method");
    }
  }
);

export const createPaymentIntent = createAsyncThunk<
  string, // Return type (clientSecret)
  CreateIntentPayload, // Argument type
  { rejectValue: string; state: RootState } // Thunk config
>(
  "payment/createPaymentIntent",
  async ({ amount, currency, serviceLogId }, { rejectWithValue }) => {
    try {
      const response = await paymentService.createPaymentIntent({ amount, currency, serviceLogId });
      return response.clientSecret;
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      return rejectWithValue(error.message || "Failed to create payment intent");
    }
  }
);

// --- Initial State ---

const initialState: PaymentState = {
  paymentMethods: [],
  defaultPaymentMethodId: null,
  clientSecret: null,
  loadingMethods: false,
  loadingAction: false,
  error: null,
};

// --- Slice Definition ---

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentState: (state) => {
      state.paymentMethods = [];
      state.defaultPaymentMethodId = null;
      state.clientSecret = null;
      state.loadingMethods = false;
      state.loadingAction = false;
      state.error = null;
    },
    clearClientSecret: (state) => {
      state.clientSecret = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payment Methods
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loadingMethods = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action: PayloadAction<{ methods: PaymentMethod[]; defaultId: string | null }>) => {
        state.loadingMethods = false;
        state.paymentMethods = action.payload.methods || [];
        state.defaultPaymentMethodId = action.payload.defaultId || null;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loadingMethods = false;
        state.error = action.payload ?? "Failed to fetch payment methods";
      })
      // Add Payment Method
      .addCase(addPaymentMethod.pending, (state) => {
        state.loadingAction = true;
        state.error = null;
      })
      .addCase(addPaymentMethod.fulfilled, (state, action: PayloadAction<PaymentMethod>) => {
        state.loadingAction = false;
        state.paymentMethods.push(action.payload);
        if (state.paymentMethods.length === 1 && !state.defaultPaymentMethodId) {
          state.defaultPaymentMethodId = action.payload.id;
        }
      })
      .addCase(addPaymentMethod.rejected, (state, action) => {
        state.loadingAction = false;
        state.error = action.payload ?? "Failed to add payment method";
      })
      // Delete Payment Method
      .addCase(deletePaymentMethod.pending, (state) => {
        state.loadingAction = true;
        state.error = null;
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action: PayloadAction<string>) => {
        state.loadingAction = false;
        state.paymentMethods = state.paymentMethods.filter(pm => pm.id !== action.payload);
        if (state.defaultPaymentMethodId === action.payload) {
          state.defaultPaymentMethodId = state.paymentMethods.length > 0 ? state.paymentMethods[0].id : null; // Set new default if needed
        }
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.loadingAction = false;
        state.error = action.payload ?? "Failed to delete payment method";
      })
      // Set Default Payment Method
      .addCase(setDefaultPaymentMethod.pending, (state) => {
        state.loadingAction = true;
        state.error = null;
      })
      .addCase(setDefaultPaymentMethod.fulfilled, (state, action: PayloadAction<string>) => {
        state.loadingAction = false;
        state.defaultPaymentMethodId = action.payload;
      })
      .addCase(setDefaultPaymentMethod.rejected, (state, action) => {
        state.loadingAction = false;
        state.error = action.payload ?? "Failed to set default payment method";
      })
      // Create Payment Intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loadingAction = true;
        state.clientSecret = null;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action: PayloadAction<string>) => {
        state.loadingAction = false;
        state.clientSecret = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loadingAction = false;
        state.error = action.payload ?? "Failed to create payment intent";
        state.clientSecret = null;
      });
  },
});

export const { clearPaymentState, clearClientSecret } = paymentSlice.actions;
export default paymentSlice.reducer;

