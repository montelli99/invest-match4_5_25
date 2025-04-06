import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import brain from "brain";
import { Reply } from "lucide-react";
import { Comment } from "types";

interface Props {
  ticketId: string;
  onReply: (commentId: string) => void;
}

export function CommentList({ ticketId, onReply }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await brain.list_comments({ ticket_id: ticketId });
      const data = await response.json();
      
      // Organize comments into a tree structure
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];
      
      // First pass: Map all comments by ID
      data.forEach((comment: Comment) => {
        comment.children = [];
        commentMap.set(comment.id, comment);
      });
      
      // Second pass: Organize into parent-child hierarchy
      data.forEach((comment: Comment) => {
        if (comment.parent_id && commentMap.has(comment.parent_id)) {
          const parent = commentMap.get(comment.parent_id);
          parent?.children?.push(comment);
        } else {
          rootComments.push(comment);
        }
      });
      
      setComments(rootComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [ticketId]);

  const renderComment = (comment: Comment, depth = 0) => {
    return (
      <div key={comment.id} className={`mb-4 ${depth > 0 ? 'ml-8' : ''}`}>
        <Card className="p-4">
          <div className="flex justify-between">
            <div className="font-medium">{comment.user_name || "User"}</div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(comment.created_at), "PPp")}
            </div>
          </div>
          <div className="my-2 whitespace-pre-wrap">{comment.content}</div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => onReply(comment.id)}
            >
              <Reply size={16} />
              Reply
            </Button>
          </div>
        </Card>
        {comment.children && comment.children.length > 0 && (
          <div className="mt-2">
            {comment.children.map(child => renderComment(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="py-4 text-center">Loading comments...</div>;
  }

  if (comments.length === 0) {
    return <div className="py-4 text-center">No comments yet.</div>;
  }

  return (
    <div className="space-y-4">
      {comments.map(comment => renderComment(comment))}
    </div>
  );
}
