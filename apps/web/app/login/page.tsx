import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { EmailPasswordForm } from "@/components/auth/EmailPasswordForm";

export default function LoginPage() {
  return (
    <AuthShell
      alternateHref="/register"
      alternateLabel="Need an account? Register"
      description="Use your email and password to open the dashboard and protected routes."
      title="Login"
    >
      <Suspense
        fallback={
          <div className="text-sm text-muted">Loading sign-in form...</div>
        }
      >
        <EmailPasswordForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}
