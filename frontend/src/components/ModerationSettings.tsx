import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import brain from "brain";
import { PatternTester } from "components/PatternTester";

interface ModerationSettingsProps {
  token?: { idToken: string };
}

export function ModerationSettings({ token }: ModerationSettingsProps) {
  // State for form values
  const [automaticModeration, setAutomaticModeration] = useState(true);
  const [moderationThreshold, setModerationThreshold] = useState(70);
  const [selectedRules, setSelectedRules] = useState<string[]>(["profanity", "harassment", "spam"]);
  const [notifyModerators, setNotifyModerators] = useState(true);
  const [notifyReporters, setNotifyReporters] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);
  const [retentionPeriod, setRetentionPeriod] = useState("90");
  const [appealPeriod, setAppealPeriod] = useState("14");
  const [trustedUserThreshold, setTrustedUserThreshold] = useState(50);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);
  
  // Fetch current moderation settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Get moderation settings from API using the moderation_settings_v1 endpoint
      const response = await brain.get_moderation_settings_v1();
      const data = await response.json();
      
      // Update state with fetched settings
      setAutomaticModeration(data.automatic_moderation);
      setModerationThreshold(data.moderation_threshold);
      setSelectedRules(data.selected_rules || ["profanity", "harassment", "spam"]);
      setNotifyModerators(data.notify_moderators);
      setNotifyReporters(data.notify_reporters);
      setAutoPublish(data.auto_publish);
      setRetentionPeriod(data.retention_period?.toString() || "90");
      setAppealPeriod(data.appeal_period?.toString() || "14");
      setTrustedUserThreshold(data.trusted_user_threshold || 50);
      
      console.log("Loaded moderation settings from moderation_settings_v1 API:", data);
    } catch (error) {
      console.error("Error fetching moderation settings:", error);
      toast.error("Failed to load moderation settings");
    } finally {
      setLoading(false);
    }
  };
  
  // Mock rule categories for demonstration
  const ruleCategories = [
    { id: "profanity", label: "Profanity Filter", description: "Filter out profane language" },
    { id: "harassment", label: "Harassment Detection", description: "Detect and flag harassment" },
    { id: "spam", label: "Spam Detection", description: "Identify spam and promotional content" },
    { id: "pii", label: "PII Protection", description: "Detect and redact personal identifiable information" },
    { id: "threats", label: "Threat Detection", description: "Identify threatening language" },
    { id: "inappropriate", label: "Inappropriate Content", description: "Filter sexually explicit content" }
  ];
  
  // Mock roles for role management
  const roles = [
    { id: "administrator", label: "Administrator", permissions: ["view", "edit", "delete", "approve", "reject", "configure"] },
    { id: "senior_moderator", label: "Senior Moderator", permissions: ["view", "edit", "delete", "approve", "reject"] },
    { id: "moderator", label: "Moderator", permissions: ["view", "approve", "reject"] },
    { id: "reviewer", label: "Content Reviewer", permissions: ["view"] }
  ];
  
  // Handler for saving settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Prepare settings payload using the API's expected format
      const settingsPayload = {
        automatic_moderation: automaticModeration,
        moderation_threshold: moderationThreshold,
        selected_rules: selectedRules,
        notify_moderators: notifyModerators,
        notify_reporters: notifyReporters,
        auto_publish: autoPublish,
        retention_period: parseInt(retentionPeriod),
        appeal_period: parseInt(appealPeriod),
        trusted_user_threshold: trustedUserThreshold,
        rule_actions: {
          "profanity": "filter",
          "harassment": "hide",
          "spam": "reject"
        },
        auto_verify_trusted_users: true,
        revoke_verification_on_violation: true,
        required_verification_level: "basic"
      };
      
      console.log("Saving moderation settings:", settingsPayload);
      
      // Send to API endpoint using the moderation_settings_v1 endpoint
      const response = await brain.update_moderation_settings_v1(settingsPayload);
      
      if (response.ok) {
        toast.success("Moderation settings updated successfully");
        console.log("Successfully saved moderation settings to moderation_settings_v1 API");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save settings");
      }
      
    } catch (error) {
      console.error("Error saving moderation settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save moderation settings");
    } finally {
      setSaving(false);
    }
  };
  
  // Handler for rule selection
  const handleRuleToggle = (ruleId: string) => {
    setSelectedRules(prev => 
      prev.includes(ruleId) 
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Moderation Settings</CardTitle>
        <CardDescription>
          Configure content moderation rules, automation, and user management settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="rules">Rules & Actions</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-4 mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="automatic-moderation">Automatic Moderation</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable automatic content moderation</p>
                </div>
                <Switch
                  id="automatic-moderation"
                  checked={automaticModeration}
                  onCheckedChange={setAutomaticModeration}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="moderation-threshold">Moderation Threshold ({moderationThreshold}%)</Label>
                </div>
                <Slider
                  id="moderation-threshold"
                  min={0}
                  max={100}
                  step={1}
                  value={[moderationThreshold]}
                  onValueChange={(values) => setModerationThreshold(values[0])}
                  disabled={!automaticModeration}
                />
                <p className="text-sm text-muted-foreground">
                  Content with a risk score above this threshold will be automatically moderated
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="retention-period">Data Retention Period (days)</Label>
                <Select value={retentionPeriod} onValueChange={setRetentionPeriod}>
                  <SelectTrigger id="retention-period">
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="730">2 years</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How long moderated content and reports are kept before archiving
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appeal-period">Appeal Window (days)</Label>
                <Select value={appealPeriod} onValueChange={setAppealPeriod}>
                  <SelectTrigger id="appeal-period">
                    <SelectValue placeholder="Select appeal period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Time window for users to appeal moderation decisions
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notify-moderators">Notify Moderators</Label>
                    <p className="text-sm text-muted-foreground">Send notifications to moderators for new reports</p>
                  </div>
                  <Switch
                    id="notify-moderators"
                    checked={notifyModerators}
                    onCheckedChange={setNotifyModerators}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notify-reporters">Notify Reporters</Label>
                    <p className="text-sm text-muted-foreground">Send notifications to users when their reports are resolved</p>
                  </div>
                  <Switch
                    id="notify-reporters"
                    checked={notifyReporters}
                    onCheckedChange={setNotifyReporters}
                  />
                </div>
              </div>
            </div>
            )}
          </TabsContent>
          
          {/* Rules & Actions Tab */}
          <TabsContent value="rules" className="space-y-4 mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="font-medium">Active Moderation Rules</div>
                <p className="text-sm text-muted-foreground mb-4">Select which moderation rules to enable</p>
                
                <div className="space-y-2">
                  {ruleCategories.map((rule) => (
                    <div key={rule.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`rule-${rule.id}`} 
                        checked={selectedRules.includes(rule.id)}
                        onCheckedChange={() => handleRuleToggle(rule.id)}
                      />
                      <div className="grid gap-1.5">
                        <Label 
                          htmlFor={`rule-${rule.id}`}
                          className="font-medium"
                        >
                          {rule.label}
                          {selectedRules.includes(rule.id) && (
                            <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                          )}
                        </Label>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="rounded-md border p-4">
                <div className="font-medium">Default Action Settings</div>
                <p className="text-sm text-muted-foreground mb-4">Configure how content is handled when flagged</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="action-profanity">Profanity Action</Label>
                    <Select defaultValue="filter">
                      <SelectTrigger id="action-profanity">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="filter">Filter/Censor</SelectItem>
                        <SelectItem value="hide">Hide Content</SelectItem>
                        <SelectItem value="review">Flag for Review</SelectItem>
                        <SelectItem value="reject">Reject Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="action-harassment">Harassment Action</Label>
                    <Select defaultValue="hide">
                      <SelectTrigger id="action-harassment">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="filter">Filter/Censor</SelectItem>
                        <SelectItem value="hide">Hide Content</SelectItem>
                        <SelectItem value="review">Flag for Review</SelectItem>
                        <SelectItem value="reject">Reject Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="action-spam">Spam Action</Label>
                    <Select defaultValue="reject">
                      <SelectTrigger id="action-spam">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="filter">Filter/Censor</SelectItem>
                        <SelectItem value="hide">Hide Content</SelectItem>
                        <SelectItem value="review">Flag for Review</SelectItem>
                        <SelectItem value="reject">Reject Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="auto-publish" checked={autoPublish} onCheckedChange={(checked) => setAutoPublish(checked as boolean)} />
                    <div>
                      <Label htmlFor="auto-publish">Auto-publish after review</Label>
                      <p className="text-sm text-muted-foreground">Automatically publish content after human review</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
          </TabsContent>
          
          {/* Roles & Permissions Tab */}
          <TabsContent value="roles" className="space-y-4 mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="font-medium">Moderation Roles</div>
                <p className="text-sm text-muted-foreground mb-4">Configure role permissions for content moderation</p>
                
                <div className="space-y-4">
                  {roles.map((role) => (
                    <div key={role.id} className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-muted-foreground">
                            Permissions: {role.permissions.join(", ")}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                      <div className="h-px bg-border my-1" />
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="mt-4">Add Custom Role</Button>
              </div>
              
              <div className="rounded-md border p-4">
                <div className="font-medium">Trusted User Program</div>
                <p className="text-sm text-muted-foreground mb-4">Configure settings for trusted user program</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="trusted-threshold">Trusted User Threshold ({trustedUserThreshold})</Label>
                    </div>
                    <Slider
                      id="trusted-threshold"
                      min={0}
                      max={100}
                      step={5}
                      value={[trustedUserThreshold]}
                      onValueChange={(values) => setTrustedUserThreshold(values[0])}
                    />
                    <p className="text-sm text-muted-foreground">
                      Minimum reputation score required to become a trusted user
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="trusted-permissions">Trusted User Permissions</Label>
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-report" defaultChecked />
                        <Label htmlFor="perm-report">Report content with higher priority</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-flag" defaultChecked />
                        <Label htmlFor="perm-flag">Flag content for review</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-approve" defaultChecked={false} />
                        <Label htmlFor="perm-approve">Pre-approve reported content</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
          </TabsContent>
          
          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="font-medium">Pattern Testing</div>
                <p className="text-sm text-muted-foreground mb-4">Test moderation patterns against sample content</p>
                
                <PatternTester />
              </div>
              
              <div className="rounded-md border p-4">
                <div className="font-medium">Integration with Verification System</div>
                <p className="text-sm text-muted-foreground mb-4">Configure how moderation system interacts with verification</p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="auto-verify-trusted" defaultChecked />
                    <div>
                      <Label htmlFor="auto-verify-trusted">Auto-verify trusted users</Label>
                      <p className="text-sm text-muted-foreground">Automatically grant verification to trusted users</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="revoke-verification" defaultChecked />
                    <div>
                      <Label htmlFor="revoke-verification">Revoke verification on rule violations</Label>
                      <p className="text-sm text-muted-foreground">Remove verification status when users violate rules</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="verification-threshold">Required verification level</Label>
                    <Select defaultValue="basic">
                      <SelectTrigger id="verification-threshold">
                        <SelectValue placeholder="Select verification requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None required</SelectItem>
                        <SelectItem value="basic">Basic verification</SelectItem>
                        <SelectItem value="enhanced">Enhanced verification</SelectItem>
                        <SelectItem value="full">Full verification</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Minimum verification level required for specific actions</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md border p-4">
                <div className="font-medium">External API Integration</div>
                <p className="text-sm text-muted-foreground mb-4">Configure external moderation API integration</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input id="api-key" type="password" placeholder="Enter API key" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-endpoint">API Endpoint</Label>
                    <Input id="api-endpoint" placeholder="https://api.example.com/moderation" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-version">API Version</Label>
                    <Select defaultValue="v1">
                      <SelectTrigger id="api-version">
                        <SelectValue placeholder="Select API version" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v1">v1</SelectItem>
                        <SelectItem value="v2">v2</SelectItem>
                        <SelectItem value="beta">Beta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button variant="secondary">Test Connection</Button>
                </div>
              </div>
            </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-6">
          <Button 
            variant="default" 
            onClick={handleSaveSettings}
            disabled={saving || loading}
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
