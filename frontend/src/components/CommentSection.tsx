import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import brain from "brain";
import { format } from "date-fns";
import { AlertCircle, Edit2, Flag, ThumbsUp, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Comment } from "types";
import * as z from "zod";

interface Props {
  ticketId: string;
  currentUserId: string;
  isAdmin?: boolean;
}

const commentSchema = z.object({
  content: z
    .string()
    .min(2, "Comment must be at least 2 characters long")
    .max(10000, "Comment must not exceed 10000 characters"),
});

type CommentFormData = z.infer<typeof commentSchema>;

export function CommentSection({
  ticketId,
  currentUserId,
  isAdmin = false,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null,
  );
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const fetchComments = async () => {
    try {
      const response = await brain.list_comments({ ticketId });
      const data = await response.json();
      setComments(data.comments);
    } catch (err) {
      setError("Failed to load comments");
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [ticketId]);

  const onSubmit = async (data: CommentFormData) => {
    try {
      if (editingCommentId) {
        await brain.update_comment(
          { commentId: editingCommentId },
          { content: data.content },
        );
      } else {
        await brain.create_comment({
          ticketId,
          content: data.content,
        });
      }
      reset();
      setEditingCommentId(null);
      fetchComments();
    } catch (err) {
      setError("Failed to save comment");
      console.error("Error saving comment:", err);
    }
  };

  const handleReact = async (commentId: string) => {
    try {
      await brain.react_to_comment({ commentId }, { emoji: "thumbsup" });
      fetchComments();
    } catch (err) {
      console.error("Error reacting to comment:", err);
    }
  };

  const handleReport = async () => {
    if (!selectedCommentId || !reportReason) return;

    try {
      await brain.report_comment(
        { commentId: selectedCommentId },
        { reason: reportReason },
      );
      setShowReportDialog(false);
      setReportReason("");
      setSelectedCommentId(null);
      fetchComments();
    } catch (err) {
      console.error("Error reporting comment:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedCommentId) return;

    try {
      await brain.delete_comment({ commentId: selectedCommentId });
      setShowDeleteDialog(false);
      setSelectedCommentId(null);
      fetchComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleModerate = async (commentId: string, status: string) => {
    try {
      await brain.moderate_comment({ commentId }, { status });
      fetchComments();
    } catch (err) {
      console.error("Error moderating comment:", err);
    }
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <Textarea
          {...register("content")}
          placeholder="Write a comment..."
          className="min-h-[100px]"
        />
        {errors.content && (
          <p className="text-red-500 text-sm">{errors.content.message}</p>
        )}
        <Button type="submit">
          {editingCommentId ? "Update Comment" : "Post Comment"}
        </Button>
        {editingCommentId && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setEditingCommentId(null);
            }}
            className="ml-2"
          >
            Cancel
          </Button>
        )}
      </form>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex items-start space-x-4">
                <Avatar />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{comment.user_id}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(comment.created_at), "PPp")}
                        {comment.is_edited && " (edited)"}
                      </p>
                    </div>
                    {(comment.user_id === currentUserId || isAdmin) && (
                      <div className="flex space-x-2">
                        {comment.user_id === currentUserId && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingCommentId(comment.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCommentId(comment.id);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {isAdmin && comment.reports?.length > 0 && (
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleModerate(comment.id, "approved")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleModerate(comment.id, "rejected")
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="mt-2">{comment.content}</p>
                  <div className="mt-4 flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReact(comment.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      {comment.reactions?.thumbsup?.length || 0}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCommentId(comment.id);
                        setShowReportDialog(true);
                      }}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {comment.reports && comment.reports.length > 0 && isAdmin && (
                <div className="mt-4">
                  <Separator />
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Reports:</p>
                    {comment.reports.map((report, index) => (
                      <div key={index} className="mt-1 text-sm">
                        <AlertCircle className="h-4 w-4 inline mr-2 text-yellow-500" />
                        {report.reason} - {report.reporter_id}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for reporting this comment:
              <Textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="mt-2"
                placeholder="Enter reason..."
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReport}>Report</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
