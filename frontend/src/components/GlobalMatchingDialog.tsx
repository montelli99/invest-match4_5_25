import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Globe2, HelpCircle, Settings2, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import brain from "brain";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalMatchingDialog({ open, onOpenChange }: Props) {
  const [matchCount, setMatchCount] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const [globalMatching, setGlobalMatching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [matchStats, setMatchStats] = useState({
    roleMatches: 0,
    fundTypeMatches: 0,
    investmentFocusMatches: 0,
    fundSizeMatches: 0,
    averageScore: 0
  });

  useEffect(() => {
    // Fetch current settings when dialog opens
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    try {
      setIsFetching(true);
      const settingsResponse = await brain.get_contact_matches({ token: {} });
      const matchesData = await settingsResponse.json();
      setMatchCount(matchesData.length);
      setGlobalMatching(matchesData.length > 0);
      
      if (matchesData.length > 0) {
        const stats = matchesData.reduce((acc, match) => ({
          roleMatches: acc.roleMatches + (match.matching_criteria.role_match ? 1 : 0),
          fundTypeMatches: acc.fundTypeMatches + (match.matching_criteria.fund_type_match ? 1 : 0),
          investmentFocusMatches: acc.investmentFocusMatches + (match.matching_criteria.investment_focus_match ? 1 : 0),
          fundSizeMatches: acc.fundSizeMatches + (match.matching_criteria.fund_size_match ? 1 : 0),
          totalScore: acc.totalScore + match.score
        }), { roleMatches: 0, fundTypeMatches: 0, investmentFocusMatches: 0, fundSizeMatches: 0, totalScore: 0 });
        
        setMatchStats({
          roleMatches: stats.roleMatches,
          fundTypeMatches: stats.fundTypeMatches,
          investmentFocusMatches: stats.investmentFocusMatches,
          fundSizeMatches: stats.fundSizeMatches,
          averageScore: Math.round((stats.totalScore / matchesData.length) * 100)
        });
      }
    } catch (error) {
      toast.error("Failed to load current settings");
      console.error("Error fetching match settings:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await brain.update_match_settings({
        global_matching: globalMatching,
        token: {},
      });
      const data = await response.json();
      if (data.status === "success") {
        toast.success(
          globalMatching
            ? "Global matching enabled. Your contacts will now be matched with other users."
            : "Global matching disabled. Your contacts will not be matched with others.",
        );
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error updating match settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Globe2 className="h-6 w-6 text-primary" />
            <DialogTitle>Global Contact Matching</DialogTitle>
          </div>
          <DialogDescription>
            Enable or disable automatic matching of your contacts with other
            users on the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          <Card className="p-6 relative overflow-hidden">
            {isFetching && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  <Label htmlFor="global-matching" className="text-lg font-semibold">Enable Global Matching</Label>
                </div>
                <div className="text-sm text-muted-foreground pl-7">
                  When enabled, your contacts will be automatically matched with
                  other users based on their profiles and preferences.
                </div>
                <div className="flex items-center gap-2 mt-4 pl-7">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {matchCount} potential {matchCount === 1 ? 'match' : 'matches'} available
                  </span>
                </div>
              </div>
              <Switch
                id="global-matching"
                checked={globalMatching}
                onCheckedChange={setGlobalMatching}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Matching Status</h3>
              </div>
              {globalMatching ? (
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">Overall Match Quality</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[300px]">
                                <p className="mb-2">The overall quality of matches based on all criteria combined. A higher score indicates better alignment across all matching criteria.</p>
                                <ul className="text-sm space-y-1 list-disc list-inside">
                                  <li>Excellent (80-100%): Perfect or near-perfect matches</li>
                                  <li>Good (60-79%): Strong matches with minor differences</li>
                                  <li>Fair (40-59%): Moderate matches worth exploring</li>
                                  <li>Basic (0-39%): Limited alignment but potential opportunities</li>
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {matchStats.averageScore >= 80 ? 'Excellent' :
                           matchStats.averageScore >= 60 ? 'Good' :
                           matchStats.averageScore >= 40 ? 'Fair' : 'Basic'}
                        </span>
                      </div>
                      <Progress value={matchStats.averageScore} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">Role Matches</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[300px]">
                                  <p className="mb-2">Matches based on professional roles in the investment industry.</p>
                                  <ul className="text-sm space-y-1 list-disc list-inside">
                                    <li>Fund Managers seeking Limited Partners</li>
                                    <li>Capital Raisers matching with Fund Managers</li>
                                    <li>Limited Partners looking for Fund Managers</li>
                                    <li>Investment Advisors connecting with clients</li>
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span className="text-sm text-muted-foreground">{matchStats.roleMatches}</span>
                        </div>
                        <Progress 
                          value={(matchStats.roleMatches / matchCount) * 100} 
                          className="h-1.5" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">Fund Type</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[300px]">
                                  <p className="mb-2">Matches based on investment vehicle types and structures.</p>
                                  <ul className="text-sm space-y-1 list-disc list-inside">
                                    <li>Venture Capital (Early Stage, Growth, Late Stage)</li>
                                    <li>Private Equity (Buyout, Growth Equity, Distressed)</li>
                                    <li>Hedge Funds (Long/Short, Global Macro, Event-Driven)</li>
                                    <li>Real Estate (Commercial, Residential, REITs)</li>
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span className="text-sm text-muted-foreground">{matchStats.fundTypeMatches}</span>
                        </div>
                        <Progress 
                          value={(matchStats.fundTypeMatches / matchCount) * 100} 
                          className="h-1.5" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">Investment Focus</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[300px]">
                                  <p className="mb-2">Matches based on target sectors, industries, and investment strategies.</p>
                                  <ul className="text-sm space-y-1 list-disc list-inside">
                                    <li>Technology (SaaS, AI/ML, Cybersecurity)</li>
                                    <li>Healthcare (Biotech, Digital Health, Medical Devices)</li>
                                    <li>Financial Services (FinTech, InsurTech)</li>
                                    <li>Geographic Focus (North America, Europe, Asia)</li>
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span className="text-sm text-muted-foreground">{matchStats.investmentFocusMatches}</span>
                        </div>
                        <Progress 
                          value={(matchStats.investmentFocusMatches / matchCount) * 100} 
                          className="h-1.5" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">Fund Size</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[300px]">
                                  <p className="mb-2">Matches based on fund sizes and typical investment ranges.</p>
                                  <ul className="text-sm space-y-1 list-disc list-inside">
                                    <li>Seed ($1M - $5M fund size)</li>
                                    <li>Early-Stage ($5M - $50M fund size)</li>
                                    <li>Growth ($50M - $250M fund size)</li>
                                    <li>Large Cap ($250M+ fund size)</li>
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span className="text-sm text-muted-foreground">{matchStats.fundSizeMatches}</span>
                        </div>
                        <Progress 
                          value={(matchStats.fundSizeMatches / matchCount) * 100} 
                          className="h-1.5" 
                        />
                      </div>
                    </div>
                  </div>
                  <Alert className="bg-primary/5 border-primary/20">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      <p className="font-medium mb-2">With global matching enabled:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Your contacts will be matched with other users based on role, fund type, and investment focus</li>
                        <li>You'll receive notifications when new matches are found</li>
                        <li>You can review and manage matches in the dashboard</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    When disabled, your contacts will not be matched with other
                    users on the platform. Enable matching to discover potential connections.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </Card>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
