import { useAuth } from "@/components/AuthWrapper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import brain from "brain";
import { useState } from "react";

interface Props {
  ticketId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CommentForm({
  ticketId,
  parentId,
  onSuccess,
  onCancel,
}: Props) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      await brain.create_comment({
        body: {
          ticket_id: ticketId,
          content: content.trim(),
          parent_id: parentId,
        },
      });
      setContent("");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
          >
            {submitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
