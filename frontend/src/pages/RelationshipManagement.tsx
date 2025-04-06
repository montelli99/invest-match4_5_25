import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntroductionRequests } from "components/IntroductionRequests";
import { NetworkAnalytics } from "components/NetworkAnalytics";
import { RelationshipList } from "components/RelationshipList";
import { RelationshipStrength } from "components/RelationshipStrength";
import { useEffect, useState } from "react";

export default function RelationshipManagement() {
  const [userId, setUserId] = useState("user-1"); // TODO: Get from auth

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Relationship Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Network Overview</h2>
          <NetworkAnalytics userId={userId} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Relationship Strength</h2>
          <RelationshipStrength userId={userId} />
        </Card>
      </div>

      <Tabs defaultValue="relationships" className="w-full">
        <TabsList>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="introductions">Introductions</TabsTrigger>
        </TabsList>

        <TabsContent value="relationships" className="mt-6">
          <Card className="p-6">
            <RelationshipList userId={userId} />
          </Card>
        </TabsContent>

        <TabsContent value="introductions" className="mt-6">
          <Card className="p-6">
            <IntroductionRequests userId={userId} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
