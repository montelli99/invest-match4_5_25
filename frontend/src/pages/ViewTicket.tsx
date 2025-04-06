import { Badge } from "@/components/ui/badge";
import { TicketTimeline } from "@/components/TicketTimeline";
import { CommentThread } from "@/components/CommentThread";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import brain from "brain";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Ticket, TicketStatus, Comment } from "types";

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

export default function ViewTicket() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("id");

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [priorityUpdating, setPriorityUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Fetch ticket details
  const fetchTicket = async () => {
    if (!ticketId) return;

    try {
      setLoading(true);
      const response = await brain.get_ticket(
        { ticketId },
        {}
      );
      const data = await response.json();
      setTicket(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching ticket:", err);
      setError("Failed to load ticket details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchComments();
  }, [ticketId]);

  // Fetch comments
  const fetchComments = async () => {
    if (!ticketId) return;

    try {
      const response = await brain.list_comments({ ticketId });
      const data = await response.json();
      setComments(data.comments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    }
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!ticketId || !newComment.trim()) return;

    setCommentLoading(true);
    setError(null);

    try {
      const response = await brain.create_comment({
        ticket_id: ticketId,
        content: newComment,
      });
      const data = await response.json();

      // Add new comment to the list
      setComments((prev) => [...prev, data]);
      setNewComment(""); // Clear input
    } catch (err) {
      console.error("Error creating comment:", err);
      setError("Failed to post comment");
    } finally {
      setCommentLoading(false);
    }
  };

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

  // Handle status update
  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    if (!ticket || !ticketId) return;

    try {
      setUpdating(true);
      const response = await brain.update_ticket(
        { ticketId },
        { updates: { status: newStatus }, token: {} }
      );
      const updatedTicket = await response.json();
      setTicket(updatedTicket);
      setError(null);
    } catch (err) {
      console.error("Error updating ticket:", err);
      setError("Failed to update ticket status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityUpdate = async (newPriority: string) => {
    if (!ticket || !ticketId) return;

    try {
      setPriorityUpdating(true);
      const response = await brain.update_ticket(
        { ticketId },
        { updates: { priority: newPriority }, token: {} }
      );
      const updatedTicket = await response.json();
      setTicket(updatedTicket);
      setError(null);
    } catch (err) {
      console.error("Error updating ticket priority:", err);
      setError("Failed to update ticket priority. Please try again.");
    } finally {
      setPriorityUpdating(false);
    }
  };

  const handleBack = () => {
    // Check if we're coming from the admin dashboard
    const isFromAdmin = document.referrer.includes('AdminDashboard');
    navigate(isFromAdmin ? "/AdminDashboard?tab=support" : "/TicketList");
  };

  if (!ticketId) {
    return (
      <div className="container mx-auto p-6">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">No ticket ID provided.</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
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

  if (!ticket) {
    return (
      <div className="container mx-auto p-6">
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Notice: </strong>
          <span className="block sm:inline">Ticket not found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={handleBack} className="mr-4">
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Ticket Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{ticket.title}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">#{ticket.id}</p>
            </div>
            <div className="flex gap-2">
              <Select
                value={ticket.priority}
                onValueChange={handlePriorityUpdate}
                disabled={priorityUpdating}
              >
                <SelectTrigger
                  className={`w-[180px] ${priorityColors[ticket.priority]} text-white`}
                >
                  <SelectValue placeholder="Update priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={ticket.status}
                onValueChange={handleStatusUpdate}
                disabled={updating}
              >
                <SelectTrigger
                  className={`w-[180px] ${statusColors[ticket.status]} text-white`}
                >
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Details</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Created</dt>
                    <dd>{formatDate(ticket.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Last Updated</dt>
                    <dd>{formatDate(ticket.updated_at)}</dd>
                  </div>
                  {ticket.assigned_to && (
                    <div>
                      <dt className="text-sm text-gray-500">Assigned To</dt>
                      <dd>{ticket.assigned_to}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {ticket.attachments && ticket.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ticket.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        {attachment.content_type?.startsWith("image/") ? (
                          <img
                            src={attachment.url}
                            alt={attachment.filename}
                            className="max-w-full h-auto rounded-md"
                          />
                        ) : (
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">📎</span>
                            <div>
                              <p className="font-medium">{attachment.filename}</p>
                              <p className="text-sm text-gray-500">
                                {Math.round(attachment.size / 1024)}KB
                              </p>
                            </div>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(attachment.url, "_blank")}
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {ticket.resolution && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Resolution</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {ticket.resolution}
                  </p>
                </div>
              </>
            )}
          </div>

          <Separator className="my-8" />

          {/* Timeline Section */}
          <TicketTimeline ticket={ticket} comments={comments} />

          <Separator className="my-8" />

          {/* Comments Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Comments</h3>
            
            {comments.length === 0 ? (
              <p className="text-gray-500 italic">No comments yet</p>
            ) : (
              <CommentThread comments={comments} />
            )}

            {/* New Comment Form */}
            <div className="mt-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment... (Supports markdown formatting)"
                className="min-h-[100px] w-full p-3 rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">
                  Supports markdown: **bold**, *italic*, `code`, # headers, - lists
                </p>
                <Button
                  onClick={handleSubmitComment}
                  disabled={commentLoading || !newComment.trim()}
                >
                  {commentLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
