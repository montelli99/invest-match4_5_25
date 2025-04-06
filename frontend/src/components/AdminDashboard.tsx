import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminAnalyticsWrapper } from "./AdminAnalyticsWrapper";
import { toast } from "sonner";
import { ModerationRules } from "./ModerationRules";
import { ModerationActions } from "./ModerationActions";
import { PatternTester } from "./PatternTester";
import { ArrowTopRightIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("analytics");

  const handleExportData = () => {
    toast.info("Exporting Data", {
      description: "Your dashboard data export has started."
    });
  };

  const handleSystemReset = () => {
    toast.info("System Actions", {
      description: "This feature is coming soon."
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Manage platform settings and view analytics</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportData}>
            Export Data
          </Button>
          <Button variant="destructive" onClick={handleSystemReset}>
            System Actions
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="analytics" className="relative">
              Analytics
              <Badge className="ml-2 h-4 text-[10px]">NEW</Badge>
            </TabsTrigger>
            <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
            <TabsTrigger value="pattern-tester">Pattern Testing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <Button variant="ghost" size="sm" className="gap-1">
            <MixerHorizontalIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Customize</span>
          </Button>
        </div>

        <TabsContent value="analytics" className="space-y-4">
          <AdminAnalyticsWrapper />
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Content Moderation</span>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/moderation-dashboard" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      <span>Full Dashboard</span>
                      <ArrowTopRightIcon className="h-4 w-4" />
                    </a>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Review and manage content moderation rules and actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="rules">
                  <TabsList className="mb-4">
                    <TabsTrigger value="rules">Rules</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="rules">
                    <ModerationRules />
                  </TabsContent>
                  <TabsContent value="actions">
                    <ModerationActions />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pattern-tester" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Testing Tool</CardTitle>
              <CardDescription>
                Test regex patterns against sample content to evaluate effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatternTester />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>
                Configure platform-wide settings and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Settings configuration interface coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
