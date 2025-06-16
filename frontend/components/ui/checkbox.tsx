import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-[var(--color-border-primary)] bg-[var(--color-background-secondary)] data-[state=checked]:bg-[var(--color-interactive-primary)] data-[state=checked]:text-[var(--color-text-inverse)] data-[state=checked]:border-[var(--color-interactive-primary)] focus-visible:border-[var(--color-border-focus)] focus-visible:ring-[var(--color-compassionate-gentle)]/50 aria-invalid:ring-[var(--color-semantic-error)]/20 aria-invalid:border-[var(--color-semantic-error)] size-4 shrink-0 rounded-[4px] border shadow-[var(--shadow-component-input-resting)] transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
