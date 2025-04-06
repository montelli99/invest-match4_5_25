import brain from "brain";
import { useEffect, useState } from "react";

type FeatureAccess = "none" | "limited" | "full";

type FeatureAccessResult = {
  access_level: FeatureAccess;
  has_access: boolean;
  isLoading: boolean;
  error?: string;
};

const accessCache = new Map<string, FeatureAccessResult>();

export function useFeatureAccess(
  userId: string | undefined,
  featureName: string,
): FeatureAccessResult {
  const [result, setResult] = useState<FeatureAccessResult>(() => {
    const cached = accessCache.get(`${userId}-${featureName}`);
    return (
      cached || {
        access_level: "none",
        has_access: false,
        isLoading: true,
      }
    );
  });

  useEffect(() => {
    if (!userId) {
      setResult({
        access_level: "none",
        has_access: false,
        isLoading: false,
        error: "User ID is required",
      });
      return;
    }

    const checkAccess = async () => {
      try {
        const response = await brain.get_feature_access({
          pathArgs: {
            user_id: userId,
            feature_name: featureName,
          },
        });
        const data = await response.json();

        const newResult = {
          ...data,
          isLoading: false,
        };

        accessCache.set(`${userId}-${featureName}`, newResult);
        setResult(newResult);
      } catch (error) {
        setResult({
          access_level: "none",
          has_access: false,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to check feature access",
        });
      }
    };

    checkAccess();
  }, [userId, featureName]);

  return result;
}
