import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthWrapper";
import brain from "brain";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PatternTester } from "./PatternTester";

interface ContentRule {
  id: string;
  type: "profile" | "message";
  pattern: string;
  action: string;
  severity: string;
  created_by: string;
  is_active: boolean;
  priority: "low" | "medium" | "high" | "critical";
  category: "spam" | "harassment" | "fraud" | "inappropriate" | "custom";
  description?: string;
  last_matched?: string;
  match_count: number;
  false_positive_count: number;
}

interface ModAction {
  report_id: string;
  action_type: string;
  performed_by: string;
  timestamp: string;
  notes?: string;
}

interface Report {
  id: string;
  type: "profile" | "message";
  content: string;
  reported_by: string;
  status: "pending" | "reviewed" | "resolved";
  timestamp: string;
}

export const ContentModeration = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [rules, setRules] = useState<ContentRule[]>([]);
  const [actions, setActions] = useState<ModAction[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "reviewed" | "resolved" | "rules" | "actions">("pending");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await brain.get_content_rules({
        token: {
          idToken: await user?.getIdToken()
        }
      });
      const data = await response.json();
      setRules(data.rules);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load content rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActions = async (reportId?: string) => {
    try {
      setLoading(true);
      const response = await brain.get_moderation_actions({
        token: {
          idToken: await user?.getIdToken()
        },
        report_id: reportId
      });
      const data = await response.json();
      setActions(data.actions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load moderation actions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await brain.get_content_reports({
        token: {
          idToken: await user?.getIdToken()
        },
        status: activeTab as "pending" | "reviewed" | "resolved"
      });
      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: Report["status"]) => {
    try {
      await brain.update_report_status({
        report_id: reportId,
        new_status: newStatus,
        token: {
          idToken: await user?.getIdToken()
        }
      });
      toast({
        title: "Success",
        description: "Report status updated successfully",
      });
      loadReports();
      loadRules();
      loadActions(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
    }
  };

  const addRule = async (rule: Pick<ContentRule, "type" | "pattern" | "action" | "severity" | "is_active" | "priority" | "category" | "description">) => {
    try {
      await brain.add_content_rule({
        ...rule,
        // id and created_by will be generated on the server
        created_by: user?.uid || "",
        token: {
          idToken: await user?.getIdToken()
        }
      });
      toast({
        title: "Success",
        description: "Content rule added successfully",
      });
      loadRules();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add content rule",
        variant: "destructive",
      });
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<ContentRule>) => {
    try {
      await brain.update_content_rule({
        rule_id: ruleId,
        updates,
        token: {
          idToken: await user?.getIdToken()
        }
      });
      toast({
        title: "Success",
        description: "Content rule updated successfully",
      });
      loadRules();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update content rule",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user, activeTab]);

  const filteredReports = reports.filter(
    (report) => report.status === activeTab
  );

  // Remove demo data
  /*const DEMO_REPORTS: Report[] = [
  {
    id: "1",
    type: "profile",
    content: "Suspicious investment claims",
    reportedBy: "user123",
    status: "pending",
    timestamp: "2024-03-07T14:30:00Z",
  },
  {
    id: "2",
    type: "message",
    content: "Inappropriate content",
    reportedBy: "user456",
    status: "reviewed",
    timestamp: "2024-03-07T13:45:00Z",
  },
];*/







  const [newRule, setNewRule] = useState<Partial<ContentRule>>({
    type: "profile",
    pattern: "",
    action: "flag",
    severity: "medium",
    is_active: true,
    priority: "medium",
    category: "custom",
    description: ""
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddRule = async () => {
    if (!newRule.pattern) {
      toast({
        title: "Error",
        description: "Pattern is required",
        variant: "destructive",
      });
      return;
    }

    await addRule(newRule as Required<Pick<ContentRule, "type" | "pattern" | "action" | "severity" | "is_active" | "priority" | "category" | "description">>);
    setShowAddDialog(false);
    setNewRule({
      type: "profile",
      pattern: "",
      action: "flag",
      severity: "medium",
      is_active: true,
      priority: "medium",
      category: "custom",
      description: ""
    });
  };

  const renderRules = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Content Rules</h3>
        <Button
          variant="outline"
          onClick={() => setShowAddDialog(true)}
        >
          Add Rule
        </Button>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Content Rule</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select
                value={newRule.type}
                onValueChange={(value: "profile" | "message") => setNewRule({ ...newRule, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">Priority</Label>
              <Select
                value={newRule.priority}
                onValueChange={(value: ContentRule["priority"]) => setNewRule({ ...newRule, priority: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select
                value={newRule.category}
                onValueChange={(value: ContentRule["category"]) => setNewRule({ ...newRule, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="action" className="text-right">Action</Label>
              <Input
                id="action"
                value={newRule.action}
                onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="severity" className="text-right">Severity</Label>
              <Input
                id="severity"
                value={newRule.severity}
                onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="col-span-4">
              <Label>Pattern Tester</Label>
              <div className="mt-2">
                <PatternTester
                  initialPattern={newRule.pattern}
                  onValidPattern={(pattern) => setNewRule({ ...newRule, pattern })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddRule}>Add Rule</Button>
          </div>
        </DialogContent>
      </Dialog>

      {rules.map((rule) => (
        <Card key={rule.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)} Rule
            </CardTitle>
            <CardDescription>
              Created by {rule.created_by}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold">Pattern: </span>
                    {rule.pattern}
                  </div>
                  <div>
                    <span className="font-semibold">Priority: </span>
                    <Badge variant={{
                      low: "secondary",
                      medium: "default",
                      high: "warning",
                      critical: "destructive"
                    }[rule.priority]}>
                      {rule.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-semibold">Category: </span>
                    {rule.category}
                  </div>
                  <div>
                    <span className="font-semibold">Matches: </span>
                    {rule.match_count} ({rule.false_positive_count} false positives)
                  </div>
                </div>
                <Badge variant={rule.is_active ? "default" : "secondary"}>
                  {rule.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <span className="font-semibold">Action: </span>
                {rule.action}
              </div>
              <div>
                <span className="font-semibold">Severity: </span>
                {rule.severity}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateRule(rule.id, { is_active: !rule.is_active })}
                >
                  {rule.is_active ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Open dialog to edit rule
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderActions = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Moderation Actions</h3>
      {actions.map((action) => (
        <Card key={`${action.report_id}-${action.timestamp}`}>
          <CardHeader>
            <CardTitle className="text-lg">{action.action_type}</CardTitle>
            <CardDescription>
              Performed by {action.performed_by} on{" "}
              {new Date(action.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Report ID: </span>
                {action.report_id}
              </div>
              {action.notes && (
                <div>
                  <span className="font-semibold">Notes: </span>
                  {action.notes}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Moderation</h2>
        <Button variant="outline" onClick={loadReports} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="pending" className="flex-1">
            Pending
            <Badge variant="secondary" className="ml-2">
              {reports.filter((r) => r.status === "pending").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rules">
            Rules
            <Badge variant="secondary" className="ml-2">
              {rules.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="flex-1">
            Reviewed
            <Badge variant="secondary" className="ml-2">
              {reports.filter((r) => r.status === "reviewed").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="actions">
            Actions
            <Badge variant="secondary" className="ml-2">
              {actions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex-1">
            Resolved
            <Badge variant="secondary" className="ml-2">
              {reports.filter((r) => r.status === "resolved").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          {renderRules()}
        </TabsContent>

        <TabsContent value="actions">
          {renderActions()}
        </TabsContent>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {report.type.charAt(0).toUpperCase() + report.type.slice(1)}{" "}
                  Report
                </CardTitle>
                <CardDescription>
                  Reported by {report.reported_by} on{" "}
                  {new Date(report.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{report.content}</p>
                <div className="flex space-x-2">
                  {report.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleUpdateStatus(report.id, "reviewed")
                        }
                      >
                        Mark as Reviewed
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleUpdateStatus(report.id, "resolved")
                        }
                      >
                        Resolve
                      </Button>
                    </>
                  )}
                  {report.status === "reviewed" && (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(report.id, "resolved")}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
