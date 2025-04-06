import { ReferralDashboard } from "@/components/ReferralDashboard";
import { ReferralHistory } from "@/components/ReferralHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import brain from "brain";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { EarningsHistory } from "@/components/EarningsHistory";
import { ReferralSettings } from "@/components/ReferralSettings";

// Mock user ID - should come from auth context in real app
const MOCK_USER_ID = "user123";

export default function ReferralManagement() {
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("stripe");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleWithdrawalRequest = async () => {
    if (!withdrawalAmount || processing) return;
    
    setProcessing(true);
    try {
      await brain.process_commission_payment({
        affiliateId: MOCK_USER_ID,
        payment_method: selectedPaymentMethod
      });
      
      toast({
        title: "Success",
        description: "Your withdrawal request has been processed successfully."
      });
      setWithdrawalAmount("");
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process withdrawal. Please try again later."
      });
    } finally {
      setProcessing(false);
    }
    try {
      await brain.process_commission_payment({
        affiliateId: MOCK_USER_ID,
        payment_method: selectedPaymentMethod
      });
      // Show success message
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      // Show error message
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Referral Management</h1>

        <Dialog>
          <DialogTrigger asChild>
            <Button>Request Withdrawal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Commission Withdrawal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                >
                  <option value="stripe">Stripe</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <Button
                className="w-full"
                onClick={handleWithdrawalRequest}
                disabled={!withdrawalAmount || processing}
              >
                Submit Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ReferralDashboard userId={MOCK_USER_ID} />
        </TabsContent>

        <TabsContent value="referrals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
            </CardHeader>
            <CardContent>
              <ReferralHistory userId={MOCK_USER_ID} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Earnings History</CardTitle>
            </CardHeader>
            <CardContent>
              <EarningsHistory userId={MOCK_USER_ID} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <ReferralSettings userId={MOCK_USER_ID} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
