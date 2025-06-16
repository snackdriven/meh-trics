/**
 * Performance Monitoring Utilities - Week 2 Addition
 *
 * This module provides:
 * - React DevTools Profiler integration
 * - Core Web Vitals tracking
 * - Performance budget monitoring
 * - Bundle analysis helpers
 */

import { Profiler, type ProfilerOnRenderCallback } from "react";
import { type ReactNode, useCallback, useEffect } from "react";

// Environment check helper
const isDev = typeof window !== "undefined" && window.location.hostname === "localhost";

// ============================================
// Core Web Vitals Tracking
// ============================================

interface CoreWebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  rating: "good" | "needs-improvement" | "poor";
}

interface PerformanceBudget {
  FCP: number; // First Contentful Paint (ms)
  LCP: number; // Largest Contentful Paint (ms)
  FID: number; // First Input Delay (ms)
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte (ms)
}

const PERFORMANCE_BUDGET: PerformanceBudget = {
  FCP: 1800, // Good: < 1.8s
  LCP: 2500, // Good: < 2.5s
  FID: 100, // Good: < 100ms
  CLS: 0.1, // Good: < 0.1
  TTFB: 800, // Good: < 0.8s
};

class PerformanceTracker {
  private metrics: Map<string, CoreWebVitalsMetric[]> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Largest Contentful Paint
    if ("PerformanceObserver" in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };

          this.reportMetric({
            name: "LCP",
            value: lastEntry.startTime,
            delta: lastEntry.startTime,
            id: crypto.randomUUID(),
            rating: this.getRating("LCP", lastEntry.startTime),
          });
        });

        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
        this.observers.push(lcpObserver);
      } catch (_e) {
        console.warn("LCP observer not supported");
      }
    }

    // First Input Delay
    if ("PerformanceObserver" in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const fidEntry = entry as PerformanceEntry & {
              processingStart: number;
              startTime: number;
            };
            const fid = fidEntry.processingStart - fidEntry.startTime;

            this.reportMetric({
              name: "FID",
              value: fid,
              delta: fid,
              id: crypto.randomUUID(),
              rating: this.getRating("FID", fid),
            });
          });
        });

        fidObserver.observe({ type: "first-input", buffered: true });
        this.observers.push(fidObserver);
      } catch (_e) {
        console.warn("FID observer not supported");
      }
    }

    // Cumulative Layout Shift
    if ("PerformanceObserver" in window) {
      try {
        let clsValue = 0;

        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const layoutShiftEntry = entry as PerformanceEntry & {
              value: number;
              hadRecentInput: boolean;
            };
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          });

          this.reportMetric({
            name: "CLS",
            value: clsValue,
            delta: clsValue,
            id: crypto.randomUUID(),
            rating: this.getRating("CLS", clsValue),
          });
        });

        clsObserver.observe({ type: "layout-shift", buffered: true });
        this.observers.push(clsObserver);
      } catch (_e) {
        console.warn("CLS observer not supported");
      }
    }
  }

  private getRating(
    metric: keyof PerformanceBudget,
    value: number
  ): "good" | "needs-improvement" | "poor" {
    const budget = PERFORMANCE_BUDGET[metric];

    if (metric === "CLS") {
      if (value <= 0.1) return "good";
      if (value <= 0.25) return "needs-improvement";
      return "poor";
    }

    if (value <= budget * 0.75) return "good";
    if (value <= budget) return "needs-improvement";
    return "poor";
  }

  private reportMetric(metric: CoreWebVitalsMetric) {
    const existing = this.metrics.get(metric.name) || [];
    existing.push(metric);
    this.metrics.set(metric.name, existing); // Log to console in development
    if (isDev) {
      console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);

      if (metric.rating === "poor") {
        console.warn(
          `[Performance] ${metric.name} is poor! Budget: ${PERFORMANCE_BUDGET[metric.name as keyof PerformanceBudget]}, Actual: ${metric.value}`
        );
      }
    }

    // Report to analytics service (TODO: implement)
    // analytics.track('core_web_vital', metric);
  }

  getMetrics(): Map<string, CoreWebVitalsMetric[]> {
    return this.metrics;
  }

  getLatestMetrics(): Record<string, CoreWebVitalsMetric | undefined> {
    const latest: Record<string, CoreWebVitalsMetric | undefined> = {};

    for (const [name, metrics] of this.metrics) {
      latest[name] = metrics[metrics.length - 1];
    }

    return latest;
  }

  checkBudgets(): Record<string, boolean> {
    const latest = this.getLatestMetrics();
    const results: Record<string, boolean> = {};

    for (const [name, metric] of Object.entries(latest)) {
      if (metric) {
        results[name] = metric.rating === "good";
      }
    }

    return results;
  }

  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Global performance tracker instance
