import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Clock,
  Shield,
  FileText,
  Trash2,
  Save,
  Plus,
  Archive,
  History,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Calendar,
  BarChart,
  Filter,
  Play
} from "lucide-react";

/**
 * Props for RetentionPolicyManager component
 */
interface Props {
  token: { idToken: string };
}

/**
 * ContentType enum for different types of content
 */
enum ContentType {
  MESSAGES = "messages",
  PROFILES = "profiles",
  REPORTS = "reports",
  DOCUMENTS = "documents",
  ANALYTICS = "analytics"
}

/**
 * ComplianceCategory enum for compliance categories
 */
enum ComplianceCategory {
  STANDARD = "standard",
  SENSITIVE = "sensitive",
  CONFIDENTIAL = "confidential",
  REGULATED = "regulated",
  EXEMPT = "exempt"
}

/**
 * RetentionAction enum for retention actions
 */
enum RetentionAction {
  DELETE = "delete",
  ARCHIVE = "archive",
  ANONYMIZE = "anonymize",
  FLAG_FOR_REVIEW = "flag_for_review"
}

/**
 * TimePeriod interface for retention time periods
 */
interface TimePeriod {
  value: number;
  unit: "days" | "months" | "years";
}

/**
 * RetentionPolicy interface for content retention policies
 */
interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  contentType: ContentType;
  complianceCategory: ComplianceCategory;
  retentionPeriod: TimePeriod;
  action: RetentionAction;
  isActive: boolean;
  createdAt: Date;
  lastUpdated: Date;
  createdBy: string;
  appliesTo: string[];
  exemptPatterns?: string[];
  autoApply: boolean;
}

/**
 * RetentionExecution interface for policy execution records
 */
interface RetentionExecution {
  id: string;
  policyId: string;
  policyName: string;
  executionDate: Date;
  itemsProcessed: number;
  itemsAffected: number;
  status: "completed" | "failed" | "in_progress";
  executedBy: string;
  error?: string;
}

/**
 * RetentionPolicyManager component - Manages content retention policies
 */
