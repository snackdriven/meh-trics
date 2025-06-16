# Frontend Performance Optimization Plan 🚀

## Overview

This document outlines comprehensive optimization strategies for the meh-trics frontend application, focusing on performance, maintainability, and developer experience.

## Current State Analysis

### Strengths ✅
- **Modern Architecture**: React 18 with hooks, TypeScript
- **Unified Systems**: CRUD dialogs and theme system consolidated
- **Component Libraries**: Radix UI for accessibility
- **Caching Patterns**: Some hooks implement caching (useAutoTags, useCachedTodayView)

### Optimization Opportunities 🎯

## 1. Performance Optimizations

### A. React Rendering Optimizations

#### **Memoization Strategy**
```typescript
// Current: Components re-render unnecessarily
export function TodayView() {
  const habits = useTodayData().habits;
  return habits.map(habit => <HabitCard key={habit.id} habit={habit} />);
}

// Optimized: Memoized components
const HabitCard = React.memo(({ habit, onCountChange, onNotesChange }) => {
  const handleCountChange = useCallback((newCount) => {
    onCountChange(habit.id, newCount);
  }, [habit.id, onCountChange]);

  return (
    <Card>
      {/* ... */}
    </Card>
  );
});

export const TodayView = React.memo(() => {
  const { habits, handleHabitCountChange, updateHabitEntry } = useTodayData();
  
  const memoizedHandlers = useMemo(() => ({
    onCountChange: handleHabitCountChange,
    onNotesChange: updateHabitEntry
  }), [handleHabitCountChange, updateHabitEntry]);

  return (
    <div>
      {habits.map(habit => (
        <HabitCard 
          key={habit.id} 
          habit={habit} 
          {...memoizedHandlers}
        />
      ))}
    </div>
  );
});
```

#### **Context Splitting**
```typescript
// Current: Large context causes wide re-renders
// Split into focused contexts

// Data Context (changes frequently)
const TodayDataContext = createContext<TodayData>();

// UI Context (changes rarely)
const TodayUIContext = createContext<{
  collapsed: Record<string, boolean>;
  toggleCollapse: (key: string) => void;
}>();

// Settings Context (changes very rarely)
const TodaySettingsContext = createContext<TodaySettings>();
```

### B. Bundle Optimization

#### **Code Splitting & Lazy Loading**
```typescript
// Lazy load heavy components
const CalendarView = lazy(() => import('./components/CalendarView'));
const AdvancedAnalytics = lazy(() => import('./components/AdvancedAnalytics'));
const ThemeCustomizer = lazy(() => import('./components/ThemeCustomizer'));

// Route-based splitting
const routes = [
  {
    path: "/calendar",
    component: lazy(() => import('./pages/CalendarPage')),
  },
  {
    path: "/analytics", 
    component: lazy(() => import('./pages/AnalyticsPage')),
  }
];
```

#### **Dynamic Imports for Heavy Libraries**
```typescript
// Lazy load heavy dependencies
const useConfetti = () => {
  return useCallback(async () => {
    const { default: confetti } = await import('canvas-confetti');
    confetti({ /* config */ });
  }, []);
};

const useChartLibrary = () => {
  return useCallback(async () => {
    const { Chart } = await import('chart.js');
    return Chart;
  }, []);
};
```

### C. Data Fetching Optimizations

#### **SWR Pattern Implementation**
```typescript
// Generic SWR hook
export function useSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    revalidateOnFocus?: boolean;
    refreshInterval?: number;
    dedupingInterval?: number;
  } = {}
) {
  // Implementation with background refetching,
  // deduplication, focus revalidation
}

// Usage
const { data: habits, mutate } = useSWR(
  'habits-today',
  () => backend.habits.listForDate(today),
  { refreshInterval: 30000 }
);
```

#### **Optimistic Updates**
```typescript
const useOptimisticHabitUpdate = () => {
  const { data: habits, mutate } = useSWR('habits');
  
  return useCallback(async (habitId: number, count: number) => {
    // Optimistically update UI
    const optimisticData = habits?.map(h => 
      h.id === habitId ? { ...h, currentCount: count } : h
    );
    
    mutate(optimisticData, false); // Don't revalidate immediately
    
    try {
      // Perform actual update
      await backend.habits.updateCount(habitId, count);
      mutate(); // Revalidate from server
    } catch (error) {
      mutate(); // Revert on error
      throw error;
    }
  }, [habits, mutate]);
};
```

### D. State Management Optimization

#### **State Normalization**
```typescript
// Current: Nested state causing unnecessary updates
interface TodayState {
  habits: Habit[];
  habitCounts: Record<number, number>;
  habitNotes: Record<number, string>;
}

// Optimized: Normalized state
interface NormalizedTodayState {
  habits: {
    byId: Record<number, Habit>;
    allIds: number[];
  };
  habitEntries: {
    byHabitId: Record<number, HabitEntry>;
  };
  ui: {
    collapsed: Record<string, boolean>;
    selectedDate: Date;
  };
}
```

## 2. Component Architecture Improvements

### A. Compound Components

