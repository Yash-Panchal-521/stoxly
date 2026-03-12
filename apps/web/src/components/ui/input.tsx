import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl px-4 text-[15px] text-text-primary placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:[background:rgba(255,255,255,0.11)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out [background:rgba(255,255,255,0.07)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
