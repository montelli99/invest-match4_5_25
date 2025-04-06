import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import brain from "brain";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthWrapper";
import { mode, Mode } from "app";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface FeedbackAnalytics {
  total_feedback: number;
  average_rating: number;
  usability_breakdown: Record<string, number>;
  feature_ratings: Record<string, number>;
  recent_suggestions: Array<{
    suggestion: string;
    timestamp: string;
  }>;
}

export default function FeedbackAnalytics() {
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get authentication info
  const { user } = useAuth();
  const [idToken, setIdToken] = useState<string>("");
  
  // In development mode, use a dummy token for preview
  const isDev = mode === Mode.DEV;

  // Get authentication token
  useEffect(() => {
    const getToken = async () => {
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
      } else if (isDev) {
        // Set a dummy token for development/preview mode
        setIdToken("preview-dummy-token");
      }
    };
    getToken();
  }, [user, isDev]);

  useEffect(() => {
    if (!idToken) return; // Don't fetch without a token

    const fetchAnalytics = async () => {
      try {
        const response = await brain.get_feedback_analytics({
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        });
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [idToken]);

  if (loading || !idToken) return <div className="p-8">Loading analytics...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!analytics) return null;

  // Prepare data for charts
  const usabilityData = Object.entries(analytics.usability_breakdown).map(
    ([key, value]) => ({
      name: key.replace("_", " ").toUpperCase(),
      value,
    }),
  );

  const featureData = Object.entries(analytics.feature_ratings).map(
    ([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      rating: value,
    }),
  );

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Feedback Analytics</CardTitle>
          <CardDescription>
            Analysis of user feedback for the TicketList page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Total Feedback</h3>
              <p className="text-3xl font-bold">{analytics.total_feedback}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Average Rating</h3>
              <p className="text-3xl font-bold">{analytics.average_rating}/5</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usability Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usabilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Ratings</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="rating" fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recent_suggestions.map((suggestion, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">
                  {new Date(suggestion.timestamp).toLocaleDateString()}
                </p>
                <p>{suggestion.suggestion}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
