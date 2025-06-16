import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-[var(--color-border-primary)] bg-[var(--color-background-secondary)] px-3 py-2 text-[var(--color-text-primary)] shadow-[var(--shadow-component-input-resting)] transition-all outline-none",
        "placeholder:text-[var(--color-text-placeholder)] selection:bg-[var(--color-compassionate-encouragement)] selection:text-[var(--color-text-inverse)]",
        "focus-visible:border-[var(--color-border-focus)] focus-visible:shadow-[var(--shadow-component-input-focus)]",
        "aria-invalid:border-[var(--color-semantic-error)] aria-invalid:shadow-[var(--shadow-component-input-error)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "text-[var(--text-body-md-size)] leading-[var(--text-body-md-height)]",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
