"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/services/auth-service";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await resetPassword(email);
    setLoading(false);

    if (result.success) {
      setSubmitted(true);
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
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a link to reset your
            password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="rounded-xl border border-success/20 bg-success/5 p-4">
                <p className="text-body font-medium text-success">
                  Password reset link sent. Please check your email.
                </p>
                <p className="mt-2 text-small text-text-secondary">
                  Check your inbox and spam folder.
                </p>
              </div>
              <Link href="/login">
                <Button variant="secondary" className="w-full">
                  Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-small text-danger">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
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
