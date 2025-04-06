import { GlobalMatchingDialog } from "@/components/GlobalMatchingDialog";
import { ImportContactsDialog } from "@/components/ImportContactsDialog";
import { MatchedContactsList } from "@/components/MatchedContactsList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import brain from "brain";
import { Plus, AlertCircle, MessageCircle, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Contact } from "types";
import { toast } from "sonner";
import { ContactModerationIntegration } from "components/ContactModerationIntegration";

export default function ContactManagement() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [matches, setMatches] = useState<Contact[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isGlobalMatchingOpen, setIsGlobalMatchingOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchContacts = async () => {
    try {
      const response = await brain.list_contacts({ token: {} });
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      } else {
        setError("Failed to load contacts");
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("An error occurred while loading contacts");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await brain.get_contact_matches({ token: {} });
      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
      } else {
        setError("Failed to load matches");
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("An error occurred while loading matches");
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchMatches();
  }, []);

  const handleImportSuccess = () => {
    fetchContacts();
    fetchMatches();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contact Management</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsGlobalMatchingOpen(true)}
          >
            Global Matching Settings
          </Button>
          <Button onClick={() => setIsImportOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contacts
          </Button>
        </div>
      </div>

      <Tabs defaultValue="contacts" className="w-full">
        <TabsList>
          <TabsTrigger value="contacts">My Contacts</TabsTrigger>
          <TabsTrigger value="matches">Matched Contacts</TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>Moderation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-destructive">{error}</div>
              </CardContent>
            </Card>
          ) : contacts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No contacts yet. Click "Add Contacts" to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contacts.map((contact) => (
                <Card key={contact.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Email:</span>{" "}
                        {contact.email}
                      </div>
                      <div>
                        <span className="font-medium">Company:</span>{" "}
                        {contact.company}
                      </div>
                      <div>
                        <span className="font-medium">Role:</span>{" "}
                        {contact.role}
                      </div>
                      {contact.phone && (
                        <div>
                          <span className="font-medium">Phone:</span>{" "}
                          {contact.phone}
                        </div>
                      )}
                      {contact.notes && (
                        <div>
                          <span className="font-medium">Notes:</span>{" "}
                          {contact.notes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <MatchedContactsList 
            onMessageClick={(user) => {
              // Navigate to messages with this user
              navigate(`/Messages?userId=${encodeURIComponent(user.uid)}`);
            }} 
          />
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <ContactModerationIntegration 
            contacts={contacts}
            onContactFlagged={(contactId, reason) => {
              console.log(`Contact ${contactId} flagged for moderation: ${reason}`);
              // In a real app, we would call an API to flag this contact
              toast.success(`Contact flagged for moderation review`);
            }}
          />
        </TabsContent>
      </Tabs>

      <ImportContactsDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <GlobalMatchingDialog
        open={isGlobalMatchingOpen}
        onOpenChange={(open) => setIsGlobalMatchingOpen(open)}
      />
    </div>
  );
}
