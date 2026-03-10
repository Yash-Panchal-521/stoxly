import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "positive";
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium",
        tone === "positive"
          ? "bg-success/10 text-success shadow-[0_0_20px_rgba(52,211,153,0.12)]"
          : "bg-surface-muted text-foreground",
        className,
      )}
      {...props}
    />
  );
}
