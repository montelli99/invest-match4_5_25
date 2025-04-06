import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import brain from "brain";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TrialPeriodSelector } from "./TrialPeriodSelector";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { FeatureAccess, SubscriptionPlan, SubscriptionTier } from "types";
import { LoadingState } from "./LoadingState";

interface Props {
  currentPlan?: SubscriptionTier;
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  userId?: string;
}

export function SubscriptionPlans({ currentPlan, onSelectPlan, userId }: Props) {
  const [plans, setPlans] = useState<Record<string, SubscriptionPlan>>({});
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>();
  const [showTrialSelector, setShowTrialSelector] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await brain.get_subscription_plans();
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to load subscription plans");
      }
    };

    fetchPlans();
  }, []);

  const getFeatureAccessIcon = (access: FeatureAccess) => {
    switch (access) {
      case "full":
        return <Check className="h-5 w-5 text-primary" />;
      case "limited":
        return <Check className="h-5 w-5 text-muted-foreground" />;
      default:
        return <span className="h-5 w-5 text-muted-foreground">-</span>;
    }
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    
    // If plan has trial periods available, show trial selector
    if (plan.trial_periods_available?.length > 0) {
      setShowTrialSelector(true);
      return;
    }

    if (onSelectPlan) {
      onSelectPlan(plan);
    } else {
      navigate("/CreateProfile");
    }
  };

  const handleTrialPeriodSelect = async (trialPeriod: number) => {
    if (!selectedPlan || !userId) {
      toast.error("Unable to start trial", {
        description: "Missing user information. Please try again."
      });
      return;
    }

    try {
      const response = await brain.start_trial({
        user_id: userId,
        trial_code: `TRIAL_${trialPeriod}M`,
      });
      const result = await response.json();
      
      toast.success("Trial started successfully", {
        description: result.message
      });
      
      setShowTrialSelector(false);
      
      if (onSelectPlan) {
        onSelectPlan(selectedPlan);
      } else {
        navigate("/CreateProfile");
      }
    } catch (error) {
      console.error("Error starting trial:", error);
      toast.error("Failed to start trial", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    }
  };

  if (!plans || Object.keys(plans).length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-4">
        <span className={!isAnnual ? "font-semibold" : "text-muted-foreground"}>
          Monthly
        </span>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
          className="data-[state=checked]:bg-primary"
        />
        <span className={isAnnual ? "font-semibold" : "text-muted-foreground"}>
          Annual
          <Badge variant="secondary" className="ml-2">
            Save 17%
          </Badge>
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Object.values(plans).map((plan) => (
          <Card
            key={plan.tier}
            className={`p-6 ${currentPlan === plan.tier ? "border-primary" : ""}`}
          >
            <div className="mb-4">
              <h3 className="text-2xl font-semibold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold">
                ${isAnnual ? plan.price_annual / 12 : plan.price_monthly}
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </div>
              {isAnnual && (
                <div className="text-sm text-muted-foreground">
                  Billed annually (${plan.price_annual}/year)
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>{plan.max_contacts.toLocaleString()} contacts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>
                  {plan.max_matches_per_month.toLocaleString()} matches/month
                </span>
              </div>
              {Object.entries(plan.features).map(([feature, access]) => (
                <div key={feature} className="flex items-center gap-2">
                  {getFeatureAccessIcon(access)}
                  <span
                    className={access === "none" ? "text-muted-foreground" : ""}
                  >
                    {feature
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                    {access === "limited" && " (Limited)"}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>{plan.support_level} support</span>
              </div>
            </div>

            <Button
              className="w-full"
              variant={currentPlan === plan.tier ? "outline" : "default"}
              onClick={() => handleSelectPlan(plan)}
            >
              {currentPlan === plan.tier
                ? "Current Plan"
                : plan.tier === "free"
                  ? "Get Started"
                  : "Upgrade"}
            </Button>

            {plan.trial_periods_available?.length > 0 && (
              <p className="text-sm text-center mt-4 text-muted-foreground">
                {plan.trial_periods_available.join(", ")} month trial available
              </p>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={showTrialSelector} onOpenChange={setShowTrialSelector}>
        <DialogContent>
          <TrialPeriodSelector
            trialPeriods={selectedPlan?.trial_periods_available || []}
            onSelect={handleTrialPeriodSelect}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
