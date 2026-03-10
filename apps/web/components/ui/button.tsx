import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary px-4 py-2 text-primary-foreground shadow-[0_0_0_1px_rgba(34,211,238,0.22),0_0_28px_rgba(34,211,238,0.28)] hover:bg-[#67e8f9] hover:shadow-[0_0_0_1px_rgba(103,232,249,0.28),0_0_36px_rgba(34,211,238,0.38)]",
        ghost:
          "border border-border bg-black/40 px-4 py-2 text-foreground hover:border-primary/40 hover:bg-surface-muted",
        subtle:
          "bg-accent px-4 py-2 text-foreground hover:bg-[rgba(34,211,238,0.2)]",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-5",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  asChild,
  className,
  size,
  variant,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      {...props}
    />
  );
}
