import { SearchResultSkeleton } from "@/components/SearchResultSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import brain from "brain";
import { useEffect, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { AiListBuilderSearchFilters } from "types";

export interface InvestorProfile {
  id?: string;
  name: string;
  company: string;
  role?: string;
  fund_type?: string;
  fund_size?: number;
  investment_focus?: string[];
  historical_returns?: number;
  risk_profile?: string;
  source?: string;
  last_updated?: string;
  location?: string;
  website?: string;
}

interface Props {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  filters: AiListBuilderSearchFilters;
  onSelectInvestor: (investorId: string) => void;
  onError: (error: string) => void;
}

export function InvestorResults({ filters, onSelectInvestor, onError, viewMode, onViewModeChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [investors, setInvestors] = useState<InvestorProfile[]>([]);
  type SortableFields = "fund_size" | "historical_returns" | "name" | "company" | "risk_profile";
  const [sortField, setSortField] = useState<SortableFields>("fund_size");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;
  
  

  useEffect(() => {
    const fetchInvestors = async () => {
      setError(null);
      try {
        setLoading(true);
        const searchParams = {
          ...filters,
          page_size: itemsPerPage,
          page: page
        };
        const response = await brain.search_investors(searchParams);
        const data = await response.json();
        setInvestors(data.investors);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
      } catch (err) {
        setError(typeof err === 'string' ? err : 'An error occurred while fetching investors');
        console.error("Error fetching investors:", err);
        onError("Failed to fetch investors. Please try again.");
      } finally {
        setLoading(false);
      }
      
    };

    fetchInvestors();
  }, [filters, sortField, sortOrder]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="py-12">
          <h3 className="text-xl font-semibold mb-2 text-destructive">Error</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button variant="outline" onClick={() => setError(null)}>Try Again</Button>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SearchResultSkeleton />
        <SearchResultSkeleton />
        <SearchResultSkeleton />
      </div>
    );
  }

  if (investors.length === 0 && !loading) {
    return (
      <Card className="p-6 text-center">
        <div className="py-12">
          <h3 className="text-xl font-semibold mb-2">No investors found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search filters to find more investors.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          {investors.length} investors found
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md mr-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("grid")}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Select value={sortField} onValueChange={(value) => setSortField(value as SortableFields)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fund_size">Fund Size</SelectItem>
              <SelectItem value="historical_returns">Historical Returns</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="risk_profile">Risk Profile</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {investors.map((investor) => (
        <Card
          key={investor.name}
          className="p-6 hover:bg-accent/50 cursor-pointer transition-colors"
          onClick={() => onSelectInvestor(investor.name)}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">{investor.name}</h3>
              <p className="text-muted-foreground">{investor.company}</p>
            </div>
            <Badge variant="secondary">{investor.fund_type}</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium">Fund Size</p>
              <p className="text-muted-foreground">
                {investor.fund_size
                  ? formatCurrency(investor.fund_size)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Historical Returns</p>
              <p className="text-muted-foreground">
                {investor.historical_returns
                  ? `${investor.historical_returns.toFixed(1)}%`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Risk Profile</p>
              <p className="text-muted-foreground">
                {investor.risk_profile || "N/A"}
              </p>
            </div>
          </div>

          {investor.investment_focus &&
            investor.investment_focus.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {investor.investment_focus.map((focus) => (
                  <Badge key={focus} variant="outline">
                    {focus}
                  </Badge>
                ))}
              </div>
            )}
        </Card>
      ))}
      </div>
    </div>
  );
}
