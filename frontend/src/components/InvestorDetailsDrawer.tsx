import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import brain from "brain";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Color palette for charts
const COLORS = [
  "var(--chart-primary-hex)",
  "var(--chart-secondary-hex)",
  "var(--chart-success-hex)",
  "var(--chart-warning-hex)",
  "var(--chart-error-hex)",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investor: any; // Replace with proper type
}

export function InvestorDetailsDrawer({ open, onOpenChange, investor }: Props) {
  const [secAnalytics, setSecAnalytics] = useState<any>(null);
  const [secLoading, setSecLoading] = useState(false);
  const [enrichedData, setEnrichedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!investor) return;

      setLoading(true);
      try {
        // Fetch enriched data from Crunchbase
        const enrichResponse = await brain.enrich_investor_profile({
          name: investor.name,
          company: investor.company,
        });
        const enrichedProfile = await enrichResponse.json();
        setEnrichedData(enrichedProfile);

        // Fetch SEC analytics if available
        if (investor.cik) {
          setSecLoading(true);
          const secResponse = await brain.get_comprehensive_analytics({
            cik: investor.cik,
          });
          const secData = await secResponse.json();
          setSecAnalytics(secData);
        }
      } catch (error) {
        console.error("Error fetching investor details:", error);
      } finally {
        setLoading(false);
        setSecLoading(false);
      }
    };

    fetchData();
  }, [investor]);

  const renderBasicInfo = () => (
    <div className="space-y-6">
      {/* Company Info */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Company Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p>{enrichedData?.location || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Founded</p>
            <p>{enrichedData?.founded_on || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Website</p>
            <p>
              {enrichedData?.website ? (
                <a
                  href={enrichedData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {enrichedData.website}
                </a>
              ) : (
                "N/A"
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Company Size</p>
            <p>{enrichedData?.num_employees_enum || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Investment Profile */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Investment Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Fund Type</p>
            <p>{enrichedData?.fund_type || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fund Size</p>
            <p>
              {enrichedData?.fund_size
                ? `$${(enrichedData.fund_size / 1_000_000).toFixed(2)}M`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Historical Returns</p>
            <p>
              {enrichedData?.historical_returns
                ? `${enrichedData.historical_returns.toFixed(2)}%`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Risk Profile</p>
            <p>{enrichedData?.risk_profile || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Investment Focus */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Investment Focus</h3>
        <div className="flex flex-wrap gap-2">
          {enrichedData?.investment_focus?.map((focus: string) => (
            <Badge key={focus} variant="secondary">
              {focus}
            </Badge>
          )) || "N/A"}
        </div>
      </div>

      {/* Investment Stages */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Investment Stages</h3>
        <div className="flex flex-wrap gap-2">
          {enrichedData?.investment_stages?.map((stage: string) => (
            <Badge key={stage}>{stage}</Badge>
          )) || "N/A"}
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold mb-2">About</h3>
        <p className="text-sm text-muted-foreground">
          {enrichedData?.description || "No description available."}
        </p>
      </div>
    </div>
  );

  const renderSecAnalytics = () => {
    if (!investor.cik)
      return (
        <div className="text-center py-8 text-muted-foreground">
          No SEC analytics available for this investor.
        </div>
      );

    if (secLoading) return <Skeleton className="w-full h-[400px]" />;

    if (!secAnalytics) return null;

    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Industry Allocation */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Allocation</CardTitle>
              <CardDescription>
                Portfolio distribution by industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={secAnalytics.industry_allocation}
                      dataKey="value"
                      nameKey="industry"
                      label={({ industry }) => industry}
                    >
                      {secAnalytics.industry_allocation.map(
                        (_: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ),
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Holdings */}
          <Card>
            <CardHeader>
              <CardTitle>Top Holdings</CardTitle>
              <CardDescription>Largest positions by value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={secAnalytics.holdings.slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="company_name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="percentage" fill={COLORS[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Value */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Value</CardTitle>
              <CardDescription>
                Total AUM: ${(secAnalytics.total_aum / 1_000_000).toFixed(2)}M
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={secAnalytics.quarterly_changes}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total_value"
                      stroke={COLORS[0]}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional SEC Info */}
        <Card>
          <CardHeader>
            <CardTitle>Additional SEC Information</CardTitle>
            <CardDescription>Key insights from SEC filings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="clients" className="space-y-4">
              <TabsList>
                <TabsTrigger value="clients">Client Types</TabsTrigger>
                <TabsTrigger value="fees">Fee Structure</TabsTrigger>
                <TabsTrigger value="risks">Risk Factors</TabsTrigger>
              </TabsList>

              <TabsContent value="clients">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    {secAnalytics.client_types.map(
                      (client: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span>{client.type}</span>
                          <Badge>{(client.percentage * 100).toFixed(1)}%</Badge>
                        </div>
                      ),
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="fees">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    {secAnalytics.fee_structures.map(
                      (fee: any, index: number) => (
                        <div key={index}>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{fee.type}</span>
                            <Badge>{fee.rate}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {fee.description}
                          </p>
                          <Separator className="my-2" />
                        </div>
                      ),
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="risks">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {secAnalytics.risk_factors.map(
                      (risk: string, index: number) => (
                        <p key={index} className="text-sm">
                          • {risk}
                        </p>
                      ),
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{investor?.name}</SheetTitle>
          <SheetDescription>{investor?.company}</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-[200px]" />
            <Skeleton className="w-full h-[300px]" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sec">SEC Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">{renderBasicInfo()}</TabsContent>

            <TabsContent value="sec">{renderSecAnalytics()}</TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
