import { NavigationBar } from "@/components/NavigationBar";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import {
  AuthWrapper,
  signOut,
  useLoggedInUser,
  auth,
} from "@/components/AuthWrapper";
import { RoleSelectionDialog } from "@/components/RoleSelectionDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/use-theme";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Globe2,
  LineChart,
  MessageCircle,
  Moon,
  Search,
  Shield,
  Sun,
  UserCircle,
  Users,
} from "lucide-react";
import * as React from "react";
import brain from "brain";

import { useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [showAuth, setShowAuth] = React.useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = React.useState(false);
  const [shouldCheckProfile, setShouldCheckProfile] = React.useState(false);
  const [isAuthReady, setIsAuthReady] = React.useState(false);
  const user = useLoggedInUser();


  // Add debug logs for auth state
  React.useEffect(() => {
    console.log('Auth ready:', isAuthReady);
    console.log('User state:', user);
    console.log('Should check profile:', shouldCheckProfile);
  }, [isAuthReady, user, shouldCheckProfile]);

  // Check if user has a profile and redirect accordingly
  const checkAndRedirect = React.useCallback(async () => {
    if (!user) return;
    setIsCheckingProfile(true);
    try {
      // Try to get the user's profile
      const response = await brain.get_profile({ userId: user.uid });
      console.log('[DEBUG] Profile check response:', response);
      // If we get here, user has a profile
      return "/Dashboard";
    } catch (error) {
      // Log the error for debugging
      console.error('[ERROR] Profile check failed:', error);
      // If we get here, user doesn't have a profile
      return "/CreateProfile";
    } finally {
      setIsCheckingProfile(false);
    }
  }, [user]);

  // Handle navigation after profile check
  const handleNavigation = React.useCallback(async () => {
    let isMounted = true;
    try {
      const route = await checkAndRedirect();
      if (isMounted && route) {
        navigate(route, { replace: true });
      }
    } catch (error) {
      console.error('Navigation failed:', error);
    }
    return () => { isMounted = false };

  }, [checkAndRedirect, navigate]);

  // Wait for auth to be ready
  React.useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged(() => {
      setIsAuthReady(true);
    });

    return () => unsubscribe?.();
  }, []);

  // Check profile when auth is ready and we have a user
  React.useEffect(() => {
    if (isAuthReady && user && shouldCheckProfile) {
      handleNavigation();
      // Reset shouldCheckProfile to avoid rechecking unnecessarily
      setShouldCheckProfile(false);
    }
  }, [isAuthReady, user, shouldCheckProfile, handleNavigation]);

  return (
    <>
      {showAuth && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]">
          <AuthWrapper
            title="Welcome to InvestMatch"
            google={true}
            email={true}
            initialMode="signup"
            onAuthSuccess={() => {
              setShowAuth(false);
              setShouldCheckProfile(true);
            }}
          >
            <Button onClick={() => setShowAuth(false)} className="absolute top-4 right-4">
              Close
            </Button>
          </AuthWrapper>
        </div>
      )}
      <div className="min-h-screen bg-background">
        {/* Loading overlay */}
        {isCheckingProfile && (
          <LoadingOverlay message="Setting up your InvestMatch experience" />
        )}
        {/* Navigation */}
        <NavigationBar showAuth={() => setShowAuth(true)} />

        {/* Hero Section */}
        <main className="pt-24 pb-16 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative mb-16">
              {/* Background Elements */}
              <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5" />
                <div className="absolute left-1/4 top-1/4 w-[400px] h-[400px] rounded-full bg-accent/5" />
                <div className="absolute right-1/4 bottom-0 w-[600px] h-[600px] rounded-full bg-secondary/5" />
              </div>

              {/* Hero Content */}
              <div className="text-center relative">
                <h1 className="text-4xl md:text-6xl font-semibold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Connecting the Investment Community
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  InvestMatch brings together Fund Managers, Capital Raisers, and
                  Limited Partners on one powerful platform.
                </p>
                <Button
                  size="lg"
                  className="text-lg px-8"
                  onClick={() => {
                    setShowAuth(true);
                    setShouldCheckProfile(true);
                  }}>
                  Start Matching Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* How it Works */}
            <div className="mb-24">
              <h2 className="text-3xl font-semibold text-center mb-12">
                How InvestMatch Works
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
                  <p className="text-muted-foreground">
                    Our AI-powered algorithm finds the perfect matches based on
                    your criteria.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Direct Communication
                  </h3>
                  <p className="text-muted-foreground">
                    Connect and communicate securely with potential partners.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <LineChart className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                  <p className="text-muted-foreground">
                    Monitor your connections and investment opportunities in
                    real-time.
                  </p>
                </div>
              </div>
            </div>

            {/* Onboarding Guide */}
            <div className="mb-24">
              <h2 className="text-3xl font-semibold text-center mb-6">
                Get Started in Minutes
              </h2>
              <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-12">
                Follow our simple onboarding process tailored to your role
              </p>

              <Tabs defaultValue="fund-manager" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="fund-manager">Fund Manager</TabsTrigger>
                  <TabsTrigger value="limited-partner">
                    Limited Partner
                  </TabsTrigger>
                  <TabsTrigger value="capital-raiser">Capital Raiser</TabsTrigger>
                  <TabsTrigger value="fund-of-funds">Fund of Funds</TabsTrigger>
                </TabsList>

                <TabsContent value="fund-manager" className="space-y-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCircle className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          1. Create Your Profile
                        </h3>
                        <p className="text-muted-foreground">
                          Enter your fund details, investment focus, and
                          historical performance metrics.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          2. Verify Credentials
                        </h3>
                        <p className="text-muted-foreground">
                          Submit required documentation to verify your fund
                          management credentials.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
                        <ClipboardCheck className="h-8 w-8 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          3. Start Matching
                        </h3>
                        <p className="text-muted-foreground">
                          Get matched with qualified investors and start building
                          relationships.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="limited-partner" className="space-y-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCircle className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          1. Set Up Profile
                        </h3>
                        <p className="text-muted-foreground">
                          Define your investment interests, commitment size, and
                          risk tolerance.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          2. Accreditation
                        </h3>
                        <p className="text-muted-foreground">
                          Verify your accredited investor status with required
                          documentation.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
                        <ClipboardCheck className="h-8 w-8 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          3. Explore Opportunities
                        </h3>
                        <p className="text-muted-foreground">
                          Browse matched funds and connect with fund managers.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="capital-raiser" className="space-y-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCircle className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          1. Create Profile
                        </h3>
                        <p className="text-muted-foreground">
                          Add your professional background, industry focus, and
                          track record.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          2. Network Setup
                        </h3>
                        <p className="text-muted-foreground">
                          Import your professional network and set matching
                          preferences.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
                        <ClipboardCheck className="h-8 w-8 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          3. Facilitate Connections
                        </h3>
                        <p className="text-muted-foreground">
                          Start matching your contacts and facilitating
                          introductions.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fund-of-funds" className="space-y-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCircle className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          1. Create Your Profile
                        </h3>
                        <p className="text-muted-foreground">
                          Set up your fund of funds profile with portfolio details and investment criteria.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          2. Portfolio Setup
                        </h3>
                        <p className="text-muted-foreground">
                          Add your existing fund investments and track performance metrics.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
                        <ClipboardCheck className="h-8 w-8 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          3. Start Matching
                        </h3>
                        <p className="text-muted-foreground">
                          Get matched with qualified fund managers and explore new opportunities.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-24">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fund Managers</h3>
                <p className="text-muted-foreground">
                  Showcase your fund's performance and connect with qualified
                  investors.
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Limited Partners</h3>
                <p className="text-muted-foreground">
                  Find investment opportunities that match your criteria and risk
                  tolerance.
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Capital Raisers</h3>
                <p className="text-muted-foreground">
                  Leverage your network and facilitate valuable connections.
                </p>
              </Card>
            </div>

            {/* Testimonials */}
            <div className="mb-24">
              <h2 className="text-3xl font-semibold text-center mb-12">
                Trusted by Industry Leaders
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-semibold text-primary">
                        JD
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">John Doe</h4>
                      <p className="text-sm text-muted-foreground">
                        Managing Partner, Venture Capital
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "InvestMatch has revolutionized how we connect with potential
                    investors. The matching algorithm is incredibly accurate."
                  </p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-semibold text-accent">
                        AS
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Alice Smith</h4>
                      <p className="text-sm text-muted-foreground">
                        Investment Director, Private Equity
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "The platform's efficiency in connecting us with the right
                    fund managers has significantly improved our investment
                    process."
                  </p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-semibold text-secondary">
                        RJ
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Robert Johnson</h4>
                      <p className="text-sm text-muted-foreground">
                        Capital Raiser
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "InvestMatch has become an essential tool for our networking
                    and capital raising activities."
                  </p>
                </Card>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-card rounded-lg p-8 mb-24">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">95%</div>
                  <div className="text-muted-foreground">Match Accuracy</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">10k+</div>
                  <div className="text-muted-foreground">Active Users</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">$2B+</div>
                  <div className="text-muted-foreground">Capital Connected</div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mb-24">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is protected with enterprise-grade security
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Verified Users</h3>
                  <p className="text-sm text-muted-foreground">
                    All members are verified investment professionals
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <Globe2 className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold mb-2">Global Network</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with investors worldwide
                  </p>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center">
              <h2 className="text-3xl font-semibold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of investment professionals already using
                InvestMatch
              </p>
              <Button
                size="lg"
                className="text-lg px-12"
                onClick={() => {
                  setShowAuth(true);
                  setShouldCheckProfile(true);
                }}>
                Create Your Account <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">InvestMatch</h3>
                <p className="text-sm text-muted-foreground">
                  Connecting the investment community through intelligent
                  matching.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Features</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/Features" className="text-muted-foreground hover:text-primary transition-colors">
                      Smart Matching
                    </Link>
                  </li>
                  <li>
                    <Link to="/Features" className="text-muted-foreground hover:text-primary transition-colors">
                      Direct Messaging
                    </Link>
                  </li>
                  <li>
                    <Link to="/Features" className="text-muted-foreground hover:text-primary transition-colors">
                      Profile Management
                    </Link>
                  </li>
                  <li>
                    <Link to="/Features" className="text-muted-foreground hover:text-primary transition-colors">
                      Analytics Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/documentation" className="text-muted-foreground hover:text-primary transition-colors">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/support" className="text-muted-foreground hover:text-primary transition-colors">
                      Support
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="mailto:info@investmatch.com" className="text-muted-foreground hover:text-primary transition-colors">
                      info@investmatch.com
                    </a>
                  </li>
                  <li>
                    <a href="tel:+15551234567" className="text-muted-foreground hover:text-primary transition-colors">
                      +1 (555) 123-4567
                    </a>
                  </li>
                  <li>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      Follow us on LinkedIn
                    </a>
                  </li>
                  <li>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      Follow us on Twitter
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <Separator className="my-8" />
            <div className="text-center text-sm text-muted-foreground">
              © 2024 InvestMatch. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
