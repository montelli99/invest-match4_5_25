import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "./MultiSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
/**
 * Investment focus options grouped by category for Limited Partner profiles.
 * These options match the backend enum values to ensure data consistency.
 * Categories include:
 * - Financial Markets and Trading
 * - Cryptocurrency and Technology
 * - Real Estate
 * - Debt and Lending
 * - Private Equity and M&A
 * - Energy and Resources
 * - Healthcare and Life Sciences
 * - Alternative and Entertainment
 */
const InvestmentFocus = {
  // Financial Markets and Trading
  FOREX: "Forex",
  COMMODITIES: "Commodities",
  EQUITIES: "Equities",
  CURRENCIES: "Currencies",
  OPTIONS: "Options Trading",
  STOCKS: "Stocks",
  DERIVATIVES: "Derivatives",
  
  // Cryptocurrency and Technology
  CRYPTO: "Cryptocurrency",
  BITCOIN_MINING: "Bitcoin Mining",
  AI_ML: "AI - Machine Learning",
  
  // Real Estate
  RESIDENTIAL: "Residential",
  MULTIFAMILY: "Multifamily",
  SENIOR_LIVING: "Senior Living",
  CUSTOM_LUXURY: "Custom Luxury",
  SPEC_HOMES: "SPEC Homes",
  COMMERCIAL: "Commercial Real Estate",
  OFFICE: "Office Buildings",
  HOTELS: "Hotels and Motels",
  SELF_STORAGE: "Self Storage",
  INDUSTRIAL: "Industrial",
  RETAIL: "Retail",
  LAND: "Land",
  LAND_DEVELOPMENT: "Land Development",
  RV_PARKS: "RV Parks",
  RV_STORAGE: "RV Storage",
  GREEN_HOUSING: "Green Attainable Housing",
  
  // Debt and Lending
  HARD_MONEY: "Hard Money Lending",
  GAP_LENDING: "Gap Lending",
  LIENS: "Liens/Judgments",
  
  // Private Equity and M&A
  BUSINESS_ACQUISITIONS: "Business Acquisitions",
  ECOMMERCE: "Ecommerce Acquisitions",
  MERGERS_ACQUISITIONS: "Mergers & Acquisitions (M&A)",
  
  // Energy and Resources
  RENEWABLE_ENERGY: "Renewable Energy",
  CARBON_MARKETS: "Carbon Markets",
  IMPACT_INVESTING: "Impact Investing",
  SOLAR: "Solar",
  ESG: "Environmental, Social, and Governance (ESG)",
  OIL_GAS: "Oil & Gas",
  
  // Healthcare and Life Sciences
  HEALTHCARE: "Healthcare",
  LIFE_SCIENCES: "Life Sciences",
  HEALTH_WELLNESS: "Health & Wellness",
  
  // Alternative and Entertainment
  REVENUE_ROYALTY: "Revenue-Royalty Investing",
  ENTERTAINMENT: "Entertainment",
  MOTION_PICTURES: "Motion Pictures",
  RESTAURANTS: "Restaurants"
} as const;

/**
 * Props for the LimitedPartnerProfileForm component
 */
export interface LimitedPartnerProfile {
  investment_interests: string[];
  typical_commitment_size: number;
  risk_tolerance: 'Conservative' | 'Moderate' | 'Aggressive' | 'Very Aggressive';
  investment_horizon: number;
}

interface Props {
  /** Callback function called with form data when the form is submitted */
  onSubmit: (data: LimitedPartnerProfile) => void;
  /** Optional initial data to populate the form */
  initialData?: Partial<LimitedPartnerProfile>;
  /** Optional boolean to indicate loading state */
  isLoading?: boolean;
}

/**
 * Form component for Limited Partner profile creation and editing.
 * Allows users to specify their investment interests, commitment size,
 * risk tolerance, and investment horizon.
 *
 * @param onSubmit - Callback function called with form data when the form is submitted
 * @param initialData - Optional initial data to populate the form
 * @param isLoading - Optional boolean to indicate loading state
 */
export function LimitedPartnerProfileForm({
  onSubmit,
  initialData,
  isLoading = false,
}: Props) {
  // Initialize form state with initial data or default values
type FormData = {
    investment_interests: string[];
    typical_commitment_size: string;
    risk_tolerance: string;
    investment_horizon: string;
  };

  const [formData, setFormData] = useState<FormData>({
    investment_interests: initialData?.investment_interests || [],
    typical_commitment_size: initialData?.typical_commitment_size?.toString() || "",
    risk_tolerance: initialData?.risk_tolerance || "",
    investment_horizon: initialData?.investment_horizon?.toString() || "",
  });

  /**
   * Handles form submission.
   * Prevents default form submission and calls onSubmit with current form data.
   */
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert form data to LimitedPartnerProfile type
    const profileData: LimitedPartnerProfile = {
      investment_interests: formData.investment_interests,
      typical_commitment_size: parseFloat(formData.typical_commitment_size) || 0,
      risk_tolerance: formData.risk_tolerance as LimitedPartnerProfile['risk_tolerance'],
      investment_horizon: parseInt(formData.investment_horizon) || 0
    };
    onSubmit(profileData);
  };

  /**
   * Updates form data when a field value changes.
   * @param field - The name of the field to update
   * @param value - The new value for the field
   */
const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Convert investment focus options to format required by MultiSelect component
  const investmentFocusOptions = Object.values(InvestmentFocus).map(
    (focus) => ({
      label: focus,
      value: focus,
    }),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Limited Partner Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="investment_interests">Investment Interests</Label>
            <MultiSelect
              id="investment_interests"
              options={investmentFocusOptions}
              value={formData.investment_interests}
              onChange={(value) => handleChange("investment_interests", value)}
              placeholder="Select investment interests"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="typical_commitment_size">
              Typical Commitment Size (USD)
            </Label>
            <Input
              id="typical_commitment_size"
              type="number"
              min="10000"
              step="1000"
              value={formData.typical_commitment_size}
              onChange={(e) =>
                handleChange(
                  "typical_commitment_size",
                  parseFloat(e.target.value),
                )
              }
              placeholder="Enter typical commitment size"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk_tolerance">Risk Tolerance</Label>
            <Select
              value={formData.risk_tolerance}
              onValueChange={(value) => handleChange("risk_tolerance", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select risk tolerance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Conservative">Conservative</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Aggressive">Aggressive</SelectItem>
                <SelectItem value="Very Aggressive">Very Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment_horizon">
              Investment Horizon (Years)
            </Label>
            <Input
              id="investment_horizon"
              type="number"
              min="1"
              max="30"
              value={formData.investment_horizon}
              onChange={(e) =>
                handleChange("investment_horizon", parseInt(e.target.value))
              }
              placeholder="Enter investment horizon in years"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
