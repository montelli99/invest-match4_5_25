import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { AnalyticsSummary as ApiAnalyticsSummary } from "types";
import { CardSkeleton } from "./CardSkeleton";
import { DatePicker } from "./DatePicker";
import { LineChartComponent } from "./LineChartComponent";
import { MetricCard } from "./MetricCard";
import { PieChartComponent } from "./PieChartComponent";
import { NewsFeed } from "./NewsFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CapitalRaiserDashboardProps {
  userId?: string;
}

export const CapitalRaiserDashboard = ({ userId = 'current' }: CapitalRaiserDashboardProps) => {
  const [analytics, setAnalytics] = useState<ApiAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await brain.get_analytics_summary();
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load analytics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    // Polling disabled to prevent continuous refreshing
    // const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    // return () => clearInterval(interval);
    return () => {}; // Empty cleanup function
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  // Transform connection data for the line chart
  const connectionData = analytics.engagement_metrics.profile_view_history.map(
    (value, index) => ({
      day: index,
      connections: value,
    }),
  );

  // Calculate match distribution data for pie chart
  const matchDistribution = [
    {
      name: "Accepted",
      value: analytics.match_analytics.accepted_matches,
    },
    {
      name: "Pending",
      value: analytics.match_analytics.pending_matches,
    },
    {
      name: "Declined",
      value: analytics.match_analytics.declined_matches,
    },
  ];

  const handleExport = async () => {
    try {
      const response = await brain.export_analytics({
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
        format: "csv",
        metrics: ["engagement_metrics", "match_analytics", "weekly_views"],
      });

      const blob = new Blob([await response.text()], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics_${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Analytics exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export analytics",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Capital Raiser Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitor your networking performance and connection metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <DatePicker
              date={dateRange.from}
              onSelect={(date) => {
                if (date) {
                  setDateRange((prev) => ({ ...prev, from: date }));
                }
              }}
            />
            <span className="text-muted-foreground">to</span>
            <DatePicker
              date={dateRange.to}
              onSelect={(date) => {
                if (date) {
                  setDateRange((prev) => ({ ...prev, to: date }));
                }
              }}
            />
          </div>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="social-feed">Social Feed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Active Connections"
          value={analytics.engagement_metrics.total_connections.current}
          trend={{
            value:
              analytics.engagement_metrics.total_connections.change_percentage,
            label: "from last period",
          }}
        />

        <MetricCard
          title="Response Rate"
          value={`${(analytics.engagement_metrics.message_response_rate.current * 100).toFixed(1)}%`}
          trend={{
            value:
              analytics.engagement_metrics.message_response_rate
                .change_percentage,
            label: "from last period",
          }}
        />

        <MetricCard
          title="Active Conversations"
          value={analytics.engagement_metrics.active_conversations.current}
          description={`Average response time: ${analytics.engagement_metrics.average_response_time.toFixed(1)}h`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Network Growth</CardTitle>
            <CardDescription>Daily connection trends</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartComponent
              data={connectionData}
              lineKeys={[
                {
                  key: "connections",
                  color: "var(--chart-1-hex)",
                  name: "Connections",
                },
              ]}
              xAxisKey="day"
              xAxisFormatter={(value) => `Day ${value + 1}`}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Match Distribution</CardTitle>
            <CardDescription>Status of your matches</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={matchDistribution} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest networking interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recent_activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="social-feed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Network</CardTitle>
              <CardDescription>
                Share investment opportunities, market insights, and connect with your network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NewsFeed
                onMessageClick={(userId) => {
                  // Handle messaging functionality
                  console.log("Message user:", userId);
                  // You could open a message dialog here
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
