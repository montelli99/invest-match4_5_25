import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, Shield, ShieldCheck } from "lucide-react";

type VerificationLevel = "basic" | "advanced" | "expert";

interface Props {
  level: VerificationLevel;
  className?: string;
}

const LEVEL_CONFIG = {
  basic: {
    label: "Basic Verification",
    description: "Email and phone verified",
    icon: CheckCircle2,
    variant: "secondary" as const,
  },
  advanced: {
    label: "Advanced Verification",
    description: "Identity and credentials verified",
    icon: Shield,
    variant: "default" as const,
  },
  expert: {
    label: "Expert Verification",
    description: "Full professional verification",
    icon: ShieldCheck,
    variant: "default" as const,
  },
};

export function VerificationBadge({ level, className }: Props) {
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant={config.variant}
            className={`gap-1 ${className || ""}`}
          >
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
