import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
type AffiliateTier = "bronze" | "silver" | "gold" | "platinum";

interface Props {
  currentTier: AffiliateTier;
  monthlyReferrals: number;
  tierRequirements: {
    [key in AffiliateTier]: {
      min_referrals: number;
      commission_rate: number;
      benefits: string[];
    };
  };
}

export function TierProgress({
  currentTier,
  monthlyReferrals,
  tierRequirements,
}: Props) {
  // Get the next tier (if not at max tier)
  const tierOrder = Object.keys(tierRequirements) as AffiliateTier[];
  const currentTierIndex = tierOrder.findIndex((t) => t === currentTier);
  const nextTier =
    currentTierIndex < tierOrder.length - 1
      ? tierOrder[currentTierIndex + 1]
      : null;

  // Calculate progress percentage
  const maxReferrals =
    tierRequirements[tierOrder[tierOrder.length - 1]].min_referrals;
  const progress = Math.min((monthlyReferrals / maxReferrals) * 100, 100);

  return (
    <div className="space-y-4 animate-in fade-in-50">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="capitalize">
          {currentTier} Tier
        </Badge>
        <span className="text-sm text-muted-foreground">
          {monthlyReferrals} / {maxReferrals} referrals
        </span>
      </div>

      <Progress value={progress} className="h-2" />

      {nextTier && (
        <Card className="mt-4 bg-muted/50 border-dashed">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h4 className="font-medium">Next Tier Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {tierRequirements[nextTier].benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">•</span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <p className="text-sm mt-4 font-medium">
                {tierRequirements[nextTier].min_referrals - monthlyReferrals}{" "}
                more referrals needed
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
