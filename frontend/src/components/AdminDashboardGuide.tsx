import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, BarChart3, Flag, UserCheck, MessageSquare, RefreshCw, Clock, FileCheck, FileText, Activity, ChevronRight, ChevronLeft } from "lucide-react";

interface Props {
  activeSection?: string;
}

/**
 * Comprehensive guide for the Admin Dashboard
 * Explains all features and sections with detailed instructions
 */
export function AdminDashboardGuide({ activeSection = "overview" }: Props) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(activeSection);
  
  // Map dashboard sections to guide tabs for better navigation
  useEffect(() => {
    // When activeSection changes from dashboard, map it to appropriate guide section
    const sectionMap: Record<string, string> = {
      "overview": "overview",
      "enhanced-moderation": "reports",
      "moderation": "reports",
      "support": "community",
      "users": "community",
      "analytics": "performance",
      "settings": "operations"
    };
    
    if (activeSection && sectionMap[activeSection]) {
      setActiveTab(sectionMap[activeSection]);
    }
  }, [activeSection]);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="icon" title="Help Guide" className="bg-blue-500 hover:bg-blue-600 text-white">
          <HelpCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Admin Dashboard Guide
          </DialogTitle>
          <DialogDescription>
            Comprehensive instructions for using the enhanced Admin & Moderation Dashboard
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 sm:grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
            </TabsList>
            
            {/* Overview Section */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Dashboard Overview
              </h3>
              <p className="text-muted-foreground">
                The overview dashboard provides a high-level summary of all moderation activities and system status.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Key Metrics Cards</h4>
                  <p className="text-sm text-muted-foreground">
                    The top section displays critical metrics including total users, active users, platform engagement, and support tickets.
                    Each card provides real-time data to help monitor the platform's health.
                  </p>
                </div>
                
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Dashboard Sections</h4>
                  <p className="text-sm text-muted-foreground">
                    The dashboard is organized into several key sections:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-1">
                    <li><strong>Enhanced Moderation:</strong> New unified moderation system with advanced features</li>
                    <li><strong>Legacy Moderation:</strong> Previous moderation interface (being phased out)</li>
                    <li><strong>Support Tickets:</strong> User support request management</li>
                    <li><strong>Users:</strong> User account management and distribution metrics</li>
                    <li><strong>Analytics:</strong> Platform-wide analytics for matching and fundraising</li>
                    <li><strong>Settings:</strong> Admin configuration options</li>
                  </ul>
                </div>
                
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Quick Actions</h4>
                  <p className="text-sm text-muted-foreground">
                    Frequently used moderation tools for rapid access. Click any button to navigate directly to that section.
                  </p>
                </div>
                
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">System Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Displays the current system status including WebSocket connection, last update time, notification status, and user role.
                    The WebSocket connection indicator shows whether real-time updates are active or if the system is using polling fallback.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Reports Section */}
            <TabsContent value="reports" className="space-y-4 mt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Flag className="h-5 w-5" /> Content Reports
              </h3>
              <p className="text-muted-foreground">
                The content reports section enables you to review and act on reported content with comprehensive risk assessment.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Using Enhanced Moderation Dashboard</h4>
                  <p className="text-sm text-muted-foreground">
                    Follow these steps to review and handle content reports:
                  </p>
                  <ol className="text-sm text-muted-foreground list-decimal list-inside ml-2 space-y-2">
                    <li>
                      <strong>Access the dashboard:</strong> Click on "Enhanced Moderation" in the sidebar menu to open the unified dashboard
                    </li>
                    <li>
                      <strong>View pending reports:</strong> The dashboard will initially display all pending reports. You can see key metrics at the top, showing total reports by status.
                    </li>
                    <li>
                      <strong>Filter reports:</strong> Use the filter dropdown at the top of the report list to filter by:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>Status (Pending, Reviewed, Resolved)</li>
                        <li>Date range (Today, This Week, This Month)</li>
                        <li>Content type (Profile, Message)</li>
                        <li>Severity level (Low, Medium, High, Critical)</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Open a report:</strong> Click on any report row to view its details panel, which includes:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>Reported content with highlighted pattern matches</li>
                        <li>Report metadata (reporter, timestamp, etc.)</li>
                        <li>Risk assessment score and factors</li>
                        <li>Similar historical reports</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Take action:</strong> After reviewing, select one of the action buttons:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li><strong>Approve:</strong> Content does not violate guidelines</li>
                        <li><strong>Remove:</strong> Content violates guidelines and is removed</li>
                        <li><strong>Warn User:</strong> Content is borderline; user receives a warning</li>
                        <li><strong>Escalate:</strong> Needs higher-level review</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Add notes:</strong> Always add detailed notes explaining your decision in the notes field before submitting
                    </li>
                    <li>
                      <strong>Submit decision:</strong> Click the "Submit" button to record your action and move to the next report
                    </li>
                  </ol>
                </div>
                
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Content Report Management</h4>
                  <p className="text-sm text-muted-foreground">
                    In both moderation interfaces, you can manage content reports through these workflows:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-1">
                    <li>View reports filtered by status (Pending, Reviewed, Resolved)</li>
                    <li>Inspect reported content with context information</li>
                    <li>Take actions such as approve, remove, or escalate</li>
                    <li>Add detailed notes for audit purposes</li>
                  </ul>
                </div>
                
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Content Inspection</h4>
                  <p className="text-sm text-muted-foreground">
                    Click any report to view detailed content, context, reporter information, and pattern matches.
                    The detailed view highlights matched patterns and shows similar historical reports.
                  </p>
                </div>
                
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Moderation Actions</h4>
                  <p className="text-sm text-muted-foreground">
                    Take action on reports including approve, remove, warn, escalate, or mark as false positive.
                    Add detailed notes for review history and select appropriate violation categories.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Performance Section */}
            <TabsContent value="performance" className="space-y-4 mt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" /> Performance Monitoring
              </h3>
              <p className="text-muted-foreground">
                The performance section provides metrics and analytics on moderation effectiveness and efficiency.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Rule Effectiveness</h4>
                  <p className="text-sm text-muted-foreground">
                    Analyze how well each moderation rule performs with metrics on accuracy, false positive rate, and match volume.
                    Identify patterns that need refinement and see effectiveness trends over time.
                  </p>
                </div>
                
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Analytics Dashboard</h4>
                  <p className="text-sm text-muted-foreground">
                    The Analytics section provides key performance metrics for the platform:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-1">
                    <li><strong>Matching Analytics:</strong> Total matches, success rates, average quality, and response rates</li>
                    <li><strong>Fundraising Analytics:</strong> Capital raised, number of deals, and success rates</li>
                    <li><strong>User Engagement:</strong> Platform-wide user activity and interaction metrics</li>
                    <li><strong>Trend Analysis:</strong> Historical performance data and projections</li>
                  </ul>
                </div>
                
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Time Metrics</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor key time-based metrics including average review time, time to resolution, and SLA compliance.
                    Identify bottlenecks in the moderation workflow and optimize resource allocation.
                  </p>
                </div>
                
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Quality Metrics</h4>
                  <p className="text-sm text-muted-foreground">
                    Assess decision quality through accuracy rate, consistency score, and user feedback metrics.
                    Track appeal rates and outcomes to identify improvement opportunities.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Community Section */}
            <TabsContent value="community" className="space-y-4 mt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserCheck className="h-5 w-5" /> Community Features
              </h3>
              <p className="text-muted-foreground">
                The community sections help manage user interactions, appeals, and feedback systems.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Managing Support Tickets</h4>
                  <p className="text-sm text-muted-foreground">
                    Follow these steps to handle support tickets effectively:
                  </p>
                  <ol className="text-sm text-muted-foreground list-decimal list-inside ml-2 space-y-2">
                    <li>
                      <strong>Access tickets:</strong> Click the "Support" tab in the admin dashboard sidebar
                    </li>
                    <li>
                      <strong>View the ticket list:</strong> All tickets are displayed with key information:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>Ticket ID and subject line</li>
                        <li>Submitter's name and user type</li>
                        <li>Current status (Open, In Progress, Resolved, Closed)</li>
                        <li>Priority level (Low, Medium, High, Urgent)</li>
                        <li>Timestamp showing creation time and wait duration</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Filter tickets:</strong> Use the status tabs (Open, In Progress, Resolved, Closed) to filter the list, or use the search box to find specific tickets
                    </li>
                    <li>
                      <strong>Open a ticket:</strong> Click any ticket row to view its full details, including:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>Complete description of the issue</li>
                        <li>Ticket category (Account, Billing, Technical, Other)</li>
                        <li>User's account details and platform history</li>
                        <li>Any attached files or screenshots</li>
                        <li>Previous responses and conversation history</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Update status:</strong> Select the appropriate status from the dropdown:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li><strong>In Progress:</strong> You're actively working on it</li>
                        <li><strong>Resolved:</strong> Issue has been addressed</li>
                        <li><strong>Closed:</strong> No further action needed</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Respond to user:</strong> Type your response in the reply box, with options to:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>Format text using the formatting toolbar</li>
                        <li>Add attachments using the paperclip icon</li>
                        <li>Use saved response templates from the template dropdown</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Send your response:</strong> Click "Send Response" to submit your reply and notify the user
                    </li>
                    <li>
                      <strong>Add internal notes:</strong> Use the "Add Admin Note" section to leave notes only visible to other admins
                    </li>
                  </ol>
                </div>
                
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">User Management</h4>
                  <p className="text-sm text-muted-foreground">
                    The Users section allows you to review and manage platform users with these features:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-1">
                    <li>View user distribution by type (Fund Manager, Limited Partner, Capital Raiser)</li>
                    <li>Monitor active user statistics and engagement</li>
                    <li>Track new user signups over different time periods</li>
                    <li>Manage user verification status and permissions</li>
                  </ul>
                </div>
                
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Feedback Collection</h4>
                  <p className="text-sm text-muted-foreground">
                    Review user feedback on moderation decisions and platform policies. Analyze sentiment trends,
                    identify common concerns, and track feedback resolution. Use insights to improve moderation practices.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Operations Section */}
            <TabsContent value="operations" className="space-y-4 mt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <RefreshCw className="h-5 w-5" /> Operations & Tools
              </h3>
              <p className="text-muted-foreground">
                Advanced operational tools for system management and efficiency.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Admin Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    The Settings section allows you to configure platform administration options:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-1">
                    <li><strong>Role Management:</strong> Configure admin and moderator permissions</li>
                    <li><strong>Platform Configuration:</strong> Adjust system-wide settings and defaults</li>
                    <li><strong>Notification Settings:</strong> Configure admin alerts and notification thresholds</li>
                    <li><strong>Integration Settings:</strong> Manage external service connections</li>
                    <li><strong>Audit Log Access:</strong> View system-wide activity logs</li>
                  </ul>
                </div>
                
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Batch Operations</h4>
                  <p className="text-sm text-muted-foreground">
                    Process multiple reports, rules, or user actions in batches for improved efficiency.
                    Apply templates, schedule operations, and monitor progress with detailed analytics.
                    Includes rate limiting and error handling for reliable processing.
                  </p>
                </div>
                
                <div className="border rounded-md p-4 space-y-2">
                  <h4 className="font-medium">Retention Policies</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure data retention rules based on content type, sensitivity, and compliance requirements.
                    Set up automated archiving, anonymization, or deletion workflows with detailed audit trails.
                    Manage exemptions and legal holds for special cases.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const tabs = ["overview", "reports", "performance", "community", "operations"];
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1]);
                }
              }}
              disabled={activeTab === "overview"}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous Section
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const tabs = ["overview", "reports", "performance", "community", "operations"];
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex < tabs.length - 1) {
                  setActiveTab(tabs[currentIndex + 1]);
                }
              }}
              disabled={activeTab === "operations"}
            >
              Next Section <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
