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

async function saveSession({ token, user }) {
  if (!token || !user) {
    throw new Error("La API no devolvió el token y el usuario.");
  }

  await Promise.all([setAuthToken(token), setAuthUser(user)]);
  return user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const handleInvalidSession = () => setUser(null);
    window.addEventListener(AUTH_SESSION_INVALID_EVENT, handleInvalidSession);

    async function restoreSession() {
      try {
        const [token, storedUser] = await Promise.all([getAuthToken(), getAuthUser()]);

        if (!isMounted) return;
        if (token && storedUser) {
          setUser(storedUser);
        } else {
          clearAuthSession();
        }
      } catch {
        if (isMounted) {
          clearAuthSession();
          setUser(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
      window.removeEventListener(AUTH_SESSION_INVALID_EVENT, handleInvalidSession);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await api.post("auth/login", credentials);
    const authenticatedUser = await saveSession(response);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const register = useCallback(async (details) => {
    const response = await api.post("auth/register", details);
    const authenticatedUser = await saveSession(response);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = await getAuthToken();
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
