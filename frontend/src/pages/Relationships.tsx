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
import { useNavigate } from "react-router-dom";

type Relationship = {
  relationship_id: string;
  user1_id: string;
  user2_id: string;
  type: "direct" | "introduction" | "referral";
  status: "pending" | "active" | "inactive" | "blocked";
  metrics: {
    successful_introductions: number;
    total_introductions: number;
    quality_score: number;
    interaction_frequency: number;
  };
  last_interaction?: string;
};

export default function Relationships() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Placeholder user ID - this should come from auth context
  const currentUserId = "current-user-id";

  useEffect(() => {
    const loadRelationships = async () => {
      try {
        setLoading(true);
        // This will need to be replaced with actual API call once implemented
        const response = await brain.get_network_strength({
          userId: currentUserId,
        });
        const data = await response.json();
        // Transform network strength data into relationships
        // This is temporary until we have the full relationship API
        const relationships = Object.entries(data).map(
          ([userId, strength]) => ({
            relationship_id: `rel-${userId}`,
            user1_id: currentUserId,
            user2_id: userId,
            type: "direct" as const,
            status: "active" as const,
            metrics: {
              successful_introductions: 0,
              total_introductions: 0,
              quality_score: strength,
              interaction_frequency: 0,
            },
          }),
        );
        setRelationships(relationships);
      } catch (err) {
        console.error("Failed to load relationships:", err);
        setError("Failed to load relationships. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadRelationships();
  }, [currentUserId]);

  const filteredRelationships = relationships.filter((rel) => {
    switch (activeTab) {
      case "active":
        return rel.status === "active";
      case "pending":
        return rel.status === "pending";
      case "inactive":
        return rel.status === "inactive";
      default:
        return true;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "inactive":
        return "bg-gray-500";
      case "blocked":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "direct":
        return "Direct Connection";
      case "introduction":
        return "Via Introduction";
      case "referral":
        return "Via Referral";
      default:
        return type;
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

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relationship Management</h1>
        <Button onClick={() => navigate("/search")}>Find Connections</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Relationships</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">Loading relationships...</div>
                  </CardContent>
                </Card>
              ) : filteredRelationships.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      No relationships found.
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredRelationships.map((relationship) => (
                  <Card
                    key={relationship.relationship_id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() =>
                      navigate(`/relationships/${relationship.relationship_id}`)
                    }
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>John Doe</CardTitle>
                          <CardDescription>
                            {getTypeLabel(relationship.type)}
                          </CardDescription>
                        </div>
                        <Badge
                          className={`${getStatusColor(relationship.status)} text-white`}
                        >
                          {relationship.status.charAt(0).toUpperCase() +
                            relationship.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Relationship Strength
                          </div>
                          <div className="text-lg font-semibold">
                            {Math.round(relationship.metrics.quality_score)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Successful Introductions
                          </div>
                          <div className="text-lg font-semibold">
                            {relationship.metrics.successful_introductions} /{" "}
                            {relationship.metrics.total_introductions}
                          </div>
                        </div>
                      </div>
                      {relationship.last_interaction && (
                        <div className="mt-4 text-sm text-muted-foreground">
                          Last interaction:{" "}
                          {new Date(
                            relationship.last_interaction,
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
