import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { VisibilitySettings } from "types";
import { useEffect, useState } from "react";

interface Props {
  userId: string;
}

interface VisibilityState {
  settings: VisibilitySettings | null;
  loading: boolean;
  saving: boolean;
}

interface AnonymizationRule {
  field_name: string;
  method: string;
  pattern?: string | null;
  mask_char?: string | null;
  preserve_length?: boolean | null;
}

interface AnonymizationConfig {
  rules: AnonymizationRule[];
  user_id: string;
}

interface ExportProgress {
  export_id: string;
  progress?: number;
  status?: "processing" | "completed" | "failed";
  download_url?: string | null;
  error_message?: string | null;
}

export function PrivacySettings({ userId }: Props) {
  const [visibilityState, setVisibilityState] = useState<VisibilityState>({
    settings: null,
    loading: true,
    saving: false,
  });
  const { toast } = useToast();
  const [config, setConfig] = useState<AnonymizationConfig | null>(null);
  const [defaultRules, setDefaultRules] = useState<AnonymizationRule[]>([]);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [exportId, setExportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (userId) {
      loadPrivacyData();
      loadVisibilitySettings();
    }
  }, [userId]);

  const loadVisibilitySettings = async () => {
    try {
      const response = await brain.get_visibility_settings({ userId });
      const data = await response.json();
      setVisibilityState(prev => ({ ...prev, settings: data, loading: false }));
    } catch (error) {
      console.error("Error loading visibility settings:", error);
      toast({
        title: "Error",
        description: "Failed to load visibility settings",
        variant: "destructive",
      });
      setVisibilityState(prev => ({ ...prev, loading: false }));
    }
  };

  const updateVisibilitySettings = async () => {
    if (!visibilityState.settings) return;

    setVisibilityState(prev => ({ ...prev, saving: true }));
    try {
      await brain.update_visibility_settings({
        user_id: userId,
        settings: visibilityState.settings,
      });
      toast({
        title: "Success",
        description: "Visibility settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating visibility settings:", error);
      toast({
        title: "Error",
        description: "Failed to update visibility settings",
        variant: "destructive",
      });
    } finally {
      setVisibilityState(prev => ({ ...prev, saving: false }));
    }
  };

  const loadPrivacyData = async () => {
    try {
      const [prefsResponse, rulesResponse] = await Promise.all([
        brain.get_anonymization_preferences({ userId }),
        brain.get_default_rules(),
      ]);

      const prefsData = await prefsResponse.json();
      const rulesData = await rulesResponse.json();

      setConfig(prefsData);
      setDefaultRules(rulesData);
    } catch (error) {
      console.error("Error loading privacy data:", error);
      toast({
        title: "Error",
        description: "Failed to load privacy settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRule = async (ruleIndex: number, updates: Partial<AnonymizationRule>) => {
    if (!config || isUpdating) return;
    setIsUpdating(true);
    try {

    try {
      const updatedRules = [...config.rules];
      updatedRules[ruleIndex] = { ...updatedRules[ruleIndex], ...updates };

      const updatedConfig = {
        ...config,
        rules: updatedRules,
      };

      const response = await brain.save_anonymization_preferences(updatedConfig);
      const data = await response.json();
      setConfig(data);

      toast({
        title: "Success",
        description: "Privacy settings updated",
      });
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update privacy settings",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    }
  };

  const exportData = async () => {
    if (isExporting) return;
    setIsExporting(true);
    let pollInterval: NodeJS.Timeout | null = null;
    try {
      // First estimate the export size
      const estimateResponse = await brain.estimate_export_size({
        user_id: userId,
        include_profile: true,
        include_matches: true,
        include_messages: true,
        include_analytics: true,
      });
      const estimate = await estimateResponse.json();

      // Start the export
      const exportResponse = await brain.export_user_data({
        user_id: userId,
        format: "json",
        include_profile: true,
        include_matches: true,
        include_messages: true,
        include_analytics: true,
      });
      const exportData = await exportResponse.json();
      setExportId(exportData.export_id);

      // Start polling for progress
      pollInterval = setInterval(async () => {
        if (!exportData.export_id) return;

        const progressResponse = await brain.get_export_progress({
          exportId: exportData.export_id,
        });
        const progress = await progressResponse.json();
        setExportProgress(progress);

        if (progress.status === "completed" && progress.download_url) {
          clearInterval(pollInterval);
          window.location.href = progress.download_url;
          toast({
            title: "Success",
            description: "Your data has been exported",
          });
        } else if (progress.status === "failed") {
          clearInterval(pollInterval);
          toast({
            title: "Error",
            description: progress.error_message || "Export failed",
            variant: "destructive",
          });
        }
      }, 2000);

      // Cleanup interval after 5 minutes
      setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval);
          setIsExporting(false);
          if (exportProgress?.status === "processing") {
            toast({
              title: "Export Timeout",
              description: "Export process timed out. Please try again.",
              variant: "destructive",
            });
          }
        }
      }, 300000);
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    } finally {
      if (!exportProgress || exportProgress.status !== "processing") {
        setIsExporting(false);
      }
    }
  };

  // Deletion is handled through support channels as per privacy guide
  const requestDeletion = async (isHardDelete: boolean) => {
    toast({
      title: "Contact Support",
      description: `Please contact support to request ${isHardDelete ? 'permanent' : 'soft'} data deletion`,
    });
    setShowDeleteDialog(false);
  };

  if (isLoading || visibilityState.loading) {
    return (
      <div className="space-y-6">
        {/* Profile Visibility Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Preferences Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data Export & Deletion Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Visibility</CardTitle>
          <CardDescription>
            Control who can see your profile and what information is visible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Discoverability */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Profile Discoverability</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Searchable Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to find your profile in search results
                </p>
              </div>
              <Switch
                checked={visibilityState.settings?.is_searchable || false}
                onCheckedChange={(checked) =>
                  setVisibilityState(prev => ({
                    ...prev,
                    settings: { ...prev.settings!, is_searchable: checked }
                  }))
                }
              />
            </div>
          </div>

          {/* Information Visibility */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Information Visibility</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Contact Information</Label>
                <p className="text-sm text-muted-foreground">
                  Show email and phone number
                </p>
              </div>
              <Switch
                checked={visibilityState.settings?.show_contact_info || false}
                onCheckedChange={(checked) =>
                  setVisibilityState(prev => ({
                    ...prev,
                    settings: { ...prev.settings!, show_contact_info: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Investment History</Label>
                <p className="text-sm text-muted-foreground">
                  Display your investment track record
                </p>
              </div>
              <Switch
                checked={visibilityState.settings?.show_investment_history || false}
                onCheckedChange={(checked) =>
                  setVisibilityState(prev => ({
                    ...prev,
                    settings: { ...prev.settings!, show_investment_history: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Fund Details</Label>
                <p className="text-sm text-muted-foreground">
                  Show fund size and investment focus
                </p>
              </div>
              <Switch
                checked={visibilityState.settings?.show_fund_details || false}
                onCheckedChange={(checked) =>
                  setVisibilityState(prev => ({
                    ...prev,
                    settings: { ...prev.settings!, show_fund_details: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Share your profile analytics
                </p>
              </div>
              <Switch
                checked={visibilityState.settings?.show_analytics || false}
                onCheckedChange={(checked) =>
                  setVisibilityState(prev => ({
                    ...prev,
                    settings: { ...prev.settings!, show_analytics: checked }
                  }))
                }
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button 
              onClick={updateVisibilitySettings} 
              disabled={visibilityState.saving}
              className="w-full"
            >
              {visibilityState.saving ? "Saving..." : "Save Visibility Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Privacy Preferences</CardTitle>
          <CardDescription>
            Control how your data is used and shared on the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {config?.rules.map((rule, index) => (
            <div key={rule.field_name} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{rule.field_name}</Label>
                <p className="text-sm text-muted-foreground">
                  {rule.method === "mask" 
                    ? `Mask data using ${rule.mask_char || '*'}` 
                    : rule.method === "hash" 
                    ? "Hash data for privacy" 
                    : "Anonymize data"}
                </p>
              </div>
              <Switch
                checked={rule.preserve_length || false}
                onCheckedChange={(checked) =>
                  updateRule(index, { preserve_length: checked })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Anonymization Rules</CardTitle>
          <CardDescription>
            Default rules that can be applied to your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {defaultRules.map((rule) => (
              <div
                key={rule.field_name}
                className="flex justify-between items-center py-2 border-b last:border-0"
              >
                <div>
                  <h4 className="font-medium">
                    {rule.field_name.replace("_", " ").toUpperCase()}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Method: {rule.method}
                    {rule.pattern && ` (Pattern: ${rule.pattern})`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {rule.mask_char ? `Mask: ${rule.mask_char}` : "Default mask"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {rule.preserve_length ? "Preserves length" : "Variable length"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Export & Deletion</CardTitle>
          <CardDescription>
            Export or delete your data from our platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={exportData} 
            variant="outline"
            disabled={!!exportProgress && exportProgress.status === "processing"}
          >
            {exportProgress?.status === "processing" 
              ? `Exporting (${Math.round(exportProgress.progress || 0)}%)`
              : "Export My Data"}
          </Button>

          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete My Data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Choose how you want to delete
                  your data:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>
                      Soft delete: Your data will be anonymized but retained for
                      compliance
                    </li>
                    <li>
                      Hard delete: Your data will be permanently deleted (may
                      affect compliance)
                    </li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => requestDeletion(false)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Soft Delete
                </AlertDialogAction>
                <AlertDialogAction
                  onClick={() => requestDeletion(true)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Hard Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
