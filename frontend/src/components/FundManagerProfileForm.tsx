import { zodResolver } from "@hookform/resolvers/zod";
import brain from "brain";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  fund_name: z.string().min(2, "Fund name must be at least 2 characters"),
  fund_type: z.string().min(1, "Please select a fund type"),
  fund_size: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Fund size must be a positive number",
    }),
  investment_focus: z.string().min(2, "Investment focus is required"),
  historical_returns: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)),
      "Historical returns must be a number",
    ),
  risk_profile: z.string().min(1, "Please select a risk profile"),
});

type Props = {
  userId: string;
  onSuccess?: () => void;
};

export function FundManagerProfileForm({ userId, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",
      fund_name: "",
      fund_type: "",
      fund_size: "",
      investment_focus: "",
      historical_returns: "",
      risk_profile: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      // Convert numeric strings to numbers
      const profileData = {
        ...values,
        fund_size: parseFloat(values.fund_size),
        historical_returns: parseFloat(values.historical_returns),
        role: "Fund Manager",
        user_id: userId,
      };

      const response = await brain.create_profile({
        profile: profileData,
        token: {},
      });

      const data = await response.json();

      toast({
        title: "Profile Created",
        description: "Your fund manager profile has been created successfully.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/Dashboard");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Investment Firm LLC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fund_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fund Name</FormLabel>
              <FormControl>
                <Input placeholder="Growth Fund I" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fund_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fund Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fund type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="venture_capital">
                    Venture Capital
                  </SelectItem>
                  <SelectItem value="private_equity">Private Equity</SelectItem>
                  <SelectItem value="hedge_fund">Hedge Fund</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                  <SelectItem value="debt_fund">Debt Fund</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fund_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fund Size (USD)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="100000000" {...field} />
              </FormControl>
              <FormDescription>
                Enter the total fund size in USD
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="investment_focus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investment Focus</FormLabel>
              <FormControl>
                <Input
                  placeholder="Technology, Healthcare, Consumer"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter your main investment sectors or focus areas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="historical_returns"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Historical Returns (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="15.5"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter your fund's historical annual returns as a percentage
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="risk_profile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Risk Profile</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk profile" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Profile"}
        </Button>
      </form>
    </Form>
  );
}
