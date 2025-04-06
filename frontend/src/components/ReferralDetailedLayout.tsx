import { EarningsDisplay } from "@/components/EarningsDisplay";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  referralCode: string;
  referralStats: any;
  affiliateStatus: any;
  earningsData: any;
  loading: boolean;
  generateReferralCode: () => void;
}

export function ReferralDetailedLayout({
  referralCode,
  referralStats,
  affiliateStatus,
  earningsData,
  loading,
  generateReferralCode,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </CardContent>
        </Card>

        {referralStats && (
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Your referral statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">
                    {referralStats.total_referrals}
                  </p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">
                    {referralStats.converted_referrals}
                  </p>
                  <p className="text-sm text-muted-foreground">Converted</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">
                    {referralStats.pending_referrals}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {affiliateStatus?.is_affiliate && earningsData && (
        <EarningsDisplay data={earningsData} isLoading={loading} />
      )}
    </div>
  );
}
