import React from "react";
import { Contact } from "types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { CalendarDays, Mail, Phone, User } from "lucide-react";

interface Props {
  contact: Contact;
  onTransferOwnership: (contact: Contact) => void;
  onViewHistory: (contact: Contact) => void;
  onShareDocuments?: (contact: Contact) => void;
  onScheduleMeeting?: (contact: Contact) => void;
}

export function ContactCard({ contact, onTransferOwnership, onViewHistory }: Props) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{contact.name}</span>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Badge 
                variant={contact.owner_id ? "default" : "secondary"}
                className="cursor-help"
              >
                {contact.owner_name || "Unassigned"}
              </Badge>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Owner Details</h4>
                  <div className="flex items-center pt-2">
                    <User className="mr-2 h-4 w-4 opacity-70" />
                    <span className="text-sm text-muted-foreground">
                      {contact.owner_name}
                    </span>
                  </div>
                  {contact.owner_email && (
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 opacity-70" />
                      <span className="text-sm text-muted-foreground">
                        {contact.owner_email}
                      </span>
                    </div>
                  )}
                  {contact.owner_phone && (
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 opacity-70" />
                      <span className="text-sm text-muted-foreground">
                        {contact.owner_phone}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                    <span className="text-sm text-muted-foreground">
                      Owner for {formatDistanceToNow(new Date(contact.ownership_date))}
                    </span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="font-semibold">Email:</span> {contact.email}
        </div>
        {contact.company && (
          <div>
            <span className="font-semibold">Company:</span> {contact.company}
          </div>
        )}
        {contact.role && (
          <div>
            <span className="font-semibold">Role:</span> {contact.role}
          </div>
        )}
        {contact.phone && (
          <div>
            <span className="font-semibold">Phone:</span> {contact.phone}
          </div>
        )}
        <div className="text-sm text-muted-foreground">
          Last updated {formatDistanceToNow(new Date(contact.last_updated))} ago
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => onTransferOwnership(contact)}
          className="flex-1"
          size="sm"
        >
          Transfer Ownership
        </Button>
        <Button
          variant="secondary"
          onClick={() => onViewHistory(contact)}
          className="flex-1"
          size="sm"
        >
          View History
        </Button>
        {onShareDocuments && (
          <Button
            variant="outline"
            onClick={() => onShareDocuments(contact)}
            className="flex-1"
            size="sm"
          >
            Share Documents
          </Button>
        )}
        {onScheduleMeeting && (
          <Button
            variant="outline"
            onClick={() => onScheduleMeeting(contact)}
            className="flex-1"
            size="sm"
          >
            Schedule Meeting
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
