import { Shield, BarChart3, Flag, FileCheck, Activity, RefreshCw, Clock, UserCheck, MessageSquare, Settings, Users, LifeBuoy, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AdminSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  userName?: string;
  userAvatar?: string;
  userRole?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: JSX.Element;
  badge?: number;
  permission?: string;
}

/**
 * AdminSidebar - Sidebar navigation for the admin dashboard
 * 
 * Provides navigation between different admin sections with permission-based display
 */
export function AdminSidebar({
  currentSection,
  onSectionChange,
  userName = "Admin User",
  userAvatar = "",
  userRole = "admin"
}: AdminSidebarProps) {
  // Navigation items with corresponding icons and permissions
  const navigationItems: NavigationItem[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="h-5 w-5" />, permission: "overview" },
    { id: "content-reports", label: "Content Reports", icon: <Flag className="h-5 w-5" />, badge: 24, permission: "reports" },
    { id: "appeals", label: "Appeals", icon: <FileCheck className="h-5 w-5" />, badge: 8, permission: "appeals" },
    { id: "performance", label: "Performance", icon: <Activity className="h-5 w-5" />, permission: "performance" },
    { id: "batch-operations", label: "Batch Operations", icon: <RefreshCw className="h-5 w-5" />, permission: "batchOperations" },
    { id: "retention-policies", label: "Retention Policies", icon: <Clock className="h-5 w-5" />, permission: "retentionPolicies" },
    { id: "trusted-users", label: "Trusted Users", icon: <UserCheck className="h-5 w-5" />, permission: "trustedUsers" },
    { id: "feedback", label: "Feedback", icon: <MessageSquare className="h-5 w-5" />, permission: "feedback" },
    { id: "users", label: "User Management", icon: <Users className="h-5 w-5" />, permission: "users" },
    { id: "support", label: "Support Tickets", icon: <LifeBuoy className="h-5 w-5" />, permission: "support" },
    { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" />, permission: "settings" },
  ];
  
  // Check if user has permission for a feature (simplified for now)
  const hasPermission = (permission: string): boolean => {
    // Simplified permission check - in a real app this would be more sophisticated
    if (userRole === "admin") return true;
    
    // Example permission logic based on role
    if (userRole === "moderator") {
      return !["retentionPolicies", "trustedUsers", "settings"].includes(permission);
    }
    
    return ["overview", "reports", "appeals"].includes(permission);
  };
  
  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:bg-muted/50 md:border-r">
      {/* Header with Logo */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="font-semibold text-lg">InvestMatch Admin</h1>
        </div>
      </div>
      
      {/* Navigation Items */}
      <div className="p-2 flex-1 overflow-y-auto">
        <nav className="space-y-1">
          {navigationItems.map(item => {
            if (!hasPermission(item.permission || item.id)) return null;
            
            return (
              <Button
                key={item.id}
                variant={currentSection === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start ${currentSection === item.id ? "bg-secondary/80" : ""}`}
                onClick={() => onSectionChange(item.id)}
              >
                <div className="flex items-center w-full">
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge className="ml-auto">{item.badge}</Badge>
                  )}
                </div>
              </Button>
            );
          })}
        </nav>
      </div>
      
      {/* User Profile Section */}
      <div className="border-t p-4">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-3 space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{userRole}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 ml-auto rounded-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
