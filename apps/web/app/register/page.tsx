import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { EmailPasswordForm } from "@/components/auth/EmailPasswordForm";

export default function RegisterPage() {
  return (
    <AuthShell
      alternateHref="/login"
      alternateLabel="Already have an account? Login"
      description="Create your account, set your display name, and unlock the protected dashboard."
      title="Register"
    >
      <Suspense
        fallback={
          <div className="text-sm text-muted">Loading registration form...</div>
        }
      >
        <EmailPasswordForm mode="register" />
      </Suspense>
    </AuthShell>
  );
}
