import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { useEffect, useState } from "react";
import { SubscriptionPlan, SubscriptionTier } from "types";

export default function Subscriptions() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Record<string, SubscriptionPlan>>();
  const [currentSubscription, setCurrentSubscription] =
    useState<SubscriptionTier>();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await brain.get_subscription_plans();
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        toast({
          title: "Error",
          description: "Failed to load subscription plans. Please try again.",
          variant: "destructive",
        });
      }
    };

    const fetchCurrentSubscription = async () => {
      try {
        const response = await brain.get_user_subscription({
          userId: "current",
        });
        const data = await response.json();
        setCurrentSubscription(data.tier);
      } catch (error) {
        console.error("Failed to fetch current subscription:", error);
      }
    };

    fetchPlans();
    fetchCurrentSubscription();
  }, [toast]);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    setLoading(true);
    try {
      const response = await brain.update_subscription({
        userId: "current",
        body: {
          new_tier: tier,
          payment_method_id: "default", // This should be replaced with actual payment method selection
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update subscription");
      }

      toast({
        title: "Subscription updated",
        description: "Your subscription has been updated successfully.",
      });

      setCurrentSubscription(tier);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (!plans) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <h1 className="text-3xl font-semibold mb-6">Subscription Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(plans).map(([key, plan]) => (
          <Card key={key} className="relative">
            {currentSubscription === plan.tier && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-sm py-1 px-3 rounded-full">
                  Current Plan
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-3xl font-bold">
                ${plan.price_monthly}
                <span className="text-sm font-normal">/month</span>
              </div>
              <div className="space-y-2">
                <div className="font-medium">Features:</div>
                <ul className="space-y-2 text-sm">
                  <li>Up to {plan.max_contacts} contacts</li>
                  <li>{plan.max_matches_per_month} matches per month</li>
                  <li>{plan.profile_visibility_level} profile visibility</li>
                  <li>{plan.support_level} support</li>
                </ul>
              </div>
              <Button
                className="w-full"
                variant={
                  currentSubscription === plan.tier ? "outline" : "default"
                }
                disabled={loading || currentSubscription === plan.tier}
                onClick={() => handleUpgrade(plan.tier)}
              >
                {currentSubscription === plan.tier ? "Current Plan" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
