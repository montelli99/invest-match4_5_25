import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { useState } from "react";
import { validateSocialLinks } from "@/utils/validateSocialLinks";
import { ImageUpload } from "./ImageUpload";
import { SocialLinksForm } from "./SocialLinksForm";
import { useForm } from "react-hook-form";

interface ProfileFormData {
  // Common fields
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  profileImage?: string;
  fullName: string;
  companyName: string;
  role: string;

  // Limited Partner fields
  typicalCommitmentSize?: number;
  investmentHorizon?: number;
  investmentInterests?: string[];
  riskTolerance?: string;

  // Fund Manager fields
  fundType?: string;
  fundSize?: number;
  investmentFocus?: string[];
  historicalReturns?: number;
  riskProfile?: string;

  // Capital Raiser fields
  dealsRaised?: number;
  industryFocus?: string[];
  typicalDealSize?: number;
  trackRecord?: string;
  yearsExperience?: number;
  successRate?: number;

  // Fund of Funds fields
  portfolioSize?: number;
  numberOfFundInvestments?: number;
  investmentStrategy?: string;
  targetFundTypes?: string[];
  dueDiligenceProcess?: string;
  averageInvestmentSize?: number;
  geographicFocus?: string[];
  minimumFundSize?: number;
  maximumFundSize?: number;
  preferredTerms?: string;
  performanceMetrics?: {
    irr?: number;
    tvpi?: number;
    dpi?: number;
  };

  // Common fields
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  profileImage?: string;
  fullName: string;
  companyName: string;
  role: string;

  // Limited Partner fields
  typicalCommitmentSize?: number;
  investmentHorizon?: number;
  investmentInterests?: string[];
  riskTolerance?: string;

  // Fund Manager fields
  fundType?: string;
  fundSize?: number;
  investmentFocus?: string[];
  historicalReturns?: number;
  riskProfile?: string;

  // Capital Raiser fields
  dealsRaised?: number;
  industryFocus?: string[];
  typicalDealSize?: number;
  trackRecord?: string;
  yearsExperience?: number;
  successRate?: number;
  // Common fields
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  profileImage?: string;
  fullName: string;
  companyName: string;
  role: string;
  
  // Limited Partner fields
  typicalCommitmentSize?: number;
  investmentHorizon?: number;
  investmentInterests?: string[];
  riskTolerance?: string;
  
  // Fund Manager fields
  fundType?: string;
  fundSize?: number;
  investmentFocus?: string[];
  historicalReturns?: number;
  riskProfile?: string;
  
  // Capital Raiser fields
  dealsRaised?: number;
  industryFocus?: string[];
  typicalDealSize?: number;
  trackRecord?: string;
  yearsExperience?: number;
  successRate?: number;
  // Common fields
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  profileImage?: string;
  fullName: string;
  companyName: string;
  role: string;
  // Limited Partner fields
  typicalCommitmentSize?: number;
  investmentHorizon?: number;
  investmentInterests?: string[];
  riskTolerance?: string;

}

