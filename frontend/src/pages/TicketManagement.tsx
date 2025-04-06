import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import brain from "brain";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, TicketStatus } from "types";

// Status badge colors
const statusColors = {
  open: "bg-blue-500",
  in_progress: "bg-yellow-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
};

// Priority badge colors
const priorityColors = {
  low: "bg-gray-500",
  medium: "bg-blue-500",
  high: "bg-yellow-500",
  urgent: "bg-red-500",
};

export default function TicketManagement() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | TicketStatus>("all");

  // Fetch tickets
  const fetchTickets = async (status?: "all" | TicketStatus) => {
    try {
      setLoading(true);
      const response = await brain.list_tickets(
        { status: status === "all" ? null : status },
        {},
      );
      const data = await response.json();
      setTickets(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(activeTab);
  }, [activeTab]);

  // Format date to local string
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreateTicket = () => {
    navigate("/CreateTicket");
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/ViewTicket?id=${ticketId}`);
  };

  if (error) {
    return (
      <div className="p-4">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <Button onClick={handleCreateTicket}>Create New Ticket</Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | TicketStatus)} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <p className="text-gray-500 mb-4">No tickets found</p>
                <Button onClick={handleCreateTicket}>Create New Ticket</Button>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleViewTicket(ticket.id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">
                            {ticket.title}
                          </CardTitle>
                          <p className="text-sm text-gray-500">#{ticket.id}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            className={`${priorityColors[ticket.priority]} text-white`}
                          >
                            {ticket.priority}
                          </Badge>
                          <Badge
                            className={`${statusColors[ticket.status]} text-white`}
                          >
                            {ticket.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-2 mb-2">
                        {ticket.description}
                      </p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          {ticket.attachments &&
                            ticket.attachments.length > 0 && (
                              <span>
                                📎 {ticket.attachments.length} attachment(s)
                              </span>
                            )}
                          {ticket.assigned_to && (
                            <span>👤 Assigned to: {ticket.assigned_to}</span>
                          )}
                        </div>
                        <div className="flex gap-4">
                          <span>Created: {formatDate(ticket.created_at)}</span>
                          <span>Updated: {formatDate(ticket.updated_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
