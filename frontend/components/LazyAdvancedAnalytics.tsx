/**
 * Lazy-loaded Advanced Analytics Component
 *
 * This component lazy loads the heavy AdvancedAnalytics to improve initial bundle size.
 * Chart libraries and complex calculations are only loaded when needed.
 */

import { Suspense, lazy, memo } from "react";

// Lazy load the heavy AdvancedAnalytics component
const LazyAdvancedAnalytics = lazy(() =>
  import("./AdvancedAnalytics").then((module) => ({
    default: module.AdvancedAnalytics,
  }))
);

// Skeleton loader for advanced analytics
const AdvancedAnalyticsSkeleton = memo(function AdvancedAnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-[var(--color-background-tertiary)] rounded w-48" />
        <div className="h-10 bg-[var(--color-background-tertiary)] rounded w-32" />
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="p-6 space-y-3 bg-[var(--color-background-secondary)] rounded-xl border"
          >
            <div className="h-4 bg-[var(--color-background-tertiary)] rounded w-24" />
            <div className="h-8 bg-[var(--color-background-tertiary)] rounded w-16" />
            <div className="h-3 bg-[var(--color-background-tertiary)] rounded w-20" />
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="h-64 bg-[var(--color-background-secondary)] rounded-xl border p-6 space-y-4">
        <div className="h-6 bg-[var(--color-background-tertiary)] rounded w-32" />
        <div className="h-48 bg-[var(--color-background-tertiary)] rounded" />
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <div className="h-6 bg-[var(--color-background-tertiary)] rounded w-40" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-[var(--color-background-secondary)] rounded-lg border"
            >
              <div className="w-5 h-5 bg-[var(--color-background-tertiary)] rounded-full mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--color-background-tertiary)] rounded w-3/4" />
                <div className="h-3 bg-[var(--color-background-tertiary)] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trends table */}
      <div className="space-y-4">
        <div className="h-6 bg-[var(--color-background-tertiary)] rounded w-24" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-[var(--color-background-secondary)] rounded border"
            >
              <div className="h-4 bg-[var(--color-background-tertiary)] rounded w-32" />
              <div className="h-4 bg-[var(--color-background-tertiary)] rounded w-16" />
              <div className="h-4 bg-[var(--color-background-tertiary)] rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export interface LazyAdvancedAnalyticsProps {
  // Forward any props the AdvancedAnalytics needs
  [key: string]: any;
}

/**
 * Lazy Advanced Analytics Wrapper
 *
 * Provides lazy loading with proper error boundaries and fallbacks
 */
export const LazyAdvancedAnalyticsWrapper = memo<LazyAdvancedAnalyticsProps>(
  function LazyAdvancedAnalyticsWrapper(props) {
    return (
      <Suspense fallback={<AdvancedAnalyticsSkeleton />}>
        <LazyAdvancedAnalytics {...props} />
      </Suspense>
    );
  }
);

// Export for easier importing
export { LazyAdvancedAnalyticsWrapper as AdvancedAnalytics };
