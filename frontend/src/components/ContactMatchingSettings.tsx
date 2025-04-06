import { useState, useEffect } from "react";
import { authedBrain as brain } from "@/components/AuthWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ContactMatchSettings {
  enable_global_matching: boolean;
  auto_share_matches: boolean;
  minimum_match_score: number;
  match_across_all_users: boolean;
}

export function ContactMatchingSettings() {
  const [settings, setSettings] = useState<ContactMatchSettings>({
    enable_global_matching: false,
    auto_share_matches: false,
    minimum_match_score: 70,
    match_across_all_users: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await brain.get_matching_settings();
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching matching settings:", error);
      toast.error("Failed to load matching settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await brain.update_matching_settings({
        body: settings
      });
      
      if (response.ok) {
        toast.success("Matching settings updated successfully");
      } else {
        toast.error("Failed to update matching settings");
      }
    } catch (error) {
      console.error("Error updating matching settings:", error);
      toast.error("Failed to update matching settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Matching Settings</CardTitle>
        <CardDescription>
          Configure how your contacts are matched with others on the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="global-matching">Enable Global Matching</Label>
            <p className="text-sm text-muted-foreground">
              Allow your contacts to be matched with other users' contacts
            </p>
          </div>
          <Switch
            id="global-matching"
            checked={settings.enable_global_matching}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, enable_global_matching: checked })
            }
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-share">Auto-Share Matches</Label>
            <p className="text-sm text-muted-foreground">
              Automatically share matched contacts with connections
            </p>
          </div>
          <Switch
            id="auto-share"
            checked={settings.auto_share_matches}
            disabled={!settings.enable_global_matching}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, auto_share_matches: checked })
            }
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="all-users">Match Across All Users</Label>
            <p className="text-sm text-muted-foreground">
              Match contacts with all platform users (not just your connections)
            </p>
          </div>
          <Switch
            id="all-users"
            checked={settings.match_across_all_users}
            disabled={!settings.enable_global_matching}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, match_across_all_users: checked })
            }
          />
        </div>
        
        <div className="space-y-3">
          <div className="space-y-0.5">
            <Label>Minimum Match Score: {settings.minimum_match_score}%</Label>
            <p className="text-sm text-muted-foreground">
              Only show matches above this threshold
            </p>
          </div>
          <Slider
            disabled={!settings.enable_global_matching}
            value={[settings.minimum_match_score]}
            min={0}
            max={100}
            step={5}
            onValueChange={(value) =>
              setSettings({ ...settings, minimum_match_score: value[0] })
            }
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
