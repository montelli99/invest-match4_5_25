import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Message } from "types";

interface Props {
  message: Message;
  replies?: Message[];
  currentUserId: string;
  onReply: (messageId: string) => void;
  onViewThread?: (threadId: string) => void;
  isExpanded?: boolean;
}

export function ThreadedMessage({
  message,
  replies = [],
  currentUserId,
  onReply,
  onViewThread,
  isExpanded = false,
}: Props) {
  const isOwnMessage = message.sender_id === currentUserId;
  const hasReplies = replies.length > 0;

  return (
    <div
      className={cn(
        "space-y-2",
        isOwnMessage && "ml-auto",
        !isExpanded && "max-w-[80%]",
      )}
    >
      <Card
        className={cn("p-4", isOwnMessage ? "bg-primary/10" : "bg-background")}
      >
        <div className="flex items-start gap-4">
          <Avatar />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isOwnMessage ? "You" : "Other User"}
              </p>
              {message.is_thread_starter && (
                <p className="text-xs text-muted-foreground">
                  {message.thread_title || "Thread"}
                </p>
              )}
            </div>
            <p className="mt-1">{message.content}</p>
            {message.attachment && (
              <a
                href={`/api/attachments/${message.attachment.id}`}
                className="text-sm text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {message.attachment.filename}
              </a>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(message.id)}
              >
                Reply
              </Button>
              {hasReplies && !isExpanded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onViewThread?.(message.thread_id || message.id)
                  }
                >
                  View Thread ({message.reply_count})
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Show replies if expanded */}
      {isExpanded && hasReplies && (
        <div className="pl-8 space-y-2">
          {replies.map((reply) => (
            <Card
              key={reply.id}
              className={cn(
                "p-4",
                reply.sender_id === currentUserId
                  ? "bg-primary/10 ml-auto"
                  : "bg-background",
              )}
            >
              <div className="flex items-start gap-4">
                <Avatar />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {reply.sender_id === currentUserId ? "You" : "Other User"}
                  </p>
                  <p className="mt-1">{reply.content}</p>
                  {reply.attachment && (
                    <a
                      href={`/api/attachments/${reply.attachment.id}`}
                      className="text-sm text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {reply.attachment.filename}
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => onReply(reply.id)}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
