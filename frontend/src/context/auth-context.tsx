import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import type { AuthResponse, AuthUser, LoginPayload } from "@/types/auth";
import { authService } from "@/services/auth-service";
import { ROUTES } from "@/utils/constants";
import { offlineCache } from "@/utils/offline-cache";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  hasRole: (role: AuthUser["role"], allow?: AuthUser["role"][]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "sip3s.auth";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(() => {
    const persisted = localStorage.getItem(STORAGE_KEY);
    if (!persisted) return null;
    try {
      const parsed = JSON.parse(persisted) as AuthResponse;
      return parsed.user;
    } catch (error) {
      console.error("Gagal membaca sesi", error);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      offlineCache
        .readSession()
        .then((session) => {
          if (session?.user) {
            setUser(session.user);
            navigate(authService.resolveDashboardRoute(session.user.role), { replace: true });
          }
        })
        .catch((error) => console.error(error));
    }
  }, [navigate, user]);

  useEffect(() => {
    if (user) {
      const session: AuthResponse = { user, token: user.token };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      offlineCache.persistSession(session).catch((error) => console.error("Gagal menyimpan sesi offline", error));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      offlineCache.clearSession().catch((error) => console.error("Gagal menghapus sesi offline", error));
    }
  }, [user]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsLoading(true);
      try {
        const response = await authService.login(payload);
        setUser(response.user);
        const redirect = authService.resolveDashboardRoute(response.user.role);
        navigate(redirect, { replace: true });
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const logout = useCallback(() => {
    setUser(null);
    offlineCache.clearSession().catch((error) => console.error("Gagal menghapus sesi offline", error));
    navigate(ROUTES.beranda, { replace: true, state: { from: location.pathname } });
  }, [location.pathname, navigate]);

  const hasRole = useCallback(
    (role: AuthUser["role"], allow?: AuthUser["role"][]) => {
      if (!user) return false;
      if (allow && allow.length > 0) {
        return allow.includes(user.role);
      }
      return user.role === role;
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login,
      logout,
      hasRole,
    }),
    [hasRole, isLoading, login, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};
