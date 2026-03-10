import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-border bg-white/80 px-4 text-sm text-foreground outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
