import brain from "brain";
import { SearchFilters, SearchResult } from "@/brain/data-contracts";
import { MessageDialog } from "@/components/MessageDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Pagination } from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SearchPreferences } from "@/components/SearchPreferences";
import { SearchResultSkeleton } from "@/components/SearchResultSkeleton";
import { ExtendedUserProfile } from "types";
import { NavigationBar } from "@/components/NavigationBar";
import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from '@/components/AuthWrapper'

interface UserDisplayInfo {
  uid: string;
  display_name: string;
  company_name: string;
}


interface ExtendedUserProfileWithDisplay extends Omit<ExtendedUserProfile, 'role'> {
  email: string;
  name: string;
  company: string;
  role: string;
}

export default function Search() {
  const navigate = useNavigate();
  const { user, claims } = useAuth()

  const [filters, setFilters] = useState<SearchFilters>({
    search_query: "",
    user_type: undefined,
    fund_type: undefined,
    min_fund_size: undefined,
    max_fund_size: undefined,
    investment_focus: undefined,
    min_historical_returns: undefined,
    risk_profile: undefined,
    min_years_experience: undefined,
    sectors: undefined,
    track_record_required: undefined,
    page: 1,
    page_size: 10
  });

  // Debounce search query
  const debouncedSearchQuery = useDebounce(filters.search_query, 500);

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [selectedUser, setSelectedUser] = useState<ExtendedUserProfileWithDisplay | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const validateFilters = () => {
    if (!filters.search_query && !filters.user_type && !filters.fund_type) {
      return "Please enter a search term or select filters";
    }
    if (filters.min_fund_size && filters.max_fund_size &&
      Number(filters.min_fund_size) > Number(filters.max_fund_size)) {
      return "Minimum fund size cannot be greater than maximum fund size";
    }
    return null;
  };

  const handleSearch = async (page: number = currentPage) => {
    if (!user?.uid || !claims) {
      return;
    }
    const validationError = validateFilters();
    if (validationError) {
      setError(validationError);
      setShowError(true);
      return;
    }
    
    setError(null);
    try {
      setLoading(true);
      const response = await brain.search_users({
        user_id: user.uid
      }, {
        ...filters,
        page,
        page_size: 10
      });
      const data = await response.json();
      if (!data.items) {
        setSearchResults([]);
        setTotalPages(0);
        setTotalResults(0);
        return;
      }
      setSearchResults(data.items);
      setTotalPages(data.total_pages);
      setTotalResults(data.total);
      setCurrentPage(data.page);
    } catch (error) {
      console.error("Search failed:", error);
      setError("Failed to search users. Please try again.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // Clear error when filters change
  useEffect(() => {
    setError(null);
    setShowError(false);
  }, [filters]);

  // Effect for handling search query debouncing
  useEffect(() => {
    if (debouncedSearchQuery !== undefined && user?.uid && claims) {
      handleSearch(1);
    }
  }, [debouncedSearchQuery, user?.uid, claims]);

  // Pull to refresh functionality
  const handlePullToRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await handleSearch(currentPage);
    } finally {
      setRefreshing(false);
    }
  }, [currentPage]);

  const handlePageChange = useCallback((page: number) => {
    handleSearch(page);
  }, [filters]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <NavigationBar showAuth={() => { }} />
        <div className="container mx-auto py-8">
          {/* Error Alert */}
          {showError && error && (
            <div className="mb-4 p-4 bg-destructive/15 text-destructive rounded-md flex justify-between items-center">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowError(false)}
              >
                Dismiss
              </Button>
            </div>
          )}
          <h1 className="text-3xl font-bold mb-8">Search Contacts</h1>

          {/* Search Preferences */}
          {user && (
            <div className="mb-8">
              <SearchPreferences
                userId={user.uid}
                currentFilters={filters}
                onPresetSelect={(preset) => {
                  setFilters(preset.filters);
                  handleSearch();
                }}
              />
            </div>
          )}

          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Search Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 overflow-y-auto h-[calc(100vh-8rem)]">
                  {/* Filter Content */}
                  <div className="space-y-4 px-4">
                    {/* Search Query */}
                    <div className="space-y-2">
                      <Label htmlFor="mobile-search">Search Query</Label>
                      <Input
                        id="mobile-search"
                        placeholder="Search by name, company..."
                        value={filters.search_query || ""}
                        onChange={(e) => setFilters(prev => ({ ...prev, search_query: e.target.value }))}
                      />
                    </div>

                    {/* User Type */}
                    <div className="space-y-2">
                      <Label>User Type</Label>
                      <Select
                        value={filters.user_type || ""}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, user_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fund_manager">Fund Manager</SelectItem>
                          <SelectItem value="limited_partner">Limited Partner</SelectItem>
                          <SelectItem value="capital_raiser">Capital Raiser</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fund Type */}
                    <div className="space-y-2">
                      <Label>Fund Type</Label>
                      <Select
                        value={filters.fund_type || ""}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, fund_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fund type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="venture_capital">Venture Capital</SelectItem>
                          <SelectItem value="private_equity">Private Equity</SelectItem>
                          <SelectItem value="hedge_fund">Hedge Fund</SelectItem>
                          <SelectItem value="real_estate">Real Estate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fund Size Range */}
                    <div className="space-y-2">
                      <Label>Fund Size Range ($M)</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.min_fund_size || ""}
                          onChange={(e) => setFilters(prev => ({ ...prev, min_fund_size: e.target.value ? Number(e.target.value) : undefined }))}
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.max_fund_size || ""}
                          onChange={(e) => setFilters(prev => ({ ...prev, max_fund_size: e.target.value ? Number(e.target.value) : undefined }))}
                        />
                      </div>
                    </div>

                    {/* Risk Profile */}
                    <div className="space-y-2">
                      <Label>Risk Profile</Label>
                      <Select
                        value={filters.risk_profile || ""}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, risk_profile: value }))}
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

                    {/* Apply Filters Button */}
                    <Button
                      className="w-full mt-4"
                      onClick={() => {
                        handleSearch();
                        setShowFilters(false);
                      }}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filters */}
          <Card className="p-6 mb-8 hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Search Query */}
              <div className="space-y-2">
                <Label htmlFor="search">Search Query</Label>
                <Input
                  id="search"
                  placeholder="Search by name, company..."
                  value={filters.search_query || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, search_query: e.target.value }))}
                />
              </div>

              {/* User Type */}
              <div className="space-y-2">
                <Label>User Type</Label>
                <Select
                  value={filters.user_type || ""}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, user_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fund_manager">Fund Manager</SelectItem>
                    <SelectItem value="limited_partner">Limited Partner</SelectItem>
                    <SelectItem value="capital_raiser">Capital Raiser</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fund Type */}
              <div className="space-y-2">
                <Label>Fund Type</Label>
                <Select
                  value={filters.fund_type || ""}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, fund_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fund type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venture_capital">Venture Capital</SelectItem>
                    <SelectItem value="private_equity">Private Equity</SelectItem>
                    <SelectItem value="hedge_fund">Hedge Fund</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fund Size Range */}
              <div className="space-y-2">
                <Label>Minimum Fund Size ($M)</Label>
                <Input
                  type="number"
                  placeholder="Min fund size"
                  value={filters.min_fund_size || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, min_fund_size: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Maximum Fund Size ($M)</Label>
                <Input
                  type="number"
                  placeholder="Max fund size"
                  value={filters.max_fund_size || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, max_fund_size: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>

              {/* Risk Profile */}
              <div className="space-y-2">
                <Label>Risk Profile</Label>
                <Select
                  value={filters.risk_profile || ""}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, risk_profile: value }))}
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

              {/* Minimum Historical Returns */}
              <div className="space-y-2">
                <Label>Min Historical Returns (%)</Label>
                <Input
                  type="number"
                  placeholder="Min returns"
                  value={filters.min_historical_returns || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, min_historical_returns: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label>Min Years Experience</Label>
                <Input
                  type="number"
                  placeholder="Min years"
                  value={filters.min_years_experience || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, min_years_experience: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>

              {/* Track Record Required */}
              <div className="space-y-2">
                <Label>Track Record Required</Label>
                <Select
                  value={filters.track_record_required?.toString() || ""}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, track_record_required: value === "true" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Required</SelectItem>
                    <SelectItem value="false">Not Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="mt-6 w-full md:w-auto"
              onClick={() => handleSearch()}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </Card>

          {/* Search Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && (
              <>
                <SearchResultSkeleton />
                <SearchResultSkeleton />
                <SearchResultSkeleton />
              </>
            )}
            {searchResults.map((result) => (
              <Card
                key={result.profile.id || result.profile.email || 'anonymous'}
                className="p-6 hover:shadow-lg transition-shadow touch-manipulation"
              >
                <div className="flex flex-col gap-4">
                  {/* Header with name and company */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{result.profile.name}</h3>
                      {result.profile.company && (
                        <p className="text-sm text-muted-foreground">{result.profile.company}</p>
                      )}
                    </div>
                    {result.match_percentage && (
                      <div className="px-2 py-1 bg-primary/10 rounded-full text-sm">
                        {result.match_percentage}% Match
                      </div>
                    )}
                  </div>

                  {/* Role and Experience */}
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Role:</span> {result.profile.role}
                    </p>
                    {result.profile.years_experience && (
                      <p className="text-sm">
                        <span className="font-medium">Experience:</span> {result.profile.years_experience} years
                      </p>
                    )}
                  </div>

                  {/* Fund Details */}
                  {result.profile.role === 'fund_manager' && (
                    <div className="space-y-1">
                      {result.profile.fund_type && (
                        <p className="text-sm">
                          <span className="font-medium">Fund Type:</span> {result.profile.fund_type}
                        </p>
                      )}
                      {result.profile.fund_size && (
                        <p className="text-sm">
                          <span className="font-medium">Fund Size:</span> ${result.profile.fund_size}M
                        </p>
                      )}
                      {result.profile.historical_returns && (
                        <p className="text-sm">
                          <span className="font-medium">Historical Returns:</span> {result.profile.historical_returns}%
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => setSelectedUser({
                        email: result.profile.email,
                        name: result.profile.name,
                        company: result.profile.company,
                        role: result.profile.role
                      })}
                      disabled={actionLoading[result.profile.id || '']}
                    >
                      Message
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {/* Results Summary */}
          <div className="text-sm text-muted-foreground mt-4 mb-8 text-center">
            Showing {searchResults.length} of {totalResults} results
          </div>

          {/* No Results Message */}
          {searchResults.length === 0 && !loading && (
            <div className="text-center text-muted-foreground mt-8">
              No matches found. Try adjusting your search filters.
            </div>
          )}

          {/* Message Dialog */}
          {selectedUser && (
            <MessageDialog
              isOpen={!!selectedUser}
              onClose={() => setSelectedUser(null)}
              otherUser={{
                uid: selectedUser.uid || selectedUser.email, // Fallback to email if uid not available
                display_name: selectedUser.name,
                company_name: selectedUser.company,
              }}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}