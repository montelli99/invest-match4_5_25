import { Badge } from "@/components/ui/badge";
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
import { useState, useEffect } from "react";

import { SubscriptionTier } from "types";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Subscription {
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due';
  current_period_end: string;
  payment_method_id?: string;
}

interface ApiResponse<T> {
  ok: boolean;
  message?: string;
  data?: T;
}

interface UserSubscription {
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due';
  current_period_end: string;
  payment_method_id?: string;
}

interface PaymentMethod {
  id: string;
  last_four: string;
  payment_type: string;
}

type Interval = "month" | "year";

interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  interval: Interval;
  features: PlanFeature[];
  highlighted?: boolean;
}

export default function AccountSubscription() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(
    null,
  );

  const plans: SubscriptionPlan[] = [
    // Cast the tier to SubscriptionTier to ensure type safety
    {
      tier: "free" as SubscriptionTier,
      name: "Free",
      price: 0,
      interval: "month",
      features: [
        { name: "Basic profile", included: true },
        { name: "Limited searches", included: true },
        { name: "Basic matching", included: true },
        { name: "Community access", included: true },
      ],
    },
    {
      tier: "basic" as SubscriptionTier,
      name: "Basic",
      price: 29,
      interval: "month",
      features: [
        { name: "Enhanced profile", included: true },
        { name: "Unlimited searches", included: true },
        { name: "Advanced matching", included: true },
        { name: "Direct messaging", included: true },
        { name: "Basic analytics", included: true },
      ],
    },
    {
      tier: "professional" as SubscriptionTier,
      name: "Professional",
      price: 99,
      interval: "month",
      highlighted: true,
      features: [
        { name: "Premium profile", included: true },
        { name: "Priority matching", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Document sharing", included: true },
        { name: "Dedicated support", included: true },
      ],
    },
    {
      tier: "enterprise" as SubscriptionTier,
      name: "Enterprise",
      price: 299,
      interval: "month",
      features: [
        { name: "Custom solutions", included: true },
        { name: "API access", included: true },
        { name: "White-label options", included: true },
        { name: "24/7 support", included: true },
        { name: "Custom integrations", included: true },
      ],
    },
  ];

  const fetchPaymentMethods = async () => {
    try {
      setError(null);
      const response = await brain.get_payment_methods({ userId: "current" });
      const data: PaymentMethod[] = await response.json();
      setPaymentMethods(data);
      if (data.length > 0) {
        setSelectedPaymentMethod(data[0].id);
      }
    } catch (error: unknown) {
      console.error("Failed to fetch payment methods:", error);
      setError("Unable to load your payment methods.");
    }
  };

  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      try {
        const response = await brain.get_user_subscription({ userId: "current" });
        const result = await response.json() as unknown as ApiResponse<UserSubscription>;
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch subscription");
        }
        if (result.data) {
          setCurrentSubscription(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
        setError("Unable to load your subscription details.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCurrentSubscription();
    fetchPaymentMethods();
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setError(null);
    // Validate payment method
    if (!selectedPaymentMethod) {
      const errorMessage = "Please add a payment method before upgrading.";
    setError(errorMessage);
      toast({
        title: "Error",
        description: "Please add a payment method before upgrading.",
        variant: "destructive",
      });
      return;
    }

    // Prevent downgrading from enterprise
    if (currentSubscription?.tier === "enterprise" && plan.tier !== "enterprise") {
      toast({
        title: "Error",
        description: "Please contact support to downgrade from Enterprise plan.",
        variant: "destructive",
      });
      return;
    }

    // Prevent subscribing to current plan
    if (currentSubscription?.tier === plan.tier) {
      toast({
        title: "Info",
        description: "You are already subscribed to this plan.",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await brain.update_subscription(
      { userId: "current" },
      {
        new_tier: plan.tier,
        payment_method_id: selectedPaymentMethod,
        is_annual: plan.interval === "year"
      }
    );

      const result = await response.json() as ApiResponse<Subscription>;
      
      if (!response.ok || !result.data) {
        throw new Error(result.message || "Failed to update subscription");
      }
      
      // Verify the subscription was actually updated
      if (result.data.tier !== plan.tier) {
        throw new Error("Subscription update failed to apply. Please try again.");
      }

      // Refresh subscription data
      const updatedSubscription = await brain.get_user_subscription({ userId: "current" });
      const updatedResult = await updatedSubscription.json() as unknown as ApiResponse<UserSubscription>;
      if (!updatedSubscription.ok) {
        throw new Error(updatedResult.message || "Failed to fetch updated subscription");
      }
      if (updatedResult.data) {
        setCurrentSubscription(updatedResult.data);
      }
      toast({
        title: "Subscription updated",
        description: `You have successfully subscribed to the ${plan.name} plan.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {paymentMethods.length === 0 && (
          <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
            Please add a payment method before upgrading your subscription.
            <Button variant="link" className="pl-2" onClick={() => window.location.href = "/AccountSettings"}>
              Add Payment Method
            </Button>
          </div>
        )}
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Select the plan that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.tier}
            className={`relative ${plan.highlighted ? "border-primary" : ""}`}
          >
            {plan.highlighted && (
              <Badge
                className="absolute -top-2 -right-2 bg-primary"
                variant="default"
              >
                Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">${plan.price}</span>/
                {plan.interval}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <svg
                      className={`w-4 h-4 mr-2 ${feature.included ? "text-green-500" : "text-gray-300"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature.name}
                  </li>
                ))}
              </ul>
              {currentSubscription?.tier === plan.tier ? (
                <Badge variant="outline" className="w-full py-2">Current Plan</Badge>
              ) : (
                <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                onClick={() => handleSubscribe(plan)}
                disabled={loading || paymentMethods.length === 0}
              >
                {loading ? "Processing..." : "Subscribe"}
              </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
