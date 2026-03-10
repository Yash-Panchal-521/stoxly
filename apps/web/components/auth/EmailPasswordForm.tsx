"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ComponentProps } from "react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EmailPasswordFormProps = Readonly<{
  mode: "login" | "register";
}>;

type SubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

function getModeCopy(mode: "login" | "register") {
  if (mode === "register") {
    return {
      action: "Create account",
      helper:
        "Your display name appears in the dashboard header after registration.",
    };
  }

  return {
    action: "Login",
    helper: "Use the same credentials you used when you created your account.",
  };
}

export function EmailPasswordForm({ mode }: EmailPasswordFormProps) {
  const { error: authError, isLoading, login, register } = useAuthContext();
  const isRegisterMode = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const copy = getModeCopy(mode);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();

    if (isRegisterMode && trimmedName.length < 2) {
      setFormError("Enter your full name so we can personalize the workspace.");
      return;
    }

    if (!email.trim()) {
      setFormError("Enter your email address to continue.");
      return;
    }

    if (password.length < 8) {
      setFormError("Use a password with at least 8 characters.");
      return;
    }

    if (isRegisterMode && password !== confirmPassword) {
      setFormError("Your passwords do not match. Re-enter them and try again.");
      return;
    }

    try {
      if (isRegisterMode) {
        await register(trimmedName, email, password);
      } else {
        await login(email, password);
      }

      const redirectTarget = searchParams.get("redirect") ?? "/dashboard";
      router.replace(redirectTarget);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to complete authentication.";

      setFormError(message);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {isRegisterMode ? (
        <div className="space-y-2.5">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="register-name"
          >
            Full name
          </label>
          <Input
            autoComplete="name"
            id="register-name"
            placeholder="Aarav Patel"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      ) : null}

      <div className="space-y-2.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor={`${mode}-email`}
        >
          Email
        </label>
        <Input
          autoComplete="email"
          id={`${mode}-email`}
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="space-y-2.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor={`${mode}-password`}
        >
          Password
        </label>
        <Input
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          id={`${mode}-password`}
          placeholder={
            isRegisterMode ? "Create a strong password" : "Enter your password"
          }
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {isRegisterMode ? (
        <div className="space-y-2.5">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="register-confirm-password"
          >
            Confirm password
          </label>
          <Input
            autoComplete="new-password"
            id="register-confirm-password"
            placeholder="Repeat your password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-surface-muted/60 px-4 py-3 text-sm text-muted">
        {copy.helper}
      </div>

      {(formError ?? authError) ? (
        <div className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {formError ?? authError}
        </div>
      ) : null}

      <Button className="w-full" disabled={isLoading} type="submit">
        {isLoading ? `${copy.action}...` : copy.action}
      </Button>
    </form>
  );
}
