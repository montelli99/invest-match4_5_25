import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import React from "react";

interface Props {
  linkedinUrl: string;
  twitterUrl: string;
  websiteUrl: string;
  onLinkedinChange: (value: string) => void;
  onTwitterChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  error?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  loading?: boolean;
}

export const SocialLinksForm: React.FC<Props> = ({
  linkedinUrl,
  twitterUrl,
  websiteUrl,
  onLinkedinChange,
  onTwitterChange,
  onWebsiteChange,
  error,
  loading = false,
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Social Links</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter your LinkedIn profile URL (e.g., https://linkedin.com/in/username)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={linkedinUrl}
            onChange={(e) => onLinkedinChange(e.target.value)}
            disabled={loading}
            aria-label="LinkedIn profile URL"
          />
          {error?.linkedin && (
            <p className="text-sm text-red-500">{error.linkedin}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="twitter">Twitter Profile</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter your Twitter profile URL (e.g., https://twitter.com/username)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="twitter"
            type="url"
            placeholder="https://twitter.com/yourhandle"
            value={twitterUrl}
            onChange={(e) => onTwitterChange(e.target.value)}
            disabled={loading}
            aria-label="Twitter profile URL"
          />
          {error?.twitter && (
            <p className="text-sm text-red-500">{error.twitter}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="website">Website</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter your website URL (must start with https://)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="website"
            type="url"
            placeholder="https://yourwebsite.com"
            value={websiteUrl}
            onChange={(e) => onWebsiteChange(e.target.value)}
            disabled={loading}
            aria-label="Website URL"
          />
          {error?.website && (
            <p className="text-sm text-red-500">{error.website}</p>
          )}
        </div>
      </div>
    </Card>
  );
};
