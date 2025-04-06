import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import brain from "brain";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type Interaction = {
  interaction_id: string;
  type: "message" | "introduction" | "referral" | "meeting" | "document_share";
  timestamp: string;
  initiator_id: string;
  recipient_id: string;
  success?: boolean;
};

type RelationshipDetails = {
  relationship_id: string;
  user1_id: string;
  user2_id: string;
  type: "direct" | "introduction" | "referral";
  status: "pending" | "active" | "inactive" | "blocked";
  metrics: {
    successful_introductions: number;
    total_introductions: number;
    avg_response_time?: number;
    quality_score: number;
    interaction_frequency: number;
  };
  last_interaction?: string;
  interactions: Interaction[];
};

export default function RelationshipDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [relationship, setRelationship] = useState<RelationshipDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRelationshipDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // This will need to be replaced with actual API call once implemented
        const response = await brain.get_relationship_strength({
          user1Id: "current-user-id",
          user2Id: id.replace("rel-", ""),
        });
        const strengthData = await response.json();

        // Temporary mock data until we have the full API
        const mockRelationship: RelationshipDetails = {
          relationship_id: id,
          user1_id: "current-user-id",
          user2_id: id.replace("rel-", ""),
          type: "direct",
          status: "active",
          metrics: {
            successful_introductions: 5,
            total_introductions: 8,
            avg_response_time: 2.5,
            quality_score: strengthData.overall_score,
            interaction_frequency: 75,
          },
          interactions: [
            {
              interaction_id: "int-1",
              type: "introduction",
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              initiator_id: "current-user-id",
              recipient_id: id.replace("rel-", ""),
              success: true,
            },
            {
              interaction_id: "int-2",
              type: "message",
              timestamp: new Date(Date.now() - 172800000).toISOString(),
              initiator_id: id.replace("rel-", ""),
              recipient_id: "current-user-id",
            },
          ],
        };

        setRelationship(mockRelationship);
      } catch (err) {
        console.error("Failed to load relationship details:", err);
        setError(
          "Failed to load relationship details. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadRelationshipDetails();
  }, [id]);

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "message":
        return "💬";
      case "introduction":
        return "🤝";
      case "referral":
        return "👥";
      case "meeting":
        return "📅";
      case "document_share":
        return "📄";
      default:
        return "❓";
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !relationship) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">Loading relationship details...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Button
            variant="ghost"
            className="mb-2"
            onClick={() => navigate("/relationships")}
          >
            ← Back to Relationships
          </Button>
          <h1 className="text-2xl font-bold">John Doe</h1>
          <p className="text-muted-foreground">Relationship Details</p>
        </div>
        <Badge
          className={
            relationship.status === "active"
              ? "bg-green-500 text-white"
              : "bg-yellow-500 text-white"
          }
        >
          {relationship.status.charAt(0).toUpperCase() +
            relationship.status.slice(1)}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Relationship Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Connection Type
                    </dt>
                    <dd className="text-lg font-semibold">
                      {relationship.type.charAt(0).toUpperCase() +
                        relationship.type.slice(1)}{" "}
                      Connection
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Connected Since
                    </dt>
                    <dd className="text-lg font-semibold">March 15, 2024</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Relationship Strength
                    </dt>
                    <dd className="text-lg font-semibold">
                      {Math.round(relationship.metrics.quality_score)}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Successful Introductions
                    </dt>
                    <dd className="text-lg font-semibold">
                      {relationship.metrics.successful_introductions} /{" "}
                      {relationship.metrics.total_introductions}
                    </dd>
                  </div>
                  {relationship.metrics.avg_response_time && (
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Average Response Time
                      </dt>
                      <dd className="text-lg font-semibold">
                        {relationship.metrics.avg_response_time} hours
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Interactions</CardTitle>
              <CardDescription>
                History of your interactions with this contact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {relationship.interactions.map((interaction) => (
                    <div
                      key={interaction.interaction_id}
                      className="flex items-start space-x-4 p-4 rounded-lg border"
                    >
                      <div className="text-2xl">
                        {getInteractionIcon(interaction.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-semibold">
                            {interaction.type.charAt(0).toUpperCase() +
                              interaction.type.slice(1)}
                          </h4>
                          <time className="text-sm text-muted-foreground">
                            {new Date(
                              interaction.timestamp,
                            ).toLocaleDateString()}
                          </time>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {interaction.initiator_id === "current-user-id"
                            ? "You"
                            : "They"}{" "}
                          initiated this interaction
                        </p>
                        {interaction.success !== undefined && (
                          <Badge
                            className={
                              interaction.success
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }
                          >
                            {interaction.success
                              ? "Successful"
                              : "Unsuccessful"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics</CardTitle>
              <CardDescription>
                Comprehensive view of your relationship metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Interaction Metrics</h4>
                  <dl className="space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">
                        Interaction Frequency
                      </dt>
                      <dd className="text-sm font-medium">
                        {relationship.metrics.interaction_frequency}%
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">
                        Average Response Time
                      </dt>
                      <dd className="text-sm font-medium">
                        {relationship.metrics.avg_response_time
                          ? `${relationship.metrics.avg_response_time} hours`
                          : "N/A"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Introduction Metrics</h4>
                  <dl className="space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">
                        Success Rate
                      </dt>
                      <dd className="text-sm font-medium">
                        {Math.round(
                          (relationship.metrics.successful_introductions /
                            relationship.metrics.total_introductions) *
                            100,
                        )}
                        %
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">
                        Total Introductions
                      </dt>
                      <dd className="text-sm font-medium">
                        {relationship.metrics.total_introductions}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
