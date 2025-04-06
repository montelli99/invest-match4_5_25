import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { validateFile, formatFileSize, FileValidationError } from "@/utils/fileValidation";

interface Props {
  receiverId: string;
  parentId?: string;  // ID of the message being replied to
  onMessageSent?: () => void;
  onCancelReply?: () => void;  // Called when user cancels reply
  isNewThread?: boolean;  // Whether this is a new thread
}

export function MessageInput({ receiverId, parentId, onMessageSent, onCancelReply, isNewThread }: Props) {
  const [content, setContent] = useState("");
  const [threadTitle, setThreadTitle] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const MAX_LENGTH = 5000;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle typing indicator
  const handleTyping = async () => {
    // Prevent unnecessary API calls
    if (content.length === 0) return;

    if (!isTyping) {
      setIsTyping(true);
      try {
        await brain.update_typing_indicator({
          request: {
            receiver_id: receiverId,
            is_typing: true
          },
          token: {}
        });
      } catch (error) {
        console.error("Error updating typing status:", error);
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      try {
        await brain.update_typing_indicator({
          request: {
            receiver_id: receiverId,
            is_typing: false
          },
          token: {}
        });
      } catch (error) {
        console.error("Error updating typing status:", error);
      }
    }, 2000);
  };

  const validateMessage = (text: string): boolean => {
    setError(null);
    
    if (!text.trim()) {
      setError("Message cannot be empty");
      return false;
    }
    
    if (text.length > MAX_LENGTH) {
      setError(`Message too long (max ${MAX_LENGTH} characters)`);
      return false;
    }
    
    // Check for repeated characters/words (spam)
    if (text.match(/([\S\s])\1{10,}/)) {
      setError("Message appears to be spam");
      return false;
    }
    
    return true;
  };

  const validateAndUploadFile = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      switch (validation.error) {
        case FileValidationError.TYPE_NOT_ALLOWED:
          throw new Error("File type not allowed. Please upload PDF, Word, Excel, PowerPoint, Text, or Image files.");
        case FileValidationError.SIZE_TOO_LARGE:
          throw new Error(`File too large. Maximum size is ${formatFileSize(10 * 1024 * 1024)}.`);
        case FileValidationError.EMPTY_FILE:
          throw new Error("File is empty.");
        default:
          throw new Error("Invalid file.");
      }
    }

    const response = await brain.upload_attachment({
      file: file
    });
    const data = await response.json() as { attachment_id: string };
    return data.attachment_id;
  };

  const handleSend = async () => {
    if (!validateMessage(content)) {
      toast({
        title: "Error",
        description: error || "Invalid message",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim() && !fileInputRef.current?.files?.length) {
      return;
    }

    setIsSending(true);

    try {
      let attachmentId: string | undefined;

      // Upload attachment if exists
      if (fileInputRef.current?.files?.length) {
        try {
          const file = fileInputRef.current.files[0];
          attachmentId = await validateAndUploadFile(file);
        } catch (error) {
          toast({
            title: "File Error",
            description: error instanceof Error ? error.message : "Failed to upload file",
            variant: "destructive",
          });
          return;
        }
      }

      // Send message with status tracking
      const response = await brain.send_message({
        request: {
          receiver_id: receiverId,
          content: content.trim(),
          attachment_id: attachmentId,
          parent_id: parentId,
          thread_title: isNewThread ? threadTitle : undefined
        },
        token: {}
      });
      const messageData = await response.json();
      
      // Update local message status
      if (messageData.id) {
        // The message has been sent successfully
        toast({
          title: "Message Status",
          description: "Message sent successfully",
        });
      }

      // Clear input
      setContent("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Notify parent
      onMessageSent?.();

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border-t">
      {isNewThread && (
        <Input
          value={threadTitle}
          onChange={(e) => setThreadTitle(e.target.value)}
          placeholder="Thread title (optional)"
          className="mb-4"
        />
      )}
      {parentId && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded">
          <span>Replying to message</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancelReply?.()}
          >
            Cancel
          </Button>
        </div>
      )}
      <Textarea
        value={content}
        onChange={(e) => {
          const newContent = e.target.value;
          setCharCount(newContent.length);
          setError(null);
          if (newContent.length > MAX_LENGTH) {
            setError(`Message too long (max ${MAX_LENGTH} characters)`);
          }
          setContent(newContent);
          setContent(e.target.value);
          handleTyping();
        }}
        placeholder="Type your message..."
        className="min-h-[100px]"
      />
      <div className="space-y-2">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-sm text-muted-foreground">{charCount}/{MAX_LENGTH} characters</p>
        <div className="flex items-center gap-4">
        <div className="flex flex-col gap-2">
          <Input 
            type="file" 
            ref={fileInputRef} 
            className="max-w-[200px]" 
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const validation = validateFile(file);
                if (!validation.isValid) {
                  toast({
                    title: "Invalid File",
                    description: validation.error,
                    variant: "destructive",
                  });
                  e.target.value = "";
                }
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Max size: 10MB. Allowed types: PDF, Word, Excel, PowerPoint, Text, Images
          </p>
        </div>
        <Button onClick={handleSend} disabled={isSending} className="ml-auto">
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
      </div>
    </div>
  );
}
