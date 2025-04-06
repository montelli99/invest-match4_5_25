import { signOut as firebaseSignOut, getAuth } from "firebase/auth";
import { useAuth } from "@/components/AuthWrapper";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import {
  LayoutDashboard,
  MessageCircle,
  Moon,
  Search,
  Shield,
  ShieldCheck,
  Sun,
  Home,
  Settings,
  BarChart3
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { UserCircle, CircleDot } from "lucide-react";
import { useEffect, useState } from "react";
import brain from "brain";
import { Breadcrumb } from "./Breadcrumb";

interface NavigationBarProps {
  showAuth: () => void;
}

export function NavigationBar({ showAuth }: NavigationBarProps) {
  const { theme, setTheme } = useTheme();
  const { user, claims } = useAuth();
  const [hasProfile, setHasProfile] = useState(true); // Default to true to avoid flash
  const navigate = useNavigate();
  const location = useLocation();
  
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(3); // Hardcoded for demo

  // Check if user has a profile
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;
      
      try {
        await brain.get_profile({ userId: user.uid });
        setHasProfile(true);
      } catch (error) {
        if ((error as any)?.status === 404) {
          setHasProfile(false);
        }
      }
    };
    
    checkProfile();
  }, [user]);

  // Temporarily disable unread messages until messaging API is ready
  useEffect(() => {
    setUnreadMessages(0);
  }, [user]);
  
  const signOut = async () => {
    const auth = getAuth();
    try {
      await firebaseSignOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    if (location.pathname === '/') return;
    navigate('/');
  };

  return (
    <>
    <nav className="border-b bg-card/50 backdrop-blur-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {location.pathname !== "/" && !location.pathname.includes("404") && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </Button>
            )}
            <Link
              to="/"
              className="text-2xl font-semibold text-primary hover:text-primary/90 transition-colors"
            >
              InvestMatch
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <Button
                  variant="ghost"
                  onClick={handleHome}
                  className="hidden md:flex items-center gap-2"
                  disabled={location.pathname === '/'}
                >
                  <Home className="h-5 w-5" />
                  Home
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/dashboard")}
                  className="hidden md:flex items-center gap-2"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Button>
                {claims?.role === "fund_of_funds" && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/fof-dashboard")}
                    className="hidden md:flex items-center gap-2"
                  >
                    <BarChart3 className="h-5 w-5" />
                    FoF Dashboard
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => navigate("/search")}
                  className="hidden md:flex items-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  Search
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/Features")}
                  className="hidden md:flex items-center gap-2"
                >
                  <CircleDot className="h-5 w-5" />
                  Features
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/messages")}
                  className="hidden md:flex items-center gap-2"
                >
                  <div className="relative">
                    <MessageCircle className="h-5 w-5" />
                    {unreadMessages > 0 && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-medium">
                        {unreadMessages}
                      </div>
                    )}
                  </div>
                  Messages
                </Button>

                {claims?.admin && (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/admin")}
                    className="hidden md:flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent-foreground border-accent/20 hover:border-accent/30 font-medium transition-all"
                  >
                    <div className="relative flex items-center">
                      <Shield className="h-5 w-5 text-accent absolute opacity-20" />
                      <ShieldCheck className="h-5 w-5 text-accent" />
                    </div>
                    Admin
                  </Button>
                )}
              </>
            )}
            <Button
              variant="ghost"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            {!user ? (
              <>
                <Button onClick={() => showAuth?.()}>Sign In</Button>
                <Button variant="default" onClick={() => showAuth?.()}>
                  Get Started
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(hasProfile ? "/CreateProfile?edit=true" : "/CreateProfile")}
                  className={`flex items-center gap-2 ${!hasProfile ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border-primary/20 hover:border-primary/40 text-primary hover:text-primary/90'}`}
                >
                  <Settings className="h-4 w-4" />
                  {hasProfile ? 'Edit Profile' : 'Create Profile'}
                </Button>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/account/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account/subscription")}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Subscription
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account/notifications")}>
                    <div className="relative mr-2">
                      <Bell className="h-4 w-4" />
                      {unreadNotifications > 0 && (
                        <CircleDot className="h-2 w-2 absolute -top-1 -right-1 text-primary" />
                      )}
                    </div>
                    Notifications
                    {unreadNotifications > 0 && (
                      <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {unreadNotifications}
                      </span>
                    )}
                  </DropdownMenuItem>
                  {claims?.admin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin-dashboard")}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/analytics-dashboard")}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/Help")}>
                    Help & Documentation
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
      <Breadcrumb />
    </div>
    </>
  );
}
