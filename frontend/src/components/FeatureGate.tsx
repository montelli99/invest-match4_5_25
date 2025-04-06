import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFeatureAccess } from "./UseFeatureAccess";
import { AlertCircle, Lock } from "lucide-react";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  feature: string;
  userId?: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function FeatureGate({
  feature,
  userId,
  children,
  fallback,
  showUpgrade = true,
}: Props) {
  const { has_access, access_level, isLoading, error } = useFeatureAccess(
    userId,
    feature,
  );
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="animate-pulse flex space-x-4 p-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>Error checking feature access</span>
        </div>
      </Card>
    );
  }

  if (!has_access) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="p-6 text-center">
        <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">
          {access_level === "limited" ? "Limited Access" : "Feature Restricted"}
        </h3>
        <p className="text-muted-foreground mb-4">
          {access_level === "limited"
            ? "Upgrade your plan to unlock full access to this feature"
            : "This feature is not available on your current plan"}
        </p>
        {showUpgrade && (
          <Button onClick={() => navigate("/subscription")}>
            Upgrade Plan
          </Button>
        )}
      </Card>
    );
  }

  return <>{children}</>;
}
