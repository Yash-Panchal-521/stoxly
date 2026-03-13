"use client";

import { useState } from "react";
import { useAuth } from "@/auth/auth-provider";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ui/theme-toggle";

interface TopNavProps {
  onMenuToggle?: () => void;
}

export default function TopNav({ onMenuToggle }: TopNavProps) {
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
    <header
      className="sticky top-0 z-20 flex h-[52px] items-center justify-between px-4 md:px-6 backdrop-blur-2xl"
      style={{
        background: "var(--nav-bg)",
        borderBottom: "0.5px solid var(--nav-border)",
      }}
    >
      {/* Hamburger (mobile only) + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="surface-hover flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary transition-all duration-150 hover:text-text-primary md:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="h-[18px] w-[18px]" />
        </button>
        <div className="relative hidden sm:block">
          <SearchIcon className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search stocks, portfolios…"
            className="h-9 w-48 rounded-[10px] pl-9 pr-3 text-[14px] text-text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/40 lg:w-64"
            style={{ background: "var(--input-fill)" }}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button className="surface-hover rounded-xl p-2 text-text-secondary transition-all duration-150 hover:text-text-primary">
          <BellIcon className="h-[18px] w-[18px]" />
        </button>
        <div className="relative">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/[0.18] text-[13px] font-semibold text-primary focus:outline-none"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-label="User menu"
          >
            {user?.displayName?.[0]?.toUpperCase() ?? "U"}
          </button>
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 overflow-hidden rounded-[14px] shadow-2xl backdrop-blur-2xl"
              style={{
                background: "var(--dropdown-bg)",
                border: "0.5px solid var(--dropdown-border)",
              }}
            >
              {user?.email && (
                <div
                  className="px-4 py-3"
                  style={{
                    borderBottom: "0.5px solid var(--dropdown-divider)",
                  }}
                >
                  <p className="text-[11px] font-medium uppercase tracking-widest text-muted">
                    Account
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-text-primary">
                    {user.email}
                  </p>
                </div>
              )}
              <button
                className="w-full px-4 py-3 text-left text-[14px] text-danger transition-colors hover:bg-white/[0.05]"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuIcon({ className }: Readonly<{ className?: string }>) {
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
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
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
