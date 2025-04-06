import React, { useState } from "react";
import { Contact } from "types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  contact: Contact | null;
  onClose: () => void;
  onTransfer: (newOwnerId: string, reason?: string) => Promise<void>;
}

export function OwnershipTransferDialog({ contact, onClose, onTransfer }: Props) {
  const [newOwnerId, setNewOwnerId] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    if (!newOwnerId.trim()) return;

    try {
      setIsLoading(true);
      await onTransfer(newOwnerId, reason);
      onClose();
    } catch (error) {
      console.error("Failed to transfer ownership:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!contact} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Contact Ownership</DialogTitle>
          <DialogDescription>
            Transfer ownership of {contact?.name} to another user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="newOwnerId" className="text-sm font-medium">
              New Owner ID
            </label>
            <Input
              id="newOwnerId"
              value={newOwnerId}
              onChange={(e) => setNewOwnerId(e.target.value)}
              placeholder="Enter user ID of new owner"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason for Transfer (Optional)
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you transferring ownership?"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={!newOwnerId.trim() || isLoading}>
            {isLoading ? "Transferring..." : "Transfer Ownership"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
