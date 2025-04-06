import { Message } from "@/brain/data-contracts";
import { format, isAfter, isBefore } from "date-fns";
import {
  CalendarIcon,
  Check,
  Clock,
  Download,
  Paperclip,
  X as XIcon,
} from "lucide-react";
import { MessageStatus } from "./MessageStatus";
import { Button } from "./ui/button";

interface Props {
  message: Message;
  isMyMessage: boolean;
  onRespondToMeeting?: (messageId: string, accept: boolean) => void;
  onSetupReminder?: (proposal: any) => void;
}

export function MessageBubble({
  message,
  isMyMessage,
  onRespondToMeeting,
  onSetupReminder,
}: Props) {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderMeetingProposal = (message: Message) => {
    try {
      const proposal = JSON.parse(message.content);
      if (proposal.type !== "meeting_proposal") return null;

      const meetingDate = new Date(proposal.datetime);
      if (!meetingDate) return null;
      const isPast = isBefore(meetingDate, new Date());
      const isMyMessage = message.sender_id !== message.receiver_id;

      return (
        <div className="flex flex-col gap-2 p-3 bg-accent/10 rounded-lg">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span className="font-medium">Meeting Proposal</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>
              {format(meetingDate, "PPp")} ({proposal.duration} mins)
            </span>
          </div>
          {proposal.agenda && (
            <div className="text-sm mt-1">
              <p className="font-medium">Agenda:</p>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {proposal.agenda}
              </p>
            </div>
          )}
          {proposal.status === "accepted" && (
            <div className="mt-2">
              <a
                href={proposal.calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <CalendarIcon className="h-4 w-4" />
                Add to Google Calendar
              </a>
            </div>
          )}
          {proposal.status === "pending" && !isPast && !isMyMessage && (
            <div className="flex items-center gap-2 mt-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  onRespondToMeeting?.(message.id, true);
                  onSetupReminder?.(proposal);
                }}
              >
                <Check className="h-4 w-4 mr-1" /> Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRespondToMeeting?.(message.id, false)}
              >
                <XIcon className="h-4 w-4 mr-1" /> Decline
              </Button>
            </div>
          )}
          {proposal.status !== "pending" && (
            <div
              className={`text-sm mt-1 ${proposal.status === "accepted" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
            >
              {proposal.status === "accepted"
                ? "Meeting Accepted"
                : "Meeting Declined"}
            </div>
          )}
          {isPast && proposal.status === "pending" && (
            <div className="text-sm text-muted-foreground mt-1">
              This meeting proposal has expired
            </div>
          )}
        </div>
      );
    } catch {
      return null;
    }
  };

  return (
    <div
      className={`flex flex-col ${isMyMessage ? "items-end" : "items-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${message.pending ? "opacity-70" : ""} ${
          isMyMessage ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {renderMeetingProposal(message) || (
          <p className="break-words">{message.content}</p>
        )}
        {message.attachment && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Paperclip className="h-4 w-4" />
            <a
              href={message.attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              {message.attachment.filename}
              <Download className="h-4 w-4" />
            </a>
            <span className="text-muted-foreground">
              ({Math.round(message.attachment.size / 1024)}KB)
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
        <span>{formatTimestamp(message.timestamp)}</span>
        {isMyMessage && message.status && (
          <MessageStatus status={message.status} />
        )}
      </div>
    </div>
  );
}
