import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "react-router-dom";
import { Pie, PieChart, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import brain from "brain";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Line, LineChart } from "recharts";

import type { ChartData } from "types";

// Color palette for charts
const COLORS = [
  "var(--chart-primary-hex)",
  "var(--chart-secondary-hex)",
  "var(--chart-success-hex)",
  "var(--chart-warning-hex)",
  "var(--chart-error-hex)",
];

interface PerformanceData extends ChartData {
  cache_status?: {
    performance: PerformanceMetrics;
  };
}

interface TransformedChartData {
  name: string;
  value: number;
}

interface PerformanceMetrics {
  processing_time_seconds: number;
  cache_hit_ratio: number;
  cache_hits: number;
  cache_misses: number;
}

const InvestorAnalytics = () => {
  const [searchParams] = useSearchParams();
  const [secAnalytics, setSecAnalytics] = useState<any>(null);
  const [secLoading, setSecLoading] = useState(false);
  const cik = searchParams.get("cik");
  const [focusData, setFocusData] = useState<ChartData | null>(null);
  const [fundSizeData, setFundSizeData] = useState<ChartData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [riskData, setRiskData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch SEC analytics if CIK is provided
    const fetchSecAnalytics = async () => {
      if (!cik) return;
      try {
        setSecLoading(true);
        const response = await brain.get_comprehensive_analytics({ cik });
        const data = await response.json();
        setSecAnalytics(data);
      } catch (error) {
        console.error("Error fetching SEC analytics:", error);
      } finally {
        setSecLoading(false);
      }
    };

    fetchSecAnalytics();

    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [
          focusResponse,
          fundSizeResponse,
          performanceResponse,
          riskResponse,
        ] = await Promise.all([
          brain.get_investment_focus_distribution(),
          brain.get_fund_size_distribution(),
          brain.get_historical_performance(),
          brain.get_risk_profile_distribution(),
        ]);

        // Transform data for charts
        setFocusData(await focusResponse.json());
        setFundSizeData(await fundSizeResponse.json());
        setPerformanceData(await performanceResponse.json());
        setRiskData(await riskResponse.json());
      } catch (err) {
        setError("Failed to load analytics data. Please try again later.");
        console.error("Error fetching analytics:", err);
      }
    };

    fetchData();
  }, []);

  const transformChartData = (data: ChartData | null): TransformedChartData[] => {
    if (!data) return [];
    return data.labels.map((label, index) => ({
      name: label,
      value: (data.datasets[0] as { data: number[] }).data[index],
    }));
  };

  if (error) {
    const renderSecAnalytics = () => {
    if (!cik) return null;
    if (secLoading) return <div>Loading SEC analytics...</div>;
    if (!secAnalytics) return null;

    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>SEC Filing Analytics</CardTitle>
          <CardDescription>Comprehensive analysis from SEC filings</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="portfolio" className="space-y-4">
            <TabsList>
              <TabsTrigger value="portfolio">Portfolio Analysis</TabsTrigger>
              <TabsTrigger value="adv">Form ADV</TabsTrigger>
              <TabsTrigger value="additional">Additional Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Industry Allocation */}
                <Card>
                  <CardHeader>
                    <CardTitle>Industry Allocation</CardTitle>
                    <CardDescription>Portfolio distribution by industry</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={secAnalytics.industry_allocation}
                            dataKey="value"
                            nameKey="industry"
                            label={({ industry }) => industry}
                          >
                            {secAnalytics.industry_allocation.map((_: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Holdings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Holdings</CardTitle>
                    <CardDescription>Largest positions by value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={secAnalytics.holdings.slice(0, 10)}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            dataKey="company_name"
                            type="category"
                            width={100}
                          />
                          <Tooltip />
                          <Bar dataKey="percentage" fill={COLORS[0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Portfolio Value */}
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Value</CardTitle>
                    <CardDescription>Total AUM: ${(secAnalytics.total_aum / 1_000_000).toFixed(2)}M</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={secAnalytics.quarterly_changes}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="quarter" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="total_value"
                            stroke={COLORS[0]}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="adv" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Client Types */}
                <Card>
                  <CardHeader>
                    <CardTitle>Client Types</CardTitle>
                    <CardDescription>Distribution of client categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={secAnalytics.client_types}
                            dataKey="percentage"
                            nameKey="type"
                            label={({ type }) => type}
                          >
                            {secAnalytics.client_types.map((_: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Fee Structures */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fee Structures</CardTitle>
                    <CardDescription>Investment management fees</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {secAnalytics.fee_structures.map((fee: any, index: number) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{fee.type}</span>
                              <Badge>{fee.rate}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {fee.description}
                            </p>
                            <Separator />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Risk Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Factors</CardTitle>
                    <CardDescription>Key risks and considerations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {secAnalytics.risk_factors.map((risk: string, index: number) => (
                          <div key={index} className="text-sm">
                            • {risk}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Investment Policies */}
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Policies</CardTitle>
                    <CardDescription>Investment guidelines and restrictions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {secAnalytics.investment_policies.map((policy: any, index: number) => (
                          <div key={index} className="space-y-2">
                            <div className="font-medium">{policy.category}</div>
                            <p className="text-sm text-muted-foreground">
                              {policy.description}
                            </p>
                            <Separator />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Investor Analytics</h1>
        </div>
        
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceData?.cache_status?.performance?.processing_time_seconds.toFixed(2)}s</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(performanceData?.cache_status?.performance?.cache_hit_ratio * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cache Hits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceData?.cache_status?.performance?.cache_hits}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cache Misses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceData?.cache_status?.performance?.cache_misses}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Investment Focus Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Focus Distribution</CardTitle>
            <CardDescription>Top 10 investment focus areas</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {!focusData ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transformChartData(focusData)}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="var(--primary-500-hex)"
                    name="Number of Investors"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Fund Size Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Fund Size Distribution</CardTitle>
            <CardDescription>
              Distribution of funds by size range
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {!fundSizeData ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transformChartData(fundSizeData)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="var(--primary-600-hex)"
                    name="Number of Funds"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Historical Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Historical Performance</CardTitle>
            <CardDescription>Average returns over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {!performanceData ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transformChartData(performanceData)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary-700-hex)"
                    name="Average Returns (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Risk Profile Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Profile Distribution</CardTitle>
            <CardDescription>Distribution of risk profiles</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {!riskData ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transformChartData(riskData)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="var(--primary-800-hex)"
                    name="Number of Investors"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      {renderSecAnalytics()}
    </div>
  );
};

export default InvestorAnalytics;
