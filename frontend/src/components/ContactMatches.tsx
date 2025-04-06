import { useState, useEffect } from "react";
import { authedBrain as brain } from "@/components/AuthWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, Mail, Building, Briefcase, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { MessageDialog } from "./MessageDialog";

interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  phone?: string;
  owner_id: string;
  owner_name: string;
  owner_email?: string;
  owner_phone?: string;
  ownership_date: string;
  last_updated: string;
  match_score?: number;
}

interface MatchedFields {
  company: string | false;
  role: string | false;
  industry: string | false;
  [key: string]: any;
}

interface ContactMatch {
  contact: Contact;
  match_score: number;
  matched_fields: MatchedFields;
}

interface ContactMatchesResponse {
  matches: ContactMatch[];
  total: number;
}

export function ContactMatches() {
  const [matches, setMatches] = useState<ContactMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await brain.get_global_matches();
      
      if (response.ok) {
        const data: ContactMatchesResponse = await response.json();
        setMatches(data.matches);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load contact matches");
    } finally {
      setLoading(false);
    }
  };

  const handleMessageContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowMessageDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Global Contact Matches</CardTitle>
          <CardDescription>
            Find potential matches for your contacts across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No matches found yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Enable global matching in settings to find potential matches for your contacts.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Global Contact Matches</CardTitle>
          <CardDescription>
            {total} potential matches found for your contacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.map((match) => (
              <Card key={match.contact.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{match.contact.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Mail className="h-3 w-3" />
                          <span>{match.contact.email}</span>
                        </div>
                      </div>
                      <Badge className="ml-2" variant="outline">
                        {match.match_score}% Match
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                      {match.contact.company && (
                        <div className="flex items-center gap-1 text-sm">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{match.contact.company}</span>
                          {match.matched_fields.company && (
                            <Badge variant="secondary" className="ml-1 text-xs">Match</Badge>
                          )}
                        </div>
                      )}
                      
                      {match.contact.role && (
                        <div className="flex items-center gap-1 text-sm">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{match.contact.role}</span>
                          {match.matched_fields.role && (
                            <Badge variant="secondary" className="ml-1 text-xs">Match</Badge>
                          )}
                        </div>
                      )}
                      
                      {match.contact.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{match.contact.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button variant="link" className="p-0 h-auto text-sm mt-2">
                          Contact owner: {match.contact.owner_name}
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-semibold">Contact Owner</h4>
                          <div className="text-sm">
                            <p className="font-medium">{match.contact.owner_name}</p>
                            {match.contact.owner_email && (
                              <div className="flex items-center gap-1 mt-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{match.contact.owner_email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  
                  <div className="border-t md:border-t-0 md:border-l p-4 bg-muted/20 flex flex-col justify-center items-center gap-2">
                    <Button 
                      onClick={() => handleMessageContact(match.contact)}
                      className="w-full"
                      variant="outline"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    
                    <Button 
                      className="w-full"
                      variant="secondary"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedContact && (
        <MessageDialog
          isOpen={showMessageDialog}
          onClose={() => setShowMessageDialog(false)}
          otherUser={{
            uid: selectedContact.owner_id,
            display_name: selectedContact.owner_name,
            company_name: selectedContact.company,
          }}
        />
      )}
    </>
  );
}
