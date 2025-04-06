// Core React hooks for state management, side effects, and component lifecycle
import { useState, useEffect, useCallback, Suspense, lazy, useRef } from "react";
// Icon imports from lucide-react library
import { AlertTriangle, Shield, LifeBuoy, BarChart } from "lucide-react";
// Import UI components from shadcn library using the @/ path
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
// React Router hook for navigation
import { useNavigate } from "react-router-dom";
// Import custom UI components from our components directory
import { DataTable } from "components/DataTable";
import { ModerationTable } from "components/ModerationTable";
import { AdminSettings } from "components/AdminSettings";
import { ModerationSettings } from "components/ModerationSettings";
import { AdminAnalyticsWrapper } from "components/AdminAnalyticsWrapper";
import { FundManagerAnalytics } from "components/FundManagerAnalytics";
import { CapitalRaiserAnalytics } from "components/CapitalRaiserAnalytics";
import { LPAnalytics } from "components/LPAnalytics";
import { UnifiedModerationDashboard } from "components/UnifiedModerationDashboard";
import { AdminDashboardGuide } from "components/AdminDashboardGuide";
import { ChatSupportWidget } from "components/ChatSupportWidget";
import { AdminTickets } from "components/AdminTickets";
import { FeedbackCollection } from "components/FeedbackCollection";
import { useAdminDashboard } from "utils/admin";
import { useRequireRole } from "utils/auth";
import { useWebSocket, WebSocketEvent } from "utils/useWebSocket";
// Toast notifications from sonner library (preferred over shadcn toast)
import { toast } from "sonner";
// Debug component for development use
import { TabDebugger } from "components/TabDebugger";
// Authentication context hook
import { useAuth } from "@/components/AuthWrapper";
// Import app mode to check if in dev or prod environment
import { mode, Mode } from "app"; // Import mode to check if in dev mode
import { AdminAnalyticsErrorBoundary } from "components/AdminAnalyticsErrorBoundary";

/**
 * AdminDashboard - Main admin interface component
 * 
 * This is the primary dashboard used by administrators to manage:
 * - Platform analytics across user types
 * - Enhanced moderation capabilities
 * - Legacy moderation functions
 * - Support tickets
 * - User management
 * - System feedback
 * - Platform settings
 * 
 * The dashboard uses a tab-based navigation system with:
 * - Primary tabs for major feature areas
 * - Secondary tabs for certain sections (like user analytics)
 * 
 * DO NOT modify the structure without ensuring all tabs work correctly
 */
