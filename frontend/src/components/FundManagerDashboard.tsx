import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { AnalyticsSummary as ApiAnalyticsSummary } from "types";
import { useEffect, useState } from "react";
import { LineChartComponent } from "./LineChartComponent";
import { PieChartComponent } from "./PieChartComponent";
import { MetricCard } from "./MetricCard";
import { CardSkeleton } from "./CardSkeleton";
import { DatePicker } from "./DatePicker";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Clock, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import React from "react";
interface EngagementTrend {
  current: number;
  previous: number;
  change_percentage: number;
}

interface MatchAnalytics {
  total_matches: number;
  accepted_matches: number;
  declined_matches: number;
  pending_matches: number;
  match_response_rate: number;
  average_match_quality: number;
  top_matching_sectors: string[];
}

interface EngagementMetrics {
  profile_views: EngagementTrend;
  profile_view_history: number[];
  message_response_rate: EngagementTrend;
  total_connections: EngagementTrend;
  active_conversations: EngagementTrend;
  average_response_time: number;
}

interface MatchRecommendation {
  uid: string;
  name: string;
  company: string;
  match_percentage: number;
  role: string;
  mutual_connections: number;
}

interface TimelineActivity {
  activity_type: string;
  timestamp: string;
  description: string;
}

interface AnalyticsSummary {
  last_updated: string;
  engagement_metrics: EngagementMetrics;
  recent_matches: MatchRecommendation[];
  recent_activities: TimelineActivity[];
  weekly_views: number[];
  match_analytics: MatchAnalytics;
}

interface FundManagerDashboardProps {
  userId?: string;
}

