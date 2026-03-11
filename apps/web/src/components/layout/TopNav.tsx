"use client";

import { useState } from "react";
import { useAuth } from "@/auth/auth-provider";
import { useRouter } from "next/navigation";

export default function TopNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (!result.error) {
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur-md">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search stocks, portfolios…"
            className="stoxly-input w-72 pl-9"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="rounded-xl p-2 text-text-secondary transition-all duration-150 ease-in-out hover:bg-card hover:text-text-primary">
          <BellIcon className="h-4 w-4" />
        </button>
        <div className="relative">
          <button
            className="h-8 w-8 rounded-full bg-primary/20 text-center text-xs font-medium leading-8 text-primary focus:outline-none"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-label="User menu"
          >
            {user?.displayName?.[0] || "U"}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-xl border border-border bg-card shadow-sm transition-all duration-150 ease-in-out">
              <button
                className="w-full px-4 py-2 text-left text-text-secondary hover:bg-primary/10 hover:text-primary btn-ghost rounded-xl"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function SearchIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function BellIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