export function RetentionPolicyManager({ token }: Props) {
  // Policies state
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<RetentionPolicy | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Executions state
  const [executions, setExecutions] = useState<RetentionExecution[]>([]);
  const [isExecutingPolicy, setIsExecutingPolicy] = useState(false);
  
  // Analytics state
  const [contentStats, setContentStats] = useState({
    messages: { total: 18532, eligible: 5621 },
    profiles: { total: 4215, eligible: 215 },
    reports: { total: 3187, eligible: 1242 },
    documents: { total: 927, eligible: 312 },
    analytics: { total: 15489, eligible: 8954 }
  });
  
  // Load mock policies
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    const mockPolicies: RetentionPolicy[] = [
      {
        id: "policy-1",
        name: "Standard Message Retention",
        description: "Retain standard messages for 90 days then delete",
        contentType: ContentType.MESSAGES,
        complianceCategory: ComplianceCategory.STANDARD,
        retentionPeriod: { value: 90, unit: "days" },
        action: RetentionAction.DELETE,
        isActive: true,
        createdAt: new Date(2024, 0, 15),
        lastUpdated: new Date(2024, 1, 20),
        createdBy: "admin@example.com",
        appliesTo: ["public_messages", "general_notifications"],
        autoApply: true
      },
      {
        id: "policy-2",
        name: "Sensitive Profile Data",
        description: "Archive sensitive profile data after 1 year",
        contentType: ContentType.PROFILES,
        complianceCategory: ComplianceCategory.SENSITIVE,
        retentionPeriod: { value: 1, unit: "years" },
        action: RetentionAction.ARCHIVE,
        isActive: true,
        createdAt: new Date(2023, 11, 5),
        lastUpdated: new Date(2024, 1, 10),
        createdBy: "admin@example.com",
        appliesTo: ["payment_history", "identity_docs"],
        exemptPatterns: ["legal_hold_*", "dispute_*"],
        autoApply: true
      },
      {
        id: "policy-3",
        name: "Moderation Reports",
        description: "Anonymize moderation reports after 6 months",
        contentType: ContentType.REPORTS,
        complianceCategory: ComplianceCategory.CONFIDENTIAL,
        retentionPeriod: { value: 6, unit: "months" },
        action: RetentionAction.ANONYMIZE,
        isActive: true,
        createdAt: new Date(2023, 10, 15),
        lastUpdated: new Date(2024, 0, 5),
        createdBy: "admin@example.com",
        appliesTo: ["user_reports", "content_flags"],
        autoApply: false
      },
      {
        id: "policy-4",
        name: "Analytics Data",
        description: "Delete analytics raw data after 2 years",
        contentType: ContentType.ANALYTICS,
        complianceCategory: ComplianceCategory.STANDARD,
        retentionPeriod: { value: 2, unit: "years" },
        action: RetentionAction.DELETE,
        isActive: false,
        createdAt: new Date(2023, 8, 10),
        lastUpdated: new Date(2023, 8, 10),
        createdBy: "admin@example.com",
        appliesTo: ["user_activity", "search_logs"],
        autoApply: true
      },
      {
        id: "policy-5",
        name: "Regulated Document Retention",
        description: "Flag regulated documents for review after 3 years",
        contentType: ContentType.DOCUMENTS,
        complianceCategory: ComplianceCategory.REGULATED,
        retentionPeriod: { value: 3, unit: "years" },
        action: RetentionAction.FLAG_FOR_REVIEW,
        isActive: true,
        createdAt: new Date(2023, 6, 20),
        lastUpdated: new Date(2024, 1, 15),
        createdBy: "compliance@example.com",
        appliesTo: ["financial_documents", "legal_agreements"],
        exemptPatterns: ["active_case_*"],
        autoApply: false
      }
    ];
    
    setPolicies(mockPolicies);
    
    // Mock executions
    const mockExecutions: RetentionExecution[] = [
      {
        id: "exec-1",
        policyId: "policy-1",
        policyName: "Standard Message Retention",
        executionDate: new Date(2024, 1, 25),
        itemsProcessed: 10542,
        itemsAffected: 3256,
        status: "completed",
        executedBy: "system"
      },
      {
        id: "exec-2",
        policyId: "policy-2",
        policyName: "Sensitive Profile Data",
        executionDate: new Date(2024, 1, 20),
        itemsProcessed: 4215,
        itemsAffected: 189,
        status: "completed",
        executedBy: "admin@example.com"
      },
      {
        id: "exec-3",
        policyId: "policy-3",
        policyName: "Moderation Reports",
        executionDate: new Date(2024, 1, 15),
        itemsProcessed: 2156,
        itemsAffected: 876,
        status: "completed",
        executedBy: "admin@example.com"
      },
      {
        id: "exec-4",
        policyId: "policy-1",
        policyName: "Standard Message Retention",
        executionDate: new Date(2024, 0, 25),
        itemsProcessed: 9875,
        itemsAffected: 3052,
        status: "completed",
        executedBy: "system"
      },
      {
        id: "exec-5",
        policyId: "policy-5",
        policyName: "Regulated Document Retention",
        executionDate: new Date(2024, 0, 10),
        itemsProcessed: 412,
        itemsAffected: 97,
        status: "completed",
        executedBy: "compliance@example.com"
      }
    ];
    
    setExecutions(mockExecutions);
  }, []);
  
  // Create a new policy
  const createNewPolicy = () => {
    const newPolicy: RetentionPolicy = {
      id: `policy-${Date.now()}`,
      name: "New Policy",
      description: "Policy description",
      contentType: ContentType.MESSAGES,
      complianceCategory: ComplianceCategory.STANDARD,
      retentionPeriod: { value: 30, unit: "days" },
      action: RetentionAction.DELETE,
      isActive: false,
      createdAt: new Date(),
      lastUpdated: new Date(),
      createdBy: "admin@example.com", // Replace with actual user
      appliesTo: [],
      autoApply: false
    };
    
    setSelectedPolicy(newPolicy);
    setIsEditMode(true);
  };
  
  // Save policy
  const savePolicy = () => {
    if (!selectedPolicy) return;
    
    const isNew = !policies.some(p => p.id === selectedPolicy.id);
    const updatedPolicy = {
      ...selectedPolicy,
      lastUpdated: new Date()
    };
    
    if (isNew) {
      setPolicies([...policies, updatedPolicy]);
      toast.success("Policy created successfully");
    } else {
      setPolicies(policies.map(p => p.id === updatedPolicy.id ? updatedPolicy : p));
      toast.success("Policy updated successfully");
    }
    
    setIsEditMode(false);
  };
  
  // Delete policy
  const deletePolicy = (policyId: string) => {
    setPolicies(policies.filter(p => p.id !== policyId));
    if (selectedPolicy?.id === policyId) {
      setSelectedPolicy(null);
      setIsEditMode(false);
    }
    toast.success("Policy deleted successfully");
  };
  
  // Toggle policy active status
  const togglePolicyStatus = (policyId: string) => {
    const updatedPolicies = policies.map(p => {
      if (p.id === policyId) {
        return {
          ...p,
          isActive: !p.isActive,
          lastUpdated: new Date()
        };
      }
      return p;
    });
    
    setPolicies(updatedPolicies);
    
    // Update selected policy if it's the one that was toggled
    if (selectedPolicy?.id === policyId) {
      const updated = updatedPolicies.find(p => p.id === policyId);
      if (updated) setSelectedPolicy(updated);
    }
    
    toast.success("Policy status updated");
  };
  
  // Execute a policy manually
  const executePolicy = (policyId: string) => {
    const policy = policies.find(p => p.id === policyId);
    if (!policy) return;
    
    setIsExecutingPolicy(true);
    
    // Simulate policy execution
    setTimeout(() => {
      const itemsProcessed = Math.floor(Math.random() * 5000) + 1000;
      const itemsAffected = Math.floor(itemsProcessed * (Math.random() * 0.5 + 0.1));
      
      const newExecution: RetentionExecution = {
        id: `exec-${Date.now()}`,
        policyId,
        policyName: policy.name,
        executionDate: new Date(),
        itemsProcessed,
        itemsAffected,
        status: "completed",
        executedBy: "admin@example.com" // Replace with actual user
      };
      
      setExecutions([newExecution, ...executions]);
      setIsExecutingPolicy(false);
      toast.success(`Policy executed: ${itemsAffected} items affected`);
    }, 2000);
  };
  
  // Get badge color for compliance category
  const getComplianceBadge = (category: ComplianceCategory) => {
    switch (category) {
      case ComplianceCategory.STANDARD:
        return <Badge variant="secondary">Standard</Badge>;
      case ComplianceCategory.SENSITIVE:
        return <Badge variant="warning">Sensitive</Badge>;
      case ComplianceCategory.CONFIDENTIAL:
        return <Badge variant="destructive" className="bg-purple-600">Confidential</Badge>;
      case ComplianceCategory.REGULATED:
        return <Badge variant="destructive">Regulated</Badge>;
      case ComplianceCategory.EXEMPT:
        return <Badge variant="outline">Exempt</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };
  
  // Get badge for action type
  const getActionBadge = (action: RetentionAction) => {
    switch (action) {
      case RetentionAction.DELETE:
        return <Badge variant="destructive">Delete</Badge>;
      case RetentionAction.ARCHIVE:
        return <Badge variant="secondary">Archive</Badge>;
      case RetentionAction.ANONYMIZE:
        return <Badge variant="warning">Anonymize</Badge>;
      case RetentionAction.FLAG_FOR_REVIEW:
        return <Badge variant="outline">Flag For Review</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };
  
  // Format time period for display
  const formatTimePeriod = (period: TimePeriod): string => {
    return `${period.value} ${period.unit}`;
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Retention Policy Manager
        </CardTitle>
        <CardDescription>
          Manage data retention policies, compliance categorization and lifecycle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="policies" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="executions" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Execution History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          {/* Policies Tab */}
          <TabsContent value="policies">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Policy List */}
              <div className="col-span-1">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Retention Policies</h3>
                    <Button variant="outline" size="sm" onClick={createNewPolicy}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Policy
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                    {policies.map(policy => (
                      <Card 
                        key={policy.id} 
                        className={`cursor-pointer transition-colors ${selectedPolicy?.id === policy.id ? 'border-primary' : ''}`}
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setIsEditMode(false);
                        }}
                      >
                        <CardHeader className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h4 className="font-medium text-sm">{policy.name}</h4>
                              <div className="flex items-center gap-1">
                                <Badge 
                                  variant={policy.isActive ? "success" : "secondary"}
                                  className={policy.isActive ? "bg-green-500" : ""}
                                >
                                  {policy.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline">{policy.contentType}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  executePolicy(policy.id);
                                }}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePolicyStatus(policy.id);
                                }}
                              >
                                {policy.isActive ? (
                                  <Checkbox className="h-3 w-3" checked={true} />
                                ) : (
                                  <Checkbox className="h-3 w-3" checked={false} />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                    
                    {policies.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No policies found</p>
                        <p className="text-sm">Create a new policy to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Policy Details/Editor */}
              <div className="col-span-1 lg:col-span-2">
                {selectedPolicy ? (
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                          {isEditMode ? "Edit Policy" : "Policy Details"}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {!isEditMode ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setIsEditMode(true)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deletePolicy(selectedPolicy.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Reset to original if editing existing policy
                                  const original = policies.find(p => p.id === selectedPolicy.id);
                                  if (original) {
                                    setSelectedPolicy(original);
                                  }
                                  setIsEditMode(false);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={savePolicy}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isEditMode ? (
                        // Policy Edit Form
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="policy-name">Policy Name</Label>
                              <Input 
                                id="policy-name" 
                                value={selectedPolicy.name} 
                                onChange={(e) => setSelectedPolicy({ ...selectedPolicy, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="policy-type">Content Type</Label>
                              <Select 
                                value={selectedPolicy.contentType} 
                                onValueChange={(value) => 
                                  setSelectedPolicy({ ...selectedPolicy, contentType: value as ContentType })
                                }
                              >
                                <SelectTrigger id="policy-type">
                                  <SelectValue placeholder="Content Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(ContentType).map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="policy-description">Description</Label>
                            <Input 
                              id="policy-description" 
                              value={selectedPolicy.description} 
                              onChange={(e) => setSelectedPolicy({ ...selectedPolicy, description: e.target.value })}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="compliance-category">Compliance Category</Label>
                              <Select 
                                value={selectedPolicy.complianceCategory} 
                                onValueChange={(value) => 
                                  setSelectedPolicy({ ...selectedPolicy, complianceCategory: value as ComplianceCategory })
                                }
                              >
                                <SelectTrigger id="compliance-category">
                                  <SelectValue placeholder="Compliance Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(ComplianceCategory).map((category) => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="retention-action">Retention Action</Label>
                              <Select 
                                value={selectedPolicy.action} 
                                onValueChange={(value) => 
                                  setSelectedPolicy({ ...selectedPolicy, action: value as RetentionAction })
                                }
                              >
                                <SelectTrigger id="retention-action">
                                  <SelectValue placeholder="Retention Action" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(RetentionAction).map((action) => (
                                    <SelectItem key={action} value={action}>{action}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="retention-period">Retention Period</Label>
                              <Input 
                                id="retention-period" 
                                type="number" 
                                min="1"
                                value={selectedPolicy.retentionPeriod.value} 
                                onChange={(e) => setSelectedPolicy({
                                  ...selectedPolicy,
                                  retentionPeriod: {
                                    ...selectedPolicy.retentionPeriod,
                                    value: parseInt(e.target.value) || 1
                                  }
                                })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="retention-unit">Time Unit</Label>
                              <Select 
                                value={selectedPolicy.retentionPeriod.unit} 
                                onValueChange={(value) => 
                                  setSelectedPolicy({
                                    ...selectedPolicy,
                                    retentionPeriod: {
                                      ...selectedPolicy.retentionPeriod,
                                      unit: value as "days" | "months" | "years"
                                    }
                                  })
                                }
                              >
                                <SelectTrigger id="retention-unit">
                                  <SelectValue placeholder="Time Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="days">Days</SelectItem>
                                  <SelectItem value="months">Months</SelectItem>
                                  <SelectItem value="years">Years</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2 flex items-end">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="auto-apply" 
                                  checked={selectedPolicy.autoApply}
                                  onCheckedChange={(checked) => 
                                    setSelectedPolicy({
                                      ...selectedPolicy,
                                      autoApply: !!checked
                                    })
                                  }
                                />
                                <Label htmlFor="auto-apply">Auto-Apply</Label>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="applies-to">Applies To (comma separated)</Label>
                            <Input 
                              id="applies-to" 
                              value={selectedPolicy.appliesTo.join(", ")} 
                              onChange={(e) => setSelectedPolicy({
                                ...selectedPolicy,
                                appliesTo: e.target.value.split(",").map(item => item.trim()).filter(Boolean)
                              })}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="exempt-patterns">Exempt Patterns (comma separated)</Label>
                            <Input 
                              id="exempt-patterns" 
                              value={selectedPolicy.exemptPatterns?.join(", ") || ""} 
                              onChange={(e) => setSelectedPolicy({
                                ...selectedPolicy,
                                exemptPatterns: e.target.value.split(",").map(item => item.trim()).filter(Boolean)
                              })}
                            />
                            <p className="text-xs text-muted-foreground">
                              Content matching these patterns will be exempted from this policy
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-2">
                            <Checkbox 
                              id="is-active" 
                              checked={selectedPolicy.isActive}
                              onCheckedChange={(checked) => 
                                setSelectedPolicy({
                                  ...selectedPolicy,
                                  isActive: !!checked
                                })
                              }
                            />
                            <Label htmlFor="is-active">Policy Active</Label>
                          </div>
                        </div>
                      ) : (
                        // Policy Details View
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium">Content Type</h3>
                              <p>{selectedPolicy.contentType}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Compliance Category</h3>
                              <div className="pt-1">
                                {getComplianceBadge(selectedPolicy.complianceCategory)}
                              </div>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-sm font-medium">Description</h3>
                            <p className="text-sm">{selectedPolicy.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium">Retention Period</h3>
                              <p>{formatTimePeriod(selectedPolicy.retentionPeriod)}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Action</h3>
                              <div className="pt-1">
                                {getActionBadge(selectedPolicy.action)}
                              </div>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium">Applies To</h3>
                              <div className="flex flex-wrap gap-1 pt-1">
                                {selectedPolicy.appliesTo.map(item => (
                                  <Badge key={item} variant="outline">{item}</Badge>
                                ))}
                                {selectedPolicy.appliesTo.length === 0 && (
                                  <span className="text-sm text-muted-foreground">None specified</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Exempt Patterns</h3>
                              <div className="flex flex-wrap gap-1 pt-1">
                                {selectedPolicy.exemptPatterns?.map(pattern => (
                                  <Badge key={pattern} variant="outline">{pattern}</Badge>
                                ))}
                                {!selectedPolicy.exemptPatterns?.length && (
                                  <span className="text-sm text-muted-foreground">None specified</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium">Auto-Apply</h3>
                              <p>{selectedPolicy.autoApply ? "Yes" : "No"}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Status</h3>
                              <div className="pt-1">
                                <Badge 
                                  variant={selectedPolicy.isActive ? "success" : "secondary"}
                                  className={selectedPolicy.isActive ? "bg-green-500" : ""}
                                >
                                  {selectedPolicy.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <h3 className="text-sm font-medium">Created</h3>
                              <p className="text-sm">
                                {selectedPolicy.createdAt.toLocaleDateString()} by {selectedPolicy.createdBy}
                              </p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Last Updated</h3>
                              <p className="text-sm">{selectedPolicy.lastUpdated.toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          {selectedPolicy.isActive && (
                            <Alert className="mt-4">
                              <Calendar className="h-4 w-4" />
                              <AlertTitle>Next Scheduled Execution</AlertTitle>
                              <AlertDescription>
                                This policy will run automatically on {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}.
                                You can also execute it manually using the play button.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2 p-8">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-lg">No Policy Selected</h3>
                      <p className="text-muted-foreground">Select a policy from the list to view or edit it</p>
                      <Button className="mt-4" onClick={createNewPolicy}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Policy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Executions Tab */}
          <TabsContent value="executions">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Policy Execution History</h3>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Policies</SelectItem>
                    {policies.map(policy => (
                      <SelectItem key={policy.id} value={policy.id}>{policy.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Executions Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Policy</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items Processed</TableHead>
                      <TableHead>Items Affected</TableHead>
                      <TableHead>Executed By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.map(execution => (
                      <TableRow key={execution.id}>
                        <TableCell>{execution.executionDate.toLocaleString()}</TableCell>
                        <TableCell>{execution.policyName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={execution.status === "completed" ? "success" : 
                              execution.status === "failed" ? "destructive" : "warning"}
                            className={execution.status === "completed" ? "bg-green-500" : ""}
                          >
                            {execution.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{execution.itemsProcessed.toLocaleString()}</TableCell>
                        <TableCell>{execution.itemsAffected.toLocaleString()}</TableCell>
                        <TableCell>{execution.executedBy}</TableCell>
                      </TableRow>
                    ))}
                    {executions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No execution history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {isExecutingPolicy && (
                <Alert>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <AlertTitle>Policy Execution in Progress</AlertTitle>
                  <AlertDescription>
                    A retention policy is currently being executed. This process may take some time depending on the amount of data.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Total Content Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      {Object.values(contentStats).reduce((acc, stat) => acc + stat.total, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Across all content types
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Archive className="h-4 w-4 text-primary" />
                      Eligible for Retention
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      {Object.values(contentStats).reduce((acc, stat) => acc + stat.eligible, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Items meeting retention criteria
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Active Policies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      {policies.filter(p => p.isActive).length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Policies currently enforcing retention
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Content Type Analysis</CardTitle>
                  <CardDescription>
                    Distribution of content items by type and retention eligibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(contentStats).map(([type, stats]) => (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{type}</Badge>
                            <span className="text-sm font-medium">{stats.total.toLocaleString()} total items</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {stats.eligible.toLocaleString()} eligible for retention
                            ({((stats.eligible / stats.total) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${(stats.eligible / stats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Category Distribution</CardTitle>
                    <CardDescription>
                      Distribution of active policies by compliance category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.values(ComplianceCategory).map(category => {
                        const count = policies.filter(p => p.isActive && p.complianceCategory === category).length;
                        const percentage = policies.filter(p => p.isActive).length > 0 
                          ? (count / policies.filter(p => p.isActive).length) * 100 
                          : 0;
                        
                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getComplianceBadge(category)}
                                <span className="text-sm font-medium">{count} policies</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Retention Action Distribution</CardTitle>
                    <CardDescription>
                      Distribution of active policies by retention action
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.values(RetentionAction).map(action => {
                        const count = policies.filter(p => p.isActive && p.action === action).length;
                        const percentage = policies.filter(p => p.isActive).length > 0 
                          ? (count / policies.filter(p => p.isActive).length) * 100 
                          : 0;
                        
                        return (
                          <div key={action} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getActionBadge(action)}
                                <span className="text-sm font-medium">{count} policies</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Retention Policy Recommendations</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Consider implementing a policy for message content (currently 30% is unmanaged)</li>
                    <li>Add exemptions for legal hold documents to all regulated content policies</li>
                    <li>Review analytics data retention period - consider reducing from 2 years to 1 year</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Policy Templates
        </Button>
        <Button variant="default" size="sm" onClick={createNewPolicy}>
          <Plus className="h-4 w-4 mr-2" />
          New Policy
        </Button>
      </CardFooter>
    </Card>
  );
}
