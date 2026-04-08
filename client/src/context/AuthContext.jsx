import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { api, ENDPOINTS } from "../lib/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const login = useCallback(async (accessToken) => {
    try {
      const { data } = await api.post(
        ENDPOINTS.AUTH_VERIFY,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      localStorage.setItem("accessToken", accessToken);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true, user: data.user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  }, []);

  useEffect(() => {
    const verifyExistingToken = async () => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        try {
          const { data } = await api.post(
            ENDPOINTS.AUTH_VERIFY,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setUser(data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token verification error:", error);
          logout();
        }
      }

      setIsLoading(false);
    };

    verifyExistingToken();
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [user, isAuthenticated, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
