import { useAuth } from "@/components/AuthWrapper";
import { UnifiedModerationDashboard } from "components/UnifiedModerationDashboard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * UnifiedModerationDashboard Page
 * 
 * This page provides a comprehensive view of all moderation functions in one interface:
 * - Real-time updates via WebSocket
 * - Advanced content reports management
 * - Appeals and user reporting systems
 * - Pattern testing and risk scoring
 * - Batch operations for efficient moderation
 * - Performance monitoring dashboards
 * - Trusted user program management
 */
export default function UnifiedModerationDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [idToken, setIdToken] = useState<string>("");

  useEffect(() => {
    const getToken = async () => {
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
      }
    };
    getToken();
  }, [user]);

  // Default to admin role for now, in a real app we'd get this from claims
  const userRole = "admin";
  const userName = user?.displayName || "Admin User";
  const userAvatar = user?.photoURL || "";

  return (
    <div className="container-fluid h-screen p-0 m-0 overflow-hidden">
      <div className="p-4 flex items-center">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2" 
          onClick={() => navigate('/admin-dashboard')}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Admin Dashboard
        </Button>
      </div>
      <Alert className="mx-4 mb-4">
        <AlertDescription>
          This standalone moderation dashboard is now also integrated into the main Admin Dashboard for more convenient access.
          You can access all moderation features without leaving the Admin interface.
        </AlertDescription>
      </Alert>
      {idToken && (
        <UnifiedModerationDashboard 
          token={{ idToken }} 
          userRole={userRole}
          userName={userName}
          userAvatar={userAvatar}
        />
      )}
    </div>
  );
}
