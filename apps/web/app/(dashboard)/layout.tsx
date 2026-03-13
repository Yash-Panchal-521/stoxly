"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import AuthGuard from "@/auth/auth-guard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex flex-1 flex-col md:pl-sidebar">
          <TopNav onMenuToggle={() => setMobileOpen((o) => !o)} />
          <main className="flex-1 px-4 py-6 md:px-6">
            <div className="mx-auto max-w-content">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
