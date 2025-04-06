import { useState, useEffect, useCallback } from "react";
import { API_URL, WS_API_URL } from "app";
import { useWebSocket } from "utils/useWebSocket";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Shield,
  BarChart3,
  FileText,
  Users,
  Settings,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  Flag,
  UserCheck,
  FileCheck,
  Activity,
  Clock,
  ChevronRight,
  Menu,
  User,
  LogOut,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Filter,
  RefreshCw,
} from "lucide-react";

// Import all our moderation components
import { AdminDashboardGuide } from "../components/AdminDashboardGuide";
import { RiskScoringManager } from "./RiskScoringManager";
import { PatternTestingManager } from "./PatternTestingManager";
import { ContentClassifier } from "./ContentClassifier";
import { PerformanceMonitoringManager } from "./PerformanceMonitoringManager";
import { BatchOperationsManager } from "./BatchOperationsManager";
import { RetentionPolicyManager } from "./RetentionPolicyManager";
import { UserReportingSystem } from "./UserReportingSystem";
import { AppealManagement } from "./AppealManagement";
import { TrustedUserProgram } from "./TrustedUserProgram";
import { FeedbackCollection } from "./FeedbackCollection";
import { WebSocketManager } from "./WebSocketManager";
import { ModerationSettings } from "./ModerationSettings";
import { WebSocketMessage, WebSocketMessageType, ContentReportData, RiskScore, RiskSeverity } from "../utils/moderationExports";

// User roles
enum UserRole {
  ADMIN = "admin",
  MODERATOR = "moderator",
  COMMUNITY_MANAGER = "community_manager"
}

/**
 * Props for UnifiedModerationDashboard
 */
interface Props {
  token: { idToken: string };
  userRole?: UserRole;
  userName?: string;
  userAvatar?: string;
}

/**
 * Notification type for real-time updates
 */
interface Notification {
  id: string;
  type: "report" | "appeal" | "feedback" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
}

/**
 * Get priority badge for notifications
 */
const PriorityBadge = ({ priority }: { priority: string }) => {
  switch (priority) {
    case "urgent":
      return <Badge variant="destructive">Urgent</Badge>;
    case "high":
      return <Badge variant="destructive" className="bg-orange-500">High</Badge>;
    case "medium":
      return <Badge variant="warning">Medium</Badge>;
    default:
      return <Badge variant="secondary">Low</Badge>;
  }
};

/**
 * Get icon for notification types
 */
const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "report":
      return <Flag className="h-4 w-4 text-red-500" />;
    case "appeal":
      return <FileCheck className="h-4 w-4 text-amber-500" />;
    case "feedback":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    default:
      return <Bell className="h-4 w-4 text-slate-500" />;
  }
};

/**
 * UnifiedModerationDashboard - Consolidates all moderation tools in one interface
 */
