import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import brain from "brain";
import { useEffect, useState } from "react";

interface Props {
  userId: string;
}

export function RelationshipList({ userId }: Props) {
  const [relationships, setRelationships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelationships() {
      try {
        const response = await brain.get_relationships({ userId });
        const data = await response.json();
        setRelationships(data.relationships || []);
      } catch (error) {
        console.error("Error fetching relationships:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelationships();
  }, [userId]);

  if (loading) {
    return <div>Loading relationships...</div>;
  }

  return (
    <div className="space-y-4">
      {relationships.map((relationship) => (
        <Card key={relationship.user_id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={relationship.profile_image} />
                <AvatarFallback>{relationship.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{relationship.name}</h3>
                <p className="text-sm text-gray-500">{relationship.company}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium">Relationship Strength</div>
                <Progress
                  value={relationship.strength * 100}
                  className="w-[100px]"
                />
              </div>
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
