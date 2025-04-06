import { CardSkeleton } from "@/components/CardSkeleton";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "components/VerificationBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import brain from "brain";
import { useEffect, useState } from "react";
import { InvestorProfile as InvestorProfileType } from "types";
import { VerificationState } from "utils/verification";

interface Props {
  investorId: string;
  onClose: () => void;
}

export function InvestorProfile({ investorId, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [investor, setInvestor] = useState<InvestorProfileType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestor = async () => {
      try {
        setLoading(true);
        // TODO: Add endpoint to fetch single investor
        const response = await brain.search_investors({
          body: {
            name: investorId,
          },
        });
        const data = await response.json();
        setInvestor(data.investors[0] || null);
      } catch (error) {
        console.error("Error fetching investor:", error);
        setError("Failed to load investor details");
      } finally {
        setLoading(false);
      }
    };

    fetchInvestor();
  }, [investorId]);

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  if (loading) return <CardSkeleton className="min-h-[400px]" />;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!investor) return <div>No investor found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{investor.name}</h2>
            {investor.verification_state?.level && (
              <VerificationBadge 
                level={investor.verification_state.level}
                className="ml-2"
              />
            )}
          </div>
          <p className="text-muted-foreground">{investor.company}</p>
        </div>
        <Badge variant="secondary">{investor.fund_type}</Badge>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Fund Overview</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Fund Size</p>
              <p className="text-muted-foreground">
                {formatCurrency(investor.fund_size)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Historical Returns</p>
              <p className="text-muted-foreground">
                {investor.historical_returns
                  ? `${investor.historical_returns.toFixed(1)}%`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Risk Profile</p>
              <p className="text-muted-foreground">
                {investor.risk_profile || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Investment Focus</h3>
          {investor.investment_focus && investor.investment_focus.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {investor.investment_focus.map((focus) => (
                <Badge key={focus} variant="outline">
                  {focus}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No investment focus specified
            </p>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button>Contact Investor</Button>
      </div>
    </div>
  );
}
