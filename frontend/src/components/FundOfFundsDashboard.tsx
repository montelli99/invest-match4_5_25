import React, { useState, useEffect } from 'react';
import { NewsFeed } from './NewsFeed';
import { EnhancedFundManagerAnalytics } from './EnhancedFundManagerAnalytics';
import { EnhancedLPAnalytics } from './EnhancedLPAnalytics';
import { EnhancedCapitalRaiserAnalytics } from './EnhancedCapitalRaiserAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import brain from 'brain';
import { Badge } from '@/components/ui/badge';
import { ChevronRightIcon } from 'lucide-react';

interface Props {
  userId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const FundOfFundsDashboard: React.FC<Props> = ({ userId }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // We'll use the connectionData declared below in the rendering section

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await brain.get_comprehensive_dashboard({});
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch once when component mounts, removed continuous polling
    fetchDashboardData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading premium analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Format sector data for the bar chart
  const sectorData = dashboardData?.sector_analytics?.map((sector: any) => ({
    name: sector.sector,
    AUM: sector.total_aum / 1000000, // Convert to millions
    growth: sector.growth_rate,
    returns: sector.average_returns,
  })) || [];

  // Format trending sectors data for the bar chart
  const trendingSectorData = dashboardData?.trending_sectors?.map((sector: any) => ({
    name: sector.sector,
    growthRate: sector.growth_rate,
    interestScore: sector.investor_interest_score * 100,
  })) || [];

  // Format fund manager performance data for pie chart
  const fundManagerTierData = [0, 0, 0, 0]; // A, B, C, D
  dashboardData?.fund_manager_analytics?.forEach((manager: any) => {
    if (manager.tier_ranking === 'A') fundManagerTierData[0]++;
    else if (manager.tier_ranking === 'B') fundManagerTierData[1]++;
    else if (manager.tier_ranking === 'C') fundManagerTierData[2]++;
    else if (manager.tier_ranking === 'D') fundManagerTierData[3]++;
  });

  const tierDistributionData = [
    { name: 'Tier A', value: fundManagerTierData[0] },
    { name: 'Tier B', value: fundManagerTierData[1] },
    { name: 'Tier C', value: fundManagerTierData[2] },
    { name: 'Tier D', value: fundManagerTierData[3] },
  ];

  // Network connection data
  const networkData = dashboardData?.network_analytics || {};
  const connectionData = [
    { name: 'Strong', value: networkData.relationship_strength_distribution?.strong || 0 },
    { name: 'Moderate', value: networkData.relationship_strength_distribution?.moderate || 0 },
    { name: 'Weak', value: networkData.relationship_strength_distribution?.weak || 0 },
  ];
  
  // Connection funnel data - tracking conversions through the entire process
  const connectionFunnelData = {
    fund_managers: dashboardData?.network_analytics?.connection_funnel?.fund_managers || {
      introductions_sent: 86,
      responses_received: 67,
      meetings_scheduled: 42,
      meetings_held: 38,
      next_steps_initiated: 29,
      deals_closed: 12
    },
    limited_partners: dashboardData?.network_analytics?.connection_funnel?.limited_partners || {
      introductions_sent: 64,
      responses_received: 53,
      meetings_scheduled: 31,
      meetings_held: 28,
      next_steps_initiated: 19,
      deals_closed: 9
    },
    capital_raisers: dashboardData?.network_analytics?.connection_funnel?.capital_raisers || {
      introductions_sent: 102,
      responses_received: 74,
      meetings_scheduled: 45,
      meetings_held: 39,
      next_steps_initiated: 27,
      deals_closed: 14
    },
    fund_of_funds: dashboardData?.network_analytics?.connection_funnel?.fund_of_funds || {
      introductions_sent: 78,
      responses_received: 62,
      meetings_scheduled: 38,
      meetings_held: 32,
      next_steps_initiated: 24,
      deals_closed: 11
    }
  };
  
  // Calculate conversion rates between stages for each user type
  const calculateFunnelRates = (data: any) => {
    return {
      response_rate: data.responses_received / data.introductions_sent,
      meeting_schedule_rate: data.meetings_scheduled / data.responses_received,
      meeting_attendance_rate: data.meetings_held / data.meetings_scheduled,
      next_steps_rate: data.next_steps_initiated / data.meetings_held,
      deal_close_rate: data.deals_closed / data.next_steps_initiated,
      overall_conversion: data.deals_closed / data.introductions_sent
    };
  };
  
  const funnelConversionRates = {
    fund_managers: calculateFunnelRates(connectionFunnelData.fund_managers),
    limited_partners: calculateFunnelRates(connectionFunnelData.limited_partners),
    capital_raisers: calculateFunnelRates(connectionFunnelData.capital_raisers),
    fund_of_funds: calculateFunnelRates(connectionFunnelData.fund_of_funds)
  };

  // Detailed network data by user type
  const userTypeNetworkData = {
    'fund_managers': dashboardData?.network_analytics?.detailed_metrics?.fund_managers || {},
    'limited_partners': dashboardData?.network_analytics?.detailed_metrics?.limited_partners || {},
    'capital_raisers': dashboardData?.network_analytics?.detailed_metrics?.capital_raisers || {},
    'fund_of_funds': dashboardData?.network_analytics?.detailed_metrics?.fund_of_funds || {}
  };
  
  // Introductions data by user type
  // Time-series data for connection quality trends
  const connectionQualityTrendsData = dashboardData?.network_analytics?.quality_trends || [
    { month: 'Jan', overall_strength: 0.68, introduction_effectiveness: 0.72, network_growth: 12 },
    { month: 'Feb', overall_strength: 0.71, introduction_effectiveness: 0.75, network_growth: 15 },
    { month: 'Mar', overall_strength: 0.73, introduction_effectiveness: 0.73, network_growth: 18 },
    { month: 'Apr', overall_strength: 0.75, introduction_effectiveness: 0.79, network_growth: 21 },
    { month: 'May', overall_strength: 0.78, introduction_effectiveness: 0.82, network_growth: 24 },
    { month: 'Jun', overall_strength: 0.82, introduction_effectiveness: 0.85, network_growth: 27 }
  ];

  const introductionsByUserType = [
    { name: 'Fund Managers', sent: dashboardData?.network_analytics?.introductions_by_type?.fund_managers?.sent || 0, received: dashboardData?.network_analytics?.introductions_by_type?.fund_managers?.received || 0, conversion: dashboardData?.network_analytics?.introductions_by_type?.fund_managers?.conversion_rate || 0 },
    { name: 'Limited Partners', sent: dashboardData?.network_analytics?.introductions_by_type?.limited_partners?.sent || 0, received: dashboardData?.network_analytics?.introductions_by_type?.limited_partners?.received || 0, conversion: dashboardData?.network_analytics?.introductions_by_type?.limited_partners?.conversion_rate || 0 },
    { name: 'Capital Raisers', sent: dashboardData?.network_analytics?.introductions_by_type?.capital_raisers?.sent || 0, received: dashboardData?.network_analytics?.introductions_by_type?.capital_raisers?.received || 0, conversion: dashboardData?.network_analytics?.introductions_by_type?.capital_raisers?.conversion_rate || 0 },
    { name: 'Fund of Funds', sent: dashboardData?.network_analytics?.introductions_by_type?.fund_of_funds?.sent || 0, received: dashboardData?.network_analytics?.introductions_by_type?.fund_of_funds?.received || 0, conversion: dashboardData?.network_analytics?.introductions_by_type?.fund_of_funds?.conversion_rate || 0 }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Fund of Funds Analytics Dashboard</h1>
        <p className="text-gray-600">Premium insights for strategic decision-making</p>
        <div className="mt-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">Last updated: {new Date(dashboardData?.timestamp).toLocaleString()}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fund-managers">Fund Managers</TabsTrigger>
          <TabsTrigger value="limited-partners">Limited Partners</TabsTrigger>
          <TabsTrigger value="capital-raisers">Capital Raisers</TabsTrigger>
          <TabsTrigger value="news-feed">News Feed</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Opportunity Index</CardTitle>
                <CardDescription>Overall market sentiment and opportunity assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center mb-2">
                  {dashboardData?.investment_opportunity_index.toFixed(1)}
                </div>
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-4 bg-blue-600 rounded-full" 
                    style={{ width: `${dashboardData?.investment_opportunity_index}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Scale: 0-100 (Higher is better)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Quality</CardTitle>
                <CardDescription>Connection strength and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Quality Connections</p>
                    <p className="text-2xl font-bold">{networkData.total_quality_connections}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">High-Value</p>
                    <p className="text-2xl font-bold">{networkData.high_value_contacts}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <p className="text-2xl font-bold">{(networkData.introduction_success_rate * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Engagement Score</p>
                    <p className="text-xl font-semibold">{(networkData.engagement_quality_score * 100).toFixed(0)}/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Growth Rate</p>
                    <p className="text-xl font-semibold">{(networkData.connection_growth_rate * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Sentiment</CardTitle>
                <CardDescription>Current investment climate indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData?.market_sentiment_indicators && Object.entries(dashboardData.market_sentiment_indicators).map(([key, value]: [string, any]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-medium">
                        {(value * 100).toFixed(0)}/100
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${value > 0.65 ? 'bg-green-500' : value > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${value * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Trending Sectors</CardTitle>
                <CardDescription>Sectors with highest growth rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendingSectorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="growthRate" name="Growth Rate (%)" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="interestScore" name="Investor Interest (0-100)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fund Manager Tier Distribution</CardTitle>
                <CardDescription>Quality assessment of fund managers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tierDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {tierDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} managers`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Network metrics for Fund Managers moved from Network tab */}
          <Card>
            <CardHeader>
              <CardTitle>Network Analytics for Fund Managers</CardTitle>
              <CardDescription>Advanced network quality assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                <h3 className="font-semibold capitalize mb-2">Fund Managers Network Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Active Contacts:</span>
                      <span className="font-medium">{userTypeNetworkData.fund_managers.active_contacts || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Response Rate:</span>
                      <span className="font-medium">{((userTypeNetworkData.fund_managers.response_rate || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Avg. Communication:</span>
                      <span className="font-medium">{userTypeNetworkData.fund_managers.avg_communications_per_month || 0}/mo</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Deal Flow:</span>
                      <span className="font-medium">{userTypeNetworkData.fund_managers.deal_flow || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">New Connections:</span>
                      <span className="font-medium">{userTypeNetworkData.fund_managers.new_connections_30d || 0} (30d)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Quality Score:</span>
                      <span className="font-medium">{((userTypeNetworkData.fund_managers.quality_score || 0) * 100).toFixed(0)}/100</span>
                    </div>
                  </div>
                </div>
                {userTypeNetworkData.fund_managers.key_relationships && userTypeNetworkData.fund_managers.key_relationships.length > 0 && (
                  <div className="mt-3 pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-1">Key Relationships:</p>
                    <div className="flex flex-wrap gap-2">
                      {userTypeNetworkData.fund_managers.key_relationships.slice(0, 3).map((rel: any, idx: number) => (
                        <span key={idx} className="text-xs py-1 px-2 bg-blue-50 text-blue-700 rounded-full">
                          {rel.name} ({((rel.strength || 0) * 100).toFixed(0)}%)
                        </span>
                      ))}
                      {userTypeNetworkData.fund_managers.key_relationships.length > 3 && (
                        <span className="text-xs py-1 px-2 bg-gray-100 rounded-full">+{userTypeNetworkData.fund_managers.key_relationships.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Recommendations</CardTitle>
              <CardDescription>Personalized investment opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recommendation_engine_results?.slice(0, 5).map((rec: any, index: number) => (
                  <div key={rec.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-lg">{rec.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{rec.type.replace(/_/g, ' ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{(rec.match_score * 100).toFixed(0)}%</p>
                        <p className="text-xs text-gray-500">Match Score</p>
                      </div>
                    </div>
                    <p className="text-sm mt-2">{rec.reason}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {rec.key_metrics && Object.entries(rec.key_metrics).map(([key, value]: [string, any]) => (
                        <div key={key} className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500 capitalize">{key}</p>
                          <p className="font-medium">
                            {typeof value === 'number' && key === 'alignment' 
                              ? `${(value * 100).toFixed(0)}%` 
                              : value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={() => setActiveTab('fund-managers')}>
                    View Fund Manager Recommendations
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network analytics moved from Network tab to Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Quality Trends</CardTitle>
              <CardDescription>How your network strength and introduction effectiveness evolve over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={connectionQualityTrendsData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'network_growth' ? value : `${(value * 100).toFixed(1)}%`,
                        name === 'overall_strength' ? 'Network Strength' : 
                        name === 'introduction_effectiveness' ? 'Introduction Effectiveness' : 
                        'New Connections'
                      ]} 
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="overall_strength" name="Network Strength" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line yAxisId="left" type="monotone" dataKey="introduction_effectiveness" name="Introduction Effectiveness" stroke="#82ca9d" />
                    <Line yAxisId="right" type="monotone" dataKey="network_growth" name="New Connections" stroke="#ff7300" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">Quality Insights</h4>
                <p className="text-sm text-blue-700">
                  Your network strength has increased by {((connectionQualityTrendsData[connectionQualityTrendsData.length - 1].overall_strength - connectionQualityTrendsData[0].overall_strength) * 100).toFixed(1)}% over the last {connectionQualityTrendsData.length} months, with introduction effectiveness showing a
                  {((connectionQualityTrendsData[connectionQualityTrendsData.length - 1].introduction_effectiveness - connectionQualityTrendsData[0].introduction_effectiveness) * 100).toFixed(1)}% improvement.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Introductions</CardTitle>
              <CardDescription>Introductions facilitated and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.network_analytics?.recent_introductions?.slice(0, 5).map((intro: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{intro.from.name[0]}</AvatarFallback>
                          </Avatar>
                          <p className="font-medium">{intro.from.name}</p>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{intro.to.name[0]}</AvatarFallback>
                          </Avatar>
                          <p className="font-medium">{intro.to.name}</p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="capitalize">{intro.from.type.replace(/_/g, ' ')}</span>
                          <span className="mx-2">→</span>
                          <span className="capitalize">{intro.to.type.replace(/_/g, ' ')}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(intro.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div>
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            intro.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                            intro.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {intro.status.charAt(0).toUpperCase() + intro.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{intro.notes}</p>
                    {intro.outcome && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <span className="font-medium">Outcome:</span> {intro.outcome}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-center mt-4">
                  <Button variant="outline" size="sm">View All Introductions</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Distribution</CardTitle>
                <CardDescription>Breakdown of your network connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Fund Managers', value: dashboardData?.network_analytics?.user_type_connections?.fund_managers?.total || 0 },
                          { name: 'Limited Partners', value: dashboardData?.network_analytics?.user_type_connections?.limited_partners?.total || 0 },
                          { name: 'Capital Raisers', value: dashboardData?.network_analytics?.user_type_connections?.capital_raisers?.total || 0 },
                          { name: 'Fund of Funds', value: dashboardData?.network_analytics?.user_type_connections?.fund_of_funds?.total || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Fund Managers', value: dashboardData?.network_analytics?.user_type_connections?.fund_managers?.total || 0 },
                          { name: 'Limited Partners', value: dashboardData?.network_analytics?.user_type_connections?.limited_partners?.total || 0 },
                          { name: 'Capital Raisers', value: dashboardData?.network_analytics?.user_type_connections?.capital_raisers?.total || 0 },
                          { name: 'Fund of Funds', value: dashboardData?.network_analytics?.user_type_connections?.fund_of_funds?.total || 0 }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} connections`, '']}/>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Introduction Success Rate</CardTitle>
                <CardDescription>Percentage of introductions leading to meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Fund Managers', rate: dashboardData?.network_analytics?.introduction_success_by_type?.fund_managers || 0 },
                        { name: 'Limited Partners', rate: dashboardData?.network_analytics?.introduction_success_by_type?.limited_partners || 0 },
                        { name: 'Capital Raisers', rate: dashboardData?.network_analytics?.introduction_success_by_type?.capital_raisers || 0 },
                        { name: 'Fund of Funds', rate: dashboardData?.network_analytics?.introduction_success_by_type?.fund_of_funds || 0 }
                      ].map(item => ({
                        ...item,
                        rate: item.rate * 100 // Convert to percentage
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Success Rate']} />
                      <Bar dataKey="rate" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* News Feed Tab */}
        <TabsContent value="news-feed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment News & Network Updates</CardTitle>
              <CardDescription>
                Stay updated with the latest investment opportunities, market insights, and activity from your network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NewsFeed
                onMessageClick={(userId) => {
                  // Handle message click
                  console.log("Message user:", userId);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fund Managers Tab */}
        <TabsContent value="fund-managers" className="space-y-6">
          {/* Top Section: Enhanced Fund Manager Analytics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Fund Manager Analytics</CardTitle>
              <CardDescription>
                Comprehensive metrics and insights for fund managers including engagement, matches, and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedFundManagerAnalytics />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Fund Manager Performance</CardTitle>
              <CardDescription>Key metrics across all fund managers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Fund Name</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Returns</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Risk-Adjusted</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Consistency</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tier</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.fund_manager_analytics?.slice(0, 10).map((manager: any) => (
                      <tr key={manager.fund_id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{manager.fund_name}</td>
                        <td className="px-4 py-3 capitalize">{manager.fund_type.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3">{manager.historical_returns}%</td>
                        <td className="px-4 py-3">{manager.risk_adjusted_returns}%</td>
                        <td className="px-4 py-3">{manager.consistency_score.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${manager.tier_ranking === 'A' ? 'bg-green-100 text-green-800' : manager.tier_ranking === 'B' ? 'bg-blue-100 text-blue-800' : manager.tier_ranking === 'C' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                          >
                            Tier {manager.tier_ranking}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="outline" size="sm">View Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {dashboardData?.fund_manager_analytics?.length > 10 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm">Load More</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Performance by Fund Type</CardTitle>
                <CardDescription>Average historical returns by fund category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={[
                        ...Object.entries(dashboardData?.fund_manager_analytics?.reduce((acc: any, manager: any) => {
                          if (!acc[manager.fund_type]) {
                            acc[manager.fund_type] = {
                              returns: 0,
                              count: 0,
                            };
                          }
                          acc[manager.fund_type].returns += manager.historical_returns;
                          acc[manager.fund_type].count += 1;
                          return acc;
                        }, {})).map(([type, data]: [string, any]) => ({
                          name: type.replace(/_/g, ' '),
                          value: data.returns / data.count,
                        })),
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Avg. Return (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Average Return']} />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Due Diligence Scores</CardTitle>
                <CardDescription>Distribution of due diligence assessment scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dashboardData?.fund_manager_analytics?.map((manager: any, index: number) => ({
                        name: index,
                        score: manager.due_diligence_score,
                        consistency: manager.consistency_score * 100,
                      })).sort((a: any, b: any) => a.score - b.score)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="score" name="Due Diligence Score" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line yAxisId="right" type="monotone" dataKey="consistency" name="Consistency (%)" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fund Manager Network Analytics Section */}
          <Card>
            <CardHeader>
              <CardTitle>Fund Manager Network Analytics</CardTitle>
              <CardDescription>Network connections and relationship strength metrics for fund managers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Total Connections</h3>
                  <p className="text-2xl font-bold">
                    {dashboardData?.network_analytics?.user_type_connections?.fund_managers?.total || 0}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <span className={dashboardData?.network_analytics?.user_type_connections?.fund_managers?.growth_rate > 0 ? 'text-green-600' : 'text-red-600'}>
                      {((dashboardData?.network_analytics?.user_type_connections?.fund_managers?.growth_rate || 0) * 100).toFixed(1)}%
                    </span> from last month
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm font-medium text-green-900 mb-2">Introduction Success Rate</h3>
                  <p className="text-2xl font-bold">
                    {((dashboardData?.network_analytics?.introduction_success_by_type?.fund_managers || 0) * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Based on {dashboardData?.network_analytics?.introductions_by_type?.fund_managers?.sent || 0} introductions
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-900 mb-2">Relationship Strength</h3>
                  <p className="text-2xl font-bold">
                    {((dashboardData?.network_analytics?.user_type_connections?.fund_managers?.avg_strength || 0) * 100).toFixed(0)}/100
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    Average relationship quality score
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="font-medium">Recent Fund Manager Connections</h3>
                <div className="space-y-3">
                  {dashboardData?.network_analytics?.recent_introductions
                    ?.filter((intro: any) => intro.from.type === 'fund_manager' || intro.to.type === 'fund_manager')
                    ?.slice(0, 3)
                    ?.map((intro: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{intro.from.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{intro.from.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{intro.from.type.replace(/_/g, ' ')}</p>
                          </div>
                          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{intro.to.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{intro.to.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{intro.to.type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <Badge variant={intro.status === 'accepted' ? 'success' : intro.status === 'pending' ? 'outline' : 'secondary'}>
                          {intro.status}
                        </Badge>
                      </div>
                    )) || (
                      <div className="text-center p-4 text-gray-500">
                        No recent fund manager connections
                      </div>
                    )}
                </div>
                <div className="flex justify-center">
                  <Button variant="outline" size="sm">View All Fund Manager Connections</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limited Partners Tab */}
        <TabsContent value="limited-partners" className="space-y-6">
          {/* Top Section: Enhanced LP Analytics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Limited Partner Analytics</CardTitle>
              <CardDescription>
                Comprehensive metrics and insights for limited partners including portfolio analysis, investments, and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedLPAnalytics />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Limited Partner Investment Patterns</CardTitle>
              <CardDescription>Analysis of LP investment behavior and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Investor</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Typical Size</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Holding Period</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Risk Score</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Re-investment</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.lp_investment_patterns?.slice(0, 10).map((lp: any) => (
                      <tr key={lp.lp_id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{lp.name}</td>
                        <td className="px-4 py-3">{lp.investor_type}</td>
                        <td className="px-4 py-3">${(lp.typical_commitment_size / 1000000).toFixed(1)}M</td>
                        <td className="px-4 py-3">{lp.avg_holding_period} years</td>
                        <td className="px-4 py-3">{lp.risk_tolerance_score.toFixed(1)}/10</td>
                        <td className="px-4 py-3">{(lp.reinvestment_rate * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3">
                          <Button variant="outline" size="sm">View Preferences</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fund Type Preferences</CardTitle>
                <CardDescription>Aggregate LP allocation by fund type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(dashboardData?.lp_investment_patterns?.reduce((acc: any, lp: any) => {
                          Object.entries(lp.fund_type_preferences).forEach(([type, value]: [string, any]) => {
                            if (!acc[type]) acc[type] = 0;
                            acc[type] += value;
                          });
                          return acc;
                        }, {})).map(([type, value]: [string, any], index: number) => ({
                          name: type.replace(/_/g, ' '),
                          value: value,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(dashboardData?.lp_investment_patterns?.reduce((acc: any, lp: any) => {
                          Object.entries(lp.fund_type_preferences).forEach(([type, value]: [string, any]) => {
                            if (!acc[type]) acc[type] = 0;
                            acc[type] += value;
                          });
                          return acc;
                        }, {})).map(([type, value]: [string, any], index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value.toFixed(2)}`, 'Allocation Weight']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Decision Speed vs. Risk Tolerance</CardTitle>
                <CardDescription>Correlation between decision timelines and risk appetite</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dashboardData?.lp_investment_patterns?.map((lp: any) => ({
                        name: lp.investor_type,
                        risk: lp.risk_tolerance_score,
                        decision: lp.decision_speed,
                      })).sort((a: any, b: any) => a.risk - b.risk)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" label={{ value: 'Risk Tolerance (1-10)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Decision Time (days)', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="risk" name="Risk Tolerance" stroke="#8884d8" />
                      <Line yAxisId="right" type="monotone" dataKey="decision" name="Decision Time (days)" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Limited Partners Network Analytics Section */}
          <Card>
            <CardHeader>
              <CardTitle>Limited Partner Network Analytics</CardTitle>
              <CardDescription>Network connections and relationship strength metrics for limited partners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Total Connections</h3>
                  <p className="text-2xl font-bold">
                    {dashboardData?.network_analytics?.user_type_connections?.limited_partners?.total || 0}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <span className={dashboardData?.network_analytics?.user_type_connections?.limited_partners?.growth_rate > 0 ? 'text-green-600' : 'text-red-600'}>
                      {((dashboardData?.network_analytics?.user_type_connections?.limited_partners?.growth_rate || 0) * 100).toFixed(1)}%
                    </span> from last month
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm font-medium text-green-900 mb-2">Introduction Success Rate</h3>
                  <p className="text-2xl font-bold">
                    {((dashboardData?.network_analytics?.introduction_success_by_type?.limited_partners || 0) * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Based on {dashboardData?.network_analytics?.introductions_by_type?.limited_partners?.sent || 0} introductions
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-900 mb-2">Relationship Strength</h3>
                  <p className="text-2xl font-bold">
                    {((dashboardData?.network_analytics?.user_type_connections?.limited_partners?.avg_strength || 0) * 100).toFixed(0)}/100
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    Average relationship quality score
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="font-medium">Recent Limited Partner Connections</h3>
                <div className="space-y-3">
                  {dashboardData?.network_analytics?.recent_introductions
                    ?.filter((intro: any) => intro.from.type === 'limited_partner' || intro.to.type === 'limited_partner')
                    ?.slice(0, 3)
                    ?.map((intro: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{intro.from.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{intro.from.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{intro.from.type.replace(/_/g, ' ')}</p>
                          </div>
                          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{intro.to.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{intro.to.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{intro.to.type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <Badge variant={intro.status === 'accepted' ? 'success' : intro.status === 'pending' ? 'outline' : 'secondary'}>
                          {intro.status}
                        </Badge>
                      </div>
                    )) || (
                      <div className="text-center p-4 text-gray-500">
                        No recent limited partner connections
                      </div>
                    )}
                </div>
                <div className="flex justify-center">
                  <Button variant="outline" size="sm">View All Limited Partner Connections</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Relationship Strength Distribution moved from Network tab */}
          <Card>
            <CardHeader>
              <CardTitle>Relationship Strength Distribution</CardTitle>
              <CardDescription>Quality assessment of your network connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={connectionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {connectionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} connections`, '']}/>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capital Raisers Tab */}
        <TabsContent value="capital-raisers" className="space-y-6">
          {/* Top Section: Enhanced Capital Raiser Analytics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Capital Raiser Analytics</CardTitle>
              <CardDescription>
                Comprehensive metrics and insights for capital raisers including fundraising trends, deals raised, and success rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedCapitalRaiserAnalytics />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Capital Raiser Performance</CardTitle>
              <CardDescription>Success rates and capital raising effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Success Rate</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Total Raised</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Avg Deal Size</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Fundraising Period</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Client Retention</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.capital_raiser_metrics?.map((raiser: any) => (
                      <tr key={raiser.raiser_id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{raiser.name}</td>
                        <td className="px-4 py-3">{(raiser.success_rate * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3">${(raiser.total_capital_raised / 1000000).toFixed(1)}M</td>
                        <td className="px-4 py-3">${(raiser.avg_deal_size / 1000000).toFixed(1)}M</td>
                        <td className="px-4 py-3">{raiser.average_fundraising_period.toFixed(1)} months</td>
                        <td className="px-4 py-3">{(raiser.client_retention_rate * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3">
                          <Button variant="outline" size="sm">View Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sector Expertise Distribution</CardTitle>
                <CardDescription>Capital raiser specialization by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={Object.entries(dashboardData?.capital_raiser_metrics?.reduce((acc: any, raiser: any) => {
                        Object.entries(raiser.sector_expertise).forEach(([sector, value]: [string, any]) => {
                          if (!acc[sector]) acc[sector] = 0;
                          acc[sector] += value / dashboardData?.capital_raiser_metrics?.length;
                        });
                        return acc;
                      }, {})).map(([sector, value]: [string, any]) => ({
                        name: sector,
                        score: value,
                      }))}
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 70,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <YAxis dataKey="name" type="category" scale="band" />
                      <Tooltip formatter={(value) => [`${(value * 100).toFixed(0)}%`, 'Expertise Score']} />
                      <Bar dataKey="score" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance vs. Target</CardTitle>
                <CardDescription>How capital raisers perform against fundraising targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dashboardData?.capital_raiser_metrics?.map((raiser: any) => ({
                        name: raiser.name.replace(/Capital Advisor /g, 'CA-'),
                        performance: raiser.performance_vs_target * 100,
                        success: raiser.success_rate * 100,
                      })).sort((a: any, b: any) => b.performance - a.performance).slice(0, 7)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value.toFixed(0)}%`, '']} />
                      <Legend />
                      <Bar dataKey="performance" name="Performance vs Target" fill="#8884d8" />
                      <Bar dataKey="success" name="Success Rate" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Capital Raisers Network Analytics Section */}
          <Card>
            <CardHeader>
              <CardTitle>Capital Raiser Network Analytics</CardTitle>
              <CardDescription>Network connections and relationship strength metrics for capital raisers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Total Connections</h3>
                  <p className="text-2xl font-bold">
                    {dashboardData?.network_analytics?.user_type_connections?.capital_raisers?.total || 0}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <span className={dashboardData?.network_analytics?.user_type_connections?.capital_raisers?.growth_rate > 0 ? 'text-green-600' : 'text-red-600'}>
                      {((dashboardData?.network_analytics?.user_type_connections?.capital_raisers?.growth_rate || 0) * 100).toFixed(1)}%
                    </span> from last month
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm font-medium text-green-900 mb-2">Introduction Success Rate</h3>
                  <p className="text-2xl font-bold">
                    {((dashboardData?.network_analytics?.introduction_success_by_type?.capital_raisers || 0) * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Based on {dashboardData?.network_analytics?.introductions_by_type?.capital_raisers?.sent || 0} introductions
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-900 mb-2">Relationship Strength</h3>
                  <p className="text-2xl font-bold">
                    {((dashboardData?.network_analytics?.user_type_connections?.capital_raisers?.avg_strength || 0) * 100).toFixed(0)}/100
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    Average relationship quality score
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="font-medium">Recent Capital Raiser Connections</h3>
                <div className="space-y-3">
                  {dashboardData?.network_analytics?.recent_introductions
                    ?.filter((intro: any) => intro.from.type === 'capital_raiser' || intro.to.type === 'capital_raiser')
                    ?.slice(0, 3)
                    ?.map((intro: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{intro.from.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{intro.from.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{intro.from.type.replace(/_/g, ' ')}</p>
                          </div>
                          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{intro.to.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{intro.to.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{intro.to.type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <Badge variant={intro.status === 'accepted' ? 'success' : intro.status === 'pending' ? 'outline' : 'secondary'}>
                          {intro.status}
                        </Badge>
                      </div>
                    )) || (
                      <div className="text-center p-4 text-gray-500">
                        No recent capital raiser connections
                      </div>
                    )}
                </div>
                <div className="flex justify-center">
                  <Button variant="outline" size="sm">View All Capital Raiser Connections</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="network" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Connection Metrics by User Type</CardTitle>
                <CardDescription>Network growth and relationship strength</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['fund_managers', 'limited_partners', 'capital_raisers', 'fund_of_funds'].map((userType) => (
                    <div key={userType} className="border-b pb-4 last:border-0">
                      <h3 className="font-semibold capitalize mb-2">{userType.replace(/_/g, ' ')}</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-2 bg-blue-50 rounded-md">
                          <p className="text-sm text-gray-500">Connections</p>
                          <p className="text-xl font-bold">
                            {dashboardData?.network_analytics?.user_type_connections?.[userType]?.total || 0}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-md">
                          <p className="text-sm text-gray-500">Avg. Strength</p>
                          <p className="text-xl font-bold">
                            {((dashboardData?.network_analytics?.user_type_connections?.[userType]?.avg_strength || 0) * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded-md">
                          <p className="text-sm text-gray-500">Growth Rate</p>
                          <p className="text-xl font-bold">
                            {((dashboardData?.network_analytics?.user_type_connections?.[userType]?.growth_rate || 0) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Distribution</CardTitle>
                <CardDescription>Breakdown of your network connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Fund Managers', value: dashboardData?.network_analytics?.user_type_connections?.fund_managers?.total || 0 },
                          { name: 'Limited Partners', value: dashboardData?.network_analytics?.user_type_connections?.limited_partners?.total || 0 },
                          { name: 'Capital Raisers', value: dashboardData?.network_analytics?.user_type_connections?.capital_raisers?.total || 0 },
                          { name: 'Fund of Funds', value: dashboardData?.network_analytics?.user_type_connections?.fund_of_funds?.total || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Fund Managers', value: dashboardData?.network_analytics?.user_type_connections?.fund_managers?.total || 0 },
                          { name: 'Limited Partners', value: dashboardData?.network_analytics?.user_type_connections?.limited_partners?.total || 0 },
                          { name: 'Capital Raisers', value: dashboardData?.network_analytics?.user_type_connections?.capital_raisers?.total || 0 },
                          { name: 'Fund of Funds', value: dashboardData?.network_analytics?.user_type_connections?.fund_of_funds?.total || 0 }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} connections`, '']}/>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Detailed Connection Conversion Funnel</CardTitle>
              <CardDescription>Track complete journey from introductions to deals with conversion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="fund_of_funds" className="mb-6">
                <TabsList>
                  <TabsTrigger value="fund_of_funds">Fund of Funds</TabsTrigger>
                  <TabsTrigger value="fund_managers">Fund Managers</TabsTrigger>
                  <TabsTrigger value="limited_partners">Limited Partners</TabsTrigger>
                  <TabsTrigger value="capital_raisers">Capital Raisers</TabsTrigger>
                </TabsList>
                
                {Object.entries(connectionFunnelData).map(([userType, data]: [string, any]) => {
                  const rates = funnelConversionRates[userType as keyof typeof funnelConversionRates];
                  
                  // Calculate drop-off percentage at each stage
                  const dropOffs = {
                    response: 100 - (rates.response_rate * 100),
                    schedule: 100 - (rates.meeting_schedule_rate * 100),
                    attendance: 100 - (rates.meeting_attendance_rate * 100),
                    next_steps: 100 - (rates.next_steps_rate * 100),
                    deal_close: 100 - (rates.deal_close_rate * 100),
                  };
                  
                  // Find the highest drop-off stage
                  const highestDropOff = Object.entries(dropOffs).reduce((a, b) => a[1] > b[1] ? a : b);
                  
                  return (
                    <TabsContent key={userType} value={userType} className="space-y-6">
                      <div className="grid grid-cols-6 gap-4 mb-6">
                        <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border">
                          <span className="text-sm text-gray-500">Introductions</span>
                          <span className="text-2xl font-bold">{data.introductions_sent}</span>
                          <span className="text-xs text-gray-400">100%</span>
                        </div>
                        
                        <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border">
                          <span className="text-sm text-gray-500">Responses</span>
                          <span className="text-2xl font-bold">{data.responses_received}</span>
                          <span className={`text-xs ${dropOffs.response > 25 ? 'text-red-500' : 'text-green-500'}`}>
                            {(rates.response_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border">
                          <span className="text-sm text-gray-500">Meetings Scheduled</span>
                          <span className="text-2xl font-bold">{data.meetings_scheduled}</span>
                          <span className={`text-xs ${dropOffs.schedule > 25 ? 'text-red-500' : 'text-green-500'}`}>
                            {(rates.meeting_schedule_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border">
                          <span className="text-sm text-gray-500">Meetings Held</span>
                          <span className="text-2xl font-bold">{data.meetings_held}</span>
                          <span className={`text-xs ${dropOffs.attendance > 15 ? 'text-red-500' : 'text-green-500'}`}>
                            {(rates.meeting_attendance_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border">
                          <span className="text-sm text-gray-500">Next Steps</span>
                          <span className="text-2xl font-bold">{data.next_steps_initiated}</span>
                          <span className={`text-xs ${dropOffs.next_steps > 25 ? 'text-red-500' : 'text-green-500'}`}>
                            {(rates.next_steps_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border">
                          <span className="text-sm text-gray-500">Deals Closed</span>
                          <span className="text-2xl font-bold">{data.deals_closed}</span>
                          <span className={`text-xs ${dropOffs.deal_close > 40 ? 'text-red-500' : 'text-green-500'}`}>
                            {(rates.deal_close_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Introductions', value: data.introductions_sent },
                              { name: 'Responses', value: data.responses_received },
                              { name: 'Meetings Scheduled', value: data.meetings_scheduled },
                              { name: 'Meetings Held', value: data.meetings_held },
                              { name: 'Next Steps', value: data.next_steps_initiated },
                              { name: 'Deals Closed', value: data.deals_closed }
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                            <Bar dataKey="value" fill="#8884d8">
                              {[
                                { name: 'Introductions', value: data.introductions_sent },
                                { name: 'Responses', value: data.responses_received },
                                { name: 'Meetings Scheduled', value: data.meetings_scheduled },
                                { name: 'Meetings Held', value: data.meetings_held },
                                { name: 'Next Steps', value: data.next_steps_initiated },
                                { name: 'Deals Closed', value: data.deals_closed }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#8884d8' : index === 5 ? '#82ca9d' : '#a4a1d3'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-2">Conversion Analysis</h4>
                        <div className="text-sm text-blue-700">
                          <p><strong>Overall conversion rate:</strong> {(rates.overall_conversion * 100).toFixed(1)}% (from introduction to deal)</p>
                          <p className="mt-2"><strong>Highest drop-off:</strong> {highestDropOff[0].replace('_', ' ')} stage at {highestDropOff[1].toFixed(1)}% drop-off</p>
                          <p className="mt-1">This indicates you should focus on improving the {highestDropOff[0].replace('_', ' ')} process to increase overall conversion.</p>
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Introduction Activity by User Type</CardTitle>
                <CardDescription>Sent, received, and conversion rates by user category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={introductionsByUserType}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <Tooltip formatter={(value, name) => [
                        name === 'conversion' ? `${(value * 100).toFixed(1)}%` : value,
                        name === 'sent' ? 'Sent' : name === 'received' ? 'Received' : 'Conversion Rate'
                      ]} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="sent" name="Sent" fill="#8884d8" />
                      <Bar yAxisId="left" dataKey="received" name="Received" fill="#82ca9d" />
                      <Line yAxisId="right" type="monotone" dataKey="conversion" name="Conversion Rate" stroke="#ff7300" strokeWidth={2} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Network Metrics</CardTitle>
                <CardDescription>Advanced network quality assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {Object.entries(userTypeNetworkData).map(([userType, metrics]: [string, any]) => (
                    <div key={userType} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <h3 className="font-semibold capitalize mb-2">{userType.replace(/_/g, ' ')}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Active Contacts:</span>
                            <span className="font-medium">{metrics.active_contacts || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Response Rate:</span>
                            <span className="font-medium">{((metrics.response_rate || 0) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Avg. Communication:</span>
                            <span className="font-medium">{metrics.avg_communications_per_month || 0}/mo</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Deal Flow:</span>
                            <span className="font-medium">{metrics.deal_flow || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">New Connections:</span>
                            <span className="font-medium">{metrics.new_connections_30d || 0} (30d)</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Quality Score:</span>
                            <span className="font-medium">{((metrics.quality_score || 0) * 100).toFixed(0)}/100</span>
                          </div>
                        </div>
                      </div>
                      {metrics.key_relationships && metrics.key_relationships.length > 0 && (
                        <div className="mt-3 pt-2 border-t">
                          <p className="text-xs text-gray-500 mb-1">Key Relationships:</p>
                          <div className="flex flex-wrap gap-2">
                            {metrics.key_relationships.slice(0, 3).map((rel: any, idx: number) => (
                              <span key={idx} className="text-xs py-1 px-2 bg-blue-50 text-blue-700 rounded-full">
                                {rel.name} ({((rel.strength || 0) * 100).toFixed(0)}%)
                              </span>
                            ))}
                            {metrics.key_relationships.length > 3 && (
                              <span className="text-xs py-1 px-2 bg-gray-100 rounded-full">+{metrics.key_relationships.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Network metrics for Limited Partners moved from Network tab */}
          <Card>
            <CardHeader>
              <CardTitle>Network Analytics for Limited Partners</CardTitle>
              <CardDescription>Advanced network quality assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                <h3 className="font-semibold capitalize mb-2">Limited Partners Network Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Active Contacts:</span>
                      <span className="font-medium">{userTypeNetworkData.limited_partners.active_contacts || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Response Rate:</span>
                      <span className="font-medium">{((userTypeNetworkData.limited_partners.response_rate || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Avg. Communication:</span>
                      <span className="font-medium">{userTypeNetworkData.limited_partners.avg_communications_per_month || 0}/mo</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Deal Flow:</span>
                      <span className="font-medium">{userTypeNetworkData.limited_partners.deal_flow || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">New Connections:</span>
                      <span className="font-medium">{userTypeNetworkData.limited_partners.new_connections_30d || 0} (30d)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Quality Score:</span>
                      <span className="font-medium">{((userTypeNetworkData.limited_partners.quality_score || 0) * 100).toFixed(0)}/100</span>
                    </div>
                  </div>
                </div>
                {userTypeNetworkData.limited_partners.key_relationships && userTypeNetworkData.limited_partners.key_relationships.length > 0 && (
                  <div className="mt-3 pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-1">Key Relationships:</p>
                    <div className="flex flex-wrap gap-2">
                      {userTypeNetworkData.limited_partners.key_relationships.slice(0, 3).map((rel: any, idx: number) => (
                        <span key={idx} className="text-xs py-1 px-2 bg-blue-50 text-blue-700 rounded-full">
                          {rel.name} ({((rel.strength || 0) * 100).toFixed(0)}%)
                        </span>
                      ))}
                      {userTypeNetworkData.limited_partners.key_relationships.length > 3 && (
                        <span className="text-xs py-1 px-2 bg-gray-100 rounded-full">+{userTypeNetworkData.limited_partners.key_relationships.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Relationship Strength Distribution moved from Network tab */}
          <Card>
            <CardHeader>
              <CardTitle>Relationship Strength Distribution</CardTitle>
              <CardDescription>Quality assessment of your network connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={connectionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {connectionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} connections`, '']}/>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Quality Trends</CardTitle>
              <CardDescription>How your network strength and introduction effectiveness evolve over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={connectionQualityTrendsData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'network_growth' ? value : `${(value * 100).toFixed(1)}%`,
                        name === 'overall_strength' ? 'Network Strength' : 
                        name === 'introduction_effectiveness' ? 'Introduction Effectiveness' : 
                        'New Connections'
                      ]} 
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="overall_strength" name="Network Strength" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line yAxisId="left" type="monotone" dataKey="introduction_effectiveness" name="Introduction Effectiveness" stroke="#82ca9d" />
                    <Line yAxisId="right" type="monotone" dataKey="network_growth" name="New Connections" stroke="#ff7300" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">Quality Insights</h4>
                <p className="text-sm text-blue-700">
                  Your network strength has increased by {((connectionQualityTrendsData[connectionQualityTrendsData.length - 1].overall_strength - connectionQualityTrendsData[0].overall_strength) * 100).toFixed(1)}% over the last {connectionQualityTrendsData.length} months, with introduction effectiveness showing a
                  {((connectionQualityTrendsData[connectionQualityTrendsData.length - 1].introduction_effectiveness - connectionQualityTrendsData[0].introduction_effectiveness) * 100).toFixed(1)}% improvement.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Introductions</CardTitle>
              <CardDescription>Introductions facilitated and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.network_analytics?.recent_introductions?.slice(0, 5).map((intro: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{intro.from.name[0]}</AvatarFallback>
                          </Avatar>
                          <p className="font-medium">{intro.from.name}</p>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{intro.to.name[0]}</AvatarFallback>
                          </Avatar>
                          <p className="font-medium">{intro.to.name}</p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="capitalize">{intro.from.type.replace(/_/g, ' ')}</span>
                          <span className="mx-2">→</span>
                          <span className="capitalize">{intro.to.type.replace(/_/g, ' ')}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(intro.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div>
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            intro.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                            intro.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {intro.status.charAt(0).toUpperCase() + intro.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{intro.notes}</p>
                    {intro.outcome && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <span className="font-medium">Outcome:</span> {intro.outcome}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-center mt-4">
                  <Button variant="outline" size="sm">View All Introductions</Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* Limited Partners Tab */}
        <TabsContent value="limited-partners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Limited Partner Analytics</CardTitle>
              <CardDescription>Key metrics for Limited Partners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total AUM</p>
                    <p className="text-2xl font-bold">${dashboardData?.limited_partner_analytics?.total_aum?.toLocaleString()} M</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Avg. Investment Size</p>
                    <p className="text-2xl font-bold">${dashboardData?.limited_partner_analytics?.avg_investment?.toLocaleString()} K</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Portfolio Diversification</p>
                    <p className="text-2xl font-bold">{dashboardData?.limited_partner_analytics?.diversification_score?.toFixed(1)}/10</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Network Analytics for LPs */}
          <Card>
            <CardHeader>
              <CardTitle>Network Analytics for Limited Partners</CardTitle>
              <CardDescription>Connection strength and relationship insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">LP Network Metrics</h3>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Active Contacts:</span>
                          <span className="font-medium">{userTypeNetworkData.limited_partners.active_contacts || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Response Rate:</span>
                          <span className="font-medium">{((userTypeNetworkData.limited_partners.response_rate || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Avg. Communication:</span>
                          <span className="font-medium">{userTypeNetworkData.limited_partners.avg_communications_per_month || 0}/mo</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Investment Opportunities:</span>
                          <span className="font-medium">{userTypeNetworkData.limited_partners.investment_opportunities || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">New Connections:</span>
                          <span className="font-medium">{userTypeNetworkData.limited_partners.new_connections_30d || 0} (30d)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Quality Score:</span>
                          <span className="font-medium">{((userTypeNetworkData.limited_partners.quality_score || 0) * 100).toFixed(0)}/100</span>
                        </div>
                      </div>
                    </div>
                    {userTypeNetworkData.limited_partners.key_relationships && userTypeNetworkData.limited_partners.key_relationships.length > 0 && (
                      <div className="mt-3 pt-2 border-t">
                        <p className="text-xs text-gray-500 mb-1">Key Relationships:</p>
                        <div className="flex flex-wrap gap-2">
                          {userTypeNetworkData.limited_partners.key_relationships.slice(0, 3).map((rel: any, idx: number) => (
                            <span key={idx} className="text-xs py-1 px-2 bg-blue-50 text-blue-700 rounded-full">
                              {rel.name} ({((rel.strength || 0) * 100).toFixed(0)}%)
                            </span>
                          ))}
                          {userTypeNetworkData.limited_partners.key_relationships.length > 3 && (
                            <span className="text-xs py-1 px-2 bg-gray-100 rounded-full">+{userTypeNetworkData.limited_partners.key_relationships.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Relationship Strength Distribution</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={connectionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {connectionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-4">LP Introduction Success Funnel</h3>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Stage</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Count</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Conversion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-4 py-3">Introductions Sent</td>
                        <td className="px-4 py-3">{connectionFunnelData.limited_partners.introductions_sent}</td>
                        <td className="px-4 py-3">-</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3">Responses Received</td>
                        <td className="px-4 py-3">{connectionFunnelData.limited_partners.responses_received}</td>
                        <td className="px-4 py-3">{(funnelConversionRates.limited_partners.response_rate * 100).toFixed(1)}%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3">Meetings Scheduled</td>
                        <td className="px-4 py-3">{connectionFunnelData.limited_partners.meetings_scheduled}</td>
                        <td className="px-4 py-3">{(funnelConversionRates.limited_partners.meeting_schedule_rate * 100).toFixed(1)}%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3">Meetings Held</td>
                        <td className="px-4 py-3">{connectionFunnelData.limited_partners.meetings_held}</td>
                        <td className="px-4 py-3">{(funnelConversionRates.limited_partners.meeting_attendance_rate * 100).toFixed(1)}%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3">Next Steps</td>
                        <td className="px-4 py-3">{connectionFunnelData.limited_partners.next_steps_initiated}</td>
                        <td className="px-4 py-3">{(funnelConversionRates.limited_partners.next_steps_rate * 100).toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Deals Closed</td>
                        <td className="px-4 py-3">{connectionFunnelData.limited_partners.deals_closed}</td>
                        <td className="px-4 py-3">{(funnelConversionRates.limited_partners.deal_close_rate * 100).toFixed(1)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Overall conversion rate from introduction to deal: <span className="font-medium">{(funnelConversionRates.limited_partners.overall_conversion * 100).toFixed(1)}%</span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Insights for Limited Partners</CardTitle>
              <CardDescription>Sector performance and investment trends relevant to LPs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Investment Allocation by Sector</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData?.lp_analytics?.allocation_by_sector || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sector" />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                        <Bar dataKey="percentage" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Risk Profile vs. Returns</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData?.lp_analytics?.risk_return_profile || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="risk_level" />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Expected Return']} />
                        <Line type="monotone" dataKey="expected_return" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capital Raisers Tab */}
        <TabsContent value="capital-raisers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Capital Raiser Performance</CardTitle>
              <CardDescription>Key metrics for fundraising effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Capital Raised</p>
                    <p className="text-2xl font-bold">${dashboardData?.capital_raiser_analytics?.total_raised?.toLocaleString()} M</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Avg. Deal Size</p>
                    <p className="text-2xl font-bold">${dashboardData?.capital_raiser_analytics?.avg_deal_size?.toLocaleString()} K</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <p className="text-2xl font-bold">{dashboardData?.capital_raiser_analytics?.success_rate?.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Network Analytics for Capital Raisers */}
          <Card>
            <CardHeader>
              <CardTitle>Network Analytics for Capital Raisers</CardTitle>
              <CardDescription>Connection effectiveness and fundraising network insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Capital Raiser Network Metrics</h3>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Active Contacts:</span>
                          <span className="font-medium">{userTypeNetworkData.capital_raisers.active_contacts || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Response Rate:</span>
                          <span className="font-medium">{((userTypeNetworkData.capital_raisers.response_rate || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Avg. Communication:</span>
                          <span className="font-medium">{userTypeNetworkData.capital_raisers.avg_communications_per_month || 0}/mo</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Fundraising Leads:</span>
                          <span className="font-medium">{userTypeNetworkData.capital_raisers.fundraising_leads || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">New Connections:</span>
                          <span className="font-medium">{userTypeNetworkData.capital_raisers.new_connections_30d || 0} (30d)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Quality Score:</span>
                          <span className="font-medium">{((userTypeNetworkData.capital_raisers.quality_score || 0) * 100).toFixed(0)}/100</span>
                        </div>
                      </div>
                    </div>
                    {userTypeNetworkData.capital_raisers.key_relationships && userTypeNetworkData.capital_raisers.key_relationships.length > 0 && (
                      <div className="mt-3 pt-2 border-t">
                        <p className="text-xs text-gray-500 mb-1">Key Relationships:</p>
                        <div className="flex flex-wrap gap-2">
                          {userTypeNetworkData.capital_raisers.key_relationships.slice(0, 3).map((rel: any, idx: number) => (
                            <span key={idx} className="text-xs py-1 px-2 bg-blue-50 text-blue-700 rounded-full">
                              {rel.name} ({((rel.strength || 0) * 100).toFixed(0)}%)
                            </span>
                          ))}
                          {userTypeNetworkData.capital_raisers.key_relationships.length > 3 && (
                            <span className="text-xs py-1 px-2 bg-gray-100 rounded-full">+{userTypeNetworkData.capital_raisers.key_relationships.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Fundraising Network Performance</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[  
                        {name: 'Fund Managers', value: userTypeNetworkData.capital_raisers.network_performance?.fund_managers || 0},
                        {name: 'Limited Partners', value: userTypeNetworkData.capital_raisers.network_performance?.limited_partners || 0},
                        {name: 'Other Capital Raisers', value: userTypeNetworkData.capital_raisers.network_performance?.capital_raisers || 0},
                        {name: 'Fund of Funds', value: userTypeNetworkData.capital_raisers.network_performance?.fund_of_funds || 0},
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Effectiveness" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Fundraising Success by Approach</h3>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Approach</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Attempts</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Success</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Rate</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Avg. Deal Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData?.capital_raiser_analytics?.approach_success?.map((approach: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-3 capitalize">{approach.method.replace(/_/g, ' ')}</td>
                          <td className="px-4 py-3">{approach.attempts}</td>
                          <td className="px-4 py-3">{approach.successful}</td>
                          <td className="px-4 py-3">{(approach.success_rate * 100).toFixed(1)}%</td>
                          <td className="px-4 py-3">${approach.avg_deal_size.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Market Insights for Capital Raisers</CardTitle>
              <CardDescription>Fundraising trends and capital availability by sector</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Capital Availability by Sector</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData?.capital_raiser_analytics?.capital_by_sector || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sector" />
                        <YAxis tickFormatter={(value) => `$${value}M`} />
                        <Tooltip formatter={(value) => [`$${value}M`, 'Available Capital']} />
                        <Bar dataKey="available_capital" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Fundraising Cycle Length</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData?.capital_raiser_analytics?.cycle_length_trend || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis tickFormatter={(value) => `${value} mo`} />
                        <Tooltip formatter={(value) => [`${value} months`, 'Avg Cycle Length']} />
                        <Line type="monotone" dataKey="avg_months" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FundOfFundsDashboard;
export type { Props };
