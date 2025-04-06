import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { SearchFilters } from "types";

interface Props {
  onSearch: (filters: SearchFilters) => void;
}

export function InvestorSearch({ onSearch }: Props) {
  const [filters, setFilters] = useState<SearchFilters>({
    search_query: undefined,
    fund_type: undefined,
    min_fund_size: undefined,
    max_fund_size: undefined,
    investment_focus: undefined,
    min_historical_returns: undefined,
    risk_profile: undefined,
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined);

  const clearFilters = () => {
    setFilters({
      fund_type: undefined,
      min_fund_size: undefined,
      max_fund_size: undefined,
      investment_focus: undefined,
      min_historical_returns: undefined,
      risk_profile: undefined,
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {hasActiveFilters && (
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (value === undefined) return null;
                return (
                  <Badge key={key} variant="secondary" className="gap-2">
                    {key.replace(/_/g, " ")}: {value}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setFilters({ ...filters, [key]: undefined })
                      }
                    />
                  </Badge>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          </div>
        )}
        
        <Tabs defaultValue="fund-details" className="w-full">
          <div className="mb-6">
            <Label>Search</Label>
            <Input
              type="text"
              placeholder="Search by name, company or location"
              value={filters.search_query || ""}
              onChange={(e) =>
                setFilters({ ...filters, search_query: e.target.value || undefined })
              }
            />
          </div>

          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fund-details">Fund Details</TabsTrigger>
            <TabsTrigger value="investment-criteria">Investment Criteria</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="fund-details" className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fund Type */}
          <div className="space-y-2">
            <Label>Fund Type</Label>
            <Select
              value={filters.fund_type || ""}
              onValueChange={(value) =>
                setFilters({ ...filters, fund_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fund type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venture_capital">Venture Capital</SelectItem>
                <SelectItem value="private_equity">Private Equity</SelectItem>
                <SelectItem value="hedge_fund">Hedge Fund</SelectItem>
                <SelectItem value="angel">Angel Investor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fund Size Range */}
          <div className="space-y-2">
            <Label>Minimum Fund Size (USD)</Label>
            <Input
              type="number"
              placeholder="Min fund size"
              value={filters.min_fund_size || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  min_fund_size: parseFloat(e.target.value) || undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Maximum Fund Size (USD)</Label>
            <Input
              type="number"
              placeholder="Max fund size"
              value={filters.max_fund_size || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  max_fund_size: parseFloat(e.target.value) || undefined,
                })
              }
            />
          </div>

          {/* Risk Profile */}
          <div className="space-y-2">
            <Label>Risk Profile</Label>
            <Select
              value={filters.risk_profile || ""}
              onValueChange={(value) =>
                setFilters({ ...filters, risk_profile: value })
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

          {/* Historical Returns */}
          <div className="space-y-2">
            <Label>Minimum Historical Returns (%)</Label>
            <Input
              type="number"
              placeholder="Min returns"
              value={filters.min_historical_returns || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  min_historical_returns:
                    parseFloat(e.target.value) || undefined,
                })
              }
            />
          </div>
        </div>
          </TabsContent>

          <TabsContent value="investment-criteria" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Investment Focus - TODO: Add multi-select */}
              <div className="space-y-2">
                <Label>Investment Focus</Label>
                <Select
                  value={filters.investment_focus?.[0] || ""}
                  onValueChange={(value) =>
                    setFilters({ ...filters, investment_focus: [value] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select focus area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="fintech">Fintech</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Historical Returns */}
              <div className="space-y-2">
                <Label>Minimum Historical Returns (%)</Label>
                <Input
                  type="number"
                  placeholder="Min returns"
                  value={filters.min_historical_returns || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      min_historical_returns:
                        parseFloat(e.target.value) || undefined,
                    })
                  }
                />
              </div>

              {/* Risk Profile */}
              <div className="space-y-2">
                <Label>Risk Profile</Label>
                <Select
                  value={filters.risk_profile || ""}
                  onValueChange={(value) =>
                    setFilters({ ...filters, risk_profile: value })
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
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSearch}>Search Investors</Button>
        </div>
      </div>
    </Card>
  );
}
