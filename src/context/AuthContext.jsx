/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api, {
  AUTH_SESSION_INVALID_EVENT,
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  setAuthToken,
  setAuthUser,
} from "@/lib/api";

const AuthContext = createContext(null);

function readStoredUser() {
  const token = getAuthToken();
  const storedUser = getAuthUser();

  if (token && storedUser) {
    return storedUser;
  }

  clearAuthSession();
  return null;
}

function saveSession({ token, user }) {
  if (!token || !user) {
    throw new Error("La API no devolvió el token y el usuario.");
  }

  setAuthToken(token);
  setAuthUser(user);
  return user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const isLoading = false;

  useEffect(() => {
    const handleInvalidSession = () => setUser(null);
    window.addEventListener(AUTH_SESSION_INVALID_EVENT, handleInvalidSession);

    return () => {
      window.removeEventListener(AUTH_SESSION_INVALID_EVENT, handleInvalidSession);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await api.post("auth/login", credentials);
    const authenticatedUser = saveSession(response);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const register = useCallback(async (details) => {
    const response = await api.post("auth/register", details);
    const authenticatedUser = saveSession(response);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const logout = useCallback(async () => {
    const token = getAuthToken();

    try {
      if (token) {
        await api.post("auth/logout");
      }
    } catch {
      // La sesión local se cierra aunque el servidor no esté disponible.
    } finally {
      clearAuthSession();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
}
