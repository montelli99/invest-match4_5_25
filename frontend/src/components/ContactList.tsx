import React, { useState } from "react";
import { Contact } from "types";
import { ContactCard } from "./ContactCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OwnershipTransferDialog } from "./OwnershipTransferDialog";
import { OwnershipHistoryDialog } from "./OwnershipHistoryDialog";

interface Props {
  contacts: Contact[];
  onTransferOwnership: (contactId: string, newOwnerId: string, reason?: string) => Promise<void>;
  onShareDocuments?: (contact: Contact) => void;
  onScheduleMeeting?: (contact: Contact) => void;
}

export function ContactList({ contacts, onTransferOwnership, onShareDocuments, onScheduleMeeting }: Props) {
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [viewingHistoryContact, setViewingHistoryContact] = useState<Contact | null>(null);

  // Filter contacts based on search and owner filter
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase()) ||
      contact.company?.toLowerCase().includes(search.toLowerCase()) ||
      false;

    const matchesOwner =
      ownerFilter === "all" ||
      (ownerFilter === "mine" && contact.owner_id === "current_user_id") ||
      (ownerFilter === "others" && contact.owner_id !== "current_user_id");

    return matchesSearch && matchesOwner;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Contacts</SelectItem>
            <SelectItem value="mine">My Contacts</SelectItem>
            <SelectItem value="others">Other Owners</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onTransferOwnership={() => setSelectedContact(contact)}
            onViewHistory={() => setViewingHistoryContact(contact)}
            onShareDocuments={onShareDocuments}
            onScheduleMeeting={onScheduleMeeting}
          />
        ))}
      </div>

      <OwnershipTransferDialog
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onTransfer={async (newOwnerId, reason) => {
          if (selectedContact) {
            await onTransferOwnership(selectedContact.id, newOwnerId, reason);
            setSelectedContact(null);
          }
        }}
      />

      <OwnershipHistoryDialog
        contact={viewingHistoryContact}
        onClose={() => setViewingHistoryContact(null)}
      />
    </div>
  );
}
