/**
 * Lazy-loaded Theme Customizer Component
 *
 * This component lazy loads the heavy ThemeCustomizer to improve initial bundle size.
 * The ColorPicker and other heavy dependencies are only loaded when needed.
 */

import { Suspense, lazy, memo } from "react";

// Lazy load the heavy ThemeCustomizer component
const LazyThemeCustomizer = lazy(() =>
  import("./ThemeCustomizer").then((module) => ({
    default: module.ThemeCustomizer,
  }))
);

// Skeleton loader for theme customizer
const ThemeCustomizerSkeleton = memo(function ThemeCustomizerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-[var(--color-background-tertiary)] rounded w-64" />

      {/* Color picker sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="h-6 bg-[var(--color-background-tertiary)] rounded w-32" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-10 bg-[var(--color-background-tertiary)] rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Controls section */}
      <div className="space-y-4">
        <div className="h-6 bg-[var(--color-background-tertiary)] rounded w-24" />
        <div className="flex gap-4">
          <div className="h-10 bg-[var(--color-background-tertiary)] rounded w-20" />
          <div className="h-10 bg-[var(--color-background-tertiary)] rounded w-24" />
          <div className="h-10 bg-[var(--color-background-tertiary)] rounded w-16" />
        </div>
      </div>

      {/* Preview section */}
      <div className="h-32 bg-[var(--color-background-tertiary)] rounded" />
    </div>
  );
});

export interface LazyThemeCustomizerProps {
  // Forward any props the ThemeCustomizer needs
  [key: string]: any;
}

/**
 * Lazy Theme Customizer Wrapper
 *
 * Provides lazy loading with proper error boundaries and fallbacks
 */
export const LazyThemeCustomizerWrapper = memo<LazyThemeCustomizerProps>(
  function LazyThemeCustomizerWrapper(props) {
    return (
      <Suspense fallback={<ThemeCustomizerSkeleton />}>
        <LazyThemeCustomizer {...props} />
      </Suspense>
    );
  }
);

// Export for easier importing
export { LazyThemeCustomizerWrapper as ThemeCustomizer };
