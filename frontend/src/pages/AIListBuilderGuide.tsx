import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AIListBuilderGuide = () => {
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">AI List Builder Guide</h1>
        <p className="text-muted-foreground">
          Learn how to effectively use the AI List Builder to find and match
          with potential investors.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          The AI List Builder uses advanced algorithms to match investors based
          on multiple criteria including fund type, size, investment focus, and
          historical performance.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="search">Search & Filters</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>What is the AI List Builder?</CardTitle>
              <CardDescription>
                Understanding the core features and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Key Features</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Multi-source data integration from SEC EDGAR and Crunchbase
                  </li>
                  <li>Intelligent matching based on multiple criteria</li>
                  <li>Real-time analytics and insights</li>
                  <li>Performance optimization with smart caching</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold">Data Sources</h3>
                <p>
                  The AI List Builder aggregates data from multiple reliable
                  sources:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>SEC EDGAR:</strong> Official filing data for
                    registered investment managers
                  </li>
                  <li>
                    <strong>Crunchbase:</strong> Comprehensive investor profiles
                    and market data
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Options</CardTitle>
              <CardDescription>
                How to find the right investors for your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Available Filters</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Fund Type:</strong> Filter by venture capital,
                    private equity, hedge funds, etc.
                  </li>
                  <li>
                    <strong>Fund Size Range:</strong> Set minimum and maximum
                    fund sizes
                  </li>
                  <li>
                    <strong>Investment Focus:</strong> Target specific
                    industries or sectors
                  </li>
                  <li>
                    <strong>Historical Returns:</strong> Filter by performance
                    metrics
                  </li>
                  <li>
                    <strong>Risk Profile:</strong> Match based on investment
                    risk tolerance
                  </li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold">Search Tips</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Start with broader criteria and narrow down based on results
                  </li>
                  <li>
                    Use multiple filters in combination for more precise
                    matching
                  </li>
                  <li>
                    Consider historical performance alongside current metrics
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Insights</CardTitle>
              <CardDescription>
                Understanding the analytics features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Available Analytics</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Investment Focus Distribution:</strong> See the most
                    common investment areas
                  </li>
                  <li>
                    <strong>Fund Size Distribution:</strong> Understand the
                    market landscape
                  </li>
                  <li>
                    <strong>Historical Performance:</strong> Track performance
                    trends
                  </li>
                  <li>
                    <strong>Risk Profile Distribution:</strong> Analyze risk
                    preferences
                  </li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold">Using Analytics Effectively</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use distributions to understand market positioning</li>
                  <li>Track historical trends for better decision making</li>
                  <li>Compare individual profiles against market averages</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Common questions about the AI List Builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">
                      How often is the data updated?
                    </h3>
                    <p>
                      Data is refreshed regularly from our sources. SEC EDGAR
                      data is updated quarterly, while Crunchbase data is
                      updated daily.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="font-semibold">
                      How accurate is the matching?
                    </h3>
                    <p>
                      Our matching algorithm uses multiple data points and
                      sophisticated weighting to ensure high accuracy. However,
                      always perform your own due diligence before making
                      investment decisions.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="font-semibold">Can I export the data?</h3>
                    <p>
                      Yes, you can export search results and analytics data for
                      further analysis or reporting.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="font-semibold">
                      What if I find incorrect information?
                    </h3>
                    <p>
                      If you spot any inaccuracies, please report them through
                      the platform. We verify and update information promptly.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="font-semibold">
                      How do I optimize my search results?
                    </h3>
                    <p>
                      Start with broader criteria and gradually refine based on
                      the results. Use multiple filters in combination for more
                      precise matching.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIListBuilderGuide;
