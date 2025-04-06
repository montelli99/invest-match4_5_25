import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CapitalRaiserAnalytics } from "./CapitalRaiserAnalytics";

export function EnhancedCapitalRaiserAnalytics() {
  return (
    <div className="space-y-4">
      {/* Include the original CapitalRaiserAnalytics component */}
      <CapitalRaiserAnalytics />
      
      {/* Add the comprehensive metrics from admin dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Total Capital Raised</h3>
          <div className="text-2xl font-bold">$187.4M</div>
          <p className="text-xs text-green-500">+16% from last quarter</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Average Deal Size</h3>
          <div className="text-2xl font-bold">$3.8M</div>
          <p className="text-xs text-green-500">+0.4M from last quarter</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Fundraising Success Rate</h3>
          <div className="text-2xl font-bold">42.7%</div>
          <p className="text-xs text-green-500">+3.5% from last quarter</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Deal Conversion</h3>
          <div className="text-lg font-medium">Introduction to Term Sheet</div>
          <div className="text-2xl font-bold">28.4%</div>
          <p className="text-xs text-green-500">+2.7% from last month</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Live Fundraising</h3>
          <div className="text-2xl font-bold">32</div>
          <p className="text-xs text-green-500">+5 from last month</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Top Deal Sector</h3>
          <div className="text-2xl font-bold">SaaS</div>
          <p className="text-xs text-muted-foreground">27.3% of deals</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Deal Structure</h3>
          <div className="text-2xl font-bold">Equity</div>
          <p className="text-xs text-muted-foreground">72% of deals</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Profile & Engagement</h3>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Profile Completion</h4>
                <div className="text-lg font-bold">89.5%</div>
              </div>
              <div className="text-xs text-green-500">+3.8% from last month</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Active Raisers</h4>
                <div className="text-lg font-bold">1,253</div>
              </div>
              <div className="text-xs text-green-500">+98 from last month</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Verification Rate</h4>
                <div className="text-lg font-bold">93.1%</div>
              </div>
              <div className="text-xs text-green-500">+1.5% from last month</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Profile Views</h4>
                <div className="text-lg font-bold">18,742</div>
              </div>
              <div className="text-xs text-green-500">+1,640 from last month</div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Deal Performance</h3>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Time to Close</h4>
                <div className="text-lg font-bold">68 days</div>
              </div>
              <div className="text-xs text-green-500">-7 days from last year</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm h-48">
            <h4 className="font-medium mb-2">Deal Type Distribution</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm">Pre-seed:</div>
                <div className="text-sm font-medium">18%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Seed:</div>
                <div className="text-sm font-medium">32%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Series A:</div>
                <div className="text-sm font-medium">24%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Series B+:</div>
                <div className="text-sm font-medium">16%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Growth/Other:</div>
                <div className="text-sm font-medium">10%</div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Raiser Performance</h3>
          
          <Card className="p-4 bg-white shadow-sm">
            <h4 className="font-medium mb-2">Experience Level</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm">First-time:</div>
                <div className="text-sm font-medium">21%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Experienced:</div>
                <div className="text-sm font-medium">52%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Veteran:</div>
                <div className="text-sm font-medium">27%</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm">
            <h4 className="font-medium mb-2">Geographic Focus</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm">North America:</div>
                <div className="text-sm font-medium">58%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Europe:</div>
                <div className="text-sm font-medium">24%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Asia-Pacific:</div>
                <div className="text-sm font-medium">13%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Rest of World:</div>
                <div className="text-sm font-medium">5%</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Investor Contacts</h3>
          <div className="text-xl font-bold">5,874</div>
          <div className="text-xs text-green-500">+432 from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Introductions Made</h3>
          <div className="text-xl font-bold">986</div>
          <div className="text-xs text-green-500">+74 from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Avg. Response Time</h3>
          <div className="text-xl font-bold">5.2 hrs</div>
          <div className="text-xs text-green-500">-0.7 hrs from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Network Growth</h3>
          <div className="text-xl font-bold">+22.3%</div>
          <div className="text-xs text-green-500">+3.1% from last month</div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Match Acceptance Rate</h3>
          <div className="text-xl font-bold">62.7%</div>
          <div className="text-xs text-green-500">+3.5% from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Avg. Match Score</h3>
          <div className="text-xl font-bold">74.8%</div>
          <div className="text-xs text-green-500">+2.2% from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">First Meeting Rate</h3>
          <div className="text-xl font-bold">46.3%</div>
          <div className="text-xs text-green-500">+3.4% from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">User Satisfaction</h3>
          <div className="text-xl font-bold">4.4/5</div>
          <div className="text-xs text-green-500">+0.3 from last month</div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Meetings Scheduled</h3>
          <div className="text-xl font-bold">1,247</div>
          <div className="text-xs text-green-500">+108 from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Meeting Completion</h3>
          <div className="text-xl font-bold">87.3%</div>
          <div className="text-xs text-green-500">+1.8% from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Avg. Round Size</h3>
          <div className="text-xl font-bold">$5.2M</div>
          <div className="text-xs text-green-500">+$0.4M from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Time to Term Sheet</h3>
          <div className="text-xl font-bold">28 days</div>
          <div className="text-xs text-green-500">-3 days from last month</div>
        </Card>
      </div>
    </div>
  );
}
