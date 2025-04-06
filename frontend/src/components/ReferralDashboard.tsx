import { Alert, AlertDescription } from "@/components/ui/alert";
import { LayoutSelector, type DashboardLayout } from "@/components/LayoutSelector";
import { ButtonGroup } from "@/components/ui/button-group";
import { Download, ExternalLink } from "lucide-react";
import { TierProgress } from "@/components/TierProgress";
import { EarningsDisplay } from "@/components/EarningsDisplay";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import brain from "brain";
import { useEffect, useState } from "react";

import { ReferralLink } from "types";

interface ReferralStats {
  total_referrals: number;
  converted_referrals: number;
  pending_referrals: number;
}

interface Props {
  userId: string;
}

export function ReferralDashboard({ userId }: Props) {
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [affiliateStatus, setAffiliateStatus] = useState<{
    is_affiliate: boolean;
    status: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [layout, setLayout] = useState<DashboardLayout>("compact");
  const [tierRequirements, setTierRequirements] = useState<any>(null);

  useEffect(() => {
    loadReferralData();
  }, [userId]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get referral links
      const linksResponse = await brain.get_referral_links({ userId: userId });
      const linksData = await linksResponse.json();
      setReferralLinks(linksData.links);

      // Get referral stats
      const statsResponse = await brain.get_referral_stats({ userId: userId });
      const stats = await statsResponse.json();
      setReferralStats(stats);

      // Get affiliate status
      const affiliateResponse = await brain.get_affiliate_status_endpoint({ userId: userId });
      
      // Get commission payments
      const paymentsResponse = await brain.get_commission_payments({ affiliateId: userId });
      const paymentsData = await paymentsResponse.json();
      const affiliate = await affiliateResponse.json();
      setAffiliateStatus(affiliate);

      // Prepare earnings data
      if (affiliate.is_affiliate) {
        setEarningsData({
          lifetime_earnings: affiliate.status.lifetime_earnings,
          pending_earnings: affiliate.status.pending_earnings,
          commission_rate: affiliate.status.commission_rate,
          monthly_earnings: [0, 0, 0, 0, 0, 0], // Placeholder for now
          recent_payments: paymentsData.payments.map((p: any) => ({
            id: p.id,
            amount: p.amount,
            date: p.created_at,
            status: p.status
          })).slice(0, 5)
        });
      }

      // Get tier requirements
      const tierResponse = await brain.get_tier_requirements();
      const tierData = await tierResponse.json();
      setTierRequirements(tierData);
    } catch (err) {
      console.error("Error loading referral data:", err);
      setError("Failed to load referral data. Please try again later.");
    } finally {
      setLoading(false);
    }

  };

  const generateReferralCode = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await brain.create_referral_code({ user_id: userId });
      const data = await response.json();
      setReferralCode(data.code);
    } catch (err) {
      console.error("Error generating referral code:", err);
      setError("Failed to generate referral code. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const activateAffiliate = async () => {
    try {
      setLoading(true);
      setError("");

      await brain.activate_affiliate({ user_id: userId });
      await loadReferralData(); // Reload data to get updated status
    } catch (err) {
      console.error("Error activating affiliate status:", err);
      setError("Failed to activate affiliate status. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-6">
        <ButtonGroup>
          <Button size="sm" variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Data</span>
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Full Dashboard</span>
          </Button>
        </ButtonGroup>
        <LayoutSelector currentLayout={layout} onLayoutChange={setLayout} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
          <CardDescription>
            Invite others to join and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referralCode ? (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Your Referral Code:</p>
                <p className="text-2xl font-bold mt-1">{referralCode}</p>
              </div>
            ) : (
              <Button onClick={generateReferralCode} disabled={loading}>
                Generate Referral Code
              </Button>
            )}

            {referralStats && (
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {referralStats.total_referrals}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Referrals
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {referralStats.converted_referrals}
                  </p>
                  <p className="text-sm text-muted-foreground">Converted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {referralStats.pending_referrals}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {affiliateStatus?.is_affiliate && earningsData && (
        <EarningsDisplay data={earningsData} isLoading={loading} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Affiliate Program</CardTitle>
          <CardDescription>
            Earn commission by referring qualified investors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {affiliateStatus?.is_affiliate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Current Tier</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {affiliateStatus.status.tier}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Monthly Referrals</p>
                  <p className="text-sm text-muted-foreground">
                    {affiliateStatus.status.monthly_successful_referrals}
                  </p>
                </div>
              </div>

              {/* Tier Progress */}
              {tierRequirements && (
                <TierProgress
                  currentTier={affiliateStatus.status.tier}
                  monthlyReferrals={affiliateStatus.status.monthly_successful_referrals}
                  tierRequirements={tierRequirements}
                />
              )}

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">
                    {affiliateStatus.status.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Commission Rate</p>
                  <p className="text-sm text-muted-foreground">
                    {(affiliateStatus.status.commission_rate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Lifetime Earnings</p>
                  <p className="text-sm text-muted-foreground">
                    ${affiliateStatus.status.lifetime_earnings.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Pending Earnings</p>
                  <p className="text-sm text-muted-foreground">
                    ${affiliateStatus.status.pending_earnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Join our affiliate program to start earning commission on
                successful referrals
              </p>
              <Button onClick={activateAffiliate} disabled={loading}>
                Activate Affiliate Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
