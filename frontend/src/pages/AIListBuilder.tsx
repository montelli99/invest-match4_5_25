import { AIListBuilder } from "@/components/AIListBuilder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function AIListBuilderPage() {
  const navigate = useNavigate();

  const handleInvestorSelect = (investor: any) => {
    // TODO: Navigate to investor profile or initiate contact
    console.log("Selected investor:", investor);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI List Builder</h1>
        <p className="text-lg text-muted-foreground">
          Discover potential investors using AI-powered data analysis from SEC
          EDGAR, OpenVC, and OpenBB Terminal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <AIListBuilder onInvestorSelect={handleInvestorSelect} />
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Data Sources</h3>
            <div className="space-y-2">
              <div>
                <h4 className="font-medium">SEC EDGAR</h4>
                <p className="text-sm text-muted-foreground">
                  Access company filings and financial data from the SEC.
                </p>
              </div>
              <div>
                <h4 className="font-medium">OpenVC</h4>
                <p className="text-sm text-muted-foreground">
                  Venture capital and angel investor profiles.
                </p>
              </div>
              <div>
                <h4 className="font-medium">OpenBB Terminal</h4>
                <p className="text-sm text-muted-foreground">
                  Financial market data and analytics.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use filters to narrow down your search</li>
              <li>• Click on an investor card to view more details</li>
              <li>• Data is refreshed periodically for accuracy</li>
              <li>• Export your list for offline analysis</li>
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our team is here to help you make the most of the AI List Builder.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // TODO: Implement help/support functionality
                console.log("Show help/support");
              }}
            >
              Contact Support
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
