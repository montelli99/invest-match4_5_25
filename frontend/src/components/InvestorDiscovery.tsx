import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { SearchFilters } from "types";
import { InvestorResults } from "./InvestorResults";
import { InvestorSearch } from "./InvestorSearch";

export default function InvestorDiscovery() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  };

  const handleSelectInvestor = (investorId: string) => {
    // TODO: Implement investor selection
    console.log("Selected investor:", investorId);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Discover Investors</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="search" className="space-y-6">
          <InvestorSearch onSearch={handleSearch} />
          <InvestorResults
            filters={filters}
            onSelectInvestor={handleSelectInvestor}
            onError={handleError}
            viewMode={viewMode}
          />
        </TabsContent>
        <TabsContent value="analytics">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
            {/* TODO: Add analytics components */}
            <p className="text-muted-foreground">Analytics coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
