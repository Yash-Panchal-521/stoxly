import Link from "next/link";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthShellProps = Readonly<{
  alternateHref: string;
  alternateLabel: string;
  children: ReactNode;
  description: string;
  title: string;
}>;

export function AuthShell({
  alternateHref,
  alternateLabel,
  children,
  description,
  title,
}: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-12 sm:px-8 lg:px-12">
      <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="relative overflow-hidden rounded-[36px] border border-border bg-[linear-gradient(180deg,rgba(6,14,19,0.88),rgba(3,8,12,0.96))] px-8 py-10 shadow-[0_0_80px_rgba(34,211,238,0.08)] sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -left-10 top-8 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative space-y-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/80">
              Secure access
            </p>
            <div className="space-y-5">
              <h1 className="neon-text max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Step into the Stoxly control room.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
                Fast account access, protected dashboards, and session-aware API
                requests without the generic starter-kit look.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-border bg-black/30 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
                  Session
                </p>
                <p className="mt-2 text-sm text-foreground">
                  Protected routes and instant redirects.
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-black/30 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
                  Access
                </p>
                <p className="mt-2 text-sm text-foreground">
                  Email sign-in with cleaner failure states.
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-black/30 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
                  Token
                </p>
                <p className="mt-2 text-sm text-foreground">
                  Session token kept in memory for API calls.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Card className="mx-auto w-full max-w-xl bg-[linear-gradient(180deg,rgba(7,18,25,0.96),rgba(4,10,14,0.98))]">
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary/85">
              Stoxly access
            </div>
            <CardTitle className="text-3xl">{title}</CardTitle>
            <CardDescription className="max-w-lg text-base leading-7">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {children}
            <p className="text-sm text-muted">
              <Link className="font-semibold text-primary" href={alternateHref}>
                {alternateLabel}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
