import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import brain from "brain";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const testCardSchema = z.object({
  number: z.string().min(16).max(16),
  exp_month: z.number().min(1).max(12),
  exp_year: z.number().min(2024),
  cvc: z.string().min(3).max(4),
});

const formSchema = z.object({
  amount: z.number().min(0.5).max(99999.99),
  currency: z.enum(["usd", "eur", "gbp"]),
  payment_method: z.enum(["card", "bank_transfer"]),
  description: z.string().optional(),
  card: testCardSchema.optional(),
  bank_account: z.record(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function TestPaymentForm() {
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: "usd",
      payment_method: "card",
      card: {
        number: "4242424242424242",
        exp_month: 12,
        exp_year: 2024,
        cvc: "123",
      },
    },
  });

  const paymentMethod = watch("payment_method");

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await brain.create_test_payment({
        body: data,
      });
      const result = await response.json();
      setResult(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process payment",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select {...register("currency")}>
            <option value="usd">USD</option>
            <option value="eur">EUR</option>
            <option value="gbp">GBP</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_method">Payment Method</Label>
          <Select {...register("payment_method")}>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input id="description" {...register("description")} />
        </div>

        {paymentMethod === "card" && (
          <div className="space-y-4 border p-4 rounded">
            <h3 className="font-medium">Card Details</h3>

            <div className="space-y-2">
              <Label htmlFor="card.number">Card Number</Label>
              <Input
                id="card.number"
                {...register("card.number")}
                placeholder="4242424242424242"
              />
              {errors.card?.number && (
                <p className="text-sm text-red-500">
                  {errors.card.number.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="card.exp_month">Exp Month</Label>
                <Input
                  id="card.exp_month"
                  type="number"
                  min="1"
                  max="12"
                  {...register("card.exp_month", { valueAsNumber: true })}
                />
                {errors.card?.exp_month && (
                  <p className="text-sm text-red-500">
                    {errors.card.exp_month.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="card.exp_year">Exp Year</Label>
                <Input
                  id="card.exp_year"
                  type="number"
                  min="2024"
                  {...register("card.exp_year", { valueAsNumber: true })}
                />
                {errors.card?.exp_year && (
                  <p className="text-sm text-red-500">
                    {errors.card.exp_year.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="card.cvc">CVC</Label>
                <Input id="card.cvc" {...register("card.cvc")} maxLength={4} />
                {errors.card?.cvc && (
                  <p className="text-sm text-red-500">
                    {errors.card.cvc.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "bank_transfer" && (
          <div className="space-y-4 border p-4 rounded">
            <h3 className="font-medium">Bank Account Details</h3>
            <p className="text-sm text-gray-500">
              Bank transfers are simulated and will always succeed in test mode.
            </p>
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Make Test Payment"}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert className="mt-4">
            <AlertDescription>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </AlertDescription>
          </Alert>
        )}
      </form>
    </Card>
  );
}
