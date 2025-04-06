import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit, Mail, Phone, Trash } from "lucide-react";

interface Contact {
  name: string;
  email: string;
  company: string;
  role?: string;
  notes?: string;
}

interface Match {
  name: string;
  company: string;
  matchScore: number;
  matchReasons: string[];
}

interface ContactDetailProps {
  contact: Contact;
  matches: Match[];
  onEdit: () => void;
  onDelete: () => void;
}

export function ContactDetail({ contact, matches, onEdit, onDelete }: ContactDetailProps) {
  const getRoleDisplay = (role?: string) => {
    if (!role) return "";
    switch (role) {
      case "fund_manager":
        return "Fund Manager";
      case "limited_partner":
        return "Limited Partner";
      case "capital_raiser":
        return "Capital Raiser";
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{contact.name}</CardTitle>
              <CardDescription>{contact.company}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={onDelete} className="text-destructive">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">Role</div>
                <div>{getRoleDisplay(contact.role) || "Not specified"}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Contact Information</div>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                    {contact.email}
                  </a>
                </div>
                {contact.role && (
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">Not provided</span>
                  </div>
                )}
              </div>
            </div>
            {contact.notes && (
              <div>
                <div className="text-sm font-medium mb-1">Notes</div>
                <div className="text-sm text-muted-foreground">{contact.notes}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Potential Matches</CardTitle>
          <CardDescription>
            Contacts who might be good connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No potential matches found
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="font-medium">{match.name}</div>
                      <div className="text-sm text-muted-foreground">{match.company}</div>
                    </div>
                    <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
                      {match.matchScore}% Match
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Why they match:</div>
                    <ul className="text-sm text-muted-foreground">
                      {match.matchReasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm">
                      Request Introduction
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