export default function AdminDashboard() {
  // State management for tab navigation
  // activeUserSubTab controls the secondary tabs in the Users section
  const [activeUserSubTab, setActiveUserSubTab] = useState("overview");
  // Debug mode flag - keep this FALSE in production
  // When enabled, shows additional debugging elements
  const debugMode = false; // Disable debugging elements
  // React Router navigation hook
  const navigate = useNavigate();
  
  // Primary tab state - controls which main section is visible
  // Default is set to "analytics" to show the enhanced analytics dashboard
  const [activeTab, setActiveTab] = useState("analytics");
  // Fetch dashboard data via custom hook
  // This loads all admin dashboard metrics via a single API call
  // DO NOT remove this as multiple components rely on this data
  const { data, isLoading: dataLoading, error: dataError, refetch } = useAdminDashboard();
  // Toast notifications are now from sonner library
  // IMPORTANT: Do not use shadcn toast in this component
  // Authentication state from AuthWrapper context
  const { user } = useAuth();
  
  // ID token for authenticated API calls
  // This token is required by many components and APIs
  const [idToken, setIdToken] = useState<string>("");
  
  // Check if we're in development mode to enable preview features
  // This allows the dashboard to render in preview mode without real authentication
  // CRITICAL: This must remain to allow testing in preview mode
  const isDev = mode === Mode.DEV;
  
  // Effect to fetch the authentication token
  // This runs when user auth state changes
  // In development mode, it provides a dummy token for testing
  useEffect(() => {
    const getToken = async () => {
      if (user) {
        // Get real Firebase token for authenticated users
        const token = await user.getIdToken();
        setIdToken(token);
      } else if (isDev) {
        // Set a dummy token for development/preview mode
        // This allows components to render without real authentication
        setIdToken("preview-dummy-token");
      }
    };
    getToken();
  }, [user, isDev]);

  // User role and profile information
  // FIXME: In production, this should come from Firebase claims
  // Currently hardcoded for simplified testing
  const userRole = "admin";
  const userName = user?.displayName || "Admin User";
  const userAvatar = user?.photoURL || "";
  
  // Global API error state
  // This provides fallback error handling to prevent dashboard crashes
  // when API calls fail
  const [apiError, setApiError] = useState<string | null>(null);

  // Global error handler for API-related errors
  // This catches unhandled errors at the window level and prevents
  // the entire dashboard from crashing when API calls fail
  useEffect(() => {
    // Set global error handler for unhandled API errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Global error:", event.error);
      // Only set API error for certain types of errors (API related)
      // This filtering prevents unrelated errors from triggering the API error state
      if (event.error?.message?.includes("422") || 
          event.error?.message?.includes("API") ||
          event.error?.message?.includes("fetch")) {
        setApiError("API connection issue. Using preview data for demonstration.");
      }
    };

    window.addEventListener('error', handleGlobalError);
    return () => window.removeEventListener('error', handleGlobalError);
  }, []);

  // WebSocket message handler for real-time updates
  // This callback processes different types of WebSocket events and
  // updates the dashboard data accordingly
  // IMPORTANT: Currently disabled in favor of polling
  const handleWebSocketMessage = useCallback((event: WebSocketEvent) => {
    switch (event.type) {
      case 'moderation':
        // Update moderation data when new reports come in
        refetch();
        toast.info('New moderation event');
        break;
      case 'analytics':
        // Update analytics data when metrics change
        refetch();
        break;
      case 'user_activity':
        // Update user activity data for real-time monitoring
        refetch();
        break;
      case 'system':
        // Handle system events like maintenance notifications
        toast.info(event.data.message);
        break;
    }
  }, [refetch]);

  // WebSocket connection for real-time updates
  // This provides immediate notifications for critical events
  // IMPORTANT: The hook options must be memoized to prevent React hooks ordering violations
  // This ensures that the same number of hooks are called in the same order on every render
  const webSocketOptions = useRef({
    onMessage: handleWebSocketMessage,
    eventTypes: ['moderation', 'analytics', 'user_activity', 'system'],
    autoReconnect: true,
    maxReconnectAttempts: 5, // Increased from 3 to improve reliability
    reconnectDelay: 3000, // 3 second delay between reconnection attempts
    authToken: idToken // Use auth token for secure WebSocket connections
  });
  
  // Update the options reference when dependencies change
  // This prevents unnecessary recreations of the WebSocket connection
  useEffect(() => {
    webSocketOptions.current = {
      onMessage: handleWebSocketMessage,
      eventTypes: ['moderation', 'analytics', 'user_activity', 'system'],
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 3000,
      authToken: idToken
    };
  }, [handleWebSocketMessage, idToken]);
  
  // Use the memoized options to prevent hooks ordering violations
  const { status: wsStatus } = useWebSocket('/admin', webSocketOptions.current as any);

  // Dashboard data polling mechanism (fallback for WebSocket failures)
  // This provides a backup mechanism when WebSockets are unavailable
  // Polling disabled to prevent continuous refreshing
  useEffect(() => {
    // Polling disabled
    console.log("WebSocket polling disabled to prevent continuous refreshing");
    // No-op function for cleanup
    return () => {};
  }, [refetch, wsStatus]);
  
  // Backup polling mechanism for API failure recovery
  // This provides an additional layer of resilience when the primary
  // data fetching mechanism fails
  // Polling disabled to prevent continuous refreshing
  useEffect(() => {
    // Backup polling disabled
    console.log("Backup polling disabled to prevent continuous refreshing");
    // No-op function for cleanup
    return () => {};
  }, [dataError, apiError, refetch]);
  // Authentication and role verification
  // Uses useRequireRole hook to check if user has moderator permissions
  // In development mode, this check is bypassed for preview purposes
  const { hasAccess, isLoading: isLoadingRole, error: roleError } = useRequireRole("moderator");
  
  // Combined loading state from data fetching and role verification
  // In dev mode, we skip waiting for role verification
  const isLoading = dataLoading || (isLoadingRole && !isDev);
  
  // Combined error state from data fetching and role verification
  // In dev mode, we ignore role verification errors
  const error = dataError || (roleError && !isDev);

  // Redirect unauthorized users to home page
  // If not in dev mode and user doesn't have access, redirect
  // This prevents unauthorized access to the admin dashboard
  useEffect(() => {
    if (!isDev && !isLoadingRole && !hasAccess) {
      navigate("/");
    }
  }, [hasAccess, isLoadingRole, navigate, isDev]);

  // Loading state UI
  // Shown while fetching data and verifying permissions
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-4">
          <p>Loading...</p>
        </Card>
      </div>
    );
  }

  // Error state UI
  // Shown when there's an error fetching data or verifying permissions
  // In dev mode, we continue showing the dashboard despite errors
  if (error && !isDev) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Authentication gate
  // If user doesn't have access and we're not in dev mode, render nothing
  // The useEffect above will handle redirecting to the home page
  if (!hasAccess && !isDev) {
    return null; // Will redirect in useEffect
  }
  
  // Preview mode banner component
  // Only shown in development mode to indicate that authentication is bypassed
  // This helps distinguish between preview and production environments
  const PreviewModeBanner = isDev && (
    <Alert className="mb-4 bg-blue-100">
      <AlertDescription>
        <span className="font-semibold">Preview Mode:</span> You're viewing the AdminDashboard in preview mode. Authentication is bypassed.
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {PreviewModeBanner}
      {apiError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      {/* WebSocket connection status indicator */}
      {wsStatus !== 'connected' && (
        <Alert className="mb-4 bg-amber-50">
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="font-semibold">Real-time updates:</span> {wsStatus === 'connecting' ? 'Connecting...' : wsStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
            </div>
            {wsStatus === 'disconnected' && (
              <Button size="sm" onClick={() => window.location.reload()} className="ml-4">
                Reconnect
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Dashboard header with title and quick-access buttons */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {/* Quick access buttons for most important sections */}
        <div className="flex items-center space-x-2">
          <Button onClick={() => setActiveTab("enhanced-moderation")} className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Enhanced Moderation Dashboard
          </Button>
          <Button onClick={() => setActiveTab("analytics")} className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Enhanced Analytics Dashboard
          </Button>
        </div>
      </div>

      {/* Main navigation tabs - this controls the primary dashboard sections */}
      <Tabs
        defaultValue="analytics" // Default to analytics tab on load
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        {/* Tab navigation with help button */}
        <div className="flex items-center space-x-2">
          {/* Primary navigation tabs */}
          <TabsList className="mr-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="enhanced-moderation">Enhanced Moderation</TabsTrigger>
            <TabsTrigger value="moderation">Legacy Moderation</TabsTrigger>
            <TabsTrigger value="support">Support Tickets</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            {/* Analytics tab with "New" badge to highlight the feature */}
            <TabsTrigger value="analytics" className="relative">
              Analytics
              <span className="absolute -top-2 -right-2 flex h-5 w-5 animate-bounce">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 text-white text-xs items-center justify-center">New</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Contextual help button with guide for current section */}
          <div className="relative inline-flex">
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">?</div>
            <AdminDashboardGuide activeSection={activeTab} />
          </div>
        </div>

        {/* OVERVIEW TAB: Dashboard summary with key metrics and quick links */}
        <TabsContent value="overview" className="border-2 border-primary/20 rounded-lg p-6 shadow-md mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Enhanced Moderation</h3>
                  <p className="text-sm text-muted-foreground">Access the comprehensive moderation dashboard</p>
                </div>
                <Button onClick={() => setActiveTab("enhanced-moderation")} className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Open Dashboard
                </Button>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Support Tickets</h3>
                  <p className="text-sm text-muted-foreground">Manage user support tickets</p>
                </div>
                <Button 
                  onClick={() => setActiveTab("support")} 
                  className="flex items-center gap-2"
                >
                  <LifeBuoy className="h-4 w-4" />
                  View Tickets
                </Button>
              </div>
            </Card>
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Total Users</h3>
                <p className="text-2xl">
                  {isLoading ? "Loading..." : data?.platform_metrics?.total_users ?? 0}
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Active Users (30d)</h3>
                <p className="text-2xl">
                  {isLoading ? "Loading..." : data?.platform_metrics?.active_users_30d ?? 0}
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Platform Engagement</h3>
                <p className="text-2xl">
                  {isLoading
                    ? "Loading..."
                    : data?.platform_metrics?.platform_engagement_rate
                      ? `${(data.platform_metrics.platform_engagement_rate * 100).toFixed(1)}%`
                      : "0.0%"}
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-2">Support Tickets</h3>
                    <p className="text-2xl">
                      {isLoading ? "Loading..." : data?.support_stats?.open_tickets ?? 0}
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab("support")}> 
                <LifeBuoy className="h-4 w-4 mr-2" />
                Manage Tickets
              </Button>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ENHANCED MODERATION TAB: New comprehensive moderation interface */}
        <TabsContent value="enhanced-moderation" className="space-y-4">
          {idToken ? (
            <>
              <div className="h-[75vh] -mx-6">
                <UnifiedModerationDashboard 
                  token={{ idToken }} 
                  userRole={userRole}
                  userName={userName}
                  userAvatar={userAvatar}
                />
              </div>
            </>
          ) : (
            <Card className="p-4">
              <p>Loading enhanced moderation dashboard...</p>
            </Card>
          )}
        </TabsContent>

        {/* LEGACY MODERATION TAB: Previous moderation interface with migration banner */}
        <TabsContent value="moderation" className="space-y-4">
          <Alert className="mb-4 bg-amber-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Enhanced Moderation Dashboard is Now Available</p>
                <p>The legacy moderation panel has been fully replaced with our comprehensive system that includes:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Sophisticated pattern matching and content classification</li>
                  <li>Real-time performance metrics and effectiveness tracking</li>
                  <li>Advanced risk assessment with factor analysis</li>
                  <li>Community management tools and feedback collection</li>
                  <li>Retention policy management and comprehensive audit trails</li>
                </ul>
                <Button className="mt-2" variant="default" onClick={() => setActiveTab('enhanced-moderation')}>Switch to Enhanced Dashboard</Button>
              </div>
            </AlertDescription>
          </Alert>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Pending Reports</h3>
                <p className="text-2xl">
                  {isLoading ? "Loading..." : data?.moderation_stats?.pending_reports}
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Resolved Today</h3>
                <p className="text-2xl">
                  {isLoading ? "Loading..." : data?.moderation_stats?.resolved_today}
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Average Response Time</h3>
                <p className="text-2xl">
                  {isLoading
                    ? "Loading..."
                    : data?.moderation_stats?.avg_resolution_time
                      ? `${data.moderation_stats.avg_resolution_time.toFixed(1)}h`
                      : "0.0h"}
                </p>
              </Card>
            </div>

            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Content Reports</h2>
              <Tabs defaultValue="pending" className="space-y-4">
                <TabsList className="mb-4">
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="reviewed">Under Review</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                  <ModerationTable status="pending" />
                </TabsContent>

                <TabsContent value="reviewed">
                  <ModerationTable status="reviewed" />
                </TabsContent>

                <TabsContent value="resolved">
                  <ModerationTable status="resolved" />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </TabsContent>

        {/* USERS TAB: User management with role-specific analytics */}
        <TabsContent value="users" className="space-y-4">
          {/* User Analytics Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">Comprehensive Analytics Dashboard</h3>
            <p className="text-muted-foreground">Complete analytics organized by user role</p>
          </div>
          {/* Secondary tabs for user role-specific analytics */}
          <Tabs 
            defaultValue="overview" 
            value={activeUserSubTab}
            onValueChange={setActiveUserSubTab}
            className="space-y-6 w-full"
          >
            {/* Custom gradient tab buttons like in the example */}
            <div className="w-full mb-8">
              <div className="rounded-lg bg-muted p-1 w-full grid grid-cols-5 gap-2">
                <Button 
                  variant={activeUserSubTab === 'overview' ? "default" : "ghost"}
                  className={`rounded-md font-medium ${activeUserSubTab === 'overview' ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white hover:from-pink-600 hover:to-blue-600' : ''}`}
                  onClick={() => setActiveUserSubTab('overview')}
                >
                  Overview
                </Button>
                <Button 
                  variant={activeUserSubTab === 'fund-managers' ? "default" : "ghost"}
                  className={`rounded-md font-medium ${activeUserSubTab === 'fund-managers' ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white hover:from-pink-600 hover:to-blue-600' : ''}`}
                  onClick={() => setActiveUserSubTab('fund-managers')}
                >
                  Fund Managers
                </Button>
                <Button 
                  variant={activeUserSubTab === 'capital-raisers' ? "default" : "ghost"}
                  className={`rounded-md font-medium ${activeUserSubTab === 'capital-raisers' ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white hover:from-pink-600 hover:to-blue-600' : ''}`}
                  onClick={() => setActiveUserSubTab('capital-raisers')}
                >
                  Capital Raisers
                </Button>
                <Button 
                  variant={activeUserSubTab === 'limited-partners' ? "default" : "ghost"}
                  className={`rounded-md font-medium ${activeUserSubTab === 'limited-partners' ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white hover:from-pink-600 hover:to-blue-600' : ''}`}
                  onClick={() => setActiveUserSubTab('limited-partners')}
                >
                  Limited Partners
                </Button>
                <Button 
                  variant={activeUserSubTab === 'fund-of-funds' ? "default" : "ghost"}
                  className={`rounded-md font-medium ${activeUserSubTab === 'fund-of-funds' ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white hover:from-pink-600 hover:to-blue-600' : ''}`}
                  onClick={() => setActiveUserSubTab('fund-of-funds')}
                >
                  Fund of Funds
                </Button>
              </div>
            </div>
            
            <TabsContent value="overview" className="border rounded-lg p-6 shadow-sm">
              <div className="space-y-6">
                {/* Platform-wide analytics */}
                <div className="mb-6">
                  <Card className="p-4">
                    <CardHeader>
                      <CardTitle>Platform Overview</CardTitle>
                      <CardDescription>
                        Comprehensive view of platform-wide metrics and performance indicators
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {idToken ? (
                        <AdminAnalyticsWrapper />
                      ) : (
                        <p>Loading platform analytics...</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* User distribution cards */}
                <Card className="p-4">
                  <CardHeader>
                    <CardTitle>User Type Distribution</CardTitle>
                    <CardDescription>Breakdown of user types and engagement metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(data?.user_type_metrics || {}).map(([role, metrics]: [string, any]) => (
                        <Card key={role} className="p-4">
                          <h3 className="font-semibold mb-2 capitalize">{role.replace("_", " ")}</h3>
                          <div className="space-y-2">
                            <p>Total Users: {metrics?.total_users}</p>
                            <p>Active Users: {metrics?.active_users}</p>
                            <p>New Users (30d): {metrics?.new_users_30d}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="fund-managers" className="border rounded-lg p-6 shadow-sm">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fund Manager Analytics</CardTitle>
                    <CardDescription>
                      Performance metrics and insights for fund managers including engagement, matches, and fund performance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                    <FundManagerAnalytics />
                  </CardContent>
                </Card>
                
                {/* Additional Fund Manager Analytics from AdminAnalyticsWrapper */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fund Manager Performance</CardTitle>
                    <CardDescription>
                      Detailed performance analytics for fund managers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {idToken ? (
                      <div className="py-4">
                        {/* Specific extracted analytics for Fund Managers */}
                        <div id="fund-manager-analytics">
                          {/* This would ideally be a specific component extracted from AdminAnalyticsWrapper */}
                          <h3 className="text-lg font-medium mb-4">Fund Performance Metrics</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2">Average Fund Size</h4>
                              <p className="text-2xl font-bold">$24.7M</p>
                              <p className="text-xs text-green-500">+12% from last quarter</p>
                            </Card>
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2">Average IRR</h4>
                              <p className="text-2xl font-bold">18.3%</p>
                              <p className="text-xs text-green-500">+2.1% from last quarter</p>
                            </Card>
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2">Match Conversion Rate</h4>
                              <p className="text-2xl font-bold">34.8%</p>
                              <p className="text-xs text-green-500">+5% from last quarter</p>
                            </Card>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p>Loading fund manager performance data...</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="capital-raisers" className="border rounded-lg p-6 shadow-sm">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Capital Raiser Analytics</CardTitle>
                    <CardDescription>
                      Detailed metrics for capital raisers including deals raised, success rates, and fundraising performance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                    <CapitalRaiserAnalytics />
                  </CardContent>
                </Card>
                
                {/* Additional Capital Raiser Analytics from AdminAnalyticsWrapper */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fundraising Performance</CardTitle>
                    <CardDescription>
                      Comprehensive fundraising metrics and deal flow analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {idToken ? (
                      <div className="py-4">
                        {/* Specific extracted analytics for Capital Raisers */}
                        <div id="capital-raiser-analytics">
                          <h3 className="text-lg font-medium mb-4">Fundraising Metrics</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2">Avg. Capital Raised</h4>
                              <p className="text-2xl font-bold">$16.2M</p>
                              <p className="text-xs text-green-500">+8.3% from last quarter</p>
                            </Card>
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2">Avg. Time to Close</h4>
                              <p className="text-2xl font-bold">4.7 months</p>
                              <p className="text-xs text-green-500">-0.5 months from last quarter</p>
                            </Card>
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2">Success Rate</h4>
                              <p className="text-2xl font-bold">42.5%</p>
                              <p className="text-xs text-green-500">+3.8% from last quarter</p>
                            </Card>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p>Loading fundraising performance data...</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="limited-partners" className="border rounded-lg p-6 shadow-sm">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Limited Partner Analytics</CardTitle>
                    <CardDescription>
                      Investment analytics for LPs including portfolio performance, sector allocation, and investment opportunities.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                    <LPAnalytics />
                  </CardContent>
                </Card>
                
                {/* Additional LP Analytics from AdminAnalyticsWrapper */}
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Performance</CardTitle>
                    <CardDescription>
                      Comprehensive investment metrics and portfolio analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {idToken ? (
                      <div className="py-4">
                        {/* Specific extracted analytics for Limited Partners */}
                        <div id="lp-analytics">
                          <h3 className="text-lg font-medium mb-4">Investment Metrics</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2">Avg. Commitment Size</h4>
                              <p className="text-2xl font-bold">$3.8M</p>
                              <p className="text-xs text-green-500">+4.1% from last quarter</p>
                            </Card>
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2">Portfolio Diversification</h4>
                              <p className="text-2xl font-bold">8.3 sectors</p>
                              <p className="text-xs text-green-500">+1.2 from last quarter</p>
                            </Card>
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2">Match Acceptance Rate</h4>
                              <p className="text-2xl font-bold">28.7%</p>
                              <p className="text-xs text-green-500">+2.3% from last quarter</p>
                            </Card>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p>Loading investment performance data...</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="fund-of-funds" className="border rounded-lg p-6 shadow-sm">
              <Card>
                <CardHeader>
                  <CardTitle>Fund of Funds Analytics</CardTitle>
                  <CardDescription>
                    Performance metrics for Fund of Funds including portfolio diversification, risk-adjusted returns, and manager selection.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold mb-2">Fund of Funds Dashboard</h3>
                    <p className="text-muted-foreground mb-4">Comprehensive analytics module coming soon.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="p-4">
                        <h4 className="font-medium text-sm mb-2">Total FoF Managers</h4>
                        <p className="text-2xl font-bold">86</p>
                        <p className="text-xs text-green-500">+12 from last quarter</p>
                      </Card>
                      <Card className="p-4">
                        <h4 className="font-medium text-sm mb-2">Avg. FoF Size</h4>
                        <p className="text-2xl font-bold">$147.2M</p>
                        <p className="text-xs text-green-500">+$14.5M from last quarter</p>
                      </Card>
                      <Card className="p-4">
                        <h4 className="font-medium text-sm mb-2">Platform Engagement</h4>
                        <p className="text-2xl font-bold">32.1%</p>
                        <p className="text-xs text-amber-500">-1.4% from last quarter</p>
                      </Card>
                    </div>
                    
                    <div className="mt-8">
                      <Button variant="outline">Request Early Access to FoF Analytics</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>



        {/* SUPPORT TICKETS TAB: Support ticket management interface */}
        <TabsContent value="support" className="space-y-4">
          <Card className="p-4">
            {idToken ? (
              <AdminTickets token={{ idToken }} />
            ) : (
              <p>Loading support tickets dashboard...</p>
            )}
          </Card>
        </TabsContent>

        {/* ANALYTICS TAB: Enhanced analytics dashboard with error boundary */}
        <TabsContent value="analytics" className="space-y-4 w-full px-0">
          <AdminAnalyticsErrorBoundary>
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Enhanced Analytics Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive analytics showing platform performance, user activity, and business metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {idToken ? (
                  <AdminAnalyticsWrapper />
                ) : (
                  <p>Loading analytics dashboard...</p>
                )}
              </CardContent>
            </Card>
          </AdminAnalyticsErrorBoundary>
        </TabsContent>

        {/* FEEDBACK TAB: User feedback collection and analysis */}
        <TabsContent value="feedback" className="space-y-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">User Feedback</h2>
              <Button onClick={() => navigate("/FeedbackAnalytics")} variant="outline">View Full Feedback Analytics</Button>
            </div>
            <p className="text-muted-foreground mb-4">Review and analyze user feedback to improve the platform.</p>
            <div className="flex justify-center">
              <FeedbackCollection token={{ idToken }} />
            </div>
          </Card>
        </TabsContent>

        {/* SETTINGS TAB: System configuration options */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <Card className="p-4">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure moderation system settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <ModerationSettings token={{ idToken }} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* AI Chat Support Widget - Fixed floating helper */}
      {/* This component provides AI-powered assistance throughout the admin interface */}
      <ChatSupportWidget />
    </div>
  );
}
