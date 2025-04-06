import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileFormData } from "@/pages/CreateProfile";

interface Props {
  data: Partial<ProfileFormData>;
}

export function ProfilePreview({ data }: Props) {
  const formatCurrency = (value: number | undefined) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatArray = (arr: string[] | string | undefined) => {
    if (typeof arr === 'string') return arr;

    if (!arr || arr.length === 0) return "N/A";
    return arr.join(", ");
  };

  return (
    <Card className="p-6 bg-card">
      <div className="flex items-start gap-4">
        <Avatar className="w-20 h-20">
          {data.profile_image ? (
            <img 
              src={data.profile_image} 
              alt={data.name || "Profile"}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold text-primary">
              {data.name?.charAt(0) || "?"}
            </div>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{data.name || "Your Name"}</h2>
              <p className="text-muted-foreground">
                {data.company || "Company Name"}
              </p>
            </div>
            {data.role && (
              <Badge variant="secondary" className="text-sm">
                {data.role}
              </Badge>
            )}
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-sm">
              <span className="font-medium">Email:</span>{" "}
              {data.email || "email@example.com"}
            </p>
            {data.phone && (
              <p className="text-sm">
                <span className="font-medium">Phone:</span> {data.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {data.role === "Fund Manager" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Fund Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Fund Type</p>
                <p className="text-muted-foreground">
                  {data.fundType || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Fund Size</p>
                <p className="text-muted-foreground">
                  {formatCurrency(data.fundSize)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Risk Profile</p>
                <p className="text-muted-foreground">
                  {data.riskProfile || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Minimum Investment</p>
                <p className="text-muted-foreground">
                  {formatCurrency(data.minimum_investment)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Investment Strategy</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {data.investment_strategy || "No investment strategy provided"}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Focus Areas</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Investment Focus:</span>{" "}
                {formatArray(data.investmentFocus)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Geographic Focus:</span>{" "}
                {formatArray(data.geographic_focus)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Investment Stages:</span>{" "}
                {formatArray(data.investment_stages)}
              </p>
            </div>
          </div>
        </div>
      )}

      {data.role === "Limited Partner" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Investment Preferences
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Accreditation Status</p>
                <p className="text-muted-foreground">
                  {data.accreditation_status || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Investment Timeline</p>
                <p className="text-muted-foreground">
                  {data.investment_timeline || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Risk Tolerance</p>
                <p className="text-muted-foreground">
                  {data.riskTolerance || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Typical Commitment</p>
                <p className="text-muted-foreground">
                  {formatCurrency(data.typicalCommitmentSize)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Focus Areas</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Preferred Sectors:</span>{" "}
                {formatArray(data.preferred_sectors)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Geographic Preferences:</span>{" "}
                {formatArray(data.geographic_preferences)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Track Record</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {formatArray(data.past_investments) ||
                "No past investments provided"}
            </p>
          </div>
        </div>
      )}

      {data.role === "Capital Raiser" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-muted-foreground">
                  {data.success_rate ? `${data.success_rate}%` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Capital Raised</p>
                <p className="text-muted-foreground">
                  {formatCurrency(data.total_capital_raised)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Deals Raised</p>
                <p className="text-muted-foreground">
                  {data.dealsRaised || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Typical Deal Size</p>
                <p className="text-muted-foreground">
                  {formatCurrency(data.typicalDealSize)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Expertise</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Specialization Areas:</span>{" "}
                {formatArray(data.specialization_areas)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Geographic Coverage:</span>{" "}
                {formatArray(data.geographic_coverage)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Industry Focus:</span>{" "}
                {formatArray(data.industryFocus)}
              </p>
            </div>
          </div>

          {data.client_references && data.client_references.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Client References</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {formatArray(data.client_references)}
              </p>
            </div>
          )}
        </div>
      )}

      {data.social_links && (
        <>
          <Separator className="my-6" />
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="space-y-2">
              {data.social_links.linkedin && (
                <p className="text-sm">
                  <span className="font-medium">LinkedIn:</span>{" "}
                  <a
                    href={data.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Profile
                  </a>
                </p>
              )}
              {data.social_links.twitter && (
                <p className="text-sm">
                  <span className="font-medium">Twitter:</span>{" "}
                  <a
                    href={data.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Profile
                  </a>
                </p>
              )}
              {data.social_links.website && (
                <p className="text-sm">
                  <span className="font-medium">Website:</span>{" "}
                  <a
                    href={data.social_links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit Website
                  </a>
                </p>
              )}
              {data.calendly_link && (
                <p className="text-sm">
                  <span className="font-medium">Schedule Meeting:</span>{" "}
                  <a
                    href={data.calendly_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Book a Time
                  </a>
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
