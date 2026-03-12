"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout as firebaseLogout,
  type AuthResult,
} from "@/services/auth-service";

interface AuthContextValue {
  readonly user: User | null;
  readonly loading: boolean;
  readonly registerWithEmail: (
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  readonly loginWithEmail: (
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  readonly loginWithGoogle: () => Promise<AuthResult>;
  readonly logout: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // Clear cached data whenever a session ends (logout, token expiry, another tab sign-out)
        queryClient.clear();
      }
      setUser(firebaseUser);
      setLoading(false);

      // Sync a lightweight session cookie so middleware can gate protected routes
      if (firebaseUser) {
        const secure = window.location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `__session=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`;
      } else {
        document.cookie = "__session=; path=/; max-age=0";
      }
    });

    return unsubscribe;
  }, [queryClient]);

  const logout = useMemo(
    () => async (): Promise<{ error: string | null }> => {
      queryClient.clear();
      return firebaseLogout();
    },
    [queryClient],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      registerWithEmail,
      loginWithEmail,
      loginWithGoogle,
      logout,
    }),
    [user, loading, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
