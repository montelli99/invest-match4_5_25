import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import brain from "brain";

export interface Props {
  userId?: string;
  completeness?: number;
  verificationStatus?: string;
  verificationThreshold?: number;
  requireDocuments?: boolean;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  showTooltip?: boolean;
  className?: string;
  fetchVerificationStatus?: boolean;
}

export function ProfileCompletenessIndicator({
  userId,
  completeness = 0,
  verificationStatus = "incomplete",
  verificationThreshold = 90,
  requireDocuments = true,
  size = "md",
  showBadge = true,
  showTooltip = true,
  className = "",
  fetchVerificationStatus = false,
}: Props) {
  const [verificationData, setVerificationData] = useState<{
    profile_completeness: number;
    verification_status: string;
    profile_completion_threshold: number;
    require_document_verification: boolean;
    verification_message: string;
  } | null>(null);

  const [loading, setLoading] = useState(fetchVerificationStatus);

  useEffect(() => {
    if (fetchVerificationStatus && userId) {
      const getVerificationStatus = async () => {
        try {
          setLoading(true);
          const response = await brain.get_verification_status({ userId });
          const data = await response.json();
          setVerificationData(data);
        } catch (error) {
          console.error("Error fetching verification status:", error);
        } finally {
          setLoading(false);
        }
      };

      getVerificationStatus();
    }
  }, [fetchVerificationStatus, userId]);

  // Use verification data if available, otherwise use props
  const actualCompleteness = verificationData?.profile_completeness ?? completeness;
  const actualVerificationStatus = verificationData?.verification_status ?? verificationStatus;
  const actualThreshold = verificationData?.profile_completion_threshold ?? verificationThreshold;
  const actualRequireDocuments = verificationData?.require_document_verification ?? requireDocuments;
  const verificationMessage = verificationData?.verification_message;

  const progressSizes = {
    sm: "h-2",
    md: "h-2.5",
    lg: "h-3",
  };

  const progressClasses = `w-full ${progressSizes[size]} ${className}`;
  
  // Determine the color for the progress bar based on the completeness
  const progressColor = 
    actualCompleteness >= actualThreshold ? "bg-green-500" : 
    actualCompleteness >= 50 ? "bg-yellow-500" : "bg-gray-400";

  // Determine verification badge content
  const getBadgeContent = () => {
    if (actualVerificationStatus === "verified") {
      return {
        color: "bg-green-100 text-green-800 hover:bg-green-200",
        icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
        text: "Verified",
        tooltipText: "Your profile is verified"
      };
    } else if (actualVerificationStatus === "pending") {
      return {
        color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        icon: <Clock className="h-3.5 w-3.5 mr-1" />,
        text: "Pending",
        tooltipText: actualRequireDocuments 
          ? "Your profile is complete, but document verification is pending" 
          : "Your verification is being reviewed"
      };
    } else {
      return {
        color: "bg-slate-100 text-slate-800 hover:bg-slate-200",
        icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />,
        text: "Incomplete",
        tooltipText: verificationMessage || 
          `Complete your profile (${actualThreshold}%) ${actualRequireDocuments ? "and upload required documents " : ""}to get verified`
      };
    }
  };

  const badgeContent = getBadgeContent();

  if (loading) {
    return (
      <div className="w-full animate-pulse">
        <div className="flex justify-between text-xs text-gray-300 mb-1">
          <span>Profile Completeness</span>
          <span className="font-semibold">---%</span>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full w-full"></div>
      </div>
    );
  }

  const progressIndicator = (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Profile Completeness</span>
        <span className="font-semibold">{Math.round(actualCompleteness)}%</span>
      </div>
      <Progress value={actualCompleteness} className={progressClasses} indicatorClassName={progressColor} />
    </div>
  );

  const verificationBadge = showBadge && (
    <Badge variant="outline" className={`ml-2 flex items-center ${badgeContent.color}`}>
      {badgeContent.icon}
      {badgeContent.text}
    </Badge>
  );

  if (showTooltip) {
    return (
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                {progressIndicator}
                {verificationBadge}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{badgeContent.tooltipText}</p>
              {actualCompleteness < actualThreshold && (
                <p className="text-xs mt-1">
                  You need {Math.round(actualThreshold - actualCompleteness)}% more to reach the verification threshold
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {progressIndicator}
      {verificationBadge}
    </div>
  );
}
