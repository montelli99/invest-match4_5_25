import { useEffect, useState } from "react";
import brain from "brain";
import { GetCommissionPaymentsData, GetReferralStatsData, CalculateCommissionData } from "types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";



interface EarningsDisplayData {
  total_referrals: number;
  successful_referrals: number;
  total_earnings: number;
  pending_amount: number;
  current_rate: number;
  monthly_data: Array<{
    month: string;
    earnings: number;
  }>;
  recent_payments: Array<{
    id: string;
    amount: number;
    date: string;
    status: string;
    referral_id: string;
    commission_rate: number;
  }>;

  // Base stats
  total_referrals: number;
  successful_referrals: number;
  total_earnings: number;
  pending_amount: number;
  current_rate: number;
  
  // Monthly data
  monthly_data: Array<{
    month: string;
    earnings: number;
  }>;
  
  // Recent payments
  recent_payments: Array<{
    id: string;
    amount: number;
    date: string;
    status: string;
    referral_id: string;
    commission_rate: number;
  }>;

}

interface Props {
  userId: string;
}

export function EarningsDisplay({ userId }: Props) {
  const [data, setData] = useState<EarningsDisplayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEarningsData() {
      try {
        setIsLoading(true);
        setError(null);

        // Get referral stats
        const statsResponse = await brain.get_referral_stats({ userId });
        const statsData: GetReferralStatsData = await statsResponse.json();

        // Get commission payments
        const paymentsResponse = await brain.get_commission_payments({ affiliateId: userId });
        const paymentsData: GetCommissionPaymentsData = await paymentsResponse.json();

        // Get current commission rate
        const commissionResponse = await brain.calculate_commission({
          queryArgs: {
            structure_id: "default", // Using default structure
            base_amount: 100 // Sample amount to get current rate
          },
          body: {} // Empty performance metrics
        });
        const commissionData: CalculateCommissionData = await commissionResponse.json();

        // Process monthly data
        const monthlyData = processMonthlyEarnings(paymentsData.payments);

        setData({
          total_referrals: statsData.total_referrals,
          successful_referrals: statsData.successful_referrals,
          total_earnings: statsData.total_earnings,
          recent_payments: paymentsData.payments,
          current_rate: commissionData.commission_rate || 0.1, // Default to 10% if not available
          pending_amount: statsData.pending_earnings || 0,
          monthly_data: monthlyData
        });
      } catch (err) {
        console.error("Error loading earnings data:", err);
        setError("Failed to load earnings data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadEarningsData();
  }, [userId]);

  // Helper function to process monthly earnings
  function processMonthlyEarnings(payments: GetCommissionPaymentsData['payments']) {
    const monthlyMap = new Map<string, number>();
    
    payments.forEach(payment => {
      const date = new Date(payment.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const currentAmount = monthlyMap.get(monthKey) || 0;
      monthlyMap.set(monthKey, currentAmount + payment.amount);
    });

    return Array.from(monthlyMap.entries())
      .sort()
      .slice(-6) // Last 6 months
      .map(([month, earnings]) => ({
        month,
        earnings
      }));
  }
  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        {error}
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Loading earnings data...</div>
      </div>
    );
  }

  // Format monthly earnings data for the chart
  const chartData = data.monthly_data.map((item) => ({
    month: `Month ${index + 1}`,
    earnings: amount,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lifetime Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.total_earnings.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.pending_amount.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Commission Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data.current_rate * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed View */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart" className="space-y-4">
            <TabsList>
              <TabsTrigger value="chart">Monthly Chart</TabsTrigger>
              <TabsTrigger value="history">Payment History</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="space-y-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toFixed(2)}`,
                        "Earnings",
                      ]}
                    />
                    <Bar
                      dataKey="earnings"
                      fill="var(--primary)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                {data.recent_payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Payment #{payment.id.slice(-4)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${payment.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {payment.status}
                      </span>
                      <p className="text-sm font-medium">
                        ${payment.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
