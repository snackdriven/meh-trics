import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-[var(--color-border-primary)] bg-[var(--color-background-secondary)] px-3 py-1 text-[var(--color-text-primary)] shadow-[var(--shadow-component-input-resting)] transition-all outline-none",
        "placeholder:text-[var(--color-text-placeholder)] selection:bg-[var(--color-compassionate-encouragement)] selection:text-[var(--color-text-inverse)]",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--color-text-primary)]",
        "focus-visible:border-[var(--color-border-focus)] focus-visible:shadow-[var(--shadow-component-input-focus)]",
        "aria-invalid:border-[var(--color-semantic-error)] aria-invalid:shadow-[var(--shadow-component-input-error)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "text-[var(--text-body-md-size)] leading-[var(--text-body-md-height)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