export const ProfileForm = () => {
  const [loading, setLoading] = useState(false);
  const [socialLinksError, setSocialLinksError] = useState<{
    linkedin?: string;
    twitter?: string;
    website?: string;
  }>({});

  const defaultValues = {
    socialLinks: {
      linkedin: "",
      twitter: "",
      website: ""
    },
    fullName: "",
    companyName: "",
    role: ""
  };

  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ProfileFormData>({
    defaultValues
  });

  const onSubmit = async (data: ProfileFormData) => {
    // Validate social links before submission
    const errors = validateSocialLinks(data.socialLinks);
    setSocialLinksError(errors);
    
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please check your social media links",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await brain.create_profile({
        profile: data,
        token: {},
      });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your profile information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Label>Profile Image</Label>
          <ImageUpload 
            currentImageUrl={watch("profileImage")} 
            onImageUploaded={(url) => setValue("profileImage", url)} 
          />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <SocialLinksForm
              linkedinUrl={watch("socialLinks.linkedin") || ""}
              twitterUrl={watch("socialLinks.twitter") || ""}
              websiteUrl={watch("socialLinks.website") || ""}
              onLinkedinChange={(value) => setValue("socialLinks.linkedin", value)}
              onTwitterChange={(value) => setValue("socialLinks.twitter", value)}
              onWebsiteChange={(value) => setValue("socialLinks.website", value)}
              error={socialLinksError}
              loading={loading}
            />
            <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  {...register("fullName", {
                    required: "Full name is required",
                  })}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">
                    {errors.fullName.message}
                  </p>
                )}

            {watch("role") === "fund_of_funds" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="portfolioSize">Portfolio Size (USD)</Label>
                    <Input
                      id="portfolioSize"
                      type="number"
                      {...register("portfolioSize", { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfFundInvestments">Number of Fund Investments</Label>
                    <Input
                      id="numberOfFundInvestments"
                      type="number"
                      {...register("numberOfFundInvestments", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investmentStrategy">Investment Strategy</Label>
                  <Textarea
                    id="investmentStrategy"
                    {...register("investmentStrategy")}
                    placeholder="Describe your investment strategy and approach..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetFundTypes">Target Fund Types</Label>
                  <Select
                    onValueChange={(value) =>
                      register("targetFundTypes").onChange({ target: { value: [value] } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary fund type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venture_capital">Venture Capital</SelectItem>
                      <SelectItem value="private_equity">Private Equity</SelectItem>
                      <SelectItem value="hedge_fund">Hedge Fund</SelectItem>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                      <SelectItem value="debt">Private Debt</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDiligenceProcess">Due Diligence Process</Label>
                  <Textarea
                    id="dueDiligenceProcess"
                    {...register("dueDiligenceProcess")}
                    placeholder="Describe your due diligence process..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimumFundSize">Minimum Fund Size (USD)</Label>
                    <Input
                      id="minimumFundSize"
                      type="number"
                      {...register("minimumFundSize", { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maximumFundSize">Maximum Fund Size (USD)</Label>
                    <Input
                      id="maximumFundSize"
                      type="number"
                      {...register("maximumFundSize", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geographicFocus">Geographic Focus</Label>
                  <Select
                    onValueChange={(value) =>
                      register("geographicFocus").onChange({ target: { value: [value] } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary geographic focus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north_america">North America</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="latin_america">Latin America</SelectItem>
                      <SelectItem value="africa">Africa</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredTerms">Preferred Terms</Label>
                  <Textarea
                    id="preferredTerms"
                    {...register("preferredTerms")}
                    placeholder="Describe your preferred investment terms..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="performanceMetrics.irr">Target IRR (%)</Label>
                    <Input
                      id="performanceMetrics.irr"
                      type="number"
                      step="0.01"
                      {...register("performanceMetrics.irr", { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="performanceMetrics.tvpi">Target TVPI</Label>
                    <Input
                      id="performanceMetrics.tvpi"
                      type="number"
                      step="0.01"
                      {...register("performanceMetrics.tvpi", { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="performanceMetrics.dpi">Target DPI</Label>
                    <Input
                      id="performanceMetrics.dpi"
                      type="number"
                      step="0.01"
                      {...register("performanceMetrics.dpi", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </>
            )}
              </div>
          </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  {...register("companyName", {
                    required: "Company name is required",
                  })}
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">
                    {errors.companyName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value) =>
                  register("role").onChange({ target: { value } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fund_manager">Fund Manager</SelectItem>
                  <SelectItem value="limited_partner">
                    Limited Partner
                  </SelectItem>
                  <SelectItem value="capital_raiser">Capital Raiser</SelectItem>
                  <SelectItem value="fund_of_funds">Fund of Funds</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>

            {watch("role") === "fund_manager" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fundType">Fund Type</Label>
                    <Select
                      onValueChange={(value) =>
                        register("fundType").onChange({ target: { value } })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fund type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="venture_capital">
                          Venture Capital
                        </SelectItem>
                        <SelectItem value="private_equity">
                          Private Equity
                        </SelectItem>
                        <SelectItem value="hedge_fund">Hedge Fund</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fundSize">Fund Size (USD)</Label>
                    <Input
                      id="fundSize"
                      type="number"
                      {...register("fundSize", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskProfile">Risk Profile</Label>
                  <Select
                    onValueChange={(value) =>
                      register("riskProfile").onChange({ target: { value } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="historicalReturns">Historical Returns (%)</Label>
                  <Input
                    id="historicalReturns"
                    type="number"
                    step="0.01"
                    {...register("historicalReturns", { valueAsNumber: true })}
                  />
                </div>
              </>
            )}

            {watch("role") === "limited_partner" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="typicalCommitmentSize">Typical Commitment Size (USD)</Label>
                    <Input
                      id="typicalCommitmentSize"
                      type="number"
                      {...register("typicalCommitmentSize", { 
                        valueAsNumber: true,
                        required: "Typical commitment size is required",
                        min: {
                          value: 10000,
                          message: "Minimum commitment size is $10,000"
                        }
                      })}
                    />
                    {errors.typicalCommitmentSize && (
                      <p className="text-sm text-destructive">
                        {errors.typicalCommitmentSize.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="investmentHorizon">Investment Horizon (Years)</Label>
                    <Input
                      id="investmentHorizon"
                      type="number"
                      {...register("investmentHorizon", { 
                        valueAsNumber: true,
                        required: "Investment horizon is required",
                        min: {
                          value: 1,
                          message: "Minimum investment horizon is 1 year"
                        },
                        max: {
                          value: 30,
                          message: "Maximum investment horizon is 30 years"
                        }
                      })}
                    />
                    {errors.investmentHorizon && (
                      <p className="text-sm text-destructive">
                        {errors.investmentHorizon.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investmentInterests">Investment Interests</Label>
                  <Select
                    onValueChange={(value) =>
                      register("investmentInterests").onChange({ target: { value: [value] } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary investment interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FOREX">Forex</SelectItem>
                      <SelectItem value="CRYPTO">Cryptocurrency</SelectItem>
                      <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                      <SelectItem value="PRIVATE_EQUITY">Private Equity</SelectItem>
                      <SelectItem value="VENTURE_CAPITAL">Venture Capital</SelectItem>
                      <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                      <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                      <SelectItem value="RENEWABLE_ENERGY">Renewable Energy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                  <Select
                    onValueChange={(value) =>
                      register("riskTolerance").onChange({ target: { value } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk tolerance level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conservative">Conservative</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Aggressive">Aggressive</SelectItem>
                      <SelectItem value="Very Aggressive">Very Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.riskTolerance && (
                    <p className="text-sm text-destructive">
                      {errors.riskTolerance.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {watch("role") === "capital_raiser" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dealsRaised">Deals Raised</Label>
                    <Input
                      id="dealsRaised"
                      type="number"
                      {...register("dealsRaised", { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="typicalDealSize">Typical Deal Size (USD)</Label>
                    <Input
                      id="typicalDealSize"
                      type="number"
                      {...register("typicalDealSize", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industryFocus">Industry Focus</Label>
                  <Select
                    onValueChange={(value) =>
                      register("industryFocus").onChange({ target: { value: [value] } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                      <SelectItem value="consumer">Consumer</SelectItem>
                      <SelectItem value="financial">Financial Services</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      {...register("yearsExperience", { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="successRate">Success Rate (%)</Label>
                    <Input
                      id="successRate"
                      type="number"
                      step="0.01"
                      {...register("successRate", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trackRecord">Track Record</Label>
                  <Textarea
                    id="trackRecord"
                    {...register("trackRecord")}
                    placeholder="Describe your track record and notable deals..."
                  />
                </div>
              </>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
