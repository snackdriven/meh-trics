import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

/**
 * Celebration component variants for different types of achievements
 */
const celebrationVariants = cva(
  "fixed inset-0 z-50 flex items-center justify-center pointer-events-none",
  {
    variants: {
      type: {
        confetti: "animate-pulse",
        sparkles: "animate-bounce",
        badges: "animate-fade-in",
        gentle: "animate-gentle-glow",
      },
    },
    defaultVariants: {
      type: "gentle",
    },
  }
);

/**
 * Main celebration container component
 */
function CelebrationContainer({
  className,
  type,
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof celebrationVariants>) {
  return (
    <div className={cn(celebrationVariants({ type, className }))} {...props}>
      {children}
    </div>
  );
}

/**
 * Celebration card for displaying achievement messages
 */
function CelebrationCard({
  className,
  variant = "gentle",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "gentle" | "exciting" | "milestone";
}) {
  const cardVariants = {
    gentle:
      "bg-[var(--color-compassionate-encouragement-subtle)] border-[var(--color-compassionate-encouragement)]",
    exciting:
      "bg-[var(--color-compassionate-celebration-subtle)] border-[var(--color-compassionate-celebration)]",
    milestone:
      "bg-[var(--color-compassionate-wisdom-subtle)] border-[var(--color-compassionate-wisdom)]",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto max-w-md mx-4 p-6 rounded-xl border shadow-[var(--shadow-interactive-celebration-gentle)] backdrop-blur-sm transform transition-all duration-500 scale-100",
        cardVariants[variant],
        className
      )}
      {...props}
    />
  );
}

/**
 * Celebration emoji/icon display
 */
function CelebrationIcon({
  className,
  size = "lg",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
    xl: "text-6xl",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center mb-3 animate-bounce",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Celebration title
 */
function CelebrationTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold text-center mb-2 text-[var(--color-text-primary)]",
        className
      )}
      {...props}
    />
  );
}

/**
 * Celebration message
 */
function CelebrationMessage({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-sm text-[var(--color-text-secondary)] text-center leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

/**
 * Celebration actions (like dismiss button)
 */
function CelebrationActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex justify-center mt-4 gap-2", className)} {...props} />;
}

/**
 * Progress indicator for milestone celebrations
 */
function CelebrationProgress({
  className,
  current,
  total,
  label,
  ...props
}: React.ComponentProps<"div"> & {
  current: number;
  total: number;
  label?: string;
}) {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className={cn("mt-3", className)} {...props}>
      {label && (
        <div className="text-xs text-[var(--color-text-tertiary)] mb-1 text-center">{label}</div>
      )}
      <div className="w-full bg-[var(--color-background-tertiary)] rounded-full h-2">
        <div
          className="bg-gradient-to-r from-[var(--color-compassionate-encouragement)] to-[var(--color-compassionate-gentle)] h-2 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-[var(--color-text-tertiary)] mt-1 text-center">
        {current} / {total}
      </div>
    </div>
  );
}

/**
 * Confetti effect overlay
 */
function ConfettiOverlay({
  className,
  duration = 3000,
  ...props
}: React.ComponentProps<"div"> & {
  duration?: number;
}) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}
      style={{
        background: `
          radial-gradient(circle at 20% 20%, rgba(255,0,150,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(0,255,150,0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(255,255,0,0.1) 0%, transparent 50%)
        `,
        animation: `confetti-fall ${duration}ms ease-out forwards`,
      }}
      {...props}
    />
  );
}

/**
 * Success criteria indicator
 */
function SuccessIndicator({
  className,
  type,
  achieved = false,
  ...props
}: React.ComponentProps<"div"> & {
  type: "full" | "partial" | "minimum";
  achieved?: boolean;
}) {
  const indicators = {
    full: {
      emoji: "🎯",
      color: "text-[var(--color-compassionate-encouragement)]",
      label: "Full Success",
    },
    partial: {
      emoji: "👏",
      color: "text-[var(--color-compassionate-gentle)]",
      label: "Partial Success",
    },
    minimum: {
      emoji: "✨",
      color: "text-[var(--color-compassionate-celebration)]",
      label: "Good Effort",
    },
  };

  const indicator = indicators[type];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all",
        achieved
          ? `${indicator.color} bg-current/10`
          : "text-[var(--color-text-tertiary)] bg-[var(--color-background-tertiary)]",
        className
      )}
      {...props}
    >
      <span className="text-base">{indicator.emoji}</span>
      <span>{indicator.label}</span>
    </div>
  );
}

export {
  CelebrationContainer,
  CelebrationCard,
  CelebrationIcon,
  CelebrationTitle,
  CelebrationMessage,
  CelebrationActions,
  CelebrationProgress,
  ConfettiOverlay,
  SuccessIndicator,
  celebrationVariants,
};
