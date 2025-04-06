import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Loader2, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  onSubmit: (content: string, attachments: File[]) => Promise<void>;
  initialContent?: string;
  placeholder?: string;
  submitLabel?: string;
  onCancel?: () => void;
  className?: string;
  maxLength?: number;
}

export function CommentEditor({
  onSubmit,
  initialContent = "",
  placeholder = "Write your comment...",
  submitLabel = "Submit",
  onCancel,
  className = "",
  maxLength = 10000,
}: Props) {
  const [content, setContent] = useState(initialContent);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("write");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Comment content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (content.length > maxLength) {
      toast({
        title: "Error",
        description: `Comment content must not exceed ${maxLength} characters`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(content, attachments);
      setContent("");
      setAttachments([]);
      setActiveTab("write");
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);

      // Limit total size to 10MB
      if (totalSize > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Total file size must not exceed 10MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file types (images, PDFs, common document formats)
      const allowedTypes = [
        "image/",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument",
        "text/",
      ];

      const invalidFiles = files.filter(
        (file) => !allowedTypes.some((type) => file.type.startsWith(type)),
      );

      if (invalidFiles.length > 0) {
        toast({
          title: "Error",
          description: "Some files have unsupported formats",
          variant: "destructive",
        });
        return;
      }

      setAttachments([...attachments, ...files]);
    },
    [attachments, toast],
  );

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <Card className={cn("p-4", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-2">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="min-h-[200px] w-full p-3 rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="text-sm text-muted-foreground">
            {content.length}/{maxLength} characters
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="min-h-[200px] p-3 rounded-md border border-input bg-muted/50">
            <div className="prose dark:prose-invert max-w-none">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">Nothing to preview</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Upload className="h-4 w-4" />
            Attach Files
          </Button>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <div className="text-sm text-muted-foreground">
            Max size: 10MB per file
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm"
              >
                <span>📎 {file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeAttachment(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
