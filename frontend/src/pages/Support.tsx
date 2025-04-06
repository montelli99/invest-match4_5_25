import { useAuth } from "@/components/AuthWrapper";
import { CreateTicket } from "@/components/CreateTicket";
import { HowToGuides } from "@/components/HowToGuides";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import { TicketList } from "@/components/TicketList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function Support() {
  const { user } = useAuth();
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Support Center</h2>
          <p>Please sign in to access support features.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Support Center</h1>
        <Button
          onClick={() => setShowCreateTicket(true)}
          className="bg-primary text-primary-foreground"
        >
          Create Ticket
        </Button>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="kb">Knowledge Base</TabsTrigger>
          <TabsTrigger value="howto">How-To Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <TicketList />
        </TabsContent>

        <TabsContent value="kb">
          <KnowledgeBase />
        </TabsContent>

        <TabsContent value="howto">
          <HowToGuides />
        </TabsContent>
      </Tabs>

      {showCreateTicket && (
        <CreateTicket
          onClose={() => setShowCreateTicket(false)}
          onSuccess={() => {
            setShowCreateTicket(false);
            // Refresh ticket list
          }}
        />
      )}
    </div>
  );
}
