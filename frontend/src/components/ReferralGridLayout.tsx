import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  referralCode: string;
  referralStats: any;
  affiliateStatus: any;
  loading: boolean;
  generateReferralCode: () => void;
}

export function ReferralGridLayout({
  referralCode,
  referralStats,
  affiliateStatus,
  loading,
  generateReferralCode,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referralStats && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">
                    {referralStats.total_referrals}
                  </p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">
                    {referralStats.converted_referrals}
                  </p>
                  <p className="text-sm text-muted-foreground">Converted</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {affiliateStatus?.is_affiliate && (
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-xl font-bold capitalize">
                  {affiliateStatus.status.tier}
                </p>
                <p className="text-sm text-muted-foreground">Current Tier</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-xl font-bold">
                  {(affiliateStatus.status.commission_rate * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Commission Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Referral Code</CardTitle>
        </CardHeader>
        <CardContent>
          {referralCode ? (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Your Code:</p>
              <p className="text-xl font-bold mt-1">{referralCode}</p>
            </div>
          ) : (
            <Button
              onClick={generateReferralCode}
              disabled={loading}
              className="w-full"
            >
              Generate Code
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
