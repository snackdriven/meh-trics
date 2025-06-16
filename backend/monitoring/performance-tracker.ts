import { api } from "encore.dev/api";

interface PerformanceMetrics {
  endpoint: string;
  averageResponseTime: number;
  p95ResponseTime: number;
  errorRate: number;
  requestCount: number;
  slowestQueries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
  }>;
}

interface DatabaseMetrics {
  connections: {
    active: number;
    idle: number;
    waiting: number;
  };
  slowQueries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
  }>;
}

interface SystemHealthResponse {
  overall: "healthy" | "degraded" | "critical";
  metrics: PerformanceMetrics[];
  recommendations: string[];
  databaseConnections: {
    active: number;
    idle: number;
    waiting: number;
  };
}

/**
 * Enhanced performance monitoring with intelligent recommendations
 */
export const getSystemHealth = api<void, SystemHealthResponse>(
  { expose: true, method: "GET", path: "/monitoring/health" },
  async () => {
    // Collect metrics from various sources
    const endpointMetrics = await collectEndpointMetrics();
    const dbMetrics = await collectDatabaseMetrics();
    const recommendations = generateRecommendations(endpointMetrics, dbMetrics);

    const overall = determineOverallHealth(endpointMetrics, dbMetrics);

    return {
      overall,
      metrics: endpointMetrics,
      recommendations,
      databaseConnections: dbMetrics.connections,
    };
  }
);

async function collectEndpointMetrics(): Promise<PerformanceMetrics[]> {
  // Implementation would collect from request logs
  return [
    {
      endpoint: "/tasks",
      averageResponseTime: 150,
      p95ResponseTime: 300,
      errorRate: 0.02,
      requestCount: 1250,
      slowestQueries: [],
    },
  ];
}

async function collectDatabaseMetrics(): Promise<DatabaseMetrics> {
  // Implementation would query pg_stat_activity and other system tables
  return {
    connections: {
      active: 5,
      idle: 3,
      waiting: 0,
    },
    slowQueries: [],
  };
}

function generateRecommendations(
  endpointMetrics: PerformanceMetrics[],
  dbMetrics: DatabaseMetrics
): string[] {
  const recommendations: string[] = [];

  for (const metric of endpointMetrics) {
    if (metric.averageResponseTime > 200) {
      recommendations.push(
        `Consider optimizing ${metric.endpoint} - avg response time is ${metric.averageResponseTime}ms`
      );
    }
    if (metric.errorRate > 0.05) {
      recommendations.push(
        `High error rate on ${metric.endpoint} (${(metric.errorRate * 100).toFixed(1)}%)`
      );
    }
  }

  if (dbMetrics.connections.waiting > 0) {
    recommendations.push("Database connection pool may need tuning - queries are waiting");
  }

  return recommendations;
}

function determineOverallHealth(
  endpointMetrics: PerformanceMetrics[],
  dbMetrics: DatabaseMetrics
): "healthy" | "degraded" | "critical" {
  const highErrorRate = endpointMetrics.some((m) => m.errorRate > 0.1);
  const slowResponses = endpointMetrics.some((m) => m.averageResponseTime > 500);
  const dbIssues = dbMetrics.connections.waiting > 5;

  if (highErrorRate || dbIssues) return "critical";
  if (slowResponses) return "degraded";
  return "healthy";
}
