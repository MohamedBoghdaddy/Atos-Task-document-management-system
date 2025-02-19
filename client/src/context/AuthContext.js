import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://atos-task-document-management-system.onrender.com");

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "USER_LOADED":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case "LOGOUT_SUCCESS":
    case "AUTH_ERROR":
      return { ...state, user: null, isAuthenticated: false, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const setAuthorizationHeader = (token) => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const removeAuthorizationHeader = () => {
    delete axios.defaults.headers.common["Authorization"];
  };

  const checkAuth = useCallback(async () => {
    if (state.isAuthenticated || !state.loading) return; // ✅ Prevent unnecessary calls

    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || localStorage.getItem("token");

      if (!token) {
        dispatch({ type: "AUTH_ERROR" });
        return;
      }

      const response = await axios.get(`${API_URL}/api/users/checkAuth`, {
        withCredentials: true,
      });

      const { user } = response.data;
      if (user) {
        dispatch({ type: "USER_LOADED", payload: user });
        setAuthorizationHeader(token);
        localStorage.setItem("user", JSON.stringify({ token, user }));
      } else {
        dispatch({ type: "AUTH_ERROR" });
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      dispatch({ type: "AUTH_ERROR" });
    }
  }, [state.isAuthenticated, state.loading]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const { token, user } = JSON.parse(storedUser);
        if (user && token) {
          dispatch({ type: "LOGIN_SUCCESS", payload: user });
          setAuthorizationHeader(token);
        } else {
          checkAuth();
        }
      } catch (error) {
        console.error("❌ Failed to parse user from localStorage:", error);
        dispatch({ type: "AUTH_ERROR" });
      }
    } else {
      checkAuth();
    }
  }, [checkAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    removeAuthorizationHeader();
    dispatch({ type: "LOGOUT_SUCCESS" });
  }, []);

  const contextValue = useMemo(
    () => ({ state, dispatch, logout }),
    [state, logout]
  );

  useEffect(() => {
    if (!state.loading) {
      console.log("🔄 AuthProvider state updated:", state);
    }
  }, [state]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
