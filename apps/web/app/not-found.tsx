import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="glass-card w-full max-w-md p-10 text-center">
        <p className="text-h1 text-primary">404</p>
        <h1 className="mt-2 text-h2 text-text-primary">Page not found</h1>
        <p className="mt-3 text-body text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/dashboard" className="btn-primary mt-6 inline-block">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
