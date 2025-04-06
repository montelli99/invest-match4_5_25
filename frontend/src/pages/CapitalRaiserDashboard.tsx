import { DashboardLayout } from "@/components/DashboardLayout";
import { CapitalRaiserDashboard as CapitalRaiserDashboardComponent } from "@/components/CapitalRaiserDashboard";
import { useParams } from "react-router-dom";
import { useLoggedInUser } from "@/components/AuthWrapper";
import { NavigationBar } from "@/components/NavigationBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsFeed } from "@/components/NewsFeed";

export default function CapitalRaiserDashboardPage() {
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useLoggedInUser();
  const targetUserId = userId || (currentUser ? currentUser.uid : 'current');

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar showAuth={true} />
      <DashboardLayout>
        <h1 className="text-3xl font-bold">Capital Raiser Dashboard</h1>
        <p className="text-muted-foreground mb-6">Track your fundraising performance, client relationships, and deal pipeline</p>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="newsfeed">News Feed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="space-y-6">
            <CapitalRaiserDashboardComponent userId={targetUserId} />
          </TabsContent>
          
          <TabsContent value="newsfeed">
            <NewsFeed onMessageClick={() => {}} />
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </div>
  );
}
