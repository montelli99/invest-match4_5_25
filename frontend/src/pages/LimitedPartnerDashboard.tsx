import { DashboardLayout } from "@/components/DashboardLayout";
import { LimitedPartnerDashboard as LimitedPartnerDashboardComponent } from "@/components/LimitedPartnerDashboard";
import { useParams } from "react-router-dom";
import { useLoggedInUser } from "@/components/AuthWrapper";
import { NavigationBar } from "@/components/NavigationBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsFeed } from "@/components/NewsFeed";

export default function LimitedPartnerDashboardPage() {
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useLoggedInUser();
  const targetUserId = userId || (currentUser ? currentUser.uid : 'current');

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar showAuth={true} />
      <DashboardLayout>
        <h1 className="text-3xl font-bold">Limited Partner Dashboard</h1>
        <p className="text-muted-foreground mb-6">Track your investments, portfolio performance, and new opportunities</p>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="newsfeed">News Feed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="space-y-6">
            <LimitedPartnerDashboardComponent userId={targetUserId} />
          </TabsContent>
          
          <TabsContent value="newsfeed">
            <NewsFeed onMessageClick={() => {}} />
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </div>
  );
}
