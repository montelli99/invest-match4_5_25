import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, Area, AreaChart } from "recharts";
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

interface Props {
  userId: string;
}

export function NetworkAnalytics({ userId }: Props) {
  const [networkData, setNetworkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNetworkData() {
      try {
        const response = await brain.get_network_strength({ userId });
        const data = await response.json();

        // Transform data for visualization
        // Transform data for visualization
        const strengthData = [
          { name: "1M", value: 65 },
          { name: "2M", value: 68 },
          { name: "3M", value: 75 },
          { name: "Now", value: data.quality_score }
        ];

        const activityData = [
          { name: "1M", value: 45 },
          { name: "2M", value: 55 },
          { name: "3M", value: 65 },
          { name: "Now", value: data.activity_level }
        ];

        const metricsData = [
          {
            name: "Response Time",
            value: Math.min((24 - data.avg_response_time) * (100 / 24), 100),
          },
          {
            name: "Success Rate",
            value: data.success_rate,
          },
          {
            name: "Quality",
            value: data.quality_score,
          },
          {
            name: "Activity",
            value: data.activity_level,
          },
        ];

        setNetworkData(chartData);
      } catch (error) {
        console.error("Error fetching network data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNetworkData();
  }, [userId]);

  if (loading) {
    return <div>Loading network analytics...</div>;
  }

  if (!networkData) {
    return <div>No network data available</div>;
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={networkData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="var(--primary)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
