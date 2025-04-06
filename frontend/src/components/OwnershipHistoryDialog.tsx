import React from "react";
import { Contact } from "types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface Props {
  contact: Contact | null;
  onClose: () => void;
}

export function OwnershipHistoryDialog({ contact, onClose }: Props) {
  if (!contact) return null;

  return (
    <Dialog open={!!contact} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ownership History</DialogTitle>
          <DialogDescription>
            View the complete ownership history for {contact.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {/* Current Owner */}
            <div className="border-l-2 border-primary pl-4 relative">
              <div className="absolute w-2 h-2 bg-primary rounded-full -left-[5px] top-2" />
              <div className="space-y-1">
                <div className="font-semibold">{contact.owner_name}</div>
                <div className="text-sm text-muted-foreground">
                  Current Owner since{" "}
                  {format(new Date(contact.ownership_date), "PPP")}
                </div>
                <div className="text-sm">
                  {contact.owner_email && (
                    <div>Email: {contact.owner_email}</div>
                  )}
                  {contact.owner_phone && (
                    <div>Phone: {contact.owner_phone}</div>
                  )}
                </div>
              </div>
            </div>

            {/* History Entries */}
            {contact.ownership_history
              .slice()
              .reverse()
              .map((entry, index) => (
                <div
                  key={index}
                  className="border-l-2 border-muted pl-4 relative"
                >
                  <div className="absolute w-2 h-2 bg-muted rounded-full -left-[5px] top-2" />
                  <div className="space-y-1">
                    <div className="font-medium">
                      Transferred to {entry.new_owner_id}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(entry.change_date), "PPP")}
                    </div>
                    {entry.reason && (
                      <div className="text-sm bg-muted p-2 rounded-md">
                        Reason: {entry.reason}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Changed by: {entry.changed_by_id}
                    </div>
                    {entry.previous_owner_id && (
                      <div className="text-sm text-muted-foreground">
                        Previous owner: {entry.previous_owner_id}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
