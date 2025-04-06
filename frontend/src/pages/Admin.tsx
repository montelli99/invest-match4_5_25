import { useAuth } from "@/components/AuthWrapper";
import { ProfileFlow } from "@/components/ProfileFlow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import brain from "brain";
import { Activity, AlertTriangle, BarChart3, BookOpen, CreditCard, Settings, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AdminUser } from "types";
import { UserRole, UserAction } from "../utils/enums";
import { AdminAnalytics } from "@/components/AdminAnalytics";
import { SubscriptionManagement } from "@/components/SubscriptionManagement";
import { UnifiedModerationDashboard } from "@/components/UnifiedModerationDashboard";
import { VerificationSettingsPanel } from "@/components/VerificationSettingsPanel";

interface AuditLog {
  timestamp: string;
  action: string;
  performed_by: string;
  target_user: string;
  details: {
    role: string;
    new_claims: Record<string, any>;
  };
}

const ROLE_PERMISSIONS = {
  super_admin: [
    'manage_admins',
    'manage_roles',
    'manage_permissions',
    'view_audit_logs',
    'manage_users',
    'moderate_content',
    'view_reports',
    'manage_settings'
  ],
  admin: [
    'manage_users',
    'moderate_content',
    'view_reports',
    'manage_settings'
  ],
  moderator: [
    'moderate_content',
    'view_reports'
  ]
};

