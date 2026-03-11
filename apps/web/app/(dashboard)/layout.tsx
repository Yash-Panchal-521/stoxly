import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import AuthGuard from "@/auth/auth-guard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col pl-sidebar">
          <TopNav />
          <main className="flex-1 px-6 py-6">
            <div className="mx-auto max-w-content">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
