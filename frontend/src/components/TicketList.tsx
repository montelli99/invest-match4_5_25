import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import brain from "brain";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await brain.list_tickets(
        { token: {} },
        statusFilter !== "all" ? { status: statusFilter } : {},
      );
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500";
      case "in_progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-32">
          <p>Loading tickets...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tickets.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            No tickets found. Create a new ticket to get started.
          </p>
        </Card>
      ) : (
        tickets.map((ticket) => (
          <Card key={ticket.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{ticket.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {ticket.description}
                </p>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className={`${getPriorityColor(ticket.priority)} text-white`}
                  >
                    {ticket.priority}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(ticket.status)} text-white`}
                  >
                    {ticket.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(ticket.created_at), "PPp")}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
