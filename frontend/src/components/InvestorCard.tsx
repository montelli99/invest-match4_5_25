import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkIcon, Bookmark } from "lucide-react";
import { useBookmarkStore } from "@/utils/store";
import { cn } from "@/utils/cn";

import type { InvestorProfile } from "./InvestorResults";

interface Props {
  investor: InvestorProfile & {
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
  investor: InvestorProfile & Partial<{
    name: string;
    company: string;
    role: string;
    fund_type?: string;
    fund_size?: number;
    investment_focus?: string[];
    historical_returns?: number;
    risk_profile?: string;
    source: string;
    last_updated: string;
    location?: string;
    website?: string;
  }>;
  onViewProfile: () => void;
  onBookmark: () => void;
}

export function InvestorCard({ investor, onViewProfile, onBookmark }: Props) {
  const isBookmarked = useBookmarkStore((state) => state.isBookmarked(investor.name));
  return (
    <Card className={cn(
      "w-full hover:shadow-lg transition-all duration-200",
      isBookmarked && "ring-2 ring-primary ring-offset-2"
    )}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">{investor.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{investor.company}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onBookmark();
          }}
        >
          {isBookmarked ? (
            <Bookmark className="h-4 w-4 fill-current" />
          ) : (
            <BookmarkIcon className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          {/* Role and Location */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{investor.role}</span>
            {investor.location && (
              <span className="text-sm text-muted-foreground">
                {investor.location}
              </span>
            )}
          </div>

          {/* Fund Details and Crunchbase Data */}
          <div className="space-y-2">
            {investor.fund_type && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{investor.fund_type}</Badge>
                {investor.fund_size && (
                  <Badge variant="outline">
                    ${(investor.fund_size / 1_000_000).toFixed(0)}M
                  </Badge>
                )}
              </div>
            )}

            {/* Crunchbase Details */}
            {investor.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {investor.description}
              </p>
            )}

            {investor.founded_on && (
              <div className="text-sm">
                <span className="font-medium">Founded:</span>{" "}
                {new Date(investor.founded_on).getFullYear()}
              </div>
            )}

            {investor.num_employees_enum && (
              <div className="text-sm">
                <span className="font-medium">Size:</span>{" "}
                {investor.num_employees_enum.replace("_", " ").toLowerCase()}
              </div>
            )}

            {investor.last_funding_type && (
              <div className="text-sm">
                <span className="font-medium">Last Funding:</span>{" "}
                {investor.last_funding_type.replace("_", " ").toLowerCase()}
              </div>
            )}
          </div>
          {investor.fund_type && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{investor.fund_type}</Badge>
              {investor.fund_size && (
                <Badge variant="outline">
                  ${(investor.fund_size / 1_000_000).toFixed(0)}M
                </Badge>
              )}
            </div>
          )}

          {/* Investment Focus */}
          {investor.investment_focus &&
            investor.investment_focus.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {investor.investment_focus.map((focus) => (
                  <Badge key={focus} variant="secondary">
                    {focus.replace("_", " ").toLowerCase()}
                  </Badge>
                ))}
              </div>
            )}

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {investor.historical_returns !== undefined && (
              <div>
                <p className="text-sm font-medium">Historical Returns</p>
                <p className="text-2xl font-bold">
                  {investor.historical_returns.toFixed(1)}%
                </p>
              </div>
            )}
            {investor.risk_profile && (
              <div>
                <p className="text-sm font-medium">Risk Profile</p>
                <p className="text-2xl font-bold capitalize">
                  {investor.risk_profile}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={onViewProfile}>
              View Profile
            </Button>
            <div className="text-sm text-muted-foreground">
              Source: {investor.source}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
