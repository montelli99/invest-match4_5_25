import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import brain from "brain";
import { useEffect, useState } from "react";

interface Props {
  userId: string;
}

export function IntroductionRequests({ userId }: Props) {
  const [introductions, setIntroductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIntroductions() {
      try {
        const response = await brain.list_user_introductions({ userId });
        const data = await response.json();
        setIntroductions(data.introductions || []);
      } catch (error) {
        console.error("Error fetching introductions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchIntroductions();
  }, [userId]);

  if (loading) {
    return <div>Loading introductions...</div>;
  }

  return (
    <div className="space-y-4">
      {introductions.map((intro) => (
        <Card key={intro.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={intro.requester.profile_image} />
                <AvatarFallback>{intro.requester.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{intro.requester.name}</h3>
                <p className="text-sm text-gray-500">
                  Requesting introduction to {intro.target.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant={intro.status === "pending" ? "secondary" : "outline"}
              >
                {intro.status}
              </Badge>
              {intro.status === "pending" && (
                <div className="space-x-2">
                  <Button variant="default" size="sm">
                    Accept
                  </Button>
                  <Button variant="outline" size="sm">
                    Decline
                  </Button>
                </div>
              )}
            </div>
          </div>
          {intro.message && (
            <p className="mt-2 text-sm text-gray-600">{intro.message}</p>
          )}
        </Card>
      ))}
    </div>
  );
}
