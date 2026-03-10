import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = Readonly<InputHTMLAttributes<HTMLInputElement>>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-border bg-black/45 px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-primary/60 focus:bg-black/65 focus:ring-2 focus:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
