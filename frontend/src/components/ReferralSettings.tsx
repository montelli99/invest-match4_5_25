import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/Toast";
import brain from "brain";
import { useEffect, useState } from "react";

interface Props {
  userId: string;
}

interface Settings {
  email_notifications: boolean;
  profile_visible: boolean;
  auto_withdrawal: boolean;
}

export function ReferralSettings({ userId }: Props) {
  const [settings, setSettings] = useState<Settings>({
    email_notifications: true,
    profile_visible: true,
    auto_withdrawal: false,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      const response = await brain.get_affiliate_settings_endpoint({ userId });
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load settings. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof Settings, value: boolean) => {
    try {
      setLoading(true);
      await brain.update_affiliate_settings(
        { userId },
        { settings: { ...settings, [key]: value } },
      );
      setSettings((prev) => ({ ...prev, [key]: value }));
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update settings. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Loading settings...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your referrals and earnings
              </p>
            </div>
            <Switch
              id="email_notifications"
              checked={settings.email_notifications}
              onCheckedChange={(checked) =>
                updateSetting("email_notifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="profile_visible">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your referral profile
              </p>
            </div>
            <Switch
              id="profile_visible"
              checked={settings.profile_visible}
              onCheckedChange={(checked) =>
                updateSetting("profile_visible", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto_withdrawal">Automatic Withdrawals</Label>
              <p className="text-sm text-muted-foreground">
                Automatically process withdrawals when reaching threshold
              </p>
            </div>
            <Switch
              id="auto_withdrawal"
              checked={settings.auto_withdrawal}
              onCheckedChange={(checked) =>
                updateSetting("auto_withdrawal", checked)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
