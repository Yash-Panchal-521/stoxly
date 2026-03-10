import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = Readonly<HTMLAttributes<HTMLDivElement>>;
type CardTitleProps = Readonly<HTMLAttributes<HTMLHeadingElement>>;
type CardDescriptionProps = Readonly<HTMLAttributes<HTMLParagraphElement>>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "surface-panel neon-border rounded-[28px] border border-border p-6 sm:p-8",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("space-y-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardTitleProps) {
  const { children, ...restProps } = props;

  return (
    <h2
      className={cn("text-xl font-semibold tracking-tight", className)}
      {...restProps}
    >
      {children}
    </h2>
  );
}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("mt-6 sm:mt-8", className)} {...props} />;
}
