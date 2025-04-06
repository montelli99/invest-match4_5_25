import { useAuth } from "@/components/AuthWrapper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { useState } from "react";
import { ExtendedUserProfile } from "types";

interface Props {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: () => void;
}

export const UserProfileDialog = ({
  userId,
  open,
  onOpenChange,
  onProfileUpdate,
}: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await brain.get_profile({
        pathArgs: { userId },
      });
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      await brain.create_profile({
        profile,
        token: {
          idToken: await user?.getIdToken(),
        },
      });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      onProfileUpdate();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load profile when dialog opens
  useState(() => {
    if (open && userId) {
      loadProfile();
    }
  });

  if (!profile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update user profile information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fund_type">Fund Type</Label>
            <Input
              id="fund_type"
              value={profile.fund_type || ""}
              onChange={(e) =>
                setProfile({ ...profile, fund_type: e.target.value })
              }
              placeholder="e.g., Venture Capital"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fund_size">Fund Size</Label>
            <Input
              id="fund_size"
              type="number"
              value={profile.fund_size || ""}
              onChange={(e) =>
                setProfile({ ...profile, fund_size: Number(e.target.value) })
              }
              placeholder="Fund size in millions"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="investment_focus">Investment Focus</Label>
            <Input
              id="investment_focus"
              value={profile.investment_focus?.join(", ") || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  investment_focus: e.target.value
                    .split(",")
                    .map((s) => s.trim()),
                })
              }
              placeholder="Tech, Healthcare, etc. (comma separated)"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="historical_returns">Historical Returns (%)</Label>
            <Input
              id="historical_returns"
              type="number"
              value={profile.historical_returns || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  historical_returns: Number(e.target.value),
                })
              }
              placeholder="Average historical returns"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="risk_profile">Risk Profile</Label>
            <Input
              id="risk_profile"
              value={profile.risk_profile || ""}
              onChange={(e) =>
                setProfile({ ...profile, risk_profile: e.target.value })
              }
              placeholder="e.g., Conservative, Moderate, Aggressive"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
