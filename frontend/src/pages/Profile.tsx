import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload";
import brain from "brain";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PaymentMethodManager } from "@/components/PaymentMethodManager";
import { useAuth } from "@/components/AuthWrapper";
import { SocialLinksForm } from "@/components/SocialLinksForm";
import { validateSocialLinks } from "@/utils/validateSocialLinks";
import { useSocialLinksStore } from "@/utils/socialLinksStore";
import { ProfileCompletenessIndicator } from "@/components/ProfileCompletenessIndicator";

export default function Profile() {
  const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { links, setLinks, updateLink } = useSocialLinksStore();
  const [socialLinksError, setSocialLinksError] = useState({});
  const [photoUrl, setPhotoUrl] = useState("");
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState("incomplete");
  const [formData, setFormData] = useState({
    photo_url: "",
    total_capital_raised: "",
    deals_raised: "",
    name: "",
    company: "",
    role: "",
    fund_type: "",
    fund_size: "",
    investment_focus: "",
    historical_returns: "",
    risk_profile: ""
  });

  useEffect(() => {
    if (user?.uid) {
      loadProfile();
      // Check verification status
      checkVerificationStatus();
    }
  }, [user?.uid]);

  const checkVerificationStatus = async () => {
    if (!user?.uid) return;
    
    try {
      const response = await brain.get_verification_status({ userId: user.uid });
      const data = await response.json();
      setProfileCompleteness(data.profile_completeness || 0);
      setVerificationStatus(data.verification_status || "incomplete");
    } catch (error) {
      console.error("Error checking verification status:", error);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await brain.get_profile({ userId: user?.uid || "" });
      const profile = await response.json();

      // Load social links if they exist
      if (profile.social_links) {
        setLinks(profile.social_links);
      }
      
      setPhotoUrl(profile.photo_url || "");
      setFormData({
        photo_url: profile.photo_url || "",
        total_capital_raised: profile.total_capital_raised?.toString() || "",
        deals_raised: profile.deals_raised?.toString() || "",
        name: profile.name || "",
        company: profile.company || "",
        role: profile.role || "",
        fund_type: profile.fund_type || "",
        fund_size: profile.fund_size?.toString() || "",
        investment_focus: profile.investment_focus || "",
        historical_returns: profile.historical_returns?.toString() || "",
        risk_profile: profile.risk_profile || ""
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please log in to update your profile"
      });
      return;
    }
    
    if (saving || loading) {
      return;
    }
    setSaving(true);
    // Validate social links
    const socialErrors = validateSocialLinks(links);
    setSocialLinksError(socialErrors);
    
    if (Object.keys(socialErrors).length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check your social links"
      });
      return;
    }

    try {
      setLoading(true);
      // Format numbers before sending
// Format currency values
const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

const totalCapital = formatCurrency(formData.total_capital_raised);
const dealsRaised = formData.deals_raised ? parseInt(formData.deals_raised) : 0;

const profileData = {
        photo_url: photoUrl,
        total_capital_raised: formData.total_capital_raised ? parseFloat(formData.total_capital_raised) : undefined,
        deals_raised: formData.deals_raised ? parseInt(formData.deals_raised) : undefined,
        user_id: user?.uid,
        social_links: links,
        ...formData,
        fund_size: formData.fund_size ? parseInt(formData.fund_size) : undefined,
        historical_returns: formData.historical_returns ? parseFloat(formData.historical_returns) : undefined
      };

      await brain.create_profile({
        profile: profileData,
        token: {}
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
      // Update verification status after profile update
      await checkVerificationStatus();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Profile Settings</h1>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Profile Completeness</h2>
          <ProfileCompletenessIndicator 
            userId={user?.uid}
            fetchVerificationStatus={true}
            size="lg"
            showBadge={true}
            showTooltip={true}
          />
          <p className="text-sm text-gray-500 mt-2">
            Complete your profile to increase your chances of matching with potential partners.
            {verificationStatus !== "verified" && " A complete profile is required for verification."}
          </p>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 space-y-6">
        <ProfilePhotoUpload
          photoUrl={photoUrl}
          onPhotoUploaded={(url) => {
            setPhotoUrl(url);
            setFormData(prev => ({ ...prev, photo_url: url }));
          }}
        />
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Basic Information</h2>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="Investment Corp"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fund Manager">Fund Manager</SelectItem>
                  <SelectItem value="Limited Partner">
                    Limited Partner
                  </SelectItem>
                  <SelectItem value="Capital Raiser">Capital Raiser</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {formData.role === 'Capital Raiser' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="total_capital_raised">Total Capital Raised (USD)</Label>
                <Input
                  id="total_capital_raised"
                  type="number"
                  placeholder="1000000"
                  value={formData.total_capital_raised}
                  onChange={(e) => handleInputChange("total_capital_raised", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deals_raised">Number of Deals Raised</Label>
                <Input
                  id="deals_raised"
                  type="number"
                  placeholder="10"
                  value={formData.deals_raised}
                  onChange={(e) => handleInputChange("deals_raised", e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium">Investment Profile</h2>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="fund_type">Fund Type</Label>
              <Select value={formData.fund_type} onValueChange={(value) => handleInputChange("fund_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fund type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venture_capital">
                    Venture Capital
                  </SelectItem>
                  <SelectItem value="private_equity">Private Equity</SelectItem>
                  <SelectItem value="hedge_fund">Hedge Fund</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fund_size">Fund Size (USD)</Label>
              <Input
                id="fund_size"
                type="number"
                placeholder="1000000"
                value={formData.fund_size}
                onChange={(e) => handleInputChange("fund_size", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investment_focus">Investment Focus</Label>
              <Textarea
                id="investment_focus"
                placeholder="Describe your investment focus and strategy"
                className="min-h-[100px]"
                value={formData.investment_focus}
                onChange={(e) => handleInputChange("investment_focus", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium">Performance & Risk</h2>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="historical_returns">Historical Returns (%)</Label>
              <Input
                id="historical_returns"
                type="number"
                placeholder="15"
                value={formData.historical_returns}
                onChange={(e) => handleInputChange("historical_returns", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk_profile">Risk Profile</Label>
              <Select value={formData.risk_profile} onValueChange={(value) => handleInputChange("risk_profile", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button disabled={loading || saving} onClick={handleSubmit}>
            {saving ? "Saving..." : loading ? "Loading..." : "Save Changes"}
          </Button>
        </div>
      </Card>
      </form>

      <Card className="p-6">
        <PaymentMethodManager userId={user?.uid || ""} />
      </Card>

      <SocialLinksForm
        linkedinUrl={links.linkedin || ""}
        twitterUrl={links.twitter || ""}
        websiteUrl={links.website || ""}
        onLinkedinChange={(value) => updateLink("linkedin", value)}
        onTwitterChange={(value) => updateLink("twitter", value)}
        onWebsiteChange={(value) => updateLink("website", value)}
        error={socialLinksError}
      />
    </div>
      <Toaster />
    </ProtectedRoute>
  );
}
