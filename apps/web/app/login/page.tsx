"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/auth/auth-provider";

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await loginWithEmail(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);

    const result = await loginWithGoogle();
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-black">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/3 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]"
          style={{ background: "rgba(10,132,255,0.06)" }}
        />
      </div>

      <div className="relative w-full max-w-[380px] px-5">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-[60px] w-[60px] items-center justify-center rounded-[18px] bg-primary">
            <span className="text-[26px] font-bold text-white">S</span>
          </div>
          <h1
            className="text-[28px] font-bold text-text-primary"
            style={{ letterSpacing: "-0.025em" }}
          >
            Welcome back
          </h1>
          <p className="mt-1.5 text-[15px] text-text-secondary">
            Sign in to your Stoxly account
          </p>
        </div>

        {/* Grouped form fields */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div className="overflow-hidden rounded-2xl bg-card">
            <div
              className="px-4 py-3.5"
              style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}
            >
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-muted">
                Email
              </p>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent text-[15px] text-text-primary placeholder:text-muted/50 focus:outline-none"
              />
            </div>
            <div className="px-4 py-3.5">
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-muted">
                Password
              </p>
              <div className="flex items-center gap-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-muted/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-muted transition-colors hover:text-text-secondary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="px-1 text-right">
            <Link
              href="/forgot-password"
              className="text-[13px] text-primary transition-colors hover:text-primary-hover"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-3 text-[13px] text-danger"
              style={{ background: "rgba(255,69,58,0.1)" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-2xl bg-primary py-4 text-[15px] font-semibold text-white transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-4">
          <div
            className="h-px flex-1"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
          <span className="text-[12px] text-muted">or</span>
          <div
            className="h-px flex-1"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-card py-4 text-[15px] font-medium text-text-primary transition-all hover:brightness-125 active:scale-[0.98] disabled:opacity-50"
        >
          <GoogleIcon className="h-5 w-5" />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-[13px] text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary transition-colors hover:text-primary-hover"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
