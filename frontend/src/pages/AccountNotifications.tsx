import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Bell, Mail, BellRing, MessageSquare, Zap, Calendar, Settings } from "lucide-react";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function AccountNotifications() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [emailSettings, setEmailSettings] = useState<NotificationSetting[]>([
    {
      id: "matches",
      title: "New Matches",
      description: "Get notified when you have new investment matches",
      enabled: true,
    },
    {
      id: "messages",
      title: "Messages",
      description: "Receive email notifications for new messages",
      enabled: true,
    },
    {
      id: "updates",
      title: "Platform Updates",
      description: "Stay informed about new features and improvements",
      enabled: false,
    },
  ]);

  const [pushSettings, setPushSettings] = useState<NotificationSetting[]>([
    {
      id: "instant_matches",
      title: "Instant Match Alerts",
      description: "Receive instant notifications for high-priority matches",
      enabled: true,
    },
    {
      id: "chat_notifications",
      title: "Chat Notifications",
      description: "Get notified when you receive new chat messages",
      enabled: true,
    },
    {
      id: "reminders",
      title: "Reminders",
      description: "Receive reminders for scheduled meetings and deadlines",
      enabled: true,
    },
  ]);

  const handleToggleEmail = (settingId: string) => {
    setEmailSettings((prev) =>
      prev.map((setting) =>
        setting.id === settingId
          ? { ...setting, enabled: !setting.enabled }
          : setting,
      ),
    );
  };

  const handleTogglePush = (settingId: string) => {
    setPushSettings((prev) =>
      prev.map((setting) =>
        setting.id === settingId
          ? { ...setting, enabled: !setting.enabled }
          : setting,
      ),
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Integrate with notification settings API when available
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-card to-background py-24 px-4 border-b">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">Notification Settings</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage how you receive updates and alerts from InvestMatch
          </p>
        </div>
      </section>

      <div className="container mx-auto py-16 relative max-w-4xl">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />




        <Tabs defaultValue="email" className="w-full space-y-6 relative z-10">
        <TabsList className="grid w-full grid-cols-2 lg:max-w-[400px]">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Email Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="push" className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            <span>Push Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card className="shadow-sm border-muted">
            <CardHeader>
              <CardTitle>Email Preferences</CardTitle>
              <CardDescription>
                Manage your email notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {emailSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      {setting.id === "matches" && <Zap className="h-4 w-4 text-primary" />}
                      {setting.id === "messages" && <MessageSquare className="h-4 w-4 text-primary" />}
                      {setting.id === "updates" && <Settings className="h-4 w-4 text-primary" />}
                      {setting.title}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => handleToggleEmail(setting.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="push">
          <Card>
            <CardHeader>
              <CardTitle>Push Notification Preferences</CardTitle>
              <CardDescription>
                Manage your push notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {pushSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      {setting.id === "instant_matches" && <Zap className="h-4 w-4 text-primary" />}
                      {setting.id === "chat_notifications" && <MessageSquare className="h-4 w-4 text-primary" />}
                      {setting.id === "reminders" && <Calendar className="h-4 w-4 text-primary" />}
                      {setting.title}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => handleTogglePush(setting.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

        <div className="flex justify-end pt-6 border-t">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="min-w-[120px] shadow-sm"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
        </div>

        {/* CTA Section */}
        <section className="relative bg-gradient-to-b from-background to-card py-20 px-4 border-t mt-16">
          {/* Background Decoration */}
          <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl font-bold mb-4">Need Help with Settings?</h2>
            <p className="text-muted-foreground mb-8">
              Our support team can help you configure your notifications for the best experience.
            </p>
            <Button 
              size="lg"
              onClick={() => window.location.href = "mailto:support@investmatch.com"}
            >
              Contact Support
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
