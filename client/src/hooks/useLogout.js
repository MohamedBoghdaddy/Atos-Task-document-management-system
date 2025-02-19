import { useCallback } from "react";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://atos-task-document-management-system.onrender.com");

export const useLogout = () => {
  const { dispatch } = useAuthContext();

  const logout = useCallback(async () => {
    try {
      // Send the logout request to the server
      await axios.post(
        `${API_URL}/api/users/logout`,
        {},
        { withCredentials: true }
      );

      // Clear localStorage (client-side only)
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Remove Authorization header
      delete axios.defaults.headers.common["Authorization"];

      // Dispatch the logout action to update the auth state
      dispatch({ type: "LOGOUT_SUCCESS" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [dispatch]);

  return { logout };
};