export const FundManagerDashboard = ({ userId = 'current' }: FundManagerDashboardProps) => {
  // Dashboard configuration state
  const [activeView, setActiveView] = useState<"overview" | "performance" | "risk" | "attribution">("overview");
  const [refreshInterval, setRefreshInterval] = useState<number | null>(300000); // 5 minutes
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"1m" | "3m" | "6m" | "1y" | "ytd">("3m");
  const [benchmarkIndex, setBenchmarkIndex] = useState<string>("sp500");
  
  // Data state
  const [analytics, setAnalytics] = useState<ApiAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const { toast } = useToast();

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAnalytics();
      toast({
        title: "Success",
        description: "Analytics refreshed successfully"
      });
    } catch (err) {
      console.error("Manual refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch data with enhanced error handling
  const fetchAnalytics = async () => {
    try {
      const response = await brain.get_analytics_summary();
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Add null checks for the analytics data
      const safeData = {
        ...data,
        weekly_views: data.weekly_views || [],
        engagement_metrics: data.engagement_metrics || {},
        match_analytics: data.match_analytics || {
          top_matching_sectors: []
        },
        recent_activities: data.recent_activities || [],
        recent_matches: data.recent_matches || []
      };
      
      setAnalytics(safeData);
      setLastUpdated(new Date());
      setError(null);
      return safeData;
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Initialize without polling
  useEffect(() => {
    fetchAnalytics();
    
    // Disabled automatic polling to prevent continuous refreshing
    // Manual refresh still available through the refresh button
    
  }, [toast]);
  
  // Calculate risk-adjusted metrics (for institutional-grade analytics)
  const calculateRiskAdjustedMetrics = () => {
    if (!analytics) return null;
    
    // Sample calculation (these would be calculated from real data)
    const sharpeRatio = 1.42; // (portfolio return - risk-free rate) / portfolio standard deviation
    const sortinoRatio = 1.85; // (portfolio return - risk-free rate) / downside deviation
    const treynorRatio = 0.78; // (portfolio return - risk-free rate) / portfolio beta
    const maxDrawdown = 12.5; // largest peak-to-trough decline
    
    return {
      sharpeRatio,
      sortinoRatio,
      treynorRatio,
      maxDrawdown
    };
  };
  
  const riskMetrics = calculateRiskAdjustedMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <Card>
        <CardHeader>
          <CardTitle>Match Recommendations</CardTitle>
          <CardDescription>Potential matches based on your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (!analytics && !loading) {
    return <div>No analytics data available</div>;
  }

  // Transform weekly views data for the line chart
  const weeklyViewsData = (analytics?.weekly_views && Array.isArray(analytics.weekly_views)) 
    ? analytics.weekly_views.map((value, index) => ({
        day: index,
        views: value,
      })) 
    : [];

  // Calculate sector distribution data for pie chart
  const sectorData = (analytics?.match_analytics?.top_matching_sectors && Array.isArray(analytics.match_analytics.top_matching_sectors)) 
    ? analytics.match_analytics.top_matching_sectors.map(
        (sector, index) => ({
          name: sector,
          value: 100 - index * 15, // Demo values, replace with actual data
        })
      ) 
    : [];

  const COLORS = [
    "var(--chart-1-hex)",
    "var(--chart-2-hex)",
    "var(--chart-3-hex)",
    "var(--chart-4-hex)",
  ];

  const handleExport = async () => {
    // Enhanced export with more options
    const format = "csv"; // Default format, could be made selectable (csv, pdf, xlsx)
    const metrics = [
      "engagement_metrics", 
      "match_analytics", 
      "weekly_views",
      "risk_metrics",
      "performance_attribution"
    ];
    try {
      const response = await brain.export_analytics({
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
        format: "csv",
        metrics: metrics
      });

      const blob = new Blob([await response.text()], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics_${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Analytics exported successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export analytics",
        variant: "destructive"
      });
    }
  };

  // Component for each view
  const renderActiveView = () => {
    if (activeView === "overview") {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Profile Views"
              value={analytics?.engagement_metrics?.profile_views?.current || 0}
              trend={{
                value: analytics?.engagement_metrics?.profile_views?.change_percentage || 0,
                label: "from last period"
              }}
            />

            <MetricCard
              title="Match Success Rate"
              value={`${((analytics?.match_analytics?.match_response_rate || 0) * 100).toFixed(1)}%`}
              description={`Based on ${analytics?.match_analytics?.total_matches || 0} total matches`}
            />

            <MetricCard
              title="Average Match Quality"
              value={`${((analytics?.match_analytics?.average_match_quality || 0) * 100).toFixed(1)}%`}
              description="Overall match effectiveness"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Profile Views</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartComponent
                  data={weeklyViewsData}
                  lineKeys={[{ key: "views", color: "var(--chart-1-hex)", name: "Views" }]}
                  xAxisKey="day"
                  xAxisFormatter={(value) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][value]}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sector Distribution</CardTitle>
                <CardDescription>Investment focus areas</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={sectorData} />
              </CardContent>
            </Card>
          </div>
        </>
      );
    } else if (activeView === "performance") {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Overall Fund Return"
              value="+18.7%"
              trend={{
                value: 3.2,
                label: "vs benchmark"
              }}
            />
            <MetricCard
              title="Alpha"
              value="4.23"
              description="Risk-adjusted excess return"
            />
            <MetricCard
              title="Beta"
              value="0.92"
              description="Volatility vs market"
            />
          </div>

          <Card className="p-6 mt-4">
            <CardHeader>
              <CardTitle>Performance Attribution</CardTitle>
              <CardDescription>Factor analysis of returns</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {/* This would be a more detailed chart showing attribution */}
              <LineChartComponent
                data={[...Array(12)].map((_, i) => ({
                  month: i,
                  security: Math.random() * 3 + 1,
                  sector: Math.random() * 2 + 0.5,
                  factor: Math.random() * 1.5 + 0.2,
                  timing: Math.random() * 1 - 0.5,
                }))}
                lineKeys={[
                  { key: "security", color: "var(--chart-1-hex)", name: "Security Selection" },
                  { key: "sector", color: "var(--chart-2-hex)", name: "Sector Allocation" },
                  { key: "factor", color: "var(--chart-3-hex)", name: "Factor Exposure" },
                  { key: "timing", color: "var(--chart-4-hex)", name: "Market Timing" },
                ]}
                xAxisKey="month"
                xAxisFormatter={(value) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][value]}
                height={300}
              />
            </CardContent>
          </Card>
        </>
      );
    } else if (activeView === "risk") {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Sharpe Ratio"
              value={riskMetrics?.sharpeRatio.toFixed(2) || "--"}
              description="Risk-adjusted return"
            />
            <MetricCard
              title="Sortino Ratio"
              value={riskMetrics?.sortinoRatio.toFixed(2) || "--"}
              description="Downside risk-adjusted"
            />
            <MetricCard
              title="Max Drawdown"
              value={`-${riskMetrics?.maxDrawdown.toFixed(1)}%` || "--"}
              description="Largest peak-to-trough"
            />
            <MetricCard
              title="VaR (95%)"
              value="-2.7%"
              description="Daily Value at Risk"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Decomposition</CardTitle>
                <CardDescription>Sources of portfolio risk</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartComponent
                  data={[
                    { name: "Market Risk", value: 55 },
                    { name: "Specific Risk", value: 25 },
                    { name: "Factor Risk", value: 15 },
                    { name: "Currency Risk", value: 5 },
                  ]}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Stress Test Scenarios</CardTitle>
                <CardDescription>Potential impact of market events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Market Correction (-10%)", impact: -8.2 },
                    { name: "Interest Rate +1%", impact: -3.5 },
                    { name: "Inflation Shock", impact: -5.1 },
                    { name: "Credit Spread Widening", impact: -4.3 },
                    { name: "Currency Crisis", impact: -2.8 },
                  ].map((scenario) => (
                    <div key={scenario.name} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{scenario.name}</span>
                      <span className="text-sm text-red-500">{scenario.impact}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      );
    } else if (activeView === "attribution") {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Selection Return"
              value="+5.2%"
              description="Security selection contribution"
            />
            <MetricCard
              title="Allocation Effect"
              value="+3.8%"
              description="Sector allocation contribution"
            />
            <MetricCard
              title="Interaction Effect"
              value="+1.3%"
              description="Selection/allocation interaction"
            />
          </div>
          
          <Card className="p-6 mt-4">
            <CardHeader>
              <CardTitle>Benchmark Comparison</CardTitle>
              {/* Dashboard Header */}
      <div className="flex justify-between items-center">
                <CardDescription>Performance vs selected benchmark</CardDescription>
                <Select value={benchmarkIndex} onValueChange={setBenchmarkIndex}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Benchmark" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sp500">S&P 500</SelectItem>
                    <SelectItem value="russell2000">Russell 2000</SelectItem>
                    <SelectItem value="msci_world">MSCI World</SelectItem>
                    <SelectItem value="barclays_agg">Barclays Aggregate</SelectItem>
                    <SelectItem value="custom">Custom Benchmark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <LineChartComponent
                  data={[...Array(12)].map((_, i) => ({
                    month: i,
                    portfolio: 100 * (1 + (Math.random() * 0.03 - 0.01) * (i + 1)),
                    benchmark: 100 * (1 + (Math.random() * 0.025 - 0.01) * (i + 1)),
                  }))}
                  lineKeys={[
                    { key: "portfolio", color: "var(--chart-1-hex)", name: "Portfolio" },
                    { key: "benchmark", color: "var(--chart-2-hex)", name: "Benchmark" },
                  ]}
                  xAxisKey="month"
                  xAxisFormatter={(value) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][value]}
                  height={300}
                />
              </div>
            </CardContent>
          </Card>
        </>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            View and analyze your fund's performance and engagement metrics
          </p>
          {lastUpdated && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3 mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Select value={analyticsPeriod} onValueChange={(value) => setAnalyticsPeriod(value as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={refreshInterval?.toString() || "none"} 
            onValueChange={(value) => setRefreshInterval(value === "none" ? null : parseInt(value))}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Auto-Refresh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Auto-Refresh</SelectItem>
              <SelectItem value="60000">Every 1 minute</SelectItem>
              <SelectItem value="300000">Every 5 minutes</SelectItem>
              <SelectItem value="900000">Every 15 minutes</SelectItem>
              <SelectItem value="1800000">Every 30 minutes</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <DatePicker
              date={dateRange.from}
              onSelect={(date) => {
                if (date) {
                  setDateRange(prev => ({ ...prev, from: date }))
                }
              }}
            />
            <span className="text-muted-foreground">to</span>
            <DatePicker
              date={dateRange.to}
              onSelect={(date) => {
                if (date) {
                  setDateRange(prev => ({ ...prev, to: date }))
                }
              }}
            />
          </div>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      {/* View Selection Tabs */}
      <div className="flex border-b mb-4">
        <Button
          variant={activeView === "overview" ? "default" : "ghost"}
          className={`rounded-none ${activeView === "overview" ? '' : 'hover:text-primary'}`}
          onClick={() => setActiveView("overview")}
        >
          Overview
        </Button>
        <Button
          variant={activeView === "performance" ? "default" : "ghost"}
          className={`rounded-none ${activeView === "performance" ? '' : 'hover:text-primary'}`}
          onClick={() => setActiveView("performance")}
        >
          Performance Analysis
        </Button>
        <Button
          variant={activeView === "risk" ? "default" : "ghost"}
          className={`rounded-none ${activeView === "risk" ? '' : 'hover:text-primary'}`}
          onClick={() => setActiveView("risk")}
        >
          Risk Metrics
        </Button>
        <Button
          variant={activeView === "attribution" ? "default" : "ghost"}
          className={`rounded-none ${activeView === "attribution" ? '' : 'hover:text-primary'}`}
          onClick={() => setActiveView("attribution")}
        >
          Attribution Analysis
        </Button>
      </div>

      {/* Render the active view */}
      {renderActiveView()}

      {/* Recent Activities Feed - Always visible at bottom */}
      {analytics && analytics.recent_activities && Array.isArray(analytics.recent_activities) && (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest platform interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recent_activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
};
