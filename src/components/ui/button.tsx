import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary)/0.35)] hover:shadow-[0_8px_32px_hsl(var(--primary)/0.55)] hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground shadow-[0_4px_16px_hsl(var(--destructive)/0.35)] hover:shadow-[0_8px_24px_hsl(var(--destructive)/0.5)] hover:-translate-y-0.5",
        outline: "border border-border bg-card/40 backdrop-blur-sm text-foreground hover:bg-card hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50",
        ghost: "hover:bg-muted/60 text-foreground hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-accent",
        premium: "bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground bg-[length:200%_100%] hover:bg-[position:100%_0] shadow-[0_8px_32px_hsl(var(--primary)/0.5)] hover:shadow-[0_12px_40px_hsl(var(--primary)/0.65)] hover:-translate-y-0.5",
        glass: "bg-card/50 backdrop-blur-xl border border-border text-foreground hover:bg-card/80 hover:border-primary/40",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-base",
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
