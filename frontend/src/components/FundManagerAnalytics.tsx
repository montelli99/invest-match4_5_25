import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface FundManagerMetrics {
  profile_views: number;
  match_recommendations: number;
  engagement_rate: number;
  avg_response_time: number;
  total_connections: number;
  successful_matches: number;
  fund_performance: {
    historical_returns: number;
    risk_profile: string;
    sector_focus: string[];
  };
  time_series_data: {
    date: string;
    profile_views: number;
    matches: number;
  }[];
  sector_distribution: {
    sector: string;
    percentage: number;
  }[];
}

// Mock data for development and preview
const mockData: FundManagerMetrics = {
  profile_views: 1248,
  match_recommendations: 85,
  engagement_rate: 0.76,
  avg_response_time: 4.2,
  total_connections: 167,
  successful_matches: 42,
  fund_performance: {
    historical_returns: 12.4,
    risk_profile: "Moderate",
    sector_focus: ["Technology", "Healthcare", "Renewable Energy"]
  },
  time_series_data: [
    { date: "Jan", profile_views: 120, matches: 8 },
    { date: "Feb", profile_views: 150, matches: 10 },
    { date: "Mar", profile_views: 180, matches: 12 },
    { date: "Apr", profile_views: 210, matches: 15 },
    { date: "May", profile_views: 250, matches: 18 },
    { date: "Jun", profile_views: 270, matches: 22 },
  ],
  sector_distribution: [
    { sector: "Technology", percentage: 45 },
    { sector: "Healthcare", percentage: 25 },
    { sector: "Renewable Energy", percentage: 15 },
    { sector: "Financial Services", percentage: 10 },
    { sector: "Other", percentage: 5 },
  ]
};

export function FundManagerAnalytics() {
  const [metrics, setMetrics] = useState<FundManagerMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulating API call for data
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would be an API call:
        // const response = await brain.get_fund_manager_analytics();
        // const data = await response.json();
        
        // Using mock data for now
        setTimeout(() => {
          setMetrics(mockData);
          setIsLoading(false);
        }, 600);
      } catch (err) {
        console.error("Error fetching fund manager analytics:", err);
        setError("Failed to load fund manager analytics data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-muted-foreground">Loading fund manager analytics...</p>
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

  // Prepare recharts colors
  const colors = {
    profileViews: "#3b82f6", // blue
    matches: "#8b5cf6", // purple
    technology: "#3b82f6", // blue
    healthcare: "#8b5cf6", // purple
    renewableEnergy: "#10b981", // green
    financialServices: "#f59e0b", // amber
    other: "#ef4444", // red
  };
  
  // No need to transform the time series data for recharts

  // Sector data is already in the right format for recharts Pie

  // Prepare bar chart data for key metrics
  const keyMetricsData = [
    { name: "Profile Views", value: metrics.profile_views, fill: "#3b82f6" },
    { name: "Match Recommendations", value: metrics.match_recommendations, fill: "#8b5cf6" },
    { name: "Successful Matches", value: metrics.successful_matches, fill: "#10b981" },
    { name: "Total Connections", value: metrics.total_connections, fill: "#f59e0b" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.profile_views}</div>
            <p className="text-xs text-muted-foreground">Fund manager profile views</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.engagement_rate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Profile engagement percentage</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successful_matches}</div>
            <p className="text-xs text-muted-foreground">Connections that led to partnerships</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avg_response_time} hrs</div>
            <p className="text-xs text-muted-foreground">Average time to respond</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="sectors">Sector Focus</TabsTrigger>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
              <CardDescription>
                Profile views and matches over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={metrics.time_series_data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="profile_views" stroke={colors.profileViews} name="Profile Views" />
                    <Line yAxisId="right" type="monotone" dataKey="matches" stroke={colors.matches} name="Matches" />
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
                Breakdown of fund manager investments by sector
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
        
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Metrics</CardTitle>
              <CardDescription>
                Comparison of important fund manager metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={keyMetricsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Count" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Fund Performance Details</CardTitle>
          <CardDescription>
            Historical returns and risk profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Historical Returns:</span>
              <span className="text-green-600">{metrics.fund_performance.historical_returns}%</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Risk Profile:</span>
              <span>{metrics.fund_performance.risk_profile}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Sector Focus:</span>
              <span>{metrics.fund_performance.sector_focus.join(", ")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
