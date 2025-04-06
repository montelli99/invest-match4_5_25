import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import React, { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  userId: string;
}

export function ShareDocumentDialog({
  isOpen,
  onClose,
  documentId,
  userId,
}: Props) {
  const [emails, setEmails] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!emails.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one email address",
        variant: "destructive",
      });
      return;
    }

    const emailList = emails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    try {
      setIsSharing(true);
      await brain.share_document_with_users({
        document_id: documentId,
        user_id: userId,
        shared_with: emailList,
      });

      toast({
        title: "Success",
        description: "Document shared successfully",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share document",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Enter email addresses of users you want to share this document with.
            Separate multiple emails with commas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="emails">Email Addresses</Label>
            <Input
              id="emails"
              placeholder="user@example.com, another@example.com"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isSharing}>
            {isSharing ? "Sharing..." : "Share"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
