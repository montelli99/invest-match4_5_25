import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { UserProfile } from "@/utils/types";

interface Props {
  profile: UserProfile;
}

export function ProfileCompletion({ profile }: Props) {
  const navigate = useNavigate();

  // Define required and optional fields
  const requiredFields = [
    { name: "Email", value: profile.email },
    { name: "Name", value: profile.name },
    { name: "User Type", value: profile.userType },
  ];

  const optionalFields = [
    { name: "Password", value: profile.hasPassword },
  ];

  // Calculate completion percentages
  const completedRequiredFields = requiredFields.filter((field) => field.value).length;
  const completedOptionalFields = optionalFields.filter((field) => field.value).length;
  
  // Required fields have more weight in the completion percentage
  const completionPercentage = 
    ((completedRequiredFields * 0.7) / requiredFields.length + 
    (completedOptionalFields * 0.3) / optionalFields.length) * 100;

  const incompleteFields = requiredFields.filter((field) => !field.value);

  const hasAllRequiredFields = completedRequiredFields === requiredFields.length;
  
  if (hasAllRequiredFields && completionPercentage === 100) {
    return (
      <Alert className="bg-emerald-50 border-emerald-200">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <AlertTitle className="text-emerald-600">Profile Complete</AlertTitle>
        <AlertDescription className="text-emerald-700">
          Your profile is complete and ready for networking!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant={hasAllRequiredFields ? "default" : "destructive"} className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
          {hasAllRequiredFields 
            ? "Enhance Your Profile" 
            : "Complete Your Profile"}
        </AlertTitle>
      <AlertDescription className="mt-2">
          {!hasAllRequiredFields ? (
            <p className="mb-4">
              Complete the required fields to unlock all features and start connecting with potential matches.
            </p>
          ) : (
            <p className="mb-4">
              Your profile has all required fields. Complete optional fields to increase your visibility and matching potential.
            </p>
          )}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Profile Completion</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          <div className="text-sm space-y-3">
            {!hasAllRequiredFields && (
              <div>
                <p className="font-medium">Required fields to complete:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {incompleteFields.map((field) => (
                    <li key={field.name} className="text-destructive">{field.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {optionalFields.some(field => !field.value) && (
              <div>
                <p className="font-medium">Optional fields to enhance your profile:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {optionalFields
                    .filter(field => !field.value)
                    .map((field) => (
                      <li key={field.name} className="text-muted-foreground">
                        {field.name}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant={hasAllRequiredFields ? "outline" : "default"}
              onClick={() => navigate("/CreateProfile?edit=true")}
              className="flex-1"
            >
              {hasAllRequiredFields ? "Enhance Profile" : "Complete Required Fields"}
            </Button>
            {!profile.hasPassword && (
              <Button
                variant="outline"
                onClick={() => navigate("/CreateProfile?section=security")}
                className="flex-1"
              >
                Set Password
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
