import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle, CheckCircle, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Contact } from "types";

// Risk severity levels for contact moderation
enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Risk assessment for a contact
interface ContactRiskAssessment {
  contactId: string;
  riskLevel: RiskLevel;
  riskScore: number;
  flaggedFields: Array<{
    field: string;
    reason: string;
    pattern: string;
  }>;
  moderationStatus: "pending" | "approved" | "rejected";
  lastAssessment: string; // ISO date string
}

export interface Props {
  contacts: Contact[];
  onContactFlagged?: (contactId: string, reason: string) => void;
}

/**
 * ContactModerationIntegration component
 * 
 * This component integrates contact management with the moderation system,
 * allowing administrators to apply content rules and risk assessment to contacts.
 */
export function ContactModerationIntegration({ contacts, onContactFlagged }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState("risk");

  // Mock risk assessments - in a real app, these would come from an API call
  const riskAssessments: Record<string, ContactRiskAssessment> = {
    // Mock data for demonstration
    "contact-1": {
      contactId: "contact-1",
      riskLevel: RiskLevel.MEDIUM,
      riskScore: 65,
      flaggedFields: [
        {
          field: "company",
          reason: "Possible suspicious entity",
          pattern: "\\b(offshore|shell)\\b"
        },
        {
          field: "notes",
          reason: "Contains sensitive financial terminology",
          pattern: "\\b(laundering|evade|circumvent)\\b"
        }
      ],
      moderationStatus: "pending",
      lastAssessment: new Date().toISOString()
    },
    "contact-2": {
      contactId: "contact-2",
      riskLevel: RiskLevel.LOW,
      riskScore: 25,
      flaggedFields: [],
      moderationStatus: "approved",
      lastAssessment: new Date().toISOString()
    }
  };

  // Count contacts by risk level
  const riskCounts = {
    total: contacts.length,
    flagged: Object.keys(riskAssessments).length,
    byLevel: {
      low: Object.values(riskAssessments).filter(r => r.riskLevel === RiskLevel.LOW).length,
      medium: Object.values(riskAssessments).filter(r => r.riskLevel === RiskLevel.MEDIUM).length,
      high: Object.values(riskAssessments).filter(r => r.riskLevel === RiskLevel.HIGH).length,
      critical: Object.values(riskAssessments).filter(r => r.riskLevel === RiskLevel.CRITICAL).length,
    }
  };

  // Handle contact selection
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDialogOpen(true);
  };

  // Get risk level badge
  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.CRITICAL:
        return <Badge variant="destructive">Critical Risk</Badge>;
      case RiskLevel.HIGH:
        return <Badge variant="destructive" className="bg-orange-500">High Risk</Badge>;
      case RiskLevel.MEDIUM:
        return <Badge variant="warning">Medium Risk</Badge>;
      case RiskLevel.LOW:
        return <Badge variant="secondary">Low Risk</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Flag contact for moderation review
  const flagContact = (contactId: string, reason: string) => {
    if (onContactFlagged) {
      onContactFlagged(contactId, reason);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Contact Moderation</CardTitle>
              <CardDescription>
                Apply content rules and risk assessment to contacts
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-muted/40">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{riskCounts.flagged}</div>
                <p className="text-sm text-muted-foreground">Flagged Contacts</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-950/20">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{riskCounts.byLevel.low}</div>
                <p className="text-sm text-muted-foreground">Low Risk</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{riskCounts.byLevel.medium + riskCounts.byLevel.high}</div>
                <p className="text-sm text-muted-foreground">Medium/High Risk</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-950/20">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{riskCounts.byLevel.critical}</div>
                <p className="text-sm text-muted-foreground">Critical Risk</p>
              </CardContent>
            </Card>
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/60">
                <tr>
                  <th scope="col" className="px-6 py-3">Contact</th>
                  <th scope="col" className="px-6 py-3">Risk Level</th>
                  <th scope="col" className="px-6 py-3">Flagged Fields</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.slice(0, 5).map((contact, index) => {
                  const risk = riskAssessments[`contact-${index + 1}`] || null;
                  
                  return (
                    <tr key={contact.id || index} className="border-b hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-muted-foreground text-xs">{contact.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {risk ? getRiskBadge(risk.riskLevel) : <Badge variant="outline">Not Assessed</Badge>}
                      </td>
                      <td className="px-6 py-4">
                        {risk?.flaggedFields.length || 0}
                      </td>
                      <td className="px-6 py-4">
                        {risk ? (
                          risk.moderationStatus === "approved" ? (
                            <span className="inline-flex items-center text-green-600">
                              <CheckCircle className="mr-1 h-4 w-4" /> Approved
                            </span>
                          ) : risk.moderationStatus === "rejected" ? (
                            <span className="inline-flex items-center text-red-600">
                              <AlertCircle className="mr-1 h-4 w-4" /> Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-amber-600">
                              <AlertCircle className="mr-1 h-4 w-4" /> Pending
                            </span>
                          )
                        ) : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleContactSelect(contact)}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Export Report</Button>
          <Button onClick={() => window.location.href = "/AdminDashboard?tab=enhanced-moderation"}>
            <Shield className="mr-2 h-4 w-4" />
            Open Full Dashboard
          </Button>
        </CardFooter>
      </Card>

      {/* Contact Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Contact Review</DialogTitle>
            <DialogDescription>
              Review contact information and moderation status
            </DialogDescription>
          </DialogHeader>

          {selectedContact && (
            <Tabs defaultValue="risk" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
                <TabsTrigger value="details">Contact Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="risk" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Risk Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {riskAssessments[`contact-1`]?.riskScore || "N/A"}
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ 
                            width: `${riskAssessments[`contact-1`]?.riskScore || 0}%`,
                            backgroundColor: riskAssessments[`contact-1`]?.riskLevel === RiskLevel.CRITICAL 
                              ? 'rgb(239, 68, 68)' 
                              : riskAssessments[`contact-1`]?.riskLevel === RiskLevel.HIGH 
                                ? 'rgb(249, 115, 22)'
                                : riskAssessments[`contact-1`]?.riskLevel === RiskLevel.MEDIUM
                                  ? 'rgb(234, 179, 8)'
                                  : 'rgb(34, 197, 94)'
                          }} 
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-medium">
                        {riskAssessments[`contact-1`]?.moderationStatus === "approved" ? (
                          <span className="inline-flex items-center text-green-600">
                            <CheckCircle className="mr-2 h-5 w-5" /> Approved
                          </span>
                        ) : riskAssessments[`contact-1`]?.moderationStatus === "rejected" ? (
                          <span className="inline-flex items-center text-red-600">
                            <AlertCircle className="mr-2 h-5 w-5" /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-600">
                            <AlertCircle className="mr-2 h-5 w-5" /> Pending Review
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Last assessed: {new Date(riskAssessments[`contact-1`]?.lastAssessment || Date.now()).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Flagged Content</CardTitle>
                    <CardDescription>
                      Fields that triggered content rules
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {riskAssessments[`contact-1`]?.flaggedFields.length ? (
                      <div className="space-y-4">
                        {riskAssessments[`contact-1`].flaggedFields.map((field, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between">
                              <div className="font-medium">{field.field}</div>
                              <Badge variant="outline">{field.pattern}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{field.reason}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No flagged content</p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button 
                    variant="destructive"
                    onClick={() => flagContact(selectedContact.id, "Manually flagged for review")}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Flag for Review
                  </Button>
                  <Button variant="default">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Contact
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                        <dd className="mt-1">{selectedContact.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                        <dd className="mt-1">{selectedContact.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Company</dt>
                        <dd className="mt-1">{selectedContact.company || "N/A"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                        <dd className="mt-1">{selectedContact.role || "N/A"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                        <dd className="mt-1">{selectedContact.phone || "N/A"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Investment Focus</dt>
                        <dd className="mt-1">
                          {selectedContact.investment_focus?.length 
                            ? selectedContact.investment_focus.join(", ")
                            : "N/A"}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                        <dd className="mt-1">{selectedContact.notes || "No notes available"}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Moderation History</CardTitle>
                    <CardDescription>
                      Record of moderation actions for this contact
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="font-medium">Initial Assessment</div>
                        <p className="text-sm text-muted-foreground">
                          Contact scored 65/100 - Medium risk
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(Date.now() - 86400000).toLocaleString()}
                        </p>
                      </div>
                      <div className="border-l-4 border-amber-500 pl-4 py-2">
                        <div className="font-medium">Flagged for Review</div>
                        <p className="text-sm text-muted-foreground">
                          2 fields triggered content rules
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(Date.now() - 43200000).toLocaleString()}
                        </p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="font-medium">Moderation Review Pending</div>
                        <p className="text-sm text-muted-foreground">
                          Contact awaiting manual review
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(Date.now() - 3600000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
