import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FundManagerAnalytics } from "./FundManagerAnalytics";

export function EnhancedFundManagerAnalytics() {
  // This component enhances the FundManagerAnalytics component with additional metrics
  // that are shown in the admin dashboard
  return (
    <div className="space-y-4">
      {/* Include the original FundManagerAnalytics component */}
      <FundManagerAnalytics />
      
      {/* Add the comprehensive metrics from admin dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Average Fund Size</h3>
          <div className="text-2xl font-bold">$24.7M</div>
          <p className="text-xs text-green-500">+12% from last quarter</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Average IRR</h3>
          <div className="text-2xl font-bold">18.3%</div>
          <p className="text-xs text-green-500">+2.1% from last quarter</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Match Conversion Rate</h3>
          <div className="text-2xl font-bold">34.8%</div>
          <p className="text-xs text-green-500">+5% from last quarter</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Fund Manager Success Rate</h3>
          <div className="text-lg font-medium">Match to Deal Conversion</div>
          <div className="text-2xl font-bold">23.7%</div>
          <p className="text-xs text-green-500">+2.3% from last month</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Capital Partnerships</h3>
          <div className="text-2xl font-bold">47</div>
          <p className="text-xs text-green-500">+8 from last month</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Top Performing Sector</h3>
          <div className="text-2xl font-bold">Technology</div>
          <p className="text-xs text-muted-foreground">31.4% of deals</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Risk Profile</h3>
          <div className="text-2xl font-bold">Moderate-High</div>
          <p className="text-xs text-muted-foreground">58% of fund managers</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Profile & Engagement</h3>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Profile Completion</h4>
                <div className="text-lg font-bold">87.2%</div>
              </div>
              <div className="text-xs text-green-500">+4.1% from last month</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Active Managers</h4>
                <div className="text-lg font-bold">1,847</div>
              </div>
              <div className="text-xs text-green-500">+142 from last month</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Verification Rate</h4>
                <div className="text-lg font-bold">92.3%</div>
              </div>
              <div className="text-xs text-green-500">+1.7% from last month</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Profile Views</h4>
                <div className="text-lg font-bold">14,327</div>
              </div>
              <div className="text-xs text-green-500">+1,240 from last month</div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Fund Performance</h3>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Historical Returns</h4>
                <div className="text-lg font-bold">21.8%</div>
              </div>
              <div className="text-xs text-green-500">+2.4% from last year</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm h-48">
            <h4 className="font-medium mb-2">Fund Type Distribution</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm">Venture:</div>
                <div className="text-sm font-medium">28%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Growth:</div>
                <div className="text-sm font-medium">34%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Buyout:</div>
                <div className="text-sm font-medium">19%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Debt:</div>
                <div className="text-sm font-medium">11%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Other:</div>
                <div className="text-sm font-medium">8%</div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Investment Metrics</h3>
          
          <Card className="p-4 bg-white shadow-sm">
            <h4 className="font-medium mb-2">Experience Level</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm">Junior:</div>
                <div className="text-sm font-medium">14%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Mid-level:</div>
                <div className="text-sm font-medium">43%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Senior:</div>
                <div className="text-sm font-medium">43%</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm">
            <h4 className="font-medium mb-2">Investment Horizon</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm">Short-term:</div>
                <div className="text-sm font-medium">23%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Medium-term:</div>
                <div className="text-sm font-medium">42%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Long-term:</div>
                <div className="text-sm font-medium">35%</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Contacts Uploaded</h3>
          <div className="text-xl font-bold">8,743</div>
          <div className="text-xs text-green-500">+642 from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Introductions Made</h3>
          <div className="text-xl font-bold">1,237</div>
          <div className="text-xs text-green-500">+108 from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Avg. Response Time</h3>
          <div className="text-xl font-bold">4.3 hrs</div>
          <div className="text-xs text-green-500">-0.8 hrs from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Network Growth</h3>
          <div className="text-xl font-bold">+18.7%</div>
          <div className="text-xs text-green-500">+2.3% from last month</div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Match Acceptance Rate</h3>
          <div className="text-xl font-bold">68.4%</div>
          <div className="text-xs text-green-500">+3.2% from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Avg. Match Score</h3>
          <div className="text-xl font-bold">78.3%</div>
          <div className="text-xs text-green-500">+1.8% from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">High Confidence Matches</h3>
          <div className="text-xl font-bold">42.7%</div>
          <div className="text-xs text-green-500">+2.1% from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">User Satisfaction</h3>
          <div className="text-xl font-bold">4.3/5</div>
          <div className="text-xs text-green-500">+0.2 from last month</div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Meetings Scheduled</h3>
          <div className="text-xl font-bold">873</div>
          <div className="text-xs text-green-500">+54 from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Meeting Completion</h3>
          <div className="text-xl font-bold">89.2%</div>
          <div className="text-xs text-green-500">+1.4% from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Avg. Deal Size</h3>
          <div className="text-xl font-bold">$3.7M</div>
          <div className="text-xs text-green-500">+$0.3M from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Time to Deal</h3>
          <div className="text-xl font-bold">34 days</div>
          <div className="text-xs text-green-500">-3 days from last month</div>
        </Card>
      </div>
    </div>
  );
}
