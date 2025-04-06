import { useState, useEffect } from "react";
import {
  Bell,
  HelpCircle,
  User,
  LogOut,
  Settings,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { NotificationsPanel } from "./NotificationsPanel";

interface AdminHeaderProps {
  userName?: string;
  userAvatar?: string;
  userRole?: string;
}

/**
 * AdminHeader - Header component for the admin dashboard
 * 
 * Includes notifications, user menu, mobile navigation toggle, and other global controls
 */
export function AdminHeader({
  userName = "Admin User",
  userAvatar = "",
  userRole = "admin"
}: AdminHeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mock data - in a real app this would come from a notifications service
  useEffect(() => {
    // Simulate receiving unread notifications
    setUnreadCount(3);
  }, []);
  
  const handleLogout = () => {
    // Handle logout logic
    toast.success("Logged out successfully");
  };
  
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Mobile menu button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="py-4">
              <h2 className="text-lg font-semibold mb-4">Admin Navigation</h2>
              {/* Mobile navigation would be rendered here - using same items as sidebar */}
              <p className="text-sm text-muted-foreground">
                Please use the desktop view for full admin functionality.
              </p>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Title - visible on larger screens */}
        <h1 className="font-semibold text-lg hidden sm:block">InvestMatch Admin</h1>
        
        <div className="flex-1" />
        
        {/* Notifications */}
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[380px]">
            <NotificationsPanel 
              onNotificationRead={() => setUnreadCount(prev => Math.max(0, prev - 1))}
              onMarkAllRead={() => setUnreadCount(0)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Help */}
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
        
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">{userRole}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
