"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { AuthState } from "@/hooks/useAuth";
import { useAuthState } from "@/hooks/useAuth";

const AuthContext = createContext<AuthState | undefined>(undefined);

type AuthProviderProps = Readonly<{
  children: ReactNode;
}>;

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthState();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider.");
  }

  return context;
}