export default function Admin() {
  const [idToken, setIdToken] = useState<string>("");
  const { user, claims } = useAuth();
  const navigate = useNavigate();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Moderator);
  const [isAddingRole, setIsAddingRole] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
      }
    };
    getToken();
  }, [user]);

  // Temporarily disabled for development
  // useEffect(() => {
  //   // Redirect if not admin or super admin
  //   if (user && !claims?.admin && !claims?.super_admin) {
  //     navigate("/");
  //     toast.error("Unauthorized access");
  //   }
  // }, [user, claims, navigate]);

  useEffect(() => {
    if (user) {
      loadAdminUsers();
    }
  }, [user]);

  useEffect(() => {
    if (user && (claims?.admin || claims?.super_admin)) {
      loadAuditLogs();
    }
  }, [user, claims]);

  const loadAuditLogs = async () => {
    if (!user) return;
    
    setIsLoadingLogs(true);
    try {
      const response = await brain.get_audit_logs(
        { limit: 100 },
        { token: { idToken: await user?.getIdToken() } }
      );
      const data = await response.json();
      setAuditLogs(data.logs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const response = await brain.list_admin_users({
        token: { idToken: await user?.getIdToken() },
      });
      const data = await response.json();
      setAdminUsers(data.users);
    } catch (error) {
      console.error("Error loading admin users:", error);
      toast.error("Failed to load admin users");
    }
  };

  const handleUpdateRole = async (action: UserAction) => {
    if (!selectedUserId) {
      toast.error("Please enter a user ID");
      return;
    }

    try {
      const response = await brain.update_user_role({
        user_id: selectedUserId,
        role: selectedRole,
        action,
        token: { idToken: await user?.getIdToken() },
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        loadAdminUsers();
        setIsAddingRole(false);
        setSelectedUserId("");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  // Temporarily disabled for development
  // if (!user || (!claims?.admin && !claims?.super_admin)) {
  //   return null;
  // }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your platform and users
          </p>
        </div>
        <Dialog open={isAddingRole} onOpenChange={setIsAddingRole}>
          <DialogTrigger asChild>
            <Button>
              <Shield className="mr-2 h-4 w-4" />
              Add Admin/Moderator
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Admin or Moderator Role</DialogTitle>
              <DialogDescription>
                Grant administrative or moderation privileges to a user.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  placeholder="Enter user ID"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {claims?.super_admin && (
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    )}
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingRole(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleUpdateRole(UserAction.Add)}>Add Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="docs">
            <BookOpen className="mr-2 h-4 w-4" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="subscriptions">
            <CreditCard className="mr-2 h-4 w-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="reports">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="docs">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Documentation</CardTitle>
                <CardDescription>
                  Comprehensive guide for platform administration and moderation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose dark:prose-invert max-w-none">
                  <h3>Role Management</h3>
                  <p>
                    The platform supports three administrative roles with different permission levels:
                  </p>
                  <ul>
                    <li>
                      <strong>Super Admin:</strong> Full platform control, including managing other admins
                    </li>
                    <li>
                      <strong>Admin:</strong> User management, content moderation, and platform settings
                    </li>
                    <li>
                      <strong>Moderator:</strong> Content moderation and report handling
                    </li>
                  </ul>

                  <h3>User Management Guidelines</h3>
                  <ul>
                    <li>Verify user credentials before granting administrative access</li>
                    <li>Regularly review admin activity through audit logs</li>
                    <li>Remove inactive admin accounts promptly</li>
                    <li>Document reasons for role changes in the audit log</li>
                  </ul>

                  <h3>Content Moderation Best Practices</h3>
                  <ul>
                    <li>Review reported content within 24 hours</li>
                    <li>Apply consistent moderation standards</li>
                    <li>Document all moderation decisions</li>
                    <li>Escalate serious violations to administrators</li>
                  </ul>

                  <h3>Using the Moderation Dashboard</h3>
                  <p>
                    The moderation dashboard provides real-time content moderation capabilities:
                  </p>
                  <ul>
                    <li>
                      <strong>Real-time Updates:</strong> New reports and status changes appear instantly
                    </li>
                    <li>
                      <strong>Batch Operations:</strong>
                      <ul>
                        <li>Select multiple reports using checkboxes</li>
                        <li>Apply actions to all selected reports</li>
                        <li>Progress tracking shows completion status</li>
                        <li>Error handling ensures partial success is captured</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Filtering and Search:</strong>
                      <ul>
                        <li>Filter by report status (pending, reviewed, resolved)</li>
                        <li>Search by report reason or user ID</li>
                        <li>Quick access to most urgent reports</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Status Management:</strong>
                      <ul>
                        <li><em>Pending:</em> New reports awaiting review</li>
                        <li><em>Reviewed:</em> Reports that have been assessed</li>
                        <li><em>Resolved:</em> Reports with completed actions</li>
                      </ul>
                    </li>
                  </ul>

                  <h3>Audit and Compliance</h3>
                  <ul>
                    <li>All moderation actions are logged in the audit trail</li>
                    <li>Review notes are required for status changes</li>
                    <li>Batch operations are tracked individually</li>
                    <li>Export capabilities for compliance reporting</li>
                  </ul>

                  <h3>Best Practices for Batch Operations</h3>
                  <ul>
                    <li>Review similar reports together for consistency</li>
                    <li>Use batch actions for routine moderation tasks</li>
                    <li>Monitor the progress bar for large batch operations</li>
                    <li>Review any failed operations in the audit log</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Onboarding Process</CardTitle>
                <CardDescription>
                  Complete guide to user registration and verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose dark:prose-invert max-w-none">
                  <h3>Registration Requirements</h3>
                  <ul>
                    <li>
                      <strong>Basic Information:</strong> Full name, company name, contact details
                    </li>
                    <li>
                      <strong>Verification Documents:</strong> Accreditation status, fund management credentials
                    </li>
                    <li>
                      <strong>Profile Type Selection:</strong> Fund Manager, Limited Partner, or Capital Raiser
                    </li>
                  </ul>

                  <h3>Profile Type Requirements</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Fund Managers</h4>
                      <ul>
                        <li>Fund name and type</li>
                        <li>Fund size and investment focus</li>
                        <li>Historical returns documentation</li>
                        <li>Risk profile assessment</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold">Limited Partners</h4>
                      <ul>
                        <li>Investment interests and preferences</li>
                        <li>Typical commitment size range</li>
                        <li>Risk tolerance assessment</li>
                        <li>Investment timeline expectations</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold">Capital Raisers</h4>
                      <ul>
                        <li>Professional network details</li>
                        <li>Track record of deals raised</li>
                        <li>Industry focus and expertise</li>
                        <li>Client references (optional)</li>
                      </ul>
                    </div>
                  </div>

                  <h3>Verification Process</h3>
                  <ol>
                    <li>Document submission and initial review</li>
                    <li>Background check and credential verification</li>
                    <li>Profile completion verification</li>
                    <li>Account activation and access grant</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Matching Algorithm Documentation</CardTitle>
                <CardDescription>
                  Understanding the platform's matching system and criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose dark:prose-invert max-w-none">
                  <h3>Matching Criteria</h3>
                  <ul>
                    <li>
                      <strong>Risk Alignment (25%):</strong> Matching risk tolerance levels between parties
                    </li>
                    <li>
                      <strong>Investment Focus (25%):</strong> Sector and strategy alignment
                    </li>
                    <li>
                      <strong>Fund Size Compatibility (20%):</strong> Matching investment ranges
                    </li>
                    <li>
                      <strong>Track Record (15%):</strong> Historical performance evaluation
                    </li>
                    <li>
                      <strong>Investment Horizon (15%):</strong> Timeline compatibility
                    </li>
                  </ul>

                  <h3>Match Quality Indicators</h3>
                  <ul>
                    <li>
                      <strong>Excellent Match (90-100%):</strong> Perfect alignment in key areas
                    </li>
                    <li>
                      <strong>Strong Match (75-89%):</strong> Strong alignment with minor variations
                    </li>
                    <li>
                      <strong>Good Match (60-74%):</strong> Good potential with some differences
                    </li>
                    <li>
                      <strong>Basic Match (40-59%):</strong> Limited alignment, careful evaluation needed
                    </li>
                  </ul>

                  <h3>Global Matching Settings</h3>
                  <ul>
                    <li>Enable/disable global matching for contacts</li>
                    <li>Set minimum match percentage threshold</li>
                    <li>Configure matching criteria weights</li>
                    <li>Set automatic match notifications</li>
                  </ul>

                  <h3>Match Optimization Tips</h3>
                  <ul>
                    <li>Regularly update profile information</li>
                    <li>Provide detailed investment criteria</li>
                    <li>Maintain accurate historical data</li>
                    <li>Review and adjust matching preferences</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Management Documentation</CardTitle>
                <CardDescription>
                  Understanding user profile flow and requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileFlow />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AdminAnalytics />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin & Moderator Users</CardTitle>
              <CardDescription>
                Manage users with administrative and moderation privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminUsers.map((adminUser) => (
                  <div
                    key={adminUser.uid}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{adminUser.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {adminUser.uid}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {adminUser.roles.map((role) => (
                          <div key={role.role} className="space-y-1">
                            <Badge
                              variant={
                                role.role === "super_admin"
                                  ? "destructive"
                                  : role.role === "admin"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {role.role}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {role.permissions.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedUserId(adminUser.uid);
                        setSelectedRole(adminUser.roles[0].role as UserRole);
                        handleUpdateRole(UserAction.Remove);
                      }}
                    >
                      Remove Role
                    </Button>
                  </div>
                ))}

                {adminUsers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No admin or moderator users found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Recent administrative actions and role changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingLogs ? (
                  <p className="text-center text-muted-foreground py-8">Loading audit logs...</p>
                ) : auditLogs.length > 0 ? (
                  auditLogs.map((log, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {log.action.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Performed by: {log.performed_by}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {new Date(log.timestamp).toLocaleString()}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <p>Target User: {log.target_user}</p>
                        <p>Role: {log.details.role}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No audit logs found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>
                  Configure administrative settings and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Button variant="outline" onClick={() => navigate("/admin/permissions")}>
                    Manage Permissions
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/admin/quotas")}>
                    Configure Usage Quotas
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <VerificationSettingsPanel />
          </div>
        </TabsContent>

        <TabsContent value="subscriptions">
          {idToken && <SubscriptionManagement token={{ idToken }} />}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {idToken && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Content Moderation</h2>
              <Button variant="outline" onClick={() => navigate('/unified-moderation-dashboard')}>
                Open Full Dashboard
              </Button>
            </div>
          )}
          {idToken && <UnifiedModerationDashboard token={{ idToken }} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
