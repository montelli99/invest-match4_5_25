import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import brain from "brain";
import { useEffect, useState } from "react";

interface Props {
  userId: string;
}

export function RelationshipStrength({ userId }: Props) {
  const [networkStrength, setNetworkStrength] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNetworkStrength() {
      try {
        const response = await brain.get_network_strength({ userId });
        const data = await response.json();
        setNetworkStrength(data);
      } catch (error) {
        console.error("Error fetching network strength:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNetworkStrength();
  }, [userId]);

  if (loading) {
    return <div>Loading network strength...</div>;
  }

  if (!networkStrength) {
    return <div>No network strength data available</div>;
  }

  const calculateTrends = () => {
    // This would normally come from the API
    return {
      responseTime: networkStrength.avg_response_time < 12 ? "improving" : "declining",
      successRate: networkStrength.success_rate > 75 ? "improving" : "stable",
      quality: networkStrength.quality_score > 80 ? "improving" : "stable",
      activity: networkStrength.activity_level > 70 ? "improving" : "needs_attention"
    };
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-500";
      case "stable":
        return "text-blue-500";
      case "declining":
        return "text-yellow-500";
      case "needs_attention":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const trends = calculateTrends();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Average Response Time</h3>
          <div className="text-2xl font-bold">
            {networkStrength.avg_response_time}h
          </div>
          <Progress
            value={Math.min(
              (24 - networkStrength.avg_response_time) * (100 / 24),
              100,
            )}
            className="mt-2"
          />
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Success Rate</h3>
          <div className="text-2xl font-bold">
            {networkStrength.success_rate}%
          </div>
          <Progress value={networkStrength.success_rate} className="mt-2" />
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Network Quality</h3>
          <div className="text-2xl font-bold">
            {networkStrength.quality_score}/100
          </div>
          <Progress value={networkStrength.quality_score} className="mt-2" />
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Activity Level</h3>
          <div className="text-2xl font-bold">
            {networkStrength.activity_level}/100
          </div>
          <Progress value={networkStrength.activity_level} className="mt-2" />
        </Card>
      </div>
    </div>
  );
}
