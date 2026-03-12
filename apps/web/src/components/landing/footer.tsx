import Link from "next/link";
import { TrendingUp, ExternalLink } from "lucide-react";

const footerGroups = [
  {
    title: "Product",
    links: ["Features", "Analytics", "How It Works", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security", "Cookies"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-text-primary">
                Stoxly
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Your stock portfolio management platform. Track holdings, simulate
              trades, and monitor real-time market data.
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              <ExternalLink className="h-4 w-4" />
              View on GitHub
            </a>
          </div>

          {/* Link groups */}
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-4 text-sm font-semibold text-text-primary">
                {group.title}
              </p>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-text-secondary">
            © {new Date().getFullYear()} Stoxly. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <button
                key={item}
                type="button"
                className="text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
