import { getCardColor, getEmptyStateColor } from "../lib/colors";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "card" | "avatar" | "button";
  lines?: number;
}

export function SkeletonLoader({
  className = "",
  variant = "text",
  lines = 1,
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-[var(--color-background-tertiary)] rounded";

  if (variant === "text") {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} h-4 ${
              index === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
            }`}
          />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`${baseClasses} p-4 space-y-3 ${className}`}>
        <div className="h-4 bg-[var(--color-border-primary)] rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-[var(--color-border-primary)] rounded" />
          <div className="h-3 bg-[var(--color-border-primary)] rounded w-5/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-[var(--color-border-primary)] rounded w-16" />
          <div className="h-6 bg-[var(--color-border-primary)] rounded w-20" />
        </div>
      </div>
    );
  }

  if (variant === "avatar") {
    return <div className={`${baseClasses} rounded-full w-10 h-10 ${className}`} />;
  }

  if (variant === "button") {
    return <div className={`${baseClasses} h-10 w-24 ${className}`} />;
  }

  return <div className={`${baseClasses} ${className}`} />;
}

export function HabitListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-[var(--color-background-tertiary)] rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[var(--color-border-primary)] rounded" />
              <div className="h-5 bg-[var(--color-border-primary)] rounded w-32" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 bg-[var(--color-border-primary)] rounded w-16" />
              <div className="h-6 bg-[var(--color-border-primary)] rounded w-20" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-1">
                <div className="h-8 bg-[var(--color-border-primary)] rounded w-12 mx-auto" />
                <div className="h-3 bg-[var(--color-border-primary)] rounded w-16 mx-auto" />
              </div>
            ))}
          </div>
          <div className="h-2 bg-[var(--color-border-primary)] rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 bg-[var(--color-border-primary)] rounded w-24" />
              <div className="h-10 bg-[var(--color-border-primary)] rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-[var(--color-border-primary)] rounded w-20" />
              <div className="h-16 bg-[var(--color-border-primary)] rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-[var(--color-background-tertiary)] rounded w-48" />
        <div className="flex gap-2">
          <div className="h-10 bg-[var(--color-background-tertiary)] rounded w-24" />
          <div className="h-10 bg-[var(--color-background-tertiary)] rounded w-10" />
          <div className="h-10 bg-[var(--color-background-tertiary)] rounded w-10" />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="h-8 bg-[var(--color-background-tertiary)] rounded" />
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, index) => (
          <div key={index} className="h-32 bg-[var(--color-background-tertiary)] rounded-lg" />
        ))}
      </div>
    </div>
  );
}
