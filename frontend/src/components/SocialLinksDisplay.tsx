import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SocialLinks } from "@/utils/validateSocialLinks";
import { ExternalLink, Globe, Linkedin, Twitter } from "lucide-react";
import React from "react";

interface Props {
  links: SocialLinks;
}

export const SocialLinksDisplay: React.FC<Props> = ({ links }) => {
  const hasLinks = links.linkedin || links.twitter || links.website;

  if (!hasLinks) return null;

  return (
    <Card className="p-6 shadow-sm border-muted">
      <h3 className="text-lg font-semibold mb-4 text-foreground/90">Connect</h3>
      <div className="space-y-2.5">
        {links.linkedin && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 hover:bg-muted/50 transition-colors group ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-9 px-0"
                  asChild
                >
            <a
              href={links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full h-9 px-4"
              aria-label="Visit LinkedIn Profile"
            >
              <Linkedin className="h-4 w-4 flex-shrink-0" />
              <span className="min-w-[80px] text-sm font-medium tracking-wide text-foreground/80 group-hover:text-foreground transition-colors">LinkedIn</span>
              <ExternalLink className="h-4 w-4 ml-auto flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View LinkedIn Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {links.twitter && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 hover:bg-muted/50 transition-colors group ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-9 px-0"
                  asChild
                >
            <a
              href={links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full h-9 px-4"
            >
              <Twitter className="h-4 w-4 flex-shrink-0" />
              <span className="min-w-[80px] text-sm font-medium tracking-wide text-foreground/80 group-hover:text-foreground transition-colors">Twitter</span>
              <ExternalLink className="h-4 w-4 ml-auto opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Twitter Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {links.website && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 hover:bg-muted/50 transition-colors group ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-9 px-0"
                  asChild
                >
            <a
              href={links.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full h-9 px-4"
            >
              <Globe className="h-4 w-4 flex-shrink-0" />
              <span className="min-w-[80px] text-sm font-medium tracking-wide text-foreground/80 group-hover:text-foreground transition-colors">Website</span>
              <ExternalLink className="h-4 w-4 ml-auto opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visit Website</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </Card>
  );
};
