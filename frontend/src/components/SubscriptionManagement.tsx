import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { PaymentMethodManager } from "./PaymentMethodManager";
import { BillingHistory } from "./BillingHistory";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import brain from "brain";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserSubscription } from "types";
import { SubscriptionTier } from "../utils/enums";

interface Props {
  token: { idToken: string };
}

interface ExtendedUserSubscription extends UserSubscription {
  email?: string;
  name?: string;
}

export function SubscriptionManagement({ token }: Props) {
  const [subscriptions, setSubscriptions] = useState<
    ExtendedUserSubscription[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(
    SubscriptionTier.Free,
  );
  const [isAnnual, setIsAnnual] = useState(false);
  const [trialDays, setTrialDays] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [processingRefund, setProcessingRefund] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      // Get all user profiles first
      const profilesResponse = await brain.list_admin_users({ token });
      const profilesData = await profilesResponse.json();
      const profiles = profilesData.users.reduce(
        (acc: Record<string, any>, user: any) => {
          acc[user.uid] = { email: user.email, name: user.name };
          return acc;
        },
        {},
      );

      // Get all subscriptions
      const subscriptionsPromises = Object.keys(profiles).map((userId) =>
        brain
          .get_user_subscription({ userId })
          .then((response) => response.json())
          .then((subscription) => ({
            ...subscription,
            email: profiles[userId]?.email,
            name: profiles[userId]?.name,
          }))
          .catch(() => null),
      );

      const results = await Promise.all(subscriptionsPromises);
      setSubscriptions(results.filter(Boolean));
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedUserId || !refundAmount || !refundReason) {
      toast.error("Please fill in all required fields");
      return;
    }

    setProcessingRefund(true);
    try {
      await brain.request_refund({
        subscription_id: selectedUserId,
        user_id: selectedUserId,
        amount: parseFloat(refundAmount),
        reason: refundReason,
        request_date: new Date().toISOString(),
      });

      toast.success("Refund request submitted successfully");
      setShowRefundDialog(false);
      setRefundAmount("");
      setRefundReason("");
      loadSubscriptions();
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("Failed to process refund");
    } finally {
      setProcessingRefund(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await brain.export_analytics({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date().toISOString(),
        format: "csv",
        metrics: ["subscriptions", "trials", "revenue"],
      });

      // Create a blob from the response and download it
      const blob = new Blob([await response.text()], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscription-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  const handleUpdateSubscription = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    try {
      if (trialDays) {
        // Start a trial if trial days are specified
        await brain.start_trial({
          user_id: selectedUserId,
          trial_code: "ADMIN_TRIAL", // Using a special trial code for admin-initiated trials
          trial_period: Math.floor(parseInt(trialDays) / 30), // Convert days to months
        });
        toast.success("Trial period started successfully");
      } else {
        // Regular subscription update
        await brain.update_subscription(
          { userId: selectedUserId },
          {
            new_tier: selectedTier,
            payment_method_id: "admin_override",
            is_annual: isAnnual
          },
        );
        toast.success("Subscription updated successfully");
      }

      loadSubscriptions();
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription");
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (filterStatus !== "all") {
      if (filterStatus === "trial" && !sub.is_trial) return false;
      if (filterStatus === "active" && sub.is_trial) return false;
      if (
        filterStatus === "expired" &&
        new Date(sub.end_date || "") > new Date()
      )
        return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        sub.email?.toLowerCase().includes(query) ||
        sub.name?.toLowerCase().includes(query) ||
        sub.user_id.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>
            View and manage your current subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <div className="flex items-center space-x-2">
              <span className={!isAnnual ? "font-medium" : "text-muted-foreground"}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
              />
              <span className={isAnnual ? "font-medium" : "text-muted-foreground"}>
                Annual (Save 20%)
              </span>
            </div>
          </div>
          
          <SubscriptionPlans
            currentTier={selectedTier}
            onSelectPlan={(plan) => setSelectedTier(plan.tier)}
            isAnnual={isAnnual}
          />
        </CardContent>
      </Card>

      <PaymentMethodManager
        userId={selectedUserId}
        onUpdate={loadSubscriptions}
      />

      <BillingHistory userId={selectedUserId} />
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>
            Manage user subscriptions, trials, and access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Filter by Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subscriptions</SelectItem>
                    <SelectItem value="trial">Trial Only</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Search</Label>
                <Input
                  placeholder="Search by email, name, or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="border rounded-lg">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading subscriptions...
                </div>
              ) : filteredSubscriptions.length > 0 ? (
                <div className="divide-y">
                  {filteredSubscriptions.map((subscription) => (
                    <div
                      key={subscription.user_id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          {subscription.email || subscription.user_id}
                        </p>
                        {subscription.name && (
                          <p className="text-sm text-muted-foreground">
                            {subscription.name}
                          </p>
                        )}
                        <div className="flex gap-2 mt-1">
                          <Badge>{subscription.tier}</Badge>
                          {subscription.is_trial && (
                            <Badge variant="secondary">Trial</Badge>
                          )}
                          {subscription.end_date &&
                            new Date(subscription.end_date) < new Date() && (
                              <Badge variant="destructive">Expired</Badge>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {subscription.start_date && (
                            <span>
                              Started:{" "}
                              {format(new Date(subscription.start_date), "PP")}
                            </span>
                          )}
                          {subscription.end_date && (
                            <span className="ml-4">
                              Ends:{" "}
                              {format(new Date(subscription.end_date), "PP")}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedUserId(subscription.user_id);
                          setSelectedTier(subscription.tier);
                          setTrialDays("");
                        }}
                      >
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No subscriptions found
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Subscription</CardTitle>
          <CardDescription>
            Modify a user's subscription status and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label>User ID</Label>
                <Input
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  placeholder="Enter user ID"
                />
              </div>
              <div>
                <Label>Subscription Tier</Label>
                <Select
                  value={selectedTier}
                  onValueChange={(value) =>
                    setSelectedTier(value as SubscriptionTier)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SubscriptionTier.Free}>Free</SelectItem>
                    <SelectItem value={SubscriptionTier.Basic}>
                      Basic
                    </SelectItem>
                    <SelectItem value={SubscriptionTier.Professional}>
                      Professional
                    </SelectItem>
                    <SelectItem value={SubscriptionTier.Enterprise}>
                      Enterprise
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trial Period (days)</Label>
                <Input
                  type="number"
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  placeholder="Leave empty for no trial"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleUpdateSubscription} className="flex-1">
                Update Subscription
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRefundDialog(true)}
                className="flex-1"
                disabled={!selectedUserId}
              >
                Process Refund
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Analytics</CardTitle>
          <CardDescription>
            Overview of subscription statistics and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Total Active</h4>
              <p className="text-2xl font-bold">
                {
                  subscriptions.filter(
                    (s) => !s.end_date || new Date(s.end_date) > new Date(),
                  ).length
                }
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Trial Users</h4>
              <p className="text-2xl font-bold">
                {subscriptions.filter((s) => s.is_trial).length}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Expired</h4>
              <p className="text-2xl font-bold">
                {
                  subscriptions.filter(
                    (s) => s.end_date && new Date(s.end_date) < new Date(),
                  ).length
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Enter the refund details for the selected subscription
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Refund Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Enter refund amount"
              />
            </div>

            <div className="space-y-2">
              <Label>Reason for Refund</Label>
              <Textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRefundDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={processingRefund || !refundAmount || !refundReason}
            >
              {processingRefund ? "Processing..." : "Submit Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            Generate and download subscription reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportReport} className="w-full">
            Export Subscription Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
