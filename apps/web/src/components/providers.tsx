"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/auth/auth-provider";

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  return <AuthProvider>{children}</AuthProvider>;
}
