import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import brain from "brain";
import { useState } from "react";

interface Props {
  userId: string;
  onUpdate?: () => void;
}

interface AffiliateSettings {
  paymentMethod: string;
  payoutThreshold: number;
  emailNotifications: {
    newReferrals: boolean;
    conversions: boolean;
    payments: boolean;
  };
  profileVisibility: {
    showEarnings: boolean;
    showReferralCount: boolean;
    showTier: boolean;
  };
  autoApproval: {
    enabled: boolean;
    minTrustScore: number;
  };
}

export function AffiliateSettings({ userId, onUpdate }: Props) {
  const [settings, setSettings] = useState<AffiliateSettings>({
    paymentMethod: "stripe",
    payoutThreshold: 100,
    emailNotifications: {
      newReferrals: true,
      conversions: true,
      payments: true,
    },
    profileVisibility: {
      showEarnings: false,
      showReferralCount: true,
      showTier: true,
    },
    autoApproval: {
      enabled: false,
      minTrustScore: 70,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      // Save settings through API
      await brain.update_affiliate_settings({
        userId,
        settings,
      });

      setSuccess(true);
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error("Error saving affiliate settings:", err);
      setError("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>
            Configure how you receive your affiliate earnings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={settings.paymentMethod}
              onValueChange={(value) =>
                setSettings({ ...settings, paymentMethod: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payoutThreshold">Payout Threshold ($)</Label>
            <Input
              id="payoutThreshold"
              type="number"
              min="0"
              value={settings.payoutThreshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  payoutThreshold: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Choose which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="newReferrals">New Referral Notifications</Label>
            <Switch
              id="newReferrals"
              checked={settings.emailNotifications.newReferrals}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  emailNotifications: {
                    ...settings.emailNotifications,
                    newReferrals: checked,
                  },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="conversions">Conversion Notifications</Label>
            <Switch
              id="conversions"
              checked={settings.emailNotifications.conversions}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  emailNotifications: {
                    ...settings.emailNotifications,
                    conversions: checked,
                  },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="payments">Payment Notifications</Label>
            <Switch
              id="payments"
              checked={settings.emailNotifications.payments}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  emailNotifications: {
                    ...settings.emailNotifications,
                    payments: checked,
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Visibility</CardTitle>
          <CardDescription>
            Control what information is visible to others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showEarnings">Show Earnings</Label>
            <Switch
              id="showEarnings"
              checked={settings.profileVisibility.showEarnings}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  profileVisibility: {
                    ...settings.profileVisibility,
                    showEarnings: checked,
                  },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showReferralCount">Show Referral Count</Label>
            <Switch
              id="showReferralCount"
              checked={settings.profileVisibility.showReferralCount}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  profileVisibility: {
                    ...settings.profileVisibility,
                    showReferralCount: checked,
                  },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showTier">Show Tier Status</Label>
            <Switch
              id="showTier"
              checked={settings.profileVisibility.showTier}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  profileVisibility: {
                    ...settings.profileVisibility,
                    showTier: checked,
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auto-Approval Settings</CardTitle>
          <CardDescription>
            Configure automatic approval for referrals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="autoApproval">Enable Auto-Approval</Label>
            <Switch
              id="autoApproval"
              checked={settings.autoApproval.enabled}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  autoApproval: { ...settings.autoApproval, enabled: checked },
                })
              }
            />
          </div>

          {settings.autoApproval.enabled && (
            <div className="space-y-2">
              <Label htmlFor="minTrustScore">Minimum Trust Score</Label>
              <Input
                id="minTrustScore"
                type="number"
                min="0"
                max="100"
                value={settings.autoApproval.minTrustScore}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoApproval: {
                      ...settings.autoApproval,
                      minTrustScore: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