#### **TaskManager Compound Component**
```typescript
const TaskManager = {
  Root: ({ children, ...props }) => (
    <TaskManagerProvider {...props}>
      {children}
    </TaskManagerProvider>
  ),
  
  Header: ({ children, actions }) => (
    <Card>
      <CardHeader>
        {children}
        <CardAction>{actions}</CardAction>
      </CardHeader>
    </Card>
  ),
  
  Filters: TaskFilters,
  List: TaskList,
  CreateDialog: TaskCreateDialog,
};

// Usage
<TaskManager.Root>
  <TaskManager.Header actions={<CreateTaskButton />}>
    <h1>Today's Tasks</h1>
  </TaskManager.Header>
  <TaskManager.Filters />
  <TaskManager.List />
  <TaskManager.CreateDialog />
</TaskManager.Root>
```

### B. Custom Hook Composition

#### **Composed Data Hooks**
```typescript
// Instead of one large hook, compose smaller focused hooks
export function useTodayData() {
  const habits = useTodayHabits();
  const mood = useTodayMood();
  const journal = useTodayJournal();
  const tasks = useTodayTasks();
  
  return { habits, mood, journal, tasks };
}

export function useTodayHabits() {
  const { data, mutate } = useSWR('today-habits', fetchTodayHabits);
  
  const updateHabit = useCallback(async (id, updates) => {
    // Optimistic update logic
  }, [mutate]);
  
  return { habits: data, updateHabit, loading: !data };
}
```

## 3. UI/UX Optimizations

### A. Smart Loading States

#### **Skeleton Loaders with Suspense**
```typescript
// Enhanced skeleton components
const SkeletonCard = ({ variant = 'default' }) => (
  <Card className="animate-pulse">
    {variant === 'habit' && <HabitSkeleton />}
    {variant === 'task' && <TaskSkeleton />}
    {variant === 'calendar' && <CalendarSkeleton />}
  </Card>
);

// Suspense boundaries with fallbacks
const TodayView = () => (
  <ErrorBoundary fallback={<ErrorState />}>
    <Suspense fallback={<TodayViewSkeleton />}>
      <TodayContent />
    </Suspense>
  </ErrorBoundary>
);
```

### B. Progressive Enhancement

#### **Feature Detection & Graceful Degradation**
```typescript
const AdvancedFeatures = () => {
  const supportsWebGL = useWebGLSupport();
  const supportsOffscreen = useOffscreenCanvasSupport();
  
  if (supportsWebGL && supportsOffscreen) {
    return <AdvancedVisualization />;
  }
  
  if (supportsWebGL) {
    return <BasicVisualization />;
  }
  
  return <StaticChart />;
};
```

### C. Micro-interactions

#### **Smooth Transitions & Animations**
```typescript
const AnimatedCard = ({ children, isVisible, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
```

## 4. Developer Experience Improvements

### A. Better Error Boundaries

#### **Granular Error Handling**
```typescript
const FeatureErrorBoundary = ({ 
  feature, 
  fallback, 
  onError,
  children 
}) => {
  return (
    <ErrorBoundary
      fallback={fallback || <FeatureFallback feature={feature} />}
      onError={(error, errorInfo) => {
        console.error(`Error in ${feature}:`, error);
        onError?.(error, errorInfo);
        // Report to error tracking service
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### B. Development Tools

#### **Performance Monitoring**
```typescript
const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes(componentName)) {
          console.log(`${componentName} render time:`, entry.duration);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    return () => observer.disconnect();
  }, [componentName]);
};
```

## 5. Implementation Priority

### Phase 1: Quick Wins (Week 1)
1. **Memoize expensive components** (TodayView, CalendarView, TaskList)
2. **Add React.memo to pure components** (Cards, Buttons, Icons)
3. **Optimize useCallback/useMemo usage** in existing hooks
4. **Implement skeleton loaders** for loading states

### Phase 2: Performance (Week 2)
1. **Context splitting** (separate data, UI, settings contexts)
2. **SWR pattern implementation** for data fetching
3. **Optimistic updates** for frequent actions
4. **Bundle splitting** for heavy components

### Phase 3: Architecture (Week 3-4)
1. **Compound component patterns**
2. **State normalization**
3. **Advanced caching strategies**
4. **Error boundary improvements**

## Success Metrics

### Performance Targets
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 1MB gzipped

### Developer Experience
- **Build Time**: < 30s
- **Hot Reload**: < 500ms
- **Test Suite**: < 10s
- **Type Check**: < 5s

## Monitoring & Analytics

```typescript
// Performance tracking
const usePagePerformance = (pageName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      analytics.track('page_performance', {
        page: pageName,
        duration: endTime - startTime,
        timestamp: Date.now()
      });
    };
  }, [pageName]);
};
```

## Next Steps

1. **Audit current bundle size** with webpack-bundle-analyzer
2. **Profile components** with React DevTools Profiler
3. **Implement monitoring** for Core Web Vitals
4. **Create performance budget** and CI checks
5. **Set up regression testing** for performance

This optimization plan provides a structured approach to improving the frontend while maintaining the existing functionality and user experience.
