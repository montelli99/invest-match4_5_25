import { useAuth } from "@/components/AuthWrapper";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import brain from "brain";
import { useEffect, useState } from "react";

interface Match {
  user_id: string;
  name: string;
  company: string;
  role: string;
  match_score: number;
  fund_type?: string;
  fund_size?: number;
  investment_focus?: string;
}

export default function Matches() {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [filters, setFilters] = useState({
    fund_type: "",
    min_fund_size: "",
    max_fund_size: "",
    min_historical_returns: "",
    risk_profile: "",
    investment_focus: "",
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      loadMatches();
    }
  }, [user?.uid]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await brain.search_users(
        { user_id: user?.uid },
        {
          fund_type: filters.fund_type || undefined,
          min_fund_size: filters.min_fund_size
            ? parseFloat(filters.min_fund_size)
            : undefined,
          max_fund_size: filters.max_fund_size
            ? parseFloat(filters.max_fund_size)
            : undefined,
          min_historical_returns: filters.min_historical_returns
            ? parseFloat(filters.min_historical_returns)
            : undefined,
          risk_profile: filters.risk_profile || undefined,
          investment_focus: filters.investment_focus
            ? [filters.investment_focus]
            : undefined,
        },
      );
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error("Error loading matches:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load matches",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConnect = async (matchId: string) => {
    try {
      await brain.record_match({
        user_id: user?.uid || "",
        matched_user_id: matchId,
      });
      toast({
        title: "Success",
        description: "Connection request sent",
      });
    } catch (error) {
      console.error("Error connecting:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send connection request",
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Matches</h1>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Fund Type</Label>
              <Select
                value={filters.fund_type}
                onValueChange={(value) =>
                  handleFilterChange("fund_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="venture_capital">
                    Venture Capital
                  </SelectItem>
                  <SelectItem value="private_equity">Private Equity</SelectItem>
                  <SelectItem value="hedge_fund">Hedge Fund</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Min Fund Size (USD)</Label>
              <Input
                type="number"
                placeholder="1000000"
                value={filters.min_fund_size}
                onChange={(e) =>
                  handleFilterChange("min_fund_size", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Max Fund Size (USD)</Label>
              <Input
                type="number"
                placeholder="100000000"
                value={filters.max_fund_size}
                onChange={(e) =>
                  handleFilterChange("max_fund_size", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Min Historical Returns (%)</Label>
              <Input
                type="number"
                placeholder="10"
                value={filters.min_historical_returns}
                onChange={(e) =>
                  handleFilterChange("min_historical_returns", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Risk Profile</Label>
              <Select
                value={filters.risk_profile}
                onValueChange={(value) =>
                  handleFilterChange("risk_profile", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Investment Focus</Label>
              <Input
                placeholder="e.g. Technology, Healthcare"
                value={filters.investment_focus}
                onChange={(e) =>
                  handleFilterChange("investment_focus", e.target.value)
                }
              />
            </div>
          </div>

          <Button onClick={loadMatches} disabled={loading}>
            {loading ? "Loading..." : "Apply Filters"}
          </Button>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => (
            <Card key={match.user_id} className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{match.name}</h3>
                  <p className="text-gray-600">{match.company}</p>
                  <p className="text-sm text-gray-500">{match.role}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Match Score</span>
                    <span className="text-sm text-blue-600">
                      {match.match_score}%
                    </span>
                  </div>

                  {match.fund_type && (
                    <div className="flex justify-between">
                      <span className="text-sm">Fund Type</span>
                      <span className="text-sm">{match.fund_type}</span>
                    </div>
                  )}

                  {match.fund_size && (
                    <div className="flex justify-between">
                      <span className="text-sm">Fund Size</span>
                      <span className="text-sm">
                        ${(match.fund_size / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  )}

                  {match.investment_focus && (
                    <div className="space-y-1">
                      <span className="text-sm">Investment Focus</span>
                      <p className="text-sm text-gray-600">
                        {match.investment_focus}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleConnect(match.user_id)}
                  className="w-full"
                >
                  Connect
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Toaster />
    </ProtectedRoute>
  );
}
