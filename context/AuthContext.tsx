"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// Define your API URL (ensure this is defined in your environment variables)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface User {
  email: string;
  firstName: string;
  lastName?: string;
  dateOfBirth?: Date | null;
  [key: string]: any; // Allows for flexible additional properties
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>; // Login is now async
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Helper: Fetch User Data from API ---
  const fetchUserProfile = async (accessToken: string) => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${accessToken}`, // Include token from LocalStorage
        },
      });

      if (res.data.success) {
        const data = res.data.data;
        setUser({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        });
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Optional: If fetching profile fails (e.g., 401), you might want to logout
      // logout();
    }
  };

  // --- Effect: Check Token on App Load ---
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        try {
          // 1. Check if token is expired locally first
          const decoded: any = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;

          if (decoded.exp > currentTime) {
            setToken(storedToken);
            // 2. Token is valid, now fetch the real user data from server
            await fetchUserProfile(storedToken);
          } else {
            console.warn("Token expired");
            logout();
          }
        } catch (error) {
          console.error("Invalid token format:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // --- Actions ---

  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    // Fetch user details immediately after setting the token
    await fetchUserProfile(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, ...userData };
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateUser, isLoading }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
