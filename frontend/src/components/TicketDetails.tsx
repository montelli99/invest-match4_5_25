import { useAuth } from "@/components/AuthWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import brain from "brain";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  ticketId: string;
  onClose?: () => void;
}

export function TicketDetails({ ticketId, onClose }: Props) {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await brain.get_ticket({ ticket_id: ticketId });
      const data = await response.json();
      setTicket(data);
    } catch (error) {
      console.error("Error fetching ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

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

  if (loading || !ticket) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-32">
          <p>Loading ticket details...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{ticket.title}</h2>
          <div className="flex gap-2 mt-2">
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
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <Card className="p-4">
        <p className="whitespace-pre-wrap">{ticket.description}</p>
        <p className="text-sm text-muted-foreground mt-4">
          Created {format(new Date(ticket.created_at), "PPp")}
        </p>
      </Card>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Comments</h3>
        <CommentList
          ticketId={ticketId}
          onReply={(parentId) => setReplyTo(parentId)}
        />
        {replyTo ? (
          <div className="ml-8">
            <CommentForm
              ticketId={ticketId}
              parentId={replyTo}
              onSuccess={() => setReplyTo(null)}
              onCancel={() => setReplyTo(null)}
            />
          </div>
        ) : (
          <CommentForm ticketId={ticketId} onSuccess={() => {}} />
        )}
      </div>
    </div>
  );
}
