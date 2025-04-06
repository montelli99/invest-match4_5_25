import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardSkeleton } from "./CardSkeleton";
import { DataExportDialog } from "./DataExportDialog";
import { DatePicker } from "./DatePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsFeed } from "./NewsFeed";
import { EnhancedLPAnalytics } from "./EnhancedLPAnalytics";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsSummary, InvestmentOpportunity } from "types";

interface LimitedPartnerDashboardProps {
  userId?: string;
}

export const LimitedPartnerDashboard = ({ userId = 'current' }: LimitedPartnerDashboardProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<Date | undefined>();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"match" | "size" | "returns">("match");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      const response = await brain.get_analytics_summary();
      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError("Failed to load analytics");
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalytics();
  };

  useEffect(() => {
    fetchAnalytics();
    // Polling disabled to prevent continuous refreshing
    // const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    // return () => clearInterval(interval);
    return () => {}; // Empty cleanup function
  }, []);


  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchAnalytics();
  };

  const filteredOpportunities = useMemo(() => {
    if (!analytics?.lp_analytics) return [];
    
    return analytics.lp_analytics.tracked_opportunities.filter(opp => {
      if (selectedSector !== "all" && opp.sector !== selectedSector) return false;
      if (selectedRiskLevel !== "all" && opp.risk_level !== selectedRiskLevel) return false;
      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case "match":
          return b.match_score - a.match_score;
        case "size":
          return b.size - a.size;
        case "returns":
          return b.target_return - a.target_return;
        default:
          return 0;
      }
    });
  }, [analytics?.lp_analytics, selectedSector, selectedRiskLevel, sortBy]);

  if (loading) {
    return (
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button onClick={() => setIsExportOpen(true)}>Export Data</Button>
        </div>
      </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <CardSkeleton className="h-[400px]" />
          <CardSkeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={handleRetry}>Retry</Button>
      </div>
    );
  }

  if (!analytics?.lp_analytics) {
    return <div>No analytics data available</div>;
  }

  const { lp_analytics } = analytics;

  // Prepare data for charts
  const performanceData =
    lp_analytics.portfolio_metrics.historical_performance.map(
      (value, index) => ({
        month: index + 1,
        return: value,
      }),
    );

  const sectorDistribution = Object.entries(
    lp_analytics.portfolio_metrics.sector_distribution,
  ).map(([sector, value]) => ({
    name: sector,
    value,
  }));

  const COLORS = [
    "var(--chart-1-hex)",
    "var(--chart-2-hex)",
    "var(--chart-3-hex)",
    "var(--chart-4-hex)",
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="social-feed">Social Feed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <EnhancedLPAnalytics />
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex gap-4 flex-wrap">
        <Select value={selectedSector} onValueChange={setSelectedSector}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="real-estate">Real Estate</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Risk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="match">Match Score</SelectItem>
            <SelectItem value="size">Fund Size</SelectItem>
            <SelectItem value="returns">Target Returns</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-[200px]">
          <DatePicker 
            date={selectedDateRange}
            onSelect={setSelectedDateRange}
          />
        </div>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>Portfolio Value</CardTitle>
            <CardDescription>Total investments value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(lp_analytics.portfolio_metrics.total_value)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Appetite Match</CardTitle>
            <CardDescription>Portfolio alignment score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(lp_analytics.risk_appetite_match * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investment Opportunities</CardTitle>
            <CardDescription>Current available matches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lp_analytics.portfolio_metrics.current_opportunities}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Historical Performance</CardTitle>
            <CardDescription>Monthly returns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="return"
                    stroke="var(--chart-1-hex)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector Distribution</CardTitle>
            <CardDescription>Investment allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sectorDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {sectorDistribution.map((entry, index) => (
                  <div key={entry.name} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{entry.name}</span>
                    <span className="text-muted-foreground">
                      {(entry.value * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investment Opportunities</CardTitle>
          <CardDescription>Matched fund opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOpportunities.map(
              (opportunity: InvestmentOpportunity) => (
                <div
                  key={opportunity.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{opportunity.fund_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {opportunity.manager_name} - {opportunity.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatCurrency(opportunity.size)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {opportunity.match_score}% Match
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fund Manager Comparisons</CardTitle>
          <CardDescription>Performance metrics comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={lp_analytics.fund_manager_comparisons}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fund_size" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="historical_returns" fill="var(--chart-3-hex)" />
                <Bar dataKey="risk_score" fill="var(--chart-4-hex)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <DataExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        userId={"current-user"} // Replace with actual user ID
      />
      </TabsContent>
        
      <TabsContent value="social-feed" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Investment Network</CardTitle>
            <CardDescription>
              Share investment opportunities, market insights, and connect with your network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewsFeed
              onMessageClick={(userId) => {
                // Handle messaging functionality
                console.log("Message user:", userId);
                // You could open a message dialog here
              }}
            />
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
    </div>
  );
};
