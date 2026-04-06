import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ For splash screen

  // ✅ Load saved session on app start
  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const savedToken = await AsyncStorage.getItem("authToken");
      const savedUser = await AsyncStorage.getItem("authUser");

      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
      }
    } catch (error) {
      console.log("Error loading session:", error);
      // Clear corrupted data
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Save session (called after login)
  const saveSession = async (userData, authToken) => {
    try {
      setToken(authToken);
      setUser(userData);
      await AsyncStorage.setItem("authToken", authToken);
      await AsyncStorage.setItem("authUser", JSON.stringify(userData));
    } catch (error) {
      console.log("Error saving session:", error);
    }
  };

  // ✅ Clear session (called on logout)
  const clearSession = async () => {
    try {
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("authUser");
      await AsyncStorage.removeItem("studentId");
    } catch (error) {
      console.log("Error clearing session:", error);
    }
  };

  // ✅ Verify token with backend (optional - for extra security)
  const verifyToken = async () => {
    if (!token || !user) return false;

    try {
      let endpoint = "";
      if (user.role === "admin") endpoint = "/admin/verify";
      else if (user.role === "student") endpoint = "/student/verify";
      else if (user.role === "security") endpoint = "/security/verify";

      const API_URL = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.log("Token verification failed:", error);
      return false;
    }
  };

  // ✅ Get auth headers for API calls
  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        isLoading,
        saveSession,
        clearSession,
        verifyToken,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};