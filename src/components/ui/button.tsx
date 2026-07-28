import * as React from "react";
import { cn } from "@/lib/utils";

const VARIANTS: Record<string, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

const SIZES: Record<string, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS | (string & {});
  size?: keyof typeof SIZES | (string & {});
}

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: keyof typeof VARIANTS | (string & {});
  size?: keyof typeof SIZES | (string & {});
  className?: string;
} = {}) {
  return cn(
    BASE,
    VARIANTS[variant] ?? VARIANTS.default,
    SIZES[size] ?? SIZES.default,
    className,
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          BASE,
          VARIANTS[variant] ?? VARIANTS.default,
          SIZES[size] ?? SIZES.default,
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