export const performanceTracker = new PerformanceTracker();

// ============================================
// React Profiler Components
// ============================================

interface PerformanceProfilerProps {
  id: string;
  children: ReactNode;
  onRender?: ProfilerOnRenderCallback;
}

export function PerformanceProfiler({
  id,
  children,
  onRender,
}: PerformanceProfilerProps): JSX.Element {
  const handleRender: ProfilerOnRenderCallback = useCallback(
    (profileId, phase, actualDuration, baseDuration, startTime, commitTime) => {
      // Default performance logging
      if (isDev) {
        console.log(`[Profiler] ${profileId} (${phase}):`, {
          actualDuration: actualDuration.toFixed(2),
          baseDuration: baseDuration.toFixed(2),
          startTime: startTime.toFixed(2),
          commitTime: commitTime.toFixed(2),
        });

        // Warn about slow renders
        if (actualDuration > 16) {
          // > 1 frame at 60fps
          console.warn(
            `[Profiler] Slow render detected in ${profileId}: ${actualDuration.toFixed(2)}ms`
          );
        }
      }

      // Call custom onRender if provided
      onRender?.(profileId, phase, actualDuration, baseDuration, startTime, commitTime);

      // Report to analytics (TODO: implement)
      // analytics.track('component_render', {
      //   component: profileId,
      //   phase,
      //   duration: actualDuration,
      // });
    },
    [onRender]
  );

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
}

// ============================================
// Performance Hooks
// ============================================

export function usePerformanceMonitoring() {
  const metrics = performanceTracker.getLatestMetrics();
  const budgetStatus = performanceTracker.checkBudgets();

  return {
    metrics,
    budgetStatus,
    isGood: Object.values(budgetStatus).every(Boolean),
  };
}

export function useRenderTiming(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      if (isDev && renderTime > 16) {
        console.warn(`[RenderTiming] ${componentName} took ${renderTime.toFixed(2)}ms to unmount`);
      }
    };
  }, [componentName]);
}

// ============================================
// Bundle Analysis Helpers
// ============================================

export const bundleAnalysis = {
  /**
   * Log bundle information
   */
  logBundleInfo() {
    if (isDev) {
      console.group("[Bundle Analysis]");
      console.log("Environment: development");
      console.log("Build timestamp:", new Date().toISOString());
      console.groupEnd();
    }
  },

  /**
   * Measure code splitting effectiveness
   */
  measureCodeSplitting() {
    if ("performance" in window && "getEntriesByType" in performance) {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const scripts = resources.filter((r) => r.name.includes(".js"));

      console.group("[Code Splitting Analysis]");
      console.log(`Total JS files: ${scripts.length}`);
      console.log(
        "Script sizes:",
        scripts.map((s) => ({
          name: s.name.split("/").pop(),
          size: s.transferSize || "unknown",
          loadTime: `${(s.responseEnd - s.requestStart).toFixed(2)}ms`,
        }))
      );
      console.groupEnd();
    }
  },

  /**
   * Check for potential optimizations
   */
  checkOptimizations() {
    const warnings: string[] = [];

    // Check for large bundle sizes
    if ("performance" in window && "getEntriesByType" in performance) {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const largeFiles = resources.filter((r) => (r.transferSize || 0) > 500000); // > 500KB

      if (largeFiles.length > 0) {
        warnings.push(
          `Large files detected (>500KB): ${largeFiles.map((f) => f.name.split("/").pop()).join(", ")}`
        );
      }
    }

    // Check for performance budget violations
    const budgetStatus = performanceTracker.checkBudgets();
    const violations = Object.entries(budgetStatus).filter(([_, passing]) => !passing);

    if (violations.length > 0) {
      warnings.push(
        `Performance budget violations: ${violations.map(([metric]) => metric).join(", ")}`
      );
    }

    if (warnings.length > 0) {
      console.group("[Performance Warnings]");
      warnings.forEach((warning) => console.warn(warning));
      console.groupEnd();
    }

    return warnings;
  },
};

// ============================================
// Initialization
// ============================================

// Auto-start performance monitoring in development
if (isDev) {
  bundleAnalysis.logBundleInfo();

  // Check optimizations after a delay to let the app load
  setTimeout(() => {
    bundleAnalysis.measureCodeSplitting();
    bundleAnalysis.checkOptimizations();
  }, 3000);
}