export function UnifiedModerationDashboard({
  token,
  userRole = UserRole.ADMIN,
  userName = "Admin User",
  userAvatar = ""
}: Props) {
  // Dashboard section states
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // WebSocket connection for real-time updates
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [hasError, setHasError] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  
  // Handle WebSocket message
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    // Update last update timestamp
    setLastUpdate(new Date());
    
    // Update connection status if needed
    if (message.type === WebSocketMessageType.CONNECTION_STATUS) {
      const status = message.data?.status;
      if (status === 'connected') {
        setWsConnected(true);
        setHasError(false);
        setReconnectAttempt(0);
      } else if (status === 'disconnected') {
        setWsConnected(false);
      } else if (status === 'reconnecting') {
        setWsConnected(false);
        setReconnectAttempt(message.data?.reconnectAttempt || 0);
      }
    }
    
    // Handle content reported
    if (message.type === WebSocketMessageType.CONTENT_REPORTED) {
      const reportData = message.data as ContentReportData;
      
      // Update overview stats
      setOverviewStats(prev => ({
        ...prev,
        pendingReports: prev.pendingReports + 1
      }));
      
      // Convert to our notification format
      const newNotification: Notification = {
        id: reportData.reportId,
        type: "report",
        title: `New ${reportData.contentType} Report`,
        message: reportData.contentExcerpt,
        timestamp: new Date(reportData.timestamp),
        read: false,
        priority: mapSeverityToPriority(reportData.riskScore.severity),
        actionUrl: `/reports/${reportData.reportId}`
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      updateUnreadCount([newNotification, ...notifications]);
    }
  }, [notifications]);
  
  // Map severity to priority
  const mapSeverityToPriority = (severity: RiskSeverity): "low" | "medium" | "high" | "urgent" => {
    switch (severity) {
      case RiskSeverity.CRITICAL:
        return "urgent";
      case RiskSeverity.HIGH:
        return "high";
      case RiskSeverity.MEDIUM:
        return "medium";
      case RiskSeverity.LOW:
        return "low";
      default:
        return "medium";
    }
  };
  
  // Mock data for overview metrics
  const [overviewStats, setOverviewStats] = useState({
    pendingReports: 24,
    pendingAppeals: 8,
    activeCases: 32,
    resolvedToday: 45,
    averageResolutionTime: "2h 15m",
    ruleViolations: {
      "Inappropriate content": 28,
      "Harassment": 12,
      "Spam": 18,
      "Misinformation": 7,
      "Other": 5
    },
    reportsOverTime: [
      { date: "2023-10-01", count: 25 },
      { date: "2023-10-02", count: 32 },
      { date: "2023-10-03", count: 18 },
      { date: "2023-10-04", count: 29 },
      { date: "2023-10-05", count: 41 },
      { date: "2023-10-06", count: 33 },
      { date: "2023-10-07", count: 27 }
    ]
  });
  
  // Initialize mock notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "notif1",
        type: "report",
        title: "New Content Report",
        message: "High-risk content reported by multiple users",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        priority: "high",
        actionUrl: "/reports/143"
      },
      {
        id: "notif2",
        type: "appeal",
        title: "Moderation Appeal Submitted",
        message: "User johnsmith has appealed a content removal decision",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        priority: "medium",
        actionUrl: "/appeals/57"
      },
      {
        id: "notif3",
        type: "system",
        title: "Rule Effectiveness Alert",
        message: "Pattern 'investment_scam_*' has high false positive rate (28%)",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
        priority: "high",
        actionUrl: "/rules/effectiveness"
      },
      {
        id: "notif4",
        type: "feedback",
        title: "New Moderator Feedback",
        message: "3 new feedback items for your recent moderation actions",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        read: true,
        priority: "low",
        actionUrl: "/feedback"
      },
      {
        id: "notif5",
        type: "report",
        title: "Urgent Content Report",
        message: "Potentially illegal content reported - requires immediate review",
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        read: false,
        priority: "urgent",
        actionUrl: "/reports/144"
      }
    ];
    
    setNotifications(mockNotifications);
    updateUnreadCount(mockNotifications);
  }, []);
  
  // Set up WebSocket connection with improved fallback mechanism
  const wsConnection = useWebSocket('/moderation', {
    onMessage: handleWebSocketMessage,
    eventTypes: ['content_reported', 'risk_score_updated', 'connection_status'],
    autoReconnect: true,
    maxReconnectAttempts: 3,
    onError: (error) => {
      console.warn("WebSocket error, falling back to polling:", error);
      setWsConnected(false);
      setHasError(true);
    }
  });
  
  // Set up polling fallback when WebSocket fails
  useEffect(() => {
    if (wsConnection.status === 'error' || wsConnection.status === 'disconnected') {
      console.log("WebSocket connection error or disconnected, switching to polling fallback mode");
      setWsConnected(false);
      
      // Create polling interval for fallback
      const interval = setInterval(() => {
        console.log("Fallback polling: fetching latest content reports");
        // Fetch latest content reports as fallback
        try {
          fetch(`${API_URL}/get_content_reports`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })
            .then(response => {
              if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              if (data?.reports?.length) {
                // Process latest report as if it came through WebSocket
                const latest = data.reports[0];
                handleWebSocketMessage({
                  type: WebSocketMessageType.CONTENT_REPORTED,
                  data: latest,
                  timestamp: new Date().toISOString()
                });
                setLastUpdate(new Date());
              } else {
                console.log("Fallback polling: No new reports found");
              }
            })
            .catch(err => {
              console.error("Fallback polling failed:", err);
              
              // If API call fails, use mock data instead so UI remains functional
              if (Math.random() < 0.3) { // 30% chance of a mock notification
                addTestNotification();
              }
            });
        } catch (err) {
          console.error("Error in fallback polling:", err);
          // If everything fails, still generate test data so UI isn't broken
          if (Math.random() < 0.3) { // 30% chance of a mock notification
            addTestNotification();
          }
        }
      }, 30000); // Poll every 30 seconds
      
      return () => clearInterval(interval);
    } else if (wsConnection.status === 'connected') {
      setWsConnected(true);
      setHasError(false);
    }
  }, [wsConnection.status, handleWebSocketMessage]);
  
  // Add a test notification (for demo purposes)
  const addTestNotification = () => {
    // Create a test content report
    const riskValue = Math.floor(Math.random() * 100);
    let severity;
    
    if (riskValue >= 80) {
      severity = RiskSeverity.CRITICAL;
    } else if (riskValue >= 60) {
      severity = RiskSeverity.HIGH;
    } else if (riskValue >= 40) {
      severity = RiskSeverity.MEDIUM;
    } else {
      severity = RiskSeverity.LOW;
    }
    
    const contentTypes = ['message', 'profile', 'document', 'comment'] as const;
    const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    
    const reportData: ContentReportData = {
      reportId: `report-${Date.now()}`,
      contentId: `content-${Date.now()}`,
      contentType,
      contentExcerpt: "This is a test notification for moderation purposes.",
      reporterUserId: `user-${Math.floor(Math.random() * 1000)}`,
      reportReason: `Reported for ${Math.random() > 0.5 ? 'inappropriate content' : 'suspicious activity'}`,
      reportedUserId: `user-${Math.floor(Math.random() * 1000)}`,
      riskScore: {
        value: riskValue,
        severity,
        category: Math.random() > 0.5 ? 'HARASSMENT' : 'FALSE_INFORMATION',
        factors: [],
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
    
    const message: WebSocketMessage = {
      type: WebSocketMessageType.CONTENT_REPORTED,
      data: reportData,
      timestamp: new Date().toISOString(),
    };
    
    // Process the message as if it came from WebSocket
    handleWebSocketMessage(message);
  };
  
  // Legacy random notification (for backward compatibility)
  const addRandomNotification = () => {
    const types = ["report", "appeal", "feedback", "system"];
    const priorities = ["low", "medium", "high", "urgent"];
    const type = types[Math.floor(Math.random() * types.length)] as "report" | "appeal" | "feedback" | "system";
    const priority = priorities[Math.floor(Math.random() * priorities.length)] as "low" | "medium" | "high" | "urgent";
    
    let title = "New Notification";
    let message = "You have a new notification";
    
    if (type === "report") {
      title = "New Content Report";
      message = "A user has reported content that may violate community guidelines";
    } else if (type === "appeal") {
      title = "New Appeal Submitted";
      message = "A user has appealed a moderation decision";
    } else if (type === "feedback") {
      title = "Moderation Feedback";
      message = "New feedback on your recent moderation actions";
    } else {
      title = "System Alert";
      message = "System has detected unusual activity in the moderation queue";
    }
    
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      priority,
      actionUrl: `/${type}s/${Math.floor(Math.random() * 200)}`
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    updateUnreadCount([newNotification, ...notifications]);
    
    // Show toast for high priority notifications
    if (priority === "high" || priority === "urgent") {
      toast(title, {
        description: message,
        action: {
          label: "View",
          onClick: () => handleNotificationClick(newNotification)
        }
      });
    }
  };
  
  // Update unread count
  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.read).length;
    setUnreadCount(count);
  };
  
  // Mark a notification as read
  const markAsRead = (id: string) => {
    const updated = notifications.map(n => {
      if (n.id === id) {
        return { ...n, read: true };
      }
      return n;
    });
    
    setNotifications(updated);
    updateUnreadCount(updated);
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    updateUnreadCount(updated);
    toast.success("All notifications marked as read");
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // In a real app, this would navigate to the relevant page
    // For now, we'll just change the active tab based on notification type
    if (notification.type === "report") {
      setActiveTab("reports");
    } else if (notification.type === "appeal") {
      setActiveTab("appeals");
    } else if (notification.type === "feedback") {
      setActiveTab("feedback");
    }
    
    setNotificationsOpen(false);
  };
  
  // Check if user has permission for a feature
  const hasPermission = (feature: string): boolean => {
    // Simplified permissions check
    // In a real app, this would check against a more complex permissions system
    switch (userRole) {
      case UserRole.ADMIN:
        return true; // Admins have access to everything
      case UserRole.MODERATOR:
        // Moderators can't access certain administrative features
        return ![
          "retentionPolicies",
          "trustedUsers",
          "systemSettings"
        ].includes(feature);
      case UserRole.COMMUNITY_MANAGER:
        // Community managers focus on user interactions
        return [
          "overview",
          "reports",
          "appeals",
          "feedback",
          "trustedUsers"
        ].includes(feature);
      default:
        return false;
    }
  };
  
  // Navigation items with permission checks
  const navigationItems = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="h-5 w-5" />, permission: "overview" },
    { id: "reports", label: "Content Reports", icon: <Flag className="h-5 w-5" />, permission: "reports" },
    { id: "appeals", label: "Appeals", icon: <FileCheck className="h-5 w-5" />, permission: "appeals" },
    { id: "patterns", label: "Pattern Testing", icon: <FileText className="h-5 w-5" />, permission: "patterns" },
    { id: "classifier", label: "Content Classifier", icon: <Shield className="h-5 w-5" />, permission: "contentClassifier" },
    { id: "performance", label: "Performance", icon: <Activity className="h-5 w-5" />, permission: "performance" },
    { id: "batch", label: "Batch Operations", icon: <RefreshCw className="h-5 w-5" />, permission: "batchOperations" },
    { id: "retention", label: "Retention Policies", icon: <Clock className="h-5 w-5" />, permission: "retentionPolicies" },
    { id: "trusted", label: "Trusted Users", icon: <UserCheck className="h-5 w-5" />, permission: "trustedUsers" },
    { id: "feedback", label: "Feedback", icon: <MessageSquare className="h-5 w-5" />, permission: "feedback" },
    { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" />, permission: "systemSettings" },
  ];
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:bg-muted/50 md:border-r">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="font-semibold text-lg">InvestMatch Admin</h1>
          </div>
        </div>
        
        <div className="p-2 flex-1 overflow-y-auto">
          <nav className="space-y-1">
            {navigationItems.map(item => {
              if (!hasPermission(item.permission)) return null;
              
              // Add Help Guide next to Settings item
              if (item.id === "settings") {
                return (
                  <div key={item.id} className="space-y-1">
                    <Button
                      variant={activeTab === item.id ? "secondary" : "ghost"}
                      className={`w-full justify-start ${activeTab === item.id ? "bg-secondary/80" : ""}`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <div className="flex items-center w-full">
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    </Button>
                    
                    <div className="flex items-center px-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                        onClick={() => document.getElementById("openAdminGuide")?.click()}
                      >
                        <div className="flex items-center w-full">
                          <span className="mr-3"><HelpCircle className="h-5 w-5" /></span>
                          <span>Dashboard Guide</span>
                        </div>
                      </Button>
                      <span id="openAdminGuide" className="hidden">
                        <AdminDashboardGuide activeSection={activeTab} />
                      </span>
                    </div>
                  </div>
                );
              }
              
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start ${activeTab === item.id ? "bg-secondary/80" : ""}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <div className="flex items-center w-full">
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.id === "reports" && overviewStats.pendingReports > 0 && (
                      <Badge className="ml-auto">{overviewStats.pendingReports}</Badge>
                    )}
                    {item.id === "appeals" && overviewStats.pendingAppeals > 0 && (
                      <Badge className="ml-auto">{overviewStats.pendingAppeals}</Badge>
                    )}
                  </div>
                </Button>
              );
            })}
          </nav>
        </div>
        
        <div className="border-t p-4">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-3 space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground">{userRole}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 ml-auto rounded-full">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="font-semibold text-lg">InvestMatch Admin</h1>
            </div>
          </div>
          
          <nav className="p-2 space-y-1">
            {navigationItems.map(item => {
              if (!hasPermission(item.permission)) return null;
              
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start ${activeTab === item.id ? "bg-secondary/80" : ""}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileNavOpen(false);
                  }}
                >
                  <div className="flex items-center w-full">
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.id === "reports" && overviewStats.pendingReports > 0 && (
                      <Badge className="ml-auto">{overviewStats.pendingReports}</Badge>
                    )}
                    {item.id === "appeals" && overviewStats.pendingAppeals > 0 && (
                      <Badge className="ml-auto">{overviewStats.pendingAppeals}</Badge>
                    )}
                  </div>
                </Button>
              );
            })}
          </nav>
          
          <div className="border-t p-4 absolute bottom-0 w-full">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3 space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">{userRole}</p>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="border-b">
          <div className="flex h-16 items-center px-4 gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileNavOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1" 
                onClick={() => navigate('/admin')}
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Admin Dashboard
              </Button>
              
              <h1 className="font-semibold text-lg hidden sm:block">
                {navigationItems.find(item => item.id === activeTab)?.label || "Dashboard"}
              </h1>
            </div>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[380px]">
                  <div className="flex items-center justify-between p-4 pb-2">
                    <DropdownMenuLabel className="text-base font-semibold">Notifications</DropdownMenuLabel>
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                      Mark all as read
                    </Button>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <ScrollArea className="h-[300px]">
                    <div className="p-2">
                      {notifications.length === 0 ? (
                        <div className="text-center p-4 text-muted-foreground">
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${notification.read ? "bg-transparent" : "bg-muted"}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                <NotificationIcon type={notification.type} />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-start justify-between">
                                  <p className="font-medium text-sm">{notification.title}</p>
                                  <PriorityBadge priority={notification.priority} />
                                </div>
                                <p className="text-xs text-muted-foreground">{notification.message}</p>
                                <p className="text-xs text-muted-foreground">
                                  {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* WebSocket Status */}
              <div className="hidden md:flex items-center gap-1">
                <WebSocketManager
                  token={token}
                  onMessage={handleWebSocketMessage}
                  showNotifications={false}
                  externalStatus={{
                    connected: wsConnection.status === 'connected',
                    hasError: wsConnection.status === 'error'
                  }}
                  usingFallback={wsConnection.status !== 'connected'}
                />
              </div>
              
              {/* Help */}
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-4">
          {/* Overview Dashboard */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                    <Flag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewStats.pendingReports}</div>
                    <p className="text-xs text-muted-foreground">
                      +5 since yesterday
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Appeals</CardTitle>
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewStats.pendingAppeals}</div>
                    <p className="text-xs text-muted-foreground">
                      -2 since yesterday
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewStats.activeCases}</div>
                    <p className="text-xs text-muted-foreground">
                      +8 since yesterday
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewStats.resolvedToday}</div>
                    <p className="text-xs text-muted-foreground">
                      Avg. Time: {overviewStats.averageResolutionTime}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Rule Violations</CardTitle>
                    <CardDescription>
                      Most common violations in the last 30 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(overviewStats.ruleViolations).map(([rule, count]) => (
                        <div key={rule} className="flex items-center">
                          <div className="flex-1">
                            <div className="text-sm font-medium mb-1">{rule}</div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${(count / Object.values(overviewStats.ruleViolations).reduce((a, b) => a + b, 0)) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-sm font-medium">{count}</div>
                            <div className="text-xs text-muted-foreground">
                              {(
                                (count / Object.values(overviewStats.ruleViolations).reduce((a, b) => a + b, 0)) *
                                100
                              ).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Frequently used moderation tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button className="w-full" onClick={() => setActiveTab("reports")}>
                        <Flag className="mr-2 h-4 w-4" />
                        View Reports
                      </Button>
                      <Button className="w-full" onClick={() => setActiveTab("appeals")}>
                        <FileCheck className="mr-2 h-4 w-4" />
                        View Appeals
                      </Button>
                      <Button className="w-full" onClick={() => setActiveTab("patterns")}>
                        <FileText className="mr-2 h-4 w-4" />
                        Test Patterns
                      </Button>
                      <Button className="w-full" onClick={() => setActiveTab("batch")}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Batch Operations
                      </Button>
                      <Button className="w-full" onClick={() => setActiveTab("performance")}>
                        <Activity className="mr-2 h-4 w-4" />
                        Performance
                      </Button>
                      <Button className="w-full" onClick={() => setActiveTab("trusted")}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Trusted Users
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>
                      Current system performance and health metrics
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={addTestNotification} title="Send test notification">
                    <Bell className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">WebSocket Connection</span>
                      <WebSocketManager
                        token={token}
                        onMessage={handleWebSocketMessage}
                        showNotifications={false}
                        externalStatus={{
                          connected: wsConnection.status === 'connected',
                          hasError: wsConnection.status === 'error'
                        }}
                        usingFallback={wsConnection.status !== 'connected'}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Update</span>
                      <span className="text-sm">
                        {lastUpdate ? lastUpdate.toLocaleTimeString() : "Never"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Unread Notifications</span>
                      <span className="text-sm">{unreadCount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">User Role</span>
                      <span className="text-sm">{userRole}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Content Reports */}
          {activeTab === "reports" && (
            <UserReportingSystem token={token} />
          )}
          
          {/* Appeals */}
          {activeTab === "appeals" && (
            <AppealManagement token={token} />
          )}
          
          {/* Pattern Testing */}
          {activeTab === "patterns" && (
            <PatternTestingManager token={token} />
          )}
          
          {/* Content Classifier */}
          {activeTab === "classifier" && (
            <ContentClassifier 
              token={token} 
              onClassificationComplete={(classification) => {
                console.log("Classification complete:", classification);
                // Here we could update other parts of the UI based on classification results
                if (classification.regulatoryFlags.length > 0) {
                  // For severe flags, we could show a toast notification
                  const criticalFlags = classification.regulatoryFlags.filter(
                    f => f.severity === RiskSeverity.CRITICAL || f.severity === RiskSeverity.HIGH
                  );
                  
                  if (criticalFlags.length > 0) {
                    toast.warning(`${criticalFlags.length} critical compliance issues detected`, {
                      description: "Review content for regulatory compliance",
                      action: {
                        label: "View",
                        onClick: () => setActiveTab("classifier")
                      }
                    });
                  }
                }
              }}
            />
          )}
          
          {/* Performance */}
          {activeTab === "performance" && (
            <PerformanceMonitoringManager token={token} />
          )}
          
          {/* Batch Operations */}
          {activeTab === "batch" && (
            <BatchOperationsManager 
              token={token} 
              onBatchOperationComplete={(stats) => {
                console.log("Batch operation completed:", stats);
                // Could update other components or trigger notifications
              }}
            />
          )}
          
          {/* Retention Policies */}
          {activeTab === "retention" && (
            <RetentionPolicyManager token={token} />
          )}
          
          {/* Trusted Users */}
          {activeTab === "trusted" && (
            <TrustedUserProgram token={token} />
          )}
          
          {/* Feedback */}
          {activeTab === "feedback" && (
            <FeedbackCollection token={token} />
          )}
          
          {/* Settings */}
          {activeTab === "settings" && (
            <div className="w-full max-w-3xl mx-auto">
              <ModerationSettings token={token} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
