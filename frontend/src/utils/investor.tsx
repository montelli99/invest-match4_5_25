import { InvestorProfile } from "types";

export type EnrichedInvestorProfile = InvestorProfile & {
  description?: string;
  founded_on?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  num_employees_enum?: string;
  last_funding_type?: string;
  total_funding_usd?: number;
  investor_types?: string[];
  investment_stages?: string[];
};
