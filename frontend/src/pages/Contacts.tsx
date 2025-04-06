import { useState, useEffect } from "react";
import { authedBrain as brain } from "@/components/AuthWrapper";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactList } from "components/ContactList";
import { ImportContactsDialog } from "components/ImportContactsDialog";
import { ContactMatchingSettings } from "components/ContactMatchingSettings";
import { ContactMatches } from "components/ContactMatches";
import { DocumentSharing } from "components/DocumentSharing";
import { MeetingScheduler } from "components/MeetingScheduler";
import { Contact } from "types";
import { Loader2, UserPlus, UsersRound, CircleSlash } from "lucide-react";
import { toast } from "sonner";
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



export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDocumentSharing, setShowDocumentSharing] = useState(false);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      // This would be an actual API call
      // const response = await brain.list_contacts();
      // const data = await response.json();
      // setContacts(data.contacts);
      
      // Mock data for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      setContacts([
        {
          id: "contact-1",
          name: "John Doe",
          email: "john.doe@example.com",
          company: "Acme Ventures",
          role: "Fund Manager",
          phone: "+1 (555) 123-4567",
          owner_id: "current_user_id",
          owner_name: "Current User",
          owner_email: "current.user@example.com",
          ownership_date: new Date(2024, 9, 1).toISOString(),
          last_updated: new Date(2024, 9, 15).toISOString()
        },
        {
          id: "contact-2",
          name: "Jane Smith",
          email: "jane.smith@example.com",
          company: "Capital Partners",
          role: "Limited Partner",
          phone: "+1 (555) 987-6543",
          owner_id: "current_user_id",
          owner_name: "Current User",
          owner_email: "current.user@example.com",
          ownership_date: new Date(2024, 8, 15).toISOString(),
          last_updated: new Date(2024, 9, 10).toISOString()
        },
        {
          id: "contact-3",
          name: "Robert Johnson",
          email: "robert.j@example.com",
          company: "Growth Equity LLC",
          role: "Capital Raiser",
          phone: "+1 (555) 456-7890",
          owner_id: "user_2",
          owner_name: "Alex Wilson",
          owner_email: "alex.w@example.com",
          ownership_date: new Date(2024, 7, 20).toISOString(),
          last_updated: new Date(2024, 9, 5).toISOString()
        },
      ]);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleImportSuccess = () => {
    toast.success("Contacts imported successfully");
    fetchContacts();
  };

  const handleDeleteContact = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedContact) {
      // This would call the API
      // Delete the contact
      setContacts(contacts.filter(c => c.id !== selectedContact.id));
    }
    setIsDeleteDialogOpen(false);
  };

  const handleTransferOwnership = async (contactId: string, newOwnerId: string, reason?: string) => {
    try {
      // This would be an actual API call
      // const response = await brain.transfer_ownership({ contactId, newOwnerId, reason });
      
      // Mock for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Ownership transferred successfully");
      fetchContacts();
    } catch (error) {
      console.error("Error transferring ownership:", error);
      toast.error("Failed to transfer ownership");
    }
  };

  const handleShareDocuments = (contact: Contact) => {
    setSelectedRecipient({
      uid: contact.id,
      display_name: contact.name,
      company_name: contact.company,
    });
    setShowDocumentSharing(true);
  };

  const handleScheduleMeeting = (contact: Contact) => {
    setSelectedRecipient({
      uid: contact.id,
      display_name: contact.name,
      company_name: contact.company,
    });
    setShowMeetingScheduler(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Contacts</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowImportDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Import Contacts
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all-contacts" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="all-contacts">All Contacts</TabsTrigger>
          <TabsTrigger value="global-matches">Global Matches</TabsTrigger>
          <TabsTrigger value="pending-intros">Pending Intros</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-contacts" className="mt-6">
          {contacts.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <CircleSlash className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No contacts yet</h3>
              <p className="text-muted-foreground mb-4">Import your first contacts to get started</p>
              <Button onClick={() => setShowImportDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Import Contacts
              </Button>
            </div>
          ) : (
            <ContactList 
              contacts={contacts} 
              onTransferOwnership={handleTransferOwnership}
              onShareDocuments={handleShareDocuments}
              onScheduleMeeting={handleScheduleMeeting} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="global-matches" className="mt-6">
          <ContactMatches />
        </TabsContent>
        
        <TabsContent value="pending-intros" className="mt-6">
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <UsersRound className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No pending introductions</h3>
            <p className="text-muted-foreground mb-4">When you request or receive introductions, they will appear here</p>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <div className="max-w-2xl mx-auto">
            <ContactMatchingSettings />
          </div>
        </TabsContent>
      </Tabs>

      <ImportContactsDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportSuccess={handleImportSuccess}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedRecipient && (
        <>
          <DocumentSharing
            isOpen={showDocumentSharing}
            onClose={() => setShowDocumentSharing(false)}
            recipient={selectedRecipient}
          />
          
          <MeetingScheduler
            isOpen={showMeetingScheduler}
            onClose={() => setShowMeetingScheduler(false)}
            recipient={selectedRecipient}
          />
        </>
      )}
    </div>
  );
}
