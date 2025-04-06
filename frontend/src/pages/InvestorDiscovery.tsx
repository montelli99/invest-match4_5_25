import { InvestorProfile } from "@/components/InvestorProfile";
import { InvestorResults } from "@/components/InvestorResults";
import { InvestorSearch } from "@/components/InvestorSearch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { SearchFilters } from "types";

export default function InvestorDiscovery() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setError(null);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Discover Investors</h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <InvestorSearch onSearch={handleSearch} />

        <InvestorResults
          filters={filters}
          onSelectInvestor={setSelectedInvestorId}
          onError={setError}
        />

        <Dialog
          open={!!selectedInvestorId}
          onOpenChange={() => setSelectedInvestorId(null)}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedInvestorId && (
              <InvestorProfile
                investorId={selectedInvestorId}
                onClose={() => setSelectedInvestorId(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
