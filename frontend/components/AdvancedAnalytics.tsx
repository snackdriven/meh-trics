import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
// import backend from "~backend/client";

interface AdvancedMetrics {
  productivityScore: number;
  burnoutRisk: "low" | "medium" | "high";
  habitConsistency: number;
  moodStability: number;
  workLifeBalance: number;
  recommendations: Array<{
    type: "improvement" | "warning" | "celebration";
    message: string;
    actionable: boolean;
  }>;
  trends: Array<{
    metric: string;
    direction: "up" | "down" | "stable";
    change: number;
    period: string;
  }>;
}


export function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [metrics, setMetrics] = useState<AdvancedMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdvancedMetrics() {
      setLoading(true);
      try {
        // TODO: Implement this endpoint in backend
        // const response = await backend.analytics.getAdvancedMetrics({
        //   timeRange,
        //   includeRecommendations: true,
        // });
        // setMetrics(response);
        
        // Mock data for now
        setMetrics({
          productivityScore: 85,
          burnoutRisk: "low",
          habitConsistency: 78,
          moodStability: 82,
          workLifeBalance: 73,
          recommendations: [],
          trends: []
        });
      } catch (error) {
        console.error("Failed to fetch advanced metrics:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchAdvancedMetrics();
  }, [timeRange]);

  const productivityTrend = useMemo(() => {
    if (!metrics) return null;
    const trend = metrics.trends.find((t) => t.metric === "productivity");
    if (!trend) return null;
    return { direction: trend.direction, change: trend.change };
  }, [metrics]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <p>Unable to load analytics data</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <Select
          value={timeRange}
          onValueChange={(value: "7d" | "30d" | "90d") => setTimeRange(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Productivity Score"
          value={metrics.productivityScore}
          format="percentage"
          trend={productivityTrend}
          description="Overall productivity based on task completion and habit consistency"
        />

        <MetricCard
          title="Burnout Risk"
          value={metrics.burnoutRisk}
          format="risk"
          description="Risk assessment based on mood patterns and workload"
        />

        <MetricCard
          title="Habit Consistency"
          value={metrics.habitConsistency}
          format="percentage"
          description="How consistently you maintain your habits"
        />

        <MetricCard
          title="Mood Stability"
          value={metrics.moodStability}
          format="score"
          description="Emotional well-being and mood pattern stability"
        />
      </div>

      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Personalized Recommendations</h3>
        <div className="space-y-3">
          {metrics.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              {rec.type === "celebration" && (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              )}
              {rec.type === "warning" && <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />}
              {rec.type === "improvement" && (
                <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
              )}

              <div className="flex-1">
                <p className="text-sm">{rec.message}</p>
                {rec.actionable && (
                  <Button variant="link" size="sm" className="p-0 h-auto mt-1">
                    Take Action
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trends Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Trends Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.trends.map((trend, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{trend.metric}</p>
                <p className="text-sm text-gray-500">{trend.period}</p>
              </div>
              <div className="flex items-center gap-2">
                {trend.direction === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                {trend.direction === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
                <span
                  className={`text-sm font-medium ${
                    trend.direction === "up"
                      ? "text-green-500"
                      : trend.direction === "down"
                        ? "text-red-500"
                        : "text-gray-500"
                  }`}
                >
                  {trend.change > 0 ? "+" : ""}
                  {trend.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  format: "percentage" | "score" | "risk";
  trend?: { direction: "up" | "down" | "stable"; change: number } | null;
  description: string;
}

function MetricCard({ title, value, format, trend, description }: MetricCardProps) {
  const formatValue = (val: number | string): string => {
    if (format === "percentage" && typeof val === "number") {
      return `${val}%`;
    }
    if (format === "score" && typeof val === "number") {
      return `${val}/10`;
    }
    if (format === "risk") {
      return val.toString();
    }
    return val.toString();
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case "low":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "high":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {trend && (
          <div className="flex items-center gap-1">
            {trend.direction === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend.direction === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
            <span
              className={`text-xs ${
                trend.direction === "up"
                  ? "text-green-500"
                  : trend.direction === "down"
                    ? "text-red-500"
                    : "text-gray-500"
              }`}
            >
              {trend.change > 0 ? "+" : ""}
              {trend.change}%
            </span>
          </div>
        )}
      </div>

      <div
        className={`text-2xl font-bold ${format === "risk" ? getRiskColor(value.toString()) : ""}`}
      >
        {formatValue(value)}
      </div>

      <p className="text-xs text-gray-500 mt-2">{description}</p>
    </Card>
  );
}
