import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const performanceData = [
  { month: 'Jan', returns: 2.4, benchmark: 1.8 },
  { month: 'Feb', returns: 3.1, benchmark: 2.2 },
  { month: 'Mar', returns: 2.8, benchmark: 2.1 },
  { month: 'Apr', returns: 3.5, benchmark: 2.5 },
  { month: 'May', returns: 3.2, benchmark: 2.7 },
  { month: 'Jun', returns: 3.9, benchmark: 2.9 },
  { month: 'Jul', returns: 4.2, benchmark: 3.1 },
  { month: 'Aug', returns: 3.8, benchmark: 3.0 },
  { month: 'Sep', returns: 4.0, benchmark: 3.2 },
  { month: 'Oct', returns: 4.3, benchmark: 3.3 },
  { month: 'Nov', returns: 4.1, benchmark: 3.4 },
  { month: 'Dec', returns: 4.5, benchmark: 3.6 }
];

const investmentAllocation = [
  { name: 'Venture Capital', value: 35 },
  { name: 'Growth Equity', value: 25 },
  { name: 'Buyout', value: 20 },
  { name: 'Real Estate', value: 12 },
  { name: 'Infrastructure', value: 8 }
];

const managerDistribution = [
  { category: 'Established (>10y)', value: 45 },
  { category: 'Mid-Stage (5-10y)', value: 30 },
  { category: 'Emerging (<5y)', value: 25 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

export const FundOfFundsAnalytics = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Performance vs Benchmark</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Returns']} />
                  <Legend />
                  <Line type="monotone" dataKey="returns" stroke="#8884d8" name="FoF Returns" strokeWidth={2} />
                  <Line type="monotone" dataKey="benchmark" stroke="#82ca9d" name="Market Benchmark" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Investment Allocation */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Investment Strategy Allocation</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={investmentAllocation}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {investmentAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manager Distribution */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Manager Experience Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={managerDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend />
                <Bar dataKey="value" name="Manager Distribution" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
