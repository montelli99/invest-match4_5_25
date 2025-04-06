import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface CapitalRaiserMetrics {
  profile_views: number;
  total_connections: number;
  deals_raised: number;
  total_capital_raised: number;
  avg_deal_size: number;
  success_rate: number;
  avg_time_to_close: number;
  industry_focus: string[];
  time_series_data: {
    date: string;
    capital_raised: number;
    deals_closed: number;
  }[];
  sector_distribution: {
    sector: string;
    percentage: number;
  }[];
  deal_size_distribution: {
    range: string;
    count: number;
  }[];
}

// Mock data for development and preview
const mockData: CapitalRaiserMetrics = {
  profile_views: 1842,
  total_connections: 219,
  deals_raised: 28,
  total_capital_raised: 52500000, // $52.5M
  avg_deal_size: 1875000, // $1.875M
  success_rate: 0.65,
  avg_time_to_close: 68, // days
  industry_focus: ["Technology", "Clean Energy", "Healthcare"],
  time_series_data: [
    { date: "Jan", capital_raised: 4500000, deals_closed: 2 },
    { date: "Feb", capital_raised: 7200000, deals_closed: 3 },
    { date: "Mar", capital_raised: 8500000, deals_closed: 4 },
    { date: "Apr", capital_raised: 11000000, deals_closed: 5 },
    { date: "May", capital_raised: 9800000, deals_closed: 6 },
    { date: "Jun", capital_raised: 11500000, deals_closed: 8 },
  ],
  sector_distribution: [
    { sector: "Technology", percentage: 40 },
    { sector: "Clean Energy", percentage: 25 },
    { sector: "Healthcare", percentage: 20 },
    { sector: "Financial Services", percentage: 10 },
    { sector: "Other", percentage: 5 },
  ],
  deal_size_distribution: [
    { range: "<$500K", count: 4 },
    { range: "$500K-$1M", count: 7 },
    { range: "$1M-$5M", count: 12 },
    { range: "$5M-$10M", count: 3 },
    { range: ">$10M", count: 2 },
  ]
};

export function CapitalRaiserAnalytics() {
  const [metrics, setMetrics] = useState<CapitalRaiserMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulating API call for data
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would be an API call:
        // const response = await brain.get_capital_raiser_analytics();
        // const data = await response.json();
        
        // Using mock data for now
        setTimeout(() => {
          setMetrics(mockData);
          setIsLoading(false);
        }, 600);
      } catch (err) {
        console.error("Error fetching capital raiser analytics:", err);
        setError("Failed to load capital raiser analytics data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-muted-foreground">Loading capital raiser analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Format currency values
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  // Prepare recharts colors
  const colors = {
    capitalRaised: "#10b981", // green
    dealsCount: "#f59e0b", // amber
    technology: "#3b82f6", // blue
    cleanEnergy: "#8b5cf6", // purple
    healthcare: "#10b981", // green
    financialServices: "#f59e0b", // amber
    other: "#ef4444", // red
  };
  
  // Convert time series data for recharts
  const formattedTimeSeriesData = metrics.time_series_data.map(item => ({
    ...item,
    capital_raised_millions: item.capital_raised / 1000000 // Convert to millions for display
  }));

  // Sector data is already in the right format for recharts Pie

  // Deal size data just needs formating for the color
  const dealSizeData = metrics.deal_size_distribution.map(item => ({
    ...item,
    fill: colors.capitalRaised
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Capital Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.total_capital_raised)}</div>
            <p className="text-xs text-muted-foreground">Across all deals</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Deals Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.deals_raised}</div>
            <p className="text-xs text-muted-foreground">Total successful deals</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.success_rate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Deals closed / deals attempted</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Deal Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.avg_deal_size)}</div>
            <p className="text-xs text-muted-foreground">Average capital per deal</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fundraising" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fundraising">Fundraising Trends</TabsTrigger>
          <TabsTrigger value="sectors">Sector Focus</TabsTrigger>
          <TabsTrigger value="deal-sizes">Deal Size Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fundraising" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fundraising Performance</CardTitle>
              <CardDescription>
                Capital raised and deals closed over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={formattedTimeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" label={{ value: 'Capital Raised (Millions)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Deals Closed', angle: 90, position: 'insideRight' }} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'capital_raised_millions') {
                          return [`$${value}M`, 'Capital Raised'];
                        }
                        return [value, 'Deals Closed'];
                      }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="capital_raised_millions" stroke={colors.capitalRaised} name="Capital Raised" />
                    <Line yAxisId="right" type="monotone" dataKey="deals_closed" stroke={colors.dealsCount} name="Deals Closed" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sector Distribution</CardTitle>
              <CardDescription>
                Breakdown of capital raised by industry sector
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={metrics.sector_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                      nameKey="sector"
                      label={({ sector, percentage }) => `${sector}: ${percentage}%`}
                    >
                      {metrics.sector_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(colors)[index % Object.values(colors).length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deal-sizes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deal Size Distribution</CardTitle>
              <CardDescription>
                Number of deals by size range
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={dealSizeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Number of Deals" fill={colors.capitalRaised} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Fundraising Efficiency Metrics</CardTitle>
          <CardDescription>
            Key performance indicators for capital raising efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Average Time to Close:</span>
              <span>{metrics.avg_time_to_close} days</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Connections:</span>
              <span>{metrics.total_connections}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Profile Views:</span>
              <span>{metrics.profile_views}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Industry Focus:</span>
              <span>{metrics.industry_focus.join(", ")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
