import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import brain from "brain";
import { RefreshCw, Search, Settings } from "lucide-react";
import * as React from "react";

interface InvestorProfile {
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
}

interface SearchFilters {
  fund_type?: string;
  min_fund_size?: number;
  max_fund_size?: number;
  investment_focus?: string[];
  min_historical_returns?: number;
  risk_profile?: string;
}

interface Props {
  onInvestorSelect?: (investor: InvestorProfile) => void;
}

import { useAdmin } from "@/utils/use-admin";

export function AIListBuilder({ onInvestorSelect }: Props) {
  const { isAdmin } = useAdmin();
  const [investors, setInvestors] = React.useState<InvestorProfile[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [page, setPage] = React.useState(1);
  const [totalResults, setTotalResults] = React.useState(0);
  const [filters, setFilters] = React.useState<SearchFilters>({});
  const [showFilters, setShowFilters] = React.useState(false);
  const [sourceStatus, setSourceStatus] = React.useState<
    Record<string, { status: string; last_updated: string | null }>
  >({});

  const fetchInvestors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await brain.search_investors({ queryArgs: { page, page_size: 20 }, body: filters });
      const data = await response.json();

      setInvestors(data.investors);
      setTotalResults(data.total);
    } catch (err) {
      console.error("Error fetching investors:", err);
      setError("Failed to load investors");
    } finally {
      setLoading(false);
    }
  };

  const checkSourceStatus = async () => {
    try {
      const response = await brain.get_source_status();
      const data = await response.json();
      setSourceStatus(data);
    } catch (err) {
      console.error("Error checking source status:", err);
    }
  };

  const refreshData = async () => {
    try {
      await brain.refresh_data();
      await fetchInvestors();
      await checkSourceStatus();
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data");
    }
  };

  React.useEffect(() => {
    fetchInvestors();
    checkSourceStatus();
  }, [page, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">AI List Builder</h3>
          <p className="text-sm text-muted-foreground">
            Discover potential investors using AI-powered data analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fund Type</label>
              <Select
                value={filters.fund_type}
                onValueChange={(value) =>
                  setFilters({ ...filters, fund_type: value })
                }
              >
                <option value="">Any</option>
                <option value="venture_capital">Venture Capital</option>
                <option value="private_equity">Private Equity</option>
                <option value="angel">Angel Investor</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fund Size Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.min_fund_size}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      min_fund_size: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.max_fund_size}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      max_fund_size: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Min Historical Returns (%)
              </label>
              <Input
                type="number"
                placeholder="Min returns"
                value={filters.min_historical_returns}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    min_historical_returns: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {investors.map((investor) => (
          <Card
            key={`${investor.company}-${investor.source}`}
            className="p-4 cursor-pointer hover:border-primary transition-colors"
            onClick={() => onInvestorSelect?.(investor)}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{investor.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {investor.role} at {investor.company}
                  </p>
                </div>
                {isAdmin && (
                  <span className="text-xs bg-secondary/10 text-secondary-foreground rounded-full px-2 py-0.5">
                    {investor.source}
                  </span>
                )}
              </div>

              {investor.fund_type && (
                <div>
                  <h5 className="text-sm font-medium">Fund Type:</h5>
                  <p className="text-sm">{investor.fund_type}</p>
                </div>
              )}

              {investor.fund_size && (
                <div>
                  <h5 className="text-sm font-medium">Fund Size:</h5>
                  <p className="text-sm">
                    ${(investor.fund_size / 1000000).toFixed(1)}M
                  </p>
                </div>
              )}

              {investor.investment_focus &&
                investor.investment_focus.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium">Investment Focus:</h5>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {investor.investment_focus.map((focus) => (
                        <span
                          key={focus}
                          className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5"
                        >
                          {focus}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="text-xs text-muted-foreground mt-2">
                Last updated:{" "}
                {new Date(investor.last_updated).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {investors.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No investors found matching your criteria</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setFilters({})}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-destructive">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => fetchInvestors()}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
