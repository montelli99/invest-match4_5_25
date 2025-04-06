import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import brain from "brain";

export interface Props {
  className?: string;
}

interface VerificationSettings {
  require_documents: boolean;
  profile_completion_threshold: number;
  auto_verify_trusted_users: boolean;
  verification_message: string;
}

export function VerificationSettingsPanel({ className = "" }: Props) {
  const [settings, setSettings] = useState<VerificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await brain.get_verification_settings();
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching verification settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load verification settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await brain.update_verification_settings(settings);
      toast({
        title: "Settings saved",
        description: "Verification settings have been updated successfully",
      });
    } catch (error) {
      console.error("Error saving verification settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save verification settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRequireDocumentsChange = (checked: boolean) => {
    if (settings) {
      setSettings({
        ...settings,
        require_documents: checked,
      });
    }
  };

  const handleThresholdChange = (value: number[]) => {
    if (settings) {
      setSettings({
        ...settings,
        profile_completion_threshold: value[0],
      });
    }
  };

  const handleAutoVerifyChange = (checked: boolean) => {
    if (settings) {
      setSettings({
        ...settings,
        auto_verify_trusted_users: checked,
      });
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings) {
      setSettings({
        ...settings,
        verification_message: e.target.value,
      });
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-center text-red-500">Failed to load settings</p>
          <Button 
            onClick={fetchSettings} 
            variant="outline" 
            className="mt-4 mx-auto block"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Verification Settings</CardTitle>
        <CardDescription>
          Configure how users become verified on the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="require-documents" className="text-base">
                Require Document Verification
              </Label>
              <p className="text-sm text-muted-foreground">
                When disabled, users will be verified based solely on profile completeness
              </p>
            </div>
            <Switch
              id="require-documents"
              checked={settings.require_documents}
              onCheckedChange={handleRequireDocumentsChange}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="completion-threshold" className="text-base">
              Profile Completion Threshold ({Math.round(settings.profile_completion_threshold)}%)
            </Label>
            <p className="text-sm text-muted-foreground mb-4">
              Minimum profile completeness percentage required for verification
            </p>
            <Slider
              id="completion-threshold"
              defaultValue={[settings.profile_completion_threshold]}
              max={100}
              min={50}
              step={5}
              onValueChange={handleThresholdChange}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-verify" className="text-base">
                Auto-Verify Trusted Users
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically verify users from trusted organizations
              </p>
            </div>
            <Switch
              id="auto-verify"
              checked={settings.auto_verify_trusted_users}
              onCheckedChange={handleAutoVerifyChange}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="verification-message" className="text-base">
              Verification Message
            </Label>
            <p className="text-sm text-muted-foreground">
              Message displayed to users about verification requirements
            </p>
            <Input
              id="verification-message"
              value={settings.verification_message}
              onChange={handleMessageChange}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="ml-auto"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
