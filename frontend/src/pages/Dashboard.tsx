import { authedBrain as brain } from "@/components/AuthWrapper";
import type { Analytics, Contact, Conversation, UserSubscription } from "@/utils/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useDashboardStore } from "@/utils/dashboardStore";
import { useLoggedInUser } from "@/components/AuthWrapper";
import { useNavigate } from "react-router-dom";
import { MessageDialog } from "@/components/MessageDialog";
import { ImportContactsDialog } from "@/components/ImportContactsDialog";
import { ContactSettingsDialog } from "@/components/ContactSettingsDialog";
import { MatchedContactsList } from "@/components/MatchedContactsList";
import { MatchingPreferences } from "@/components/MatchingPreferences";
import { MatchList } from "@/components/MatchList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NavigationBar } from "@/components/NavigationBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsFeed } from "@/components/NewsFeed";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import {
  Activity,
  BarChart3,
  CreditCard,
  Download,
  Eye,
  MessageCircle,
  Search,
  TrendingUp,
  Users,
  Users2,
  Upload,
  Settings,
  Send,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import * as React from "react";
import { LoadingState } from "@/components/LoadingState";
import { CardSkeleton } from "@/components/CardSkeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileCompletion } from "@/components/ProfileCompletion";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export default function Dashboard() {
  const user = useLoggedInUser();

  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      title: "Search Users",
      description: "Find and connect with potential matches",
      icon: <Search className="h-5 w-5" />,
      onClick: () => navigate("/search")
    },
    {
      title: "View Messages",
      description: "Check your conversations",
      icon: <MessageCircle className="h-5 w-5" />,
      onClick: () => setSelectedTab("messages")
    }
  ];
  const [analytics, setAnalytics] = React.useState<Analytics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingStates, setLoadingStates] = React.useState({
    analytics: true,
    conversations: true,
    contacts: true
  });
  const [loadingErrors, setLoadingErrors] = React.useState({
    analytics: null as string | null,
    conversations: null as string | null,
    contacts: null as string | null
  });
  const [profileChecked, setProfileChecked] = React.useState(false);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<{ uid: string; display_name: string; company_name?: string; } | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState("overview");
  const [userSubscription, setUserSubscription] = React.useState<UserSubscription | null>(null);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [globalMatchingEnabled, setGlobalMatchingEnabled] = React.useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const [isContactSettingsDialogOpen, setIsContactSettingsDialogOpen] = React.useState(false);
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);

  const fetchContacts = async () => {
    if (!user) return;

    setLoadingStates(prev => ({ ...prev, contacts: true }));
    setLoadingErrors(prev => ({ ...prev, contacts: null }));

    try {
      const response = await brain.list_contacts({ token: {} });
      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.statusText}`);
      }
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setLoadingErrors(prev => ({
        ...prev,
        contacts: error instanceof Error ? error.message : 'Failed to load contacts'
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, contacts: false }));
    }
  };

  const handleGlobalMatchingToggle = async (enabled: boolean) => {
    const prevState = globalMatchingEnabled;
    setGlobalMatchingEnabled(enabled);
    try {
      await brain.update_match_settings({
        global_matching: enabled,
        token: {}, // Token will be added by AuthWrapper
      });
    } catch (error) {
      setGlobalMatchingEnabled(prevState); // Revert to previous state on error
      console.error("Error updating match settings:", error);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoadingStates(prev => ({ ...prev, analytics: true }));
    setLoadingErrors(prev => ({ ...prev, analytics: null }));

    try {
      const response = await brain.get_analytics_summary();
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoadingErrors(prev => ({
        ...prev,
        analytics: error instanceof Error ? error.message : 'Failed to load analytics'
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, analytics: false }));
      setLoading(false);
    }
  };

  const [error, setError] = React.useState<string | null>(null);

  // Check profile and load data when user is available
  React.useEffect(() => {
    if (!user) return;

    const fetchUserSubscription = async () => {
    if (!user?.uid) return;
    try {
      const response = await brain.get_user_subscription({ userId: user.uid });
      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.statusText}`);
      }
      const data = await response.json();
      setUserSubscription(data);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    }
  };

  const loadDashboardData = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        setError(null);

        // First check if user has a profile
        const profileResponse = await brain.get_profile_endpoint({ userId: user.uid });
        
        if (!profileResponse.ok) {
          if (profileResponse.status === 404) {
            console.log('No profile found, redirecting to profile creation');
            navigate('/CreateProfile');
            return;
          }
          throw new Error(`Failed to fetch profile: ${profileResponse.statusText}`);
        }

        const profile = await profileResponse.json();
        
        if (!profile || Object.keys(profile).length === 0) {
          console.log('Empty profile found, redirecting to profile creation');
          navigate('/CreateProfile');
          return;
        }
        
        setProfileChecked(true);

        // Load all dashboard data in parallel
        await Promise.all([
          fetchAnalytics(),
          fetchConversations(),
          fetchContacts(),
          fetchUserSubscription()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, navigate]);

  const fetchConversations = async () => {
    if (!user) return;

    setLoadingStates(prev => ({ ...prev, conversations: true }));
    setLoadingErrors(prev => ({ ...prev, conversations: null }));

    try {
      const response = await brain.get_conversations({ token: {} });
      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.statusText}`);
      }
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setLoadingErrors(prev => ({
        ...prev,
        conversations: error instanceof Error ? error.message : 'Failed to load conversations'
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, conversations: false }));
    }
  };

  // Don't show dashboard until both profile is checked and data is loaded
  if (loading || !profileChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingState
          message={loading ? 'Loading your dashboard...' : 'Checking your profile...'}
          className="h-full"
        />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-destructive">
          <span className="text-lg font-semibold">Something went wrong</span>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Failed to load analytics data.</p>
      </div>
    );
  }

  // Prepare data for the views chart
  const viewsData = analytics.weekly_views.map(
    (views: number, index: number) => ({
      day: new Date(
        Date.now() - (6 - index) * 24 * 60 * 60 * 1000,
      ).toLocaleDateString("en-US", { weekday: "short" }),
      views,
    }),
  );

  const { layout } = useDashboardStore();

  return (
    <DashboardLayout>
      <NavigationBar showAuth={() => {}} />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Completion Check */}
        {user && (
          <ProfileCompletion 
            profile={{
              email: user.email || undefined,
              name: user.displayName || undefined,
              userType: user.userType,
              hasPassword: user.providerData?.[0]?.providerId === "password"
            }} 
          />
        )}

        {/* Welcome Section */}
        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">
                Welcome back, {user?.displayName || "Investor"}
              </h1>
              <p className="text-muted-foreground mt-2">
                Here's what's happening with your network today
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate("/CreateProfile?edit=true")}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" onClick={() => navigate("/search")}>
                <Search className="h-4 w-4 mr-2" />
                Find Matches
              </Button>
              <Button onClick={() => setSelectedTab("messages")}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`grid grid-cols-1 ${layout === "compact" ? "md:grid-cols-2" : "md:grid-cols-3"} gap-${layout === "compact" ? "4" : "6"}`}>
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="p-6 cursor-pointer hover:shadow-lg transition-all hover:bg-accent/5 group"
              onClick={action.onClick}
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  {action.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Analytics Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Matches
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users2 className="h-4 w-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {loadingStates.analytics ? (
              <div className="space-y-6">
                <div className={`grid grid-cols-1 ${layout === "compact" ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-4"} gap-${layout === "compact" ? "4" : "6"}`}>
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
                <Card className="p-6">
                  <Skeleton className="h-[300px] w-full" />
                </Card>
              </div>
            ) : loadingErrors.analytics ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loadingErrors.analytics}</AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Profile Views
                    </p>
                    <h3 className="text-2xl font-bold">
                      {analytics.engagement_metrics.profile_views.current}
                    </h3>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Response Rate
                    </p>
                    <h3 className="text-2xl font-bold">
                      {(
                        analytics.engagement_metrics.message_response_rate.current * 100
                      ).toFixed(1)}
                      %
                    </h3>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Connections
                    </p>
                    <h3 className="text-2xl font-bold">
                      {analytics.engagement_metrics.total_connections.current}
                    </h3>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Active Conversations
                    </p>
                    <h3 className="text-2xl font-bold">
                      {analytics.engagement_metrics.active_conversations.current}
                    </h3>
                  </div>
                </div>
              </Card>
            </div>

              </>
            )}
            {/* Profile Views Chart */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Profile Views (Last 7 Days)
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await brain.export_analytics({
                        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                        end_date: new Date().toISOString(),
                        metrics: ["profile_views", "message_response_rate", "total_connections", "active_conversations"],
                      });
                      const data = await response.json();
                      // TODO: Handle the exported data
                      console.log("Exported data:", data);
                    } catch (error) {
                      console.error("Error exporting analytics:", error);
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className={layout === "expanded" ? "h-[400px]" : "h-[300px]"}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            {/* Matching Preferences */}
            <div className={`grid grid-cols-1 ${layout === "compact" ? "lg:grid-cols-2" : "lg:grid-cols-3"} gap-${layout === "compact" ? "4" : "6"}`}>
              <div className="lg:col-span-1">
                <MatchingPreferences
                  onSave={async (preferences) => {
                    try {
                      await brain.update_match_preferences(user?.uid || "", {
                        min_match_percentage: preferences.minMatchPercentage,
                        max_results: preferences.maxResults,
                        include_roles: preferences.includeRoles,
                        exclude_previously_matched: preferences.excludePreviouslyMatched,
                      });
                      // Refresh matches after updating preferences
                      const response = await brain.get_matches(user?.uid || "", {
                        min_match_percentage: preferences.minMatchPercentage,
                        max_results: preferences.maxResults,
                        include_roles: preferences.includeRoles,
                        exclude_previously_matched: preferences.excludePreviouslyMatched,
                      });
                      const data = await response.json();
                      setAnalytics({
                        ...analytics,
                        recent_matches: data,
                      });
                    } catch (error) {
                      console.error("Error updating match preferences:", error);
                    }
                  }}
                />
              </div>
              <div className="lg:col-span-2">
                <MatchList
                  matches={analytics.recent_matches}
                  onViewProfile={(profile) => navigate(`/Profile?id=${profile.email}`)}
                />
              </div>
            </div>
            {/* Match Recommendations */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Recent Match Recommendations
              </h3>
              <div className="space-y-4">
                {analytics.recent_matches.map((match: any) => (
                  <div
                    key={match.uid}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-accent">
                          {match.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{match.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {match.role} at {match.company}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary">
                        {(match.match_percentage * 100).toFixed(1)}% Match
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {match.mutual_connections} mutual connections
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {analytics.recent_activities.map((activity: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg border"
                  >
                    <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            {/* Conversations List */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Your Conversations</h3>
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.other_user.uid}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/5 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedUser(conversation.other_user);
                      setIsMessageDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {(conversation.other_user.display_name || "Anonymous")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {conversation.other_user.display_name || "Anonymous"}
                        </h4>
                        {conversation.messages.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {conversation.messages[conversation.messages.length - 1].content}
                          </p>
                        )}
                      </div>
                    </div>
                    {conversation.unread_count > 0 && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">
                        {conversation.unread_count}
                      </div>
                    )}
                  </div>
                ))}
                {conversations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start connecting with other users to begin messaging</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            {/* Contact Management */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Contact Management</h3>
                  <p className="text-sm text-muted-foreground">Manage your contacts and matching preferences</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="global-matching"
                      checked={globalMatchingEnabled}
                      onCheckedChange={handleGlobalMatchingToggle}
                    />
                    <Label htmlFor="global-matching">Enable Global Matching</Label>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsImportDialogOpen(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Contacts
                  </Button>
                </div>
              </div>

              {/* Contact List */}
              <div className="space-y-4">
                {contacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No contacts added yet</p>
                    <p className="text-sm">Import your contacts or add them manually</p>
                  </div>
                ) : (
                  contacts.map((contact: any) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {contact.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{contact.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {contact.role} at {contact.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedContact(contact);
                            setIsContactSettingsDialogOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser({
                              uid: contact.id,
                              display_name: contact.name,
                              company_name: contact.company,
                            });
                            setIsMessageDialogOpen(true);
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Matched Contacts */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Matched Contacts</h3>
              <div className="space-y-4">
                <MatchedContactsList
                  onMessageClick={(user) => {
                    setSelectedUser(user);
                    setIsMessageDialogOpen(true);
                  }}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="feed" className="space-y-6">
            <div className={`grid grid-cols-1 ${layout === "compact" ? "lg:grid-cols-2" : "lg:grid-cols-3"} gap-${layout === "compact" ? "4" : "6"}`}>
              {/* Main Feed */}
              <div className="lg:col-span-2">
                <NewsFeed
                  onMessageClick={(userId) => {
                    // Find user in contacts or recent matches
                    const user = analytics.recent_matches.find((m: any) => m.uid === userId);
                    if (user) {
                      setSelectedUser({
                        uid: user.uid,
                        display_name: user.name,
                        company_name: user.company,
                      });
                      setIsMessageDialogOpen(true);
                    }
                  }}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Trending Topics */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Trending Topics</h3>
                  <div className="space-y-4">
                    {[
                      { topic: "Sustainable Investing", posts: 128 },
                      { topic: "AI in FinTech", posts: 96 },
                      { topic: "Private Markets", posts: 84 },
                      { topic: "ESG Standards", posts: 72 },
                      { topic: "Web3 Ventures", posts: 65 },
                    ].map((item) => (
                      <div
                        key={item.topic}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">{item.topic}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.posts} posts
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Suggested Connections */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Suggested Connections</h3>
                  <div className="space-y-4">
                    {analytics.recent_matches.slice(0, 3).map((match: any) => (
                      <div
                        key={match.uid}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {match.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{match.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {match.role}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser({
                              uid: match.uid,
                              display_name: match.name,
                              company_name: match.company,
                            });
                            setIsMessageDialogOpen(true);
                          }}
                        >
                          Connect
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Subscription Management</h3>
              <SubscriptionPlans
                currentPlan={userSubscription?.tier}
                onSelectPlan={async (plan) => {
                  if (plan.tier === userSubscription?.tier) return;
                  
                  // Get payment methods
                  const paymentResponse = await brain.get_payment_methods({ userId: user?.uid || "" });
                  const paymentMethods = await paymentResponse.json();
                  
                  if (paymentMethods?.length > 0) {
                    try {
                      await brain.update_subscription({
                        pathArgs: { userId: user?.uid || "" },
                        body: {
                          new_tier: plan.tier,
                          payment_method_id: paymentMethods[0].id,
                          is_annual: false
                        }
                      });
                      await fetchUserSubscription();
                    } catch (error) {
                      console.error("Error updating subscription:", error);
                    }
                  } else {
                    // TODO: Show payment method dialog
                    console.log("No payment methods available");
                  }
                }}
              />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <ImportContactsDialog
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          onImportSuccess={() => {
            fetchContacts();
          }}
        />

        {selectedContact && (
          <ContactSettingsDialog
            contact={selectedContact}
            isOpen={isContactSettingsDialogOpen}
            onClose={() => {
              setIsContactSettingsDialogOpen(false);
              setSelectedContact(null);
            }}
            onSave={async (updatedContact) => {
              try {
                // TODO: Implement contact update API
                const updatedContacts = contacts.map((c: any) =>
                  c.id === updatedContact.id ? updatedContact : c
                );
                setContacts(updatedContacts);
              } catch (error) {
                console.error("Error updating contact:", error);
              }
            }}
          />
        )}

        {/* Message Dialog */}
        {selectedUser && (
          <MessageDialog
            isOpen={isMessageDialogOpen}
            onClose={() => {
              setIsMessageDialogOpen(false);
              fetchConversations(); // Refresh conversations after dialog closes
            }}
            otherUser={{
              uid: selectedUser.uid,
              display_name: selectedUser.display_name,
              company_name: selectedUser.company_name,
            }}
          />
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
