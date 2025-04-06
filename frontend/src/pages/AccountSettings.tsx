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
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AccountSettings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<{
    showContactInfo: boolean;
    showFundDetails: boolean;
    showInvestmentHistory: boolean;
    showAnalytics: boolean;
    isSearchable: boolean;
  }>({
    showContactInfo: true,
    showFundDetails: true,
    showInvestmentHistory: true,
    showAnalytics: true,
    isSearchable: true,
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // TODO: Replace with actual user ID from auth system when available
const userId = "current";

const fetchSettings = async () => {
      setError(null);
      setInitialLoading(true);
      try {
        const response = await brain.get_visibility_settings({ userId });
        const data = await response.json();
        
        setSettings({
          showContactInfo: data.show_contact_info,
          showFundDetails: data.show_fund_details,
          showInvestmentHistory: data.show_investment_history,
          showAnalytics: data.show_analytics,
          isSearchable: data.is_searchable,
        });
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        setError("Unable to load your settings. Please refresh the page or try again later.");
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };

  useEffect(() => {
    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await brain.update_visibility_settings({
        user_id: userId,
        settings: {
          show_contact_info: settings.showContactInfo,
          show_fund_details: settings.showFundDetails,
          show_investment_history: settings.showInvestmentHistory,
          show_analytics: settings.showAnalytics,
          is_searchable: settings.isSearchable,
          allowed_roles: ["Fund Manager", "Limited Partner", "Capital Raiser"],
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      toast({
        title: "Settings updated",
        description: "Your account settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please check your connection and try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {error && (
        <div className="mb-6 p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
          {error}
          <Button 
            variant="link" 
            className="ml-2 text-destructive" 
            onClick={() => fetchSettings()}
          >
            Try Again
          </Button>
        </div>
      )}
      {initialLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
      <h1 className="text-3xl font-semibold mb-6">Account Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Visibility</CardTitle>
          <CardDescription>
            Control what information is visible to other users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showContactInfo">Show Contact Information</Label>
            <Switch
              id="showContactInfo"
              checked={settings.showContactInfo}
              onCheckedChange={() => handleToggle("showContactInfo")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showFundDetails">Show Fund Details</Label>
            <Switch
              id="showFundDetails"
              checked={settings.showFundDetails}
              onCheckedChange={() => handleToggle("showFundDetails")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showInvestmentHistory">
              Show Investment History
            </Label>
            <Switch
              id="showInvestmentHistory"
              checked={settings.showInvestmentHistory}
              onCheckedChange={() => handleToggle("showInvestmentHistory")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showAnalytics">Show Analytics</Label>
            <Switch
              id="showAnalytics"
              checked={settings.showAnalytics}
              onCheckedChange={() => handleToggle("showAnalytics")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isSearchable">Appear in Search Results</Label>
            <Switch
              id="isSearchable"
              checked={settings.isSearchable}
              onCheckedChange={() => handleToggle("isSearchable")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
        </>
      )}
    </div>
  );
}
