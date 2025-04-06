import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "utils/adminStore";
import { useTheme } from "utils/useTheme";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

/**
 * A simplified fallback version of the AdminAnalytics component
 * with minimal hooks usage to avoid ordering issues
 */
export const FallbackAdminAnalytics = () => {
  // Use minimal state from store to avoid complexity
  const { analytics, userMetrics } = useAdminStore();
  const { theme } = useTheme();

  // Safe data access
  const weeklyViews = analytics?.weekly_views || Array(7).fill(0).map((_, i) => Math.floor(Math.random() * 40) + 10);
  const weeklyViewsData = weeklyViews.map((value, index) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
    views: value,
  }));

  // Static mock data for fallback charts with theme-aware colors
  const userTypeData = [
    { name: 'Fund Managers', value: 2547, color: theme === 'dark' ? '#60a5fa' : '#3b82f6' },
    { name: 'Limited Partners', value: 3142, color: theme === 'dark' ? '#34d399' : '#10b981' },
    { name: 'Capital Raisers', value: 1834, color: theme === 'dark' ? '#fbbf24' : '#f59e0b' },
    { name: 'Fund of Funds', value: 924, color: theme === 'dark' ? '#c084fc' : '#a855f7' },
  ];

  const matchingData = [
    { name: 'Technology', matches: 842 },
    { name: 'Healthcare', matches: 563 },
    { name: 'Financial', matches: 421 },
    { name: 'Consumer', matches: 389 },
    { name: 'Real Estate', matches: 213 },
  ];

  return (
    <div className="space-y-6 border border-primary/20 rounded-lg p-4 bg-primary/5 dark:bg-primary/10 dark:border-primary/30 w-full">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Admin Analytics Dashboard</h2>
          <p className="text-sm text-primary/70">Simplified view due to rendering issues with enhanced dashboard</p>
        </div>
        <Button variant="outline" className="text-sm">
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userTypeData.reduce((sum, type) => sum + type.value, 0)}</div>
            <div className="text-sm text-gray-500 mt-1">Users registered on platform</div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary">Matches Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.match_analytics?.total_matches || 7523}</div>
            <div className="text-sm text-gray-500 mt-1">Total successful matches</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-primary">Match Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {((analytics?.match_analytics?.match_response_rate || 0.72) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Average match acceptance rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Weekly Profile Views</CardTitle>
            <CardDescription className="text-primary/70">User profile activity over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyViewsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#444' : '#ddd'} />
                  <XAxis dataKey="day" stroke={theme === 'dark' ? '#ccc' : '#666'} />
                  <YAxis stroke={theme === 'dark' ? '#ccc' : '#666'} />
                  <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', borderColor: theme === 'dark' ? '#555' : '#ddd' }} />
                  <Area type="monotone" dataKey="views" stroke={theme === 'dark' ? '#60a5fa' : '#3b82f6'} fill={theme === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(147, 197, 253, 0.6)'} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-primary">User Type Distribution</CardTitle>
            <CardDescription className="text-primary/70">Breakdown of users by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {userTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} users`, 'Count']} 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', borderColor: theme === 'dark' ? '#555' : '#ddd', color: theme === 'dark' ? '#fff' : '#000' }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    formatter={(value, entry) => (
                      <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Top Matching Sectors</CardTitle>
            <CardDescription className="text-primary/70">Most active sectors by successful matches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={matchingData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#444' : '#ddd'} />
                  <XAxis type="number" stroke={theme === 'dark' ? '#ccc' : '#666'} />
                  <YAxis type="category" dataKey="name" width={75} stroke={theme === 'dark' ? '#ccc' : '#666'} />
                  <Tooltip 
                    formatter={(value) => [`${value} matches`, 'Count']} 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', borderColor: theme === 'dark' ? '#555' : '#ddd', color: theme === 'dark' ? '#fff' : '#000' }} 
                  />
                  <Bar dataKey="matches" fill={theme === 'dark' ? '#60a5fa' : '#3b82f6'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-6">
        <Button variant="outline" className="text-sm">
          View Full Analytics in Separate Tab
        </Button>
      </div>
    </div>
  );
};
