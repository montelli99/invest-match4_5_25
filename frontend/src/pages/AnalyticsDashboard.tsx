import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import brain from "brain";
import { NavigationBar } from "@/components/NavigationBar";

// Color palette for charts
const COLORS = [
  "var(--primary-hex)",
  "var(--destructive-hex)",
  "var(--success-hex)",
  "var(--muted-foreground-hex)",
  "var(--accent-hex)",
  "var(--warning-hex)"
];

// Helper for formatting percentage changes
const formatChange = (value: number) => {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
};

// Helper for formatting large numbers
const formatNumber = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

// Metrics card with green/red indicator based on change
const MetricCard = ({ title, value, change, formatter = (v: number) => v.toString() }: { 
  title: string; 
  value: number; 
  change: number;
  formatter?: (value: number) => string;
}) => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-2xl font-bold">{formatter(value)}</div>
        <p className={`text-xs ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
          {formatChange(change)}
        </p>
      </CardContent>
    </Card>
  );
};

// Loading placeholder for metrics
const MetricCardSkeleton = () => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-[120px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[80px] mb-2" />
        <Skeleton className="h-3 w-[60px]" />
      </CardContent>
    </Card>
  );
};

// Role translation for display
const roleDisplay: Record<string, string> = {
  fund_manager: "Fund Managers",
  capital_raiser: "Capital Raisers",
  limited_partner: "Limited Partners"
};

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("growth");
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await brain.get_comprehensive_analytics({ period });
      const data = await response.json();
      setDashboard(data);
      console.log("Fetched analytics:", data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for role-based bar chart
  const prepareRoleBarData = (metricsObj: Record<string, any>) => {
    return Object.entries(metricsObj).map(([role, data]: [string, any]) => ({
      name: roleDisplay[role] || role,
      value: data.current,
      change: data.change_percentage
    }));
  };

  // Prepare data for pie chart
  const preparePieData = (metricsObj: Record<string, any>) => {
    return Object.entries(metricsObj).map(([name, data]: [string, any]) => ({
      name,
      value: typeof data === 'object' ? data.current : data
    }));
  };

  // Prepare subscription tier distribution data
  const prepareTierDistributionData = () => {
    if (!dashboard?.monetization?.user_tier_distribution) return [];
    
    const { user_tier_distribution } = dashboard.monetization;
    const tiers = Object.keys(user_tier_distribution);
    
    return tiers.map(tier => {
      const tierData = user_tier_distribution[tier];
      const total = Object.values(tierData).reduce((sum: number, val: any) => sum + val, 0);
      
      return {
        name: tier,
        value: total,
        ...tierData
      };
    });
  };

  // User Growth & Profile Engagement section
  const renderUserGrowthSection = () => {
    if (!dashboard?.user_growth) return null;
    
    const { new_registrations, profile_completion_rate, active_inactive_ratio, verification_completion_rate } = dashboard.user_growth;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard 
            title="Active/Inactive Ratio" 
            value={active_inactive_ratio.current} 
            change={active_inactive_ratio.change_percentage}
            formatter={(v) => v.toFixed(2)} 
          />
          <MetricCard 
            title="Verification Completion" 
            value={verification_completion_rate.current} 
            change={verification_completion_rate.change_percentage}
            formatter={(v) => `${v.toFixed(1)}%`}
          />
        </div>
          
        <Card>
          <CardHeader>
            <CardTitle>New Registrations by Role</CardTitle>
            <CardDescription>User acquisition in selected time period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareRoleBarData(new_registrations)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(0), "Users"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="value" fill={COLORS[0]} name="New Users">
                    {prepareRoleBarData(new_registrations).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Completion Rate</CardTitle>
            <CardDescription>Percentage of completed profiles by role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareRoleBarData(profile_completion_rate)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Completion Rate"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="value" fill={COLORS[1]} name="Completion Rate">
                    {prepareRoleBarData(profile_completion_rate).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Networking Activity section
  const renderNetworkingSection = () => {
    if (!dashboard?.networking) return null;
    
    const { contacts_uploaded, introductions_made, contact_conversion_rate, network_growth_rate } = dashboard.networking;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard 
            title="Introductions Made" 
            value={introductions_made.current} 
            change={introductions_made.change_percentage}
            formatter={formatNumber} 
          />
          <MetricCard 
            title="Contact Conversion Rate" 
            value={contact_conversion_rate.current} 
            change={contact_conversion_rate.change_percentage}
            formatter={(v) => `${v.toFixed(1)}%`}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Contacts Uploaded by Role</CardTitle>
            <CardDescription>Number of external contacts added to the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareRoleBarData(contacts_uploaded)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(0), "Contacts"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="value" fill={COLORS[2]} name="Contacts">
                    {prepareRoleBarData(contacts_uploaded).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Network Growth Rate</CardTitle>
            <CardDescription>Expansion of connections over time (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareRoleBarData(network_growth_rate)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Growth Rate"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="value" fill={COLORS[3]} name="Growth Rate">
                    {prepareRoleBarData(network_growth_rate).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Matching Algorithm section
  const renderMatchingSection = () => {
    if (!dashboard?.matching_algorithm) return null;
    
    const { 
      total_matches_generated, average_match_score, high_confidence_match_percentage,
      match_acceptance_rate, match_engagement_rate, time_to_first_match, user_reported_match_quality 
    } = dashboard.matching_algorithm;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Matches Generated" 
            value={total_matches_generated.current} 
            change={total_matches_generated.change_percentage}
            formatter={formatNumber} 
          />
          <MetricCard 
            title="Average Match Score" 
            value={average_match_score.current} 
            change={average_match_score.change_percentage}
            formatter={(v) => `${v.toFixed(1)}%`}
          />
          <MetricCard 
            title="High Confidence Matches" 
            value={high_confidence_match_percentage.current} 
            change={high_confidence_match_percentage.change_percentage}
            formatter={(v) => `${v.toFixed(1)}%`}
          />
          <MetricCard 
            title="Match Engagement Rate" 
            value={match_engagement_rate.current} 
            change={match_engagement_rate.change_percentage}
            formatter={(v) => `${v.toFixed(1)}%`}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard 
            title="Time to First Match" 
            value={time_to_first_match.current} 
            change={time_to_first_match.change_percentage}
            formatter={(v) => `${v.toFixed(1)} days`}
          />
          <MetricCard 
            title="User-Reported Match Quality" 
            value={user_reported_match_quality.current} 
            change={user_reported_match_quality.change_percentage}
            formatter={(v) => `${v.toFixed(1)}/5`}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Match Acceptance Rate by Role</CardTitle>
            <CardDescription>Percentage of matches accepted by users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareRoleBarData(match_acceptance_rate)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Acceptance Rate"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="value" fill={COLORS[4]} name="Acceptance Rate">
                    {prepareRoleBarData(match_acceptance_rate).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Deal Flow section
  const renderDealFlowSection = () => {
    if (!dashboard?.deal_flow) return null;
    
    const { 
      meetings_scheduled, meeting_completion_rate, deal_conversion_rate,
      average_deal_size, time_from_match_to_deal
    } = dashboard.deal_flow;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard 
            title="Meetings Scheduled" 
            value={meetings_scheduled.current} 
            change={meetings_scheduled.change_percentage}
            formatter={formatNumber} 
          />
          <MetricCard 
            title="Meeting Completion Rate" 
            value={meeting_completion_rate.current} 
            change={meeting_completion_rate.change_percentage}
            formatter={(v) => `${v.toFixed(1)}%`}
          />
          <MetricCard 
            title="Deal Conversion Rate" 
            value={deal_conversion_rate.current} 
            change={deal_conversion_rate.change_percentage}
            formatter={(v) => `${v.toFixed(1)}%`}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard 
            title="Average Deal Size" 
            value={average_deal_size.current} 
            change={average_deal_size.change_percentage}
            formatter={(v) => `$${formatNumber(v)}`}
          />
          <MetricCard 
            title="Time from Match to Deal" 
            value={time_from_match_to_deal.current} 
            change={time_from_match_to_deal.change_percentage}
            formatter={(v) => `${v.toFixed(1)} days`}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Deal Flow Funnel</CardTitle>
            <CardDescription>Conversion through the deal pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[
                    { name: "Matches", value: dashboard.matching_algorithm.total_matches_generated.current },
                    { name: "Meetings", value: meetings_scheduled.current },
                    { name: "Completed", value: meetings_scheduled.current * (meeting_completion_rate.current / 100) },
                    { name: "Deals", value: meetings_scheduled.current * (meeting_completion_rate.current / 100) * (deal_conversion_rate.current / 100) }
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip 
                    formatter={(value: number) => [formatNumber(value), "Count"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="value" fill={COLORS[0]} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Sector Insights section
  const renderSectorSection = () => {
    if (!dashboard?.sector_insights) return null;
    
    const { 
      deals_per_sector, fund_manager_success_rate, capital_raiser_conversion,
      limited_partner_investment_activity
    } = dashboard.sector_insights;
    
    // Prepare sector data for pie chart
    const sectorData = Object.entries(deals_per_sector).map(([sector, data]: [string, any]) => ({
      name: sector,
      value: data.current
    }));
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard 
            title="Fund Manager Success Rate" 
            value={fund_manager_success_rate.current} 
            change={fund_manager_success_rate.change_percentage}
            formatter={(v) => `${v.toFixed(1)}%`}
          />
          <MetricCard 
            title="Capital Raiser Conversion" 
            value={capital_raiser_conversion.current} 
            change={capital_raiser_conversion.change_percentage}
            formatter={(v) => `${v.toFixed(1)}%`}
          />
          <MetricCard 
            title="LP Investment Activity" 
            value={limited_partner_investment_activity.current} 
            change={limited_partner_investment_activity.change_percentage}
            formatter={(v) => `${v.toFixed(1)} deals/user`}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Deals by Sector</CardTitle>
            <CardDescription>Distribution of deals across sectors</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-center">
            <div className="h-80 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} deals`, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-80 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} deals`, "Count"]} />
                  <Bar dataKey="value" name="Deals">
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Monetization section
  const renderMonetizationSection = () => {
    if (!dashboard?.monetization) return null;
    
    const { 
      upgrade_rate, downgrade_rate, renewal_rate,
      churn_rate, average_revenue_per_active_user
    } = dashboard.monetization;
    
    const tierData = prepareTierDistributionData();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard 
            title="Average Revenue per User" 
            value={average_revenue_per_active_user.current} 
            change={average_revenue_per_active_user.change_percentage}
            formatter={(v) => `$${v.toFixed(0)}`}
          />
          <MetricCard 
            title="Churn Rate" 
            value={churn_rate.current} 
            change={-churn_rate.change_percentage} // Invert change direction (lower is better)
            formatter={(v) => `${v.toFixed(1)}%`}
          />
          <MetricCard 
            title="Renewal Rate" 
            value={renewal_rate.current} 
            change={renewal_rate.change_percentage}
            formatter={(v) => `${v.toFixed(1)}%`}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard 
            title="Upgrade Rate" 
            value={upgrade_rate.current} 
            change={upgrade_rate.change_percentage}
            formatter={(v) => `${v.toFixed(1)}%`}
          />
          <MetricCard 
            title="Downgrade Rate" 
            value={downgrade_rate.current} 
            change={-downgrade_rate.change_percentage} // Invert change direction (lower is better)
            formatter={(v) => `${v.toFixed(1)}%`}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>User Tier Distribution</CardTitle>
            <CardDescription>Users by subscription tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={tierData}
                  stackOffset="expand"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="fund_manager" name="Fund Managers" stackId="a" fill={COLORS[0]} />
                  <Bar dataKey="capital_raiser" name="Capital Raisers" stackId="a" fill={COLORS[1]} />
                  <Bar dataKey="limited_partner" name="Limited Partners" stackId="a" fill={COLORS[2]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Satisfaction section
  const renderSatisfactionSection = () => {
    if (!dashboard?.satisfaction) return null;
    
    const { 
      user_satisfaction_score, net_promoter_score, support_tickets,
      avg_resolution_time, match_dispute_rate
    } = dashboard.satisfaction;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard 
            title="Net Promoter Score" 
            value={net_promoter_score.current} 
            change={net_promoter_score.change_percentage}
            formatter={(v) => v.toFixed(0)}
          />
          <MetricCard 
            title="Support Tickets" 
            value={support_tickets.current} 
            change={-support_tickets.change_percentage} // Invert change direction (lower is better)
            formatter={formatNumber}
          />
          <MetricCard 
            title="Avg Resolution Time" 
            value={avg_resolution_time.current} 
            change={-avg_resolution_time.change_percentage} // Invert change direction (lower is better)
            formatter={(v) => `${v.toFixed(1)} hours`}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard 
            title="Match Dispute Rate" 
            value={match_dispute_rate.current} 
            change={-match_dispute_rate.change_percentage} // Invert change direction (lower is better)
            formatter={(v) => `${v.toFixed(1)}%`}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>User Satisfaction by Role</CardTitle>
            <CardDescription>Average satisfaction score (out of 5)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareRoleBarData(user_satisfaction_score)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}/5`, "Satisfaction Score"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="value" fill={COLORS[5]} name="Satisfaction Score">
                    {prepareRoleBarData(user_satisfaction_score).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Performance section
  const renderPerformanceSection = () => {
    if (!dashboard?.performance) return null;
    
    const { 
      match_generation_latency, api_response_times, system_uptime, error_rate
    } = dashboard.performance;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard 
            title="System Uptime" 
            value={system_uptime.current} 
            change={system_uptime.change_percentage}
            formatter={(v) => `${v.toFixed(2)}%`}
          />
          <MetricCard 
            title="Error Rate" 
            value={error_rate.current} 
            change={-error_rate.change_percentage} // Invert change direction (lower is better)
            formatter={(v) => `${v.toFixed(2)}%`}
          />
          <MetricCard 
            title="Match Generation Latency" 
            value={match_generation_latency.current} 
            change={-match_generation_latency.change_percentage} // Invert change direction (lower is better)
            formatter={(v) => `${v.toFixed(2)}s`}
          />
          <MetricCard 
            title="API Response Time" 
            value={api_response_times.current} 
            change={-api_response_times.change_percentage} // Invert change direction (lower is better)
            formatter={(v) => `${v.toFixed(2)}s`}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Key platform metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { name: "Week 1", uptime: 99.8, errors: 0.13, latency: 0.9, response: 0.26 },
                    { name: "Week 2", uptime: 99.9, errors: 0.11, latency: 0.85, response: 0.24 },
                    { name: "Week 3", uptime: 99.7, errors: 0.14, latency: 0.8, response: 0.25 },
                    { name: "Week 4", uptime: 99.8, errors: 0.12, latency: 0.8, response: 0.25 },
                    { name: "Current", uptime: system_uptime.current, errors: error_rate.current, 
                      latency: match_generation_latency.current, response: api_response_times.current }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="right" type="monotone" dataKey="errors" name="Error Rate (%)" stroke={COLORS[1]} />
                  <Line yAxisId="right" type="monotone" dataKey="latency" name="Match Latency (s)" stroke={COLORS[2]} />
                  <Line yAxisId="right" type="monotone" dataKey="response" name="API Response (s)" stroke={COLORS[3]} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Show skeleton loading state
  const renderLoadingState = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive platform KPIs and performance metrics</p>
          </div>
          
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="growth" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto">
            <TabsTrigger value="growth">User Growth</TabsTrigger>
            <TabsTrigger value="networking">Networking</TabsTrigger>
            <TabsTrigger value="matching">Matching</TabsTrigger>
            <TabsTrigger value="deals">Deal Flow</TabsTrigger>
            <TabsTrigger value="sectors">Sectors</TabsTrigger>
            <TabsTrigger value="monetization">Monetization</TabsTrigger>
            <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="growth" className="space-y-4">
            {loading ? renderLoadingState() : renderUserGrowthSection()}
          </TabsContent>
          
          <TabsContent value="networking" className="space-y-4">
            {loading ? renderLoadingState() : renderNetworkingSection()}
          </TabsContent>
          
          <TabsContent value="matching" className="space-y-4">
            {loading ? renderLoadingState() : renderMatchingSection()}
          </TabsContent>
          
          <TabsContent value="deals" className="space-y-4">
            {loading ? renderLoadingState() : renderDealFlowSection()}
          </TabsContent>
          
          <TabsContent value="sectors" className="space-y-4">
            {loading ? renderLoadingState() : renderSectorSection()}
          </TabsContent>
          
          <TabsContent value="monetization" className="space-y-4">
            {loading ? renderLoadingState() : renderMonetizationSection()}
          </TabsContent>
          
          <TabsContent value="satisfaction" className="space-y-4">
            {loading ? renderLoadingState() : renderSatisfactionSection()}
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            {loading ? renderLoadingState() : renderPerformanceSection()}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
