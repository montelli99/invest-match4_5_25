import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { useEffect, useState } from "react";

interface Props {
  userId: string;
  onUpdate?: () => void;
}

interface SubscriptionPlan {
  tier: string;
  name: string;
  description: string;
  price_monthly: number;
  price_annual: number;
  features: Record<string, string>;
  max_contacts: number;
  max_matches_per_month: number;
  profile_visibility_level: string;
  support_level: string;
  trial_periods_available?: number[];
}

interface PaymentMethod {
  id: string;
  type: string;
  last_four: string;
  is_default: boolean;
}

export function SubscriptionManager({ userId, onUpdate }: Props) {
  const [plans, setPlans] = useState<Record<string, SubscriptionPlan>>({});
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      // Load subscription plans
      const plansResponse = await brain.get_subscription_plans();
      const plansData = await plansResponse.json();
      setPlans(plansData);

      // Load current subscription
      const subscriptionResponse = await brain.get_user_subscription({
        userId,
      });
      const subscriptionData = await subscriptionResponse.json();
      setCurrentSubscription(subscriptionData);

      // Load payment methods
      const paymentMethodsResponse = await brain.get_payment_methods({
        userId,
      });
      const paymentMethodsData = await paymentMethodsResponse.json();
      setPaymentMethods(paymentMethodsData);
    } catch (error) {
      console.error("Error loading subscription data:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleUpgrade = async () => {
    if (!selectedTier || !selectedPaymentMethod) {
      toast({
        title: "Error",
        description: "Please select a plan and payment method",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);

      await brain.update_subscription({
        userId,
        body: {
          new_tier: selectedTier,
          payment_method_id: selectedPaymentMethod,
          is_annual: isAnnual,
        },
      });

      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });

      setUpgradeDialogOpen(false);
      loadData();
      onUpdate?.();
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading subscription information...</div>;
  }

  const currentPlan = currentSubscription
    ? plans[currentSubscription.tier]
    : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Subscription</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            {currentPlan?.description || "No active subscription"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan && (
            <div className="space-y-2">
              <p>
                <span className="font-medium">Plan:</span> {currentPlan.name}
              </p>
              <p>
                <span className="font-medium">Price:</span> $
                {currentSubscription?.is_annual
                  ? currentPlan.price_annual
                  : currentPlan.price_monthly}
                {currentSubscription?.is_annual ? "/year" : "/month"}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {currentSubscription?.payment_status}
              </p>
              {currentSubscription?.next_payment_date && (
                <p>
                  <span className="font-medium">Next Payment:</span>{" "}
                  {new Date(
                    currentSubscription.next_payment_date,
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
            <DialogTrigger asChild>
              <Button>Change Plan</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Change Subscription Plan</DialogTitle>
                <DialogDescription>
                  Choose a new plan and payment method.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Select Plan</Label>
                  <Select value={selectedTier} onValueChange={setSelectedTier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(plans).map(([tier, plan]) => (
                        <SelectItem key={tier} value={tier}>
                          {plan.name} - $
                          {isAnnual ? plan.price_annual : plan.price_monthly}
                          {isAnnual ? "/year" : "/month"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="annual-billing"
                    checked={isAnnual}
                    onCheckedChange={setIsAnnual}
                  />
                  <Label htmlFor="annual-billing">Annual billing</Label>
                </div>

                <div className="grid gap-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={selectedPaymentMethod}
                    onValueChange={setSelectedPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          Card ending in {method.last_four}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpgrade} disabled={processing}>
                  {processing ? "Processing..." : "Confirm Change"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          {currentPlan && (
            <div className="space-y-2">
              <p>
                <span className="font-medium">Max Contacts:</span>{" "}
                {currentPlan.max_contacts}
              </p>
              <p>
                <span className="font-medium">Max Matches per Month:</span>{" "}
                {currentPlan.max_matches_per_month}
              </p>
              <p>
                <span className="font-medium">Profile Visibility:</span>{" "}
                {currentPlan.profile_visibility_level}
              </p>
              <p>
                <span className="font-medium">Support Level:</span>{" "}
                {currentPlan.support_level}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
