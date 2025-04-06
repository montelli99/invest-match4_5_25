import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Comment, Ticket } from "types";

interface TimelineEvent {
  type:
    | "status_change"
    | "priority_change"
    | "comment"
    | "creation"
    | "resolution";
  timestamp: string;
  content: string;
  user?: string;
  oldValue?: string;
  newValue?: string;
}

interface Props {
  ticket: Ticket;
  comments: Comment[];
}

export function TicketTimeline({ ticket, comments }: Props) {
  // Combine all events into a single timeline
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];



    // Add ticket creation
    events.push({
      type: "creation",
      timestamp: ticket.created_at,
      content: "Ticket created",
      user: ticket.user_id,
    });

    // Add status and priority changes from history if available
    if (ticket.history) {
      ticket.history.forEach((entry) => {
        if (entry.field === 'status' && entry.old_value !== entry.new_value) {
          events.push({
            type: 'status_change',
            timestamp: entry.timestamp,
            content: `Status changed from ${entry.old_value} to ${entry.new_value}`,
            user: entry.user_id,
            oldValue: entry.old_value,
            newValue: entry.new_value
          });
        }
        if (entry.field === 'priority' && entry.old_value !== entry.new_value) {
          events.push({
            type: 'priority_change',
            timestamp: entry.timestamp,
            content: `Priority changed from ${entry.old_value} to ${entry.new_value}`,
            user: entry.user_id,
            oldValue: entry.old_value,
            newValue: entry.new_value
          });
        }
      });
    }

    // Add comments
    comments.forEach((comment) => {
      events.push({
        type: "comment",
        timestamp: comment.created_at,
        content: comment.content,
        user: comment.user_id,
      });
    });

    // Add resolution if exists
    if (ticket.resolution) {
      events.push({
        type: "resolution",
        timestamp: ticket.updated_at,
        content: ticket.resolution,
        user: ticket.user_id,
      });
    }

    // Sort events by timestamp
    return events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "creation":
        return "🎯";
      case "comment":
        return "💬";
      case "status_change":
        return "🔄";
      case "priority_change":
        return "⚡";
      case "resolution":
        return "✅";
      default:
        return "📝";
    }
  };

  const events = generateTimelineEvents();

  return (
    <Card className="p-6">
      <h3 className="text-2xl font-semibold mb-6">Timeline</h3>
      <div className="space-y-8">
        {events.map((event, index) => (
          <div key={index} className="relative pl-8 pb-8">
            {/* Timeline line */}
            {index !== events.length - 1 && (
              <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-gray-200" />
            )}

            {/* Event icon */}
            <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">
              {getEventIcon(event.type)}
            </div>

            {/* Event content */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {event.type.replace("_", " ").toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(event.timestamp)}
                </span>
              </div>

              <div className="text-sm">
                {event.user && (
                  <span className="font-medium">{event.user} </span>
                )}
                {event.type === "comment" ? (
                  <div className="mt-2 prose prose-sm max-w-none">
                    {event.content}
                  </div>
                ) : (
                  <span>{event.content}</span>
                )}
              </div>

              {(event.oldValue || event.newValue) && (
                <div className="text-sm text-muted-foreground">
                  {event.oldValue && <span>From: {event.oldValue}</span>}
                  {event.oldValue && event.newValue && <span> → </span>}
                  {event.newValue && <span>To: {event.newValue}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
