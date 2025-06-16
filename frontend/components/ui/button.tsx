import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-interactive-primary)] text-[var(--color-text-inverse)] shadow-[var(--shadow-component-button-resting)] hover:bg-[var(--color-interactive-primary-hover)] hover:shadow-[var(--shadow-component-button-hover)] active:shadow-[var(--shadow-component-button-pressed)] focus-visible:shadow-[var(--shadow-interactive-focus-ring)]",
        destructive:
          "bg-[var(--color-semantic-error)] text-[var(--color-text-inverse)] shadow-[var(--shadow-component-button-resting)] hover:bg-[var(--color-semantic-error)]/90 hover:shadow-[var(--shadow-component-button-hover)] active:shadow-[var(--shadow-component-button-pressed)] focus-visible:shadow-[var(--shadow-interactive-focus-error)]",
        outline:
          "border border-[var(--color-border-primary)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] shadow-[var(--shadow-component-button-resting)] hover:bg-[var(--color-compassionate-gentle-subtle)] hover:shadow-[var(--shadow-component-button-hover)] active:shadow-[var(--shadow-component-button-pressed)] focus-visible:shadow-[var(--shadow-interactive-focus-ring)]",
        secondary:
          "bg-[var(--color-background-tertiary)] text-[var(--color-text-primary)] shadow-[var(--shadow-component-button-resting)] hover:bg-[var(--color-compassionate-gentle-subtle)] hover:shadow-[var(--shadow-component-button-hover)] active:shadow-[var(--shadow-component-button-pressed)] focus-visible:shadow-[var(--shadow-interactive-focus-ring)]",
        ghost:
          "text-[var(--color-text-primary)] hover:bg-[var(--color-compassionate-gentle-subtle)] focus-visible:shadow-[var(--shadow-interactive-focus-ring)]",
        link: "text-[var(--color-interactive-secondary)] underline-offset-4 hover:underline focus-visible:shadow-[var(--shadow-interactive-focus-ring)]",
      },
      size: {
        default:
          "h-[var(--space-interactive-touch-target)] px-[var(--space-component-button-padding-x)] gap-[var(--space-component-button-gap)] text-[var(--text-button-size)] leading-[var(--text-button-height)] font-[var(--text-button-weight)] tracking-[var(--text-button-spacing)] has-[>svg]:px-3",
        sm: "h-8 px-3 gap-1.5 text-sm has-[>svg]:px-2.5",
        lg: "h-12 px-6 gap-2 text-base has-[>svg]:px-4",
        icon: "size-[var(--space-interactive-touch-target)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
