"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { confirmPasswordReset } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-danger" };
  if (score <= 2) return { score, label: "Fair", color: "bg-warning" };
  if (score <= 3) return { score, label: "Good", color: "bg-primary" };
  return { score, label: "Strong", color: "bg-success" };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword;
  const isValid =
    password.length >= 8 &&
    strength.score >= 2 &&
    passwordsMatch &&
    confirmPassword.length > 0;

  useEffect(() => {
    if (!oobCode) {
      setError("Invalid or missing reset link. Please request a new one.");
    }
  }, [oobCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!oobCode || !isValid) return;

    setError(null);
    setLoading(true);

    const result = await confirmPasswordReset(oobCode, password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } else {
      setError(result.error);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background">
      {/* Subtle gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-border bg-card/80 shadow-lg backdrop-blur-xl">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>
            Choose a strong password for your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <div className="rounded-xl border border-success/20 bg-success/5 p-4">
                <p className="text-body font-medium text-success">
                  Password reset successfully!
                </p>
                <p className="mt-2 text-small text-text-secondary">
                  Redirecting you to login…
                </p>
              </div>
              <Link href="/login">
                <Button variant="secondary" className="w-full">
                  Go to login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New password */}
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-text-primary"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Strength indicator */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i < strength.score ? strength.color : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-small text-text-secondary">
                      {strength.label}
                      {password.length < 8 && " — minimum 8 characters"}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-text-primary"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-small text-danger">
                    Passwords do not match.
                  </p>
                )}
              </div>

              {error && <p className="text-small text-danger">{error}</p>}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !isValid || !oobCode}
              >
                {loading ? "Resetting…" : "Reset password"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-small text-text-secondary">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Back to sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
