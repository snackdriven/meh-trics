import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-[var(--color-border-focus)] focus-visible:ring-[var(--color-compassionate-gentle)]/50 focus-visible:ring-[3px] aria-invalid:ring-[var(--color-semantic-error)]/20 aria-invalid:border-[var(--color-semantic-error)] transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-interactive-primary)] text-[var(--color-text-inverse)] [a&]:hover:bg-[var(--color-interactive-primary-hover)]",
        secondary:
          "border-transparent bg-[var(--color-background-tertiary)] text-[var(--color-text-primary)] [a&]:hover:bg-[var(--color-compassionate-gentle-subtle)]",
        destructive:
          "border-transparent bg-[var(--color-semantic-error)] text-[var(--color-text-inverse)] [a&]:hover:bg-[var(--color-semantic-error)]/90 focus-visible:ring-[var(--color-semantic-error)]/20",
        outline:
          "text-[var(--color-text-primary)] border-[var(--color-border-primary)] [a&]:hover:bg-[var(--color-compassionate-gentle-subtle)] [a&]:hover:text-[var(--color-text-primary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
