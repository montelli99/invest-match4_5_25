import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useCallback, useEffect } from "react";
import { WebSocketResponse, getReconnectDelay } from "@/utils/commentWebSocket";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useCommentWebSocket, getConnectionStatusText } from "@/utils/commentWebSocket";
import { CommentEditor } from "@/components/CommentEditor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Comment as BaseComment, CommentAttachment } from "types";

interface Comment extends BaseComment {
  replies?: Comment[];
}
import brain from "brain";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onCommentsUpdate?: (comments: Comment[]) => void;
  maxDepth?: number;
  comments: Comment[];
  onReply?: (parentId: string, content: string) => Promise<void>;
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  className?: string;
}

export function CommentThread({
  comments,
  onReply,
  onEdit,
  onDelete,
  className = "",
  maxDepth = 5,
}: Props) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [showReplyEditor, setShowReplyEditor] = useState(false);

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { toast } = useToast();

  const { 
    connectionStatus, 
    setConnectionStatus, 
    lastMessage, 
    setLastMessage,
    error,
    setError,
    reconnectAttempt,
    setReconnectAttempt
  } = useCommentWebSocket();

  // Initialize WebSocket connection
  const { sendMessage, lastMessage: wsLastMessage, readyState } = useWebSocket(
    `ws://${window.location.host}/ws/comments`,
    {
      onOpen: () => {
        console.log('WebSocket Connected');
        setError(null);
        setReconnectAttempt(0);
      },
      onClose: (event) => {
        console.log('WebSocket Disconnected:', event.reason);
        if (!event.wasClean) {
          setError('Connection lost. Attempting to reconnect...');
          setReconnectAttempt((current: number) => current + 1);
        }
      },
      onError: (event) => {
        console.error('WebSocket Error:', event);
        setError('Connection error. Please check your internet connection.');
      },
      onMessage: (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketResponse;
          if (data.type === 'error') {
            setError(data.message);
          } else {
            setLastMessage(data);
            setError(null);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          setError('Error processing message from server.');
        }
      },
      shouldReconnect: (closeEvent) => true,
      reconnectAttempts: Infinity,
      reconnectInterval: (attemptNumber) => getReconnectDelay(attemptNumber),
    }
  );

  // Update connection status
  useEffect(() => {
    setConnectionStatus(readyState);
  }, [readyState, setConnectionStatus]);

  // Handle new messages
  useEffect(() => {
    if (!onCommentsUpdate || !lastMessage) return;
    
    if ('type' in lastMessage && lastMessage.type === 'error') {
      toast({
        title: "Error",
        description: lastMessage.message,
        variant: "destructive",
      });
      return;
    }
    
    // Update the comments array with the new message
    const updatedComments = [...comments] as Comment[];
    const commentData = lastMessage.data;
    
    switch (lastMessage.type) {
      case 'comment_created':
        if (commentData.parent_id) {
          // This is a reply, find the parent comment
          const parentIndex = updatedComments.findIndex(c => c.id === commentData.parent_id);
          if (parentIndex !== -1) {
            // Add the reply to the parent's replies
            if (!updatedComments[parentIndex].replies) {
              updatedComments[parentIndex].replies = [];
            }
            updatedComments[parentIndex].replies.push(commentData);
          }
        } else {
          // This is a root comment
          updatedComments.push(commentData);
        }
        break;
        
      case 'comment_updated': {
        // Find and update the comment
        const commentToUpdate = updatedComments.find(c => c.id === commentData.id);
        if (commentToUpdate) {
          Object.assign(commentToUpdate, commentData);
        }
        break;
      }
        
      case 'comment_deleted':
        // Remove the comment
        const commentIndex = updatedComments.findIndex(c => c.id === commentData.id);
        if (commentIndex !== -1) {
          updatedComments.splice(commentIndex, 1);
        }
        break;
    }
    
    // Sort comments by date
    updatedComments.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Update the comments state through the parent component
    onCommentsUpdate(updatedComments);
  }, [lastMessage, comments, onCommentsUpdate]);

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

  // Get user initials for avatar
  const getInitials = (userId: string) => {
    return userId
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Organize comments into threads
  const threadedComments = comments.reduce(
    (acc, comment) => {
      if (!comment.parent_id) {
        // This is a root comment
        acc[comment.id] = {
          ...comment,
          replies: [],
        };
      } else if (acc[comment.parent_id]) {
        // This is a reply to an existing comment
        acc[comment.parent_id].replies.push(comment);
      }
      return acc;
    },
    {} as Record<string, Comment & { replies: Comment[] }>,
  );

  const handleReplySubmit = async (parentId: string, content: string, files: File[]) => {
    if (!onReply) return;
    
    try {
      setLoadingAction(`reply-${parentId}`);
      
      // Upload attachments first
      const attachmentIds: string[] = [];
      for (const file of files) {
        // Convert file to base64
        const reader = new FileReader();
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = reader.result as string;
            // Remove data:image/jpeg;base64, prefix
            const base64Clean = base64.split(',')[1];
            resolve(base64Clean);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const response = await brain.upload_attachment({
          file: fileBase64
        });
        const attachment = await response.json();
        attachmentIds.push(attachment.id);
      }
      
      await onReply(parentId, content);
      setReplyingTo(null);
      setShowReplyEditor(false);
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast({
        title: "Error",
        description: "Failed to submit reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEditSubmit = async (commentId: string, content: string, files: File[]) => {
    if (!onEdit) return;
    
    try {
      setLoadingAction(`edit-${commentId}`);
      
      // Upload attachments first
      const attachmentIds: string[] = [];
      for (const file of files) {
        // Convert file to base64
        const reader = new FileReader();
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = reader.result as string;
            // Remove data:image/jpeg;base64, prefix
            const base64Clean = base64.split(',')[1];
            resolve(base64Clean);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const response = await brain.upload_attachment({
          file: fileBase64
        });
        const attachment = await response.json();
        attachmentIds.push(attachment.id);
      }
      
      await onEdit(commentId, content);
      setEditing(null);
    } catch (error) {
      console.error("Error editing comment:", error);
      toast({
        title: "Error",
        description: "Failed to edit comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const renderComment = (
    comment: Comment & { replies?: Comment[] },
    isReply = false,
    currentDepth = 0
  ) => {
    if (currentDepth > maxDepth) {
      return (
        <div key={comment.id} className="ml-8 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => window.open(`#comment-${comment.id}`, "_self")}
          >
            Show more replies...
          </Button>
        </div>
      );
    }
    
    return (
    <div 
      key={comment.id} 
      id={`comment-${comment.id}`}
      className={cn(
        "group",
        isReply && "ml-8",
        isReply && "border-l-2 border-muted pl-4"
      )}>
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{getInitials(comment.user_id)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{comment.user_id}</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
          </div>
          {editing === comment.id ? (
            <CommentEditor
              onSubmit={async (content, files) => handleEditSubmit(comment.id, content, files)}
              initialContent={comment.content}
              onCancel={() => setEditing(null)}
              submitLabel="Save Changes"
              maxLength={5000}
            />
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {comment.content}
              </ReactMarkdown>
            </div>
          )}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-2">
                {comment.attachments.map((attachment) => (
                  <Button
                    key={attachment.id}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => window.open(attachment.url, "_blank")}
                  >
                    <span>📎</span>
                    {attachment.filename}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            {onReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyingTo(comment.id);
                  setShowReplyEditor(true);
                }}
              >
                Reply
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(comment.id);
                  ;
                }}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(comment.id)}
              >
                Delete
              </Button>
            )}
          </div>
          {replyingTo === comment.id && showReplyEditor && (
            <div className="mt-4">
              <CommentEditor
                onSubmit={async (content, files) => handleReplySubmit(comment.id, content, files)}
                onCancel={() => {
                  setReplyingTo(null);
                  setShowReplyEditor(false);
                }}
                placeholder="Write a reply..."
                submitLabel="Post Reply"
                maxLength={5000}
              />
            </div>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => renderComment(reply, true, currentDepth + 1))}
        </div>
      )}
      <Separator className="mt-4" />
    </div>
  );
  };

  return (
    <div className="relative">
      {/* Connection status indicator */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <div className={cn(
          "px-2 py-1 rounded text-sm flex items-center gap-2",
          connectionStatus === ReadyState.OPEN
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
        )}>
          {connectionStatus === ReadyState.CONNECTING && <Loader2 className="h-3 w-3 animate-spin" />}
          {getConnectionStatusText(connectionStatus)}
          {reconnectAttempt > 0 && ` (Attempt ${reconnectAttempt})`}
        </div>
        {error && (
          <div className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 px-2 py-1 rounded text-sm">
            {error}
          </div>
        )}
      </div>
      <Card className={`p-4 space-y-4 ${className}`}>
      {Object.values(threadedComments).map((comment) => renderComment(comment, false, 0))}
      </Card>
    </div>
  );
}
