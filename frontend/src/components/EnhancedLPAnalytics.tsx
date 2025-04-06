import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LPAnalytics } from "./LPAnalytics";

export function EnhancedLPAnalytics() {
  return (
    <div className="space-y-4">
      {/* Include the original LPAnalytics component */}
      <LPAnalytics />
      
      {/* Add the comprehensive metrics from admin dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Average Investment Size</h3>
          <div className="text-2xl font-bold">$4.2M</div>
          <p className="text-xs text-green-500">+8% from last quarter</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Portfolio Return</h3>
          <div className="text-2xl font-bold">16.7%</div>
          <p className="text-xs text-green-500">+1.8% from last quarter</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Diversification Score</h3>
          <div className="text-2xl font-bold">82.3</div>
          <p className="text-xs text-green-500">+3.5 from last quarter</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">LP Investment Success</h3>
          <div className="text-lg font-medium">Return vs Benchmark</div>
          <div className="text-2xl font-bold">+4.3%</div>
          <p className="text-xs text-green-500">+0.7% from last quarter</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Active Investments</h3>
          <div className="text-2xl font-bold">74</div>
          <p className="text-xs text-green-500">+12 from last quarter</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Top Investment Sector</h3>
          <div className="text-2xl font-bold">Technology</div>
          <p className="text-xs text-muted-foreground">38.5% of portfolio</p>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Investment Horizon</h3>
          <div className="text-2xl font-bold">Long-term</div>
          <p className="text-xs text-muted-foreground">67% of commitments</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Profile & Engagement</h3>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Profile Completion</h4>
                <div className="text-lg font-bold">91.6%</div>
              </div>
              <div className="text-xs text-green-500">+3.2% from last month</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Active LPs</h4>
                <div className="text-lg font-bold">932</div>
              </div>
              <div className="text-xs text-green-500">+85 from last month</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Verification Rate</h4>
                <div className="text-lg font-bold">94.7%</div>
              </div>
              <div className="text-xs text-green-500">+1.2% from last month</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Profile Views</h4>
                <div className="text-lg font-bold">8,647</div>
              </div>
              <div className="text-xs text-green-500">+740 from last month</div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Investment Performance</h3>
          
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Average Annual Returns</h4>
                <div className="text-lg font-bold">15.3%</div>
              </div>
              <div className="text-xs text-green-500">+1.7% from last year</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm h-48">
            <h4 className="font-medium mb-2">Investment Type Allocation</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm">Venture Capital:</div>
                <div className="text-sm font-medium">32%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Private Equity:</div>
                <div className="text-sm font-medium">28%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Real Estate:</div>
                <div className="text-sm font-medium">18%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Infrastructure:</div>
                <div className="text-sm font-medium">14%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Other:</div>
                <div className="text-sm font-medium">8%</div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">LP Demographics</h3>
          
          <Card className="p-4 bg-white shadow-sm">
            <h4 className="font-medium mb-2">LP Type</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm">Institutional:</div>
                <div className="text-sm font-medium">47%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Family Office:</div>
                <div className="text-sm font-medium">28%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">HNWI:</div>
                <div className="text-sm font-medium">25%</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm">
            <h4 className="font-medium mb-2">Geographic Distribution</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm">North America:</div>
                <div className="text-sm font-medium">52%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Europe:</div>
                <div className="text-sm font-medium">28%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Asia-Pacific:</div>
                <div className="text-sm font-medium">15%</div>
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
          <h3 className="font-medium mb-2">Funds Evaluated</h3>
          <div className="text-xl font-bold">247</div>
          <div className="text-xs text-green-500">+38 from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Due Diligence Completed</h3>
          <div className="text-xl font-bold">86</div>
          <div className="text-xs text-green-500">+14 from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Avg. Response Time</h3>
          <div className="text-xl font-bold">3.6 days</div>
          <div className="text-xs text-green-500">-0.5 days from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Network Growth</h3>
          <div className="text-xl font-bold">+16.4%</div>
          <div className="text-xs text-green-500">+2.1% from last month</div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Match Acceptance Rate</h3>
          <div className="text-xl font-bold">64.2%</div>
          <div className="text-xs text-green-500">+3.8% from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Avg. Match Score</h3>
          <div className="text-xl font-bold">76.5%</div>
          <div className="text-xs text-green-500">+2.3% from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Investment Conversion</h3>
          <div className="text-xl font-bold">38.2%</div>
          <div className="text-xs text-green-500">+2.7% from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">User Satisfaction</h3>
          <div className="text-xl font-bold">4.5/5</div>
          <div className="text-xs text-green-500">+0.3 from last month</div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Meetings Scheduled</h3>
          <div className="text-xl font-bold">467</div>
          <div className="text-xs text-green-500">+42 from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Meeting Completion</h3>
          <div className="text-xl font-bold">91.8%</div>
          <div className="text-xs text-green-500">+1.2% from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">New Commitments</h3>
          <div className="text-xl font-bold">$74.3M</div>
          <div className="text-xs text-green-500">+$12.5M from last month</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <h3 className="font-medium mb-2">Time to Commitment</h3>
          <div className="text-xl font-bold">42 days</div>
          <div className="text-xs text-green-500">-4 days from last month</div>
        </Card>
      </div>
    </div>
  );
}
