import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface Props {
  onSearch: (filters: any) => void;
}

export function SearchFilters({ onSearch }: Props) {
  const [fundType, setFundType] = useState("");
  const [minFundSize, setMinFundSize] = useState(0);
  const [maxFundSize, setMaxFundSize] = useState(1000);
  const [investmentFocus, setInvestmentFocus] = useState<string[]>([]);
  const [minReturns, setMinReturns] = useState(0);
  const [riskProfile, setRiskProfile] = useState("");

  const handleSearch = () => {
    onSearch({
      fund_type: fundType || undefined,
      min_fund_size: minFundSize || undefined,
      max_fund_size: maxFundSize || undefined,
      investment_focus:
        investmentFocus.length > 0 ? investmentFocus : undefined,
      min_historical_returns: minReturns || undefined,
      risk_profile: riskProfile || undefined,
    });
  };

  const handleReset = () => {
    setFundType("");
    setMinFundSize(0);
    setMaxFundSize(1000);
    setInvestmentFocus([]);
    setMinReturns(0);
    setRiskProfile("");
    onSearch({});
  };

  return (
    <Card className="w-full mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fund Type */}
          <div className="space-y-2">
            <Label htmlFor="fundType">Fund Type</Label>
            <Select value={fundType} onValueChange={setFundType}>
              <SelectTrigger id="fundType">
                <SelectValue placeholder="Select fund type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venture_capital">Venture Capital</SelectItem>
                <SelectItem value="private_equity">Private Equity</SelectItem>
                <SelectItem value="hedge_fund">Hedge Fund</SelectItem>
                <SelectItem value="angel">Angel Investor</SelectItem>
                <SelectItem value="family_office">Family Office</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fund Size Range */}
          <div className="space-y-2">
            <Label>Fund Size Range (in millions)</Label>
            <div className="pt-2">
              <Slider
                min={0}
                max={1000}
                step={10}
                value={[minFundSize, maxFundSize]}
                onValueChange={([min, max]) => {
                  setMinFundSize(min);
                  setMaxFundSize(max);
                }}
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>${minFundSize}M</span>
                <span>${maxFundSize}M</span>
              </div>
            </div>
          </div>

          {/* Investment Focus */}
          <div className="space-y-2">
            <Label htmlFor="investmentFocus">Investment Focus</Label>
            <Select
              value={investmentFocus[0] || ""}
              onValueChange={(value) => setInvestmentFocus([value])}
            >
              <SelectTrigger id="investmentFocus">
                <SelectValue placeholder="Select focus area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TECH">Technology</SelectItem>
                <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                <SelectItem value="FINTECH">Fintech</SelectItem>
                <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                <SelectItem value="CONSUMER">Consumer</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                <SelectItem value="INFRASTRUCTURE">Infrastructure</SelectItem>
                <SelectItem value="IMPACT">Impact Investing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Minimum Historical Returns */}
          <div className="space-y-2">
            <Label htmlFor="minReturns">Minimum Historical Returns (%)</Label>
            <Input
              id="minReturns"
              type="number"
              min={0}
              max={100}
              value={minReturns}
              onChange={(e) => setMinReturns(Number(e.target.value))}
            />
          </div>

          {/* Risk Profile */}
          <div className="space-y-2">
            <Label htmlFor="riskProfile">Risk Profile</Label>
            <Select value={riskProfile} onValueChange={setRiskProfile}>
              <SelectTrigger id="riskProfile">
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </CardContent>
    </Card>
  );
}
