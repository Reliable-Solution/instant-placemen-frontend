import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  phone: string;
  role?: "ADMIN" | "EMPLOYER" | "CANDIDATE" | "RECRUITER";
  companyName?: string;
  companyLogo?: string;
  avatar?: string;
  city?: string;
  experience?: string;
  qualification?: string;
  skills?: string[];
  expectedSalary?: number;
  resumeSummary?: string;
  token?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Helper to decode JWT token (without verification - for client-side role check)
const decodeToken = (token: string): { id?: string; role?: string; exp?: number } | null => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    try {
      let base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) base64 += "=";
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }
};

// Verify role from JWT token (more secure than localStorage)
export const verifyRoleFromToken = (token: string, requiredRole: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return false;
  
  // Check if token is expired
  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    return false;
  }
  
  // Check role from token
  return decoded.role === requiredRole;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (action.payload.token) {
        state.token = action.payload.token;
      }
      try {
        localStorage.setItem("ip_user", JSON.stringify(action.payload));
        if (action.payload.token) {
          localStorage.setItem("ip_token", action.payload.token);
        }
      } catch (e) {
        console.error(e);
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      try {
        localStorage.setItem("ip_token", action.payload);
      } catch (e) {
        console.error(e);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem("ip_user");
        localStorage.removeItem("ip_token");
        // Clear runtime caches on logout so no private/auth data stays on shared devices
        if (typeof window !== "undefined" && "caches" in window) {
          caches.keys().then((keys) => {
            keys.forEach((key) => {
              if (key !== "ip-static-v1") {
                caches.delete(key);
              }
            });
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    loadUserFromStorage: (state) => {
      try {
        const savedUser = localStorage.getItem("ip_user");
        const savedToken = localStorage.getItem("ip_token");
        if (savedUser) {
          state.user = JSON.parse(savedUser);
          state.isAuthenticated = true;
        }
        if (savedToken) {
          state.token = savedToken;
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
});

export const { setUser, setToken, logout, loadUserFromStorage } = authSlice.actions;

export default authSlice.reducer;
