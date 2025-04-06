import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface LPMetrics {
  total_investments: number;
  capital_committed: number;
  active_investments: number;
  avg_investment_size: number;
  profile_views: number;
  total_connections: number;
  portfolio_performance: number;
  risk_tolerance: string;
  time_series_data: {
    date: string;
    investments: number;
    capital_committed: number;
  }[];
  sector_allocation: {
    sector: string;
    percentage: number;
  }[];
  fund_manager_comparison: {
    fund_manager: string;
    performance: number;
  }[];
  investment_opportunities: {
    opportunity: string;
    match_score: number;
    potential_return: number;
  }[];
}

// Mock data for development and preview
const mockData: LPMetrics = {
  total_investments: 32,
  capital_committed: 78500000, // $78.5M
  active_investments: 24,
  avg_investment_size: 2453125, // $2.45M
  profile_views: 876,
  total_connections: 143,
  portfolio_performance: 0.148, // 14.8%
  risk_tolerance: "Moderate-High",
  time_series_data: [
    { date: "Jan", investments: 2, capital_committed: 5200000 },
    { date: "Feb", investments: 3, capital_committed: 7500000 },
    { date: "Mar", investments: 4, capital_committed: 9800000 },
    { date: "Apr", investments: 5, capital_committed: 12500000 },
    { date: "May", investments: 7, capital_committed: 18500000 },
    { date: "Jun", investments: 9, capital_committed: 25000000 },
  ],
  sector_allocation: [
    { sector: "Technology", percentage: 35 },
    { sector: "Healthcare", percentage: 25 },
    { sector: "Financial Services", percentage: 15 },
    { sector: "Real Estate", percentage: 15 },
    { sector: "Other", percentage: 10 },
  ],
  fund_manager_comparison: [
    { fund_manager: "Alpha Ventures", performance: 16.2 },
    { fund_manager: "Beta Capital", performance: 14.8 },
    { fund_manager: "Gamma Partners", performance: 13.5 },
    { fund_manager: "Delta Funds", performance: 12.7 },
    { fund_manager: "Epsilon Equity", performance: 11.9 },
  ],
  investment_opportunities: [
    { opportunity: "Quantum Computing Fund", match_score: 92, potential_return: 18.5 },
    { opportunity: "Healthcare Innovation", match_score: 87, potential_return: 16.2 },
    { opportunity: "Renewable Energy Initiative", match_score: 84, potential_return: 15.7 },
    { opportunity: "AI Infrastructure", match_score: 80, potential_return: 17.3 },
    { opportunity: "Fintech Disruption", match_score: 78, potential_return: 14.8 },
  ]
};

export function LPAnalytics() {
  const [metrics, setMetrics] = useState<LPMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulating API call for data
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would be an API call:
        // const response = await brain.get_lp_analytics();
        // const data = await response.json();
        
        // Using mock data for now
        setTimeout(() => {
          setMetrics(mockData);
          setIsLoading(false);
        }, 600);
      } catch (err) {
        console.error("Error fetching LP analytics:", err);
        setError("Failed to load limited partner analytics data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-muted-foreground">Loading limited partner analytics...</p>
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
    capitalCommitted: "#3b82f6", // blue
    investments: "#8b5cf6", // purple
    matchScore: "#3b82f6", // blue
    potentialReturn: "#10b981", // green
    technology: "#3b82f6", // blue
    healthcare: "#8b5cf6", // purple
    financialServices: "#10b981", // green
    realEstate: "#f59e0b", // amber
    other: "#ef4444", // red
  };
  
  // Convert time series data for recharts
  const formattedTimeSeriesData = metrics.time_series_data.map(item => ({
    ...item,
    capital_committed_millions: item.capital_committed / 1000000 // Convert to millions for display
  }));

  // Sector data is already in the right format for recharts Pie

  // Format fund manager data for recharts
  const fundManagerData = metrics.fund_manager_comparison.map(item => ({
    ...item,
    fill: colors.capitalCommitted
  }));

  // Format opportunity data for recharts - need to keep original structure for dual bar chart

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Capital Committed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.capital_committed)}</div>
            <p className="text-xs text-muted-foreground">Across all investments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_investments}</div>
            <p className="text-xs text-muted-foreground">{metrics.active_investments} active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{(metrics.portfolio_performance * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average annual return</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.avg_investment_size)}</div>
            <p className="text-xs text-muted-foreground">Per investment</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio Analysis</TabsTrigger>
          <TabsTrigger value="sectors">Sector Allocation</TabsTrigger>
          <TabsTrigger value="opportunities">Investment Opportunities</TabsTrigger>
          <TabsTrigger value="managers">Fund Manager Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investment Activity</CardTitle>
              <CardDescription>
                Capital committed and investments over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={formattedTimeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" label={{ value: 'Capital Committed (Millions)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Investments Made', angle: 90, position: 'insideRight' }} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'capital_committed_millions') {
                          return [`$${value}M`, 'Capital Committed'];
                        }
                        return [value, 'Investments Made'];
                      }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="capital_committed_millions" stroke={colors.capitalCommitted} name="Capital Committed" />
                    <Line yAxisId="right" type="monotone" dataKey="investments" stroke={colors.investments} name="Investments Made" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sector Allocation</CardTitle>
              <CardDescription>
                Portfolio distribution across industry sectors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={metrics.sector_allocation}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                      nameKey="sector"
                      label={({ sector, percentage }) => `${sector}: ${percentage}%`}
                    >
                      {metrics.sector_allocation.map((entry, index) => (
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
        
        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investment Opportunities</CardTitle>
              <CardDescription>
                Top recommended investments with match scores and potential returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={metrics.investment_opportunities} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="opportunity" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="match_score" name="Match Score" fill={colors.matchScore} />
                    <Bar dataKey="potential_return" name="Potential Return (%)" fill={colors.potentialReturn} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="managers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fund Manager Performance</CardTitle>
              <CardDescription>
                Comparative performance of top fund managers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={fundManagerData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fund_manager" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="performance" name="Performance (%)" fill={colors.capitalCommitted} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Investment Profile Details</CardTitle>
          <CardDescription>
            LP profile and investment preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Risk Tolerance:</span>
              <span>{metrics.risk_tolerance}</span>
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
              <span className="font-medium">Inactive Investments:</span>
              <span>{metrics.total_investments - metrics.active_investments}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
