import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-[15px] font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover",
        destructive: "bg-danger text-white hover:bg-danger/90",
        outline:
          "border border-white/[0.15] bg-transparent text-text-primary hover:bg-white/[0.06]",
        secondary:
          "[background:rgba(255,255,255,0.1)] text-text-primary hover:[background:rgba(255,255,255,0.15)]",
        ghost:
          "text-text-secondary hover:bg-white/[0.06] hover:text-text-primary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-[8px] px-4 text-[14px]",
        lg: "h-12 rounded-[12px] px-8 text-[16px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
