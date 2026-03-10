"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { firebaseAuth } from "@/lib/firebase";
import { authService } from "@/services/authService";

export type AuthState = {
  error: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  user: User | null;
};

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Authentication failed.";
}

export function useAuthState(): AuthState {
  const [user, setUser] = useState<User | null>(() =>
    authService.getCurrentUser(),
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      const syncAuthState = async () => {
        try {
          await authService.syncUser(nextUser);
          setUser(nextUser);
          setError(null);
        } catch (syncError) {
          setUser(null);
          setError(toErrorMessage(syncError));
        } finally {
          setIsLoading(false);
        }
      };

      syncAuthState().catch((syncError: unknown) => {
        setUser(null);
        setError(toErrorMessage(syncError));
        setIsLoading(false);
      });
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const nextUser = await authService.login(email, password);
      setUser(nextUser);
    } catch (loginError) {
      setUser(null);
      setError(toErrorMessage(loginError));
      throw loginError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const nextUser = await authService.register(name, email, password);
        setUser(nextUser);
      } catch (registerError) {
        setUser(null);
        setError(toErrorMessage(registerError));
        throw registerError;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.logout();
      setUser(null);
    } catch (logoutError) {
      setError(toErrorMessage(logoutError));
      throw logoutError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    error,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    register,
    user,
  };
}
