"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
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
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth lives entirely in the httpOnly `token` cookie the backend sets on
  // login/google-signin - the browser attaches it automatically on every
  // withCredentials request, so this just asks the server who (if anyone)
  // the current cookie belongs to.
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true,
        // Without a timeout, a hung/slow /auth/me response left `isLoading`
        // true indefinitely - see the render gate below, which used to
        // render nothing at all (not even a spinner) until this resolved,
        // blanking every page including /login and /signup.
        timeout: 8000,
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
    } catch (error: any) {
      // No cookie, or the server rejected it (expired/revoked) - either way
      // there's no session.
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await fetchUserProfile();
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // --- Actions ---

  // Called after the backend has already set the session cookie (login,
  // google-signin, or a profile update that reissues it) - just re-syncs
  // `user` with what the cookie now represents.
  const login = async () => {
    await fetchUserProfile();
  };

  const logout = async () => {
    const requestLogout = () =>
      axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });

    try {
      await requestLogout();
    } catch {
      // The httpOnly cookie can only be cleared by the server's Set-Cookie
      // response, so a failed request here leaves it intact - the UI would
      // otherwise show "logged out" while the next fetchUserProfile() (e.g.
      // on reload) silently re-authenticates against the still-valid
      // cookie. One retry covers a transient blip; if it still fails, the
      // user genuinely wasn't logged out, so don't clear local state either
      // - that would just be a UI lying about what actually happened.
      try {
        await requestLogout();
      } catch (retryError) {
        console.error("Logout request failed:", retryError);
        throw retryError;
      }
    }
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
      value={{ user, login, logout, updateUser, isLoading }}
    >
      {children}
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
