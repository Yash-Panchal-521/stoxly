import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-6 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
          <span className="text-2xl font-bold text-primary-foreground">S</span>
        </div>
        <h1 className="text-h1">Welcome to Stoxly</h1>
        <p className="max-w-md text-body text-text-secondary">
          Your stock portfolio management platform. Track holdings, simulate
          trades, and monitor real-time market data.
        </p>
        <div className="flex gap-3">
          <Link href="/login" className="btn-primary">
            Sign in
          </Link>
          <Link href="/register" className="btn-secondary">
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
