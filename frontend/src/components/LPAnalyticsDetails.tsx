import React from "react";
import { Card } from "@/components/ui/card";

export function LPAnalyticsDetails() {
  return (
    <div className="space-y-6">
      {/* Investment Performance */}
      <div>
        <h3 className="text-lg font-medium mb-4">Investment Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Total Investments</h4>
            <p className="text-2xl font-bold">$1.24B</p>
            <p className="text-xs text-green-500">+$87.3M from last quarter</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Funds Backed</h4>
            <p className="text-2xl font-bold">142</p>
            <p className="text-xs text-green-500">+12 from last quarter</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Avg. Commitment Size</h4>
            <p className="text-2xl font-bold">$8.7M</p>
            <p className="text-xs text-green-500">+$0.5M from last quarter</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Realized Returns</h4>
            <p className="text-2xl font-bold">19.3%</p>
            <p className="text-xs text-green-500">+1.2% from last quarter</p>
          </Card>
        </div>
      </div>

      {/* Profile & Engagement */}
      <div>
        <h3 className="text-lg font-medium mb-4">Profile & Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Profile Completion</h4>
            <p className="text-2xl font-bold">91.7%</p>
            <p className="text-xs text-green-500">+2.4% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Active LPs</h4>
            <p className="text-2xl font-bold">934</p>
            <p className="text-xs text-green-500">+67 from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Verification Rate</h4>
            <p className="text-2xl font-bold">98.1%</p>
            <p className="text-xs text-green-500">+0.7% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Profile Views</h4>
            <p className="text-2xl font-bold">6,832</p>
            <p className="text-xs text-green-500">+842 from last month</p>
          </Card>
        </div>
      </div>

      {/* Investment Focus */}
      <div>
        <h3 className="text-lg font-medium mb-4">Investment Focus</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Sector Allocation</h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex justify-between">
                <span>Technology:</span>
                <span>37%</span>
              </div>
              <div className="flex justify-between">
                <span>Healthcare:</span>
                <span>24%</span>
              </div>
              <div className="flex justify-between">
                <span>Financial Services:</span>
                <span>18%</span>
              </div>
              <div className="flex justify-between">
                <span>Consumer:</span>
                <span>12%</span>
              </div>
              <div className="flex justify-between">
                <span>Other:</span>
                <span>9%</span>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Geographic Distribution</h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex justify-between">
                <span>North America:</span>
                <span>58%</span>
              </div>
              <div className="flex justify-between">
                <span>Europe:</span>
                <span>24%</span>
              </div>
              <div className="flex justify-between">
                <span>Asia:</span>
                <span>14%</span>
              </div>
              <div className="flex justify-between">
                <span>Other:</span>
                <span>4%</span>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Investment Stage</h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex justify-between">
                <span>Early Stage:</span>
                <span>32%</span>
              </div>
              <div className="flex justify-between">
                <span>Growth:</span>
                <span>43%</span>
              </div>
              <div className="flex justify-between">
                <span>Later Stage:</span>
                <span>25%</span>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Investment Horizon</h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex justify-between">
                <span>Short-term (1-3y):</span>
                <span>18%</span>
              </div>
              <div className="flex justify-between">
                <span>Medium-term (3-7y):</span>
                <span>46%</span>
              </div>
              <div className="flex justify-between">
                <span>Long-term (7y+):</span>
                <span>36%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Networking & Deal Flow */}
      <div>
        <h3 className="text-lg font-medium mb-4">Networking & Deal Flow</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Contacts Uploaded</h4>
            <p className="text-2xl font-bold">5,287</p>
            <p className="text-xs text-green-500">+412 from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Introductions Made</h4>
            <p className="text-2xl font-bold">876</p>
            <p className="text-xs text-green-500">+67 from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Deal Flow Quality</h4>
            <p className="text-2xl font-bold">8.4/10</p>
            <p className="text-xs text-green-500">+0.3 from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Network Growth</h4>
            <p className="text-2xl font-bold">+16.3%</p>
            <p className="text-xs text-green-500">+1.4% from last month</p>
          </Card>
        </div>
      </div>

      {/* Match Quality & Conversion */}
      <div>
        <h3 className="text-lg font-medium mb-4">Match Quality & Conversion</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Match Acceptance Rate</h4>
            <p className="text-2xl font-bold">67.2%</p>
            <p className="text-xs text-green-500">+3.4% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Avg. Match Score</h4>
            <p className="text-2xl font-bold">79.4%</p>
            <p className="text-xs text-green-500">+2.1% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Match to Meeting</h4>
            <p className="text-2xl font-bold">47.8%</p>
            <p className="text-xs text-green-500">+2.3% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Meeting to Investment</h4>
            <p className="text-2xl font-bold">21.3%</p>
            <p className="text-xs text-green-500">+1.2% from last month</p>
          </Card>
        </div>
      </div>

      {/* Portfolio Performance */}
      <div>
        <h3 className="text-lg font-medium mb-4">Portfolio Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Portfolio MOIC</h4>
            <p className="text-2xl font-bold">2.8x</p>
            <p className="text-xs text-green-500">+0.2x from last quarter</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Portfolio IRR</h4>
            <p className="text-2xl font-bold">24.7%</p>
            <p className="text-xs text-green-500">+1.8% from last quarter</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Realized Investments</h4>
            <p className="text-2xl font-bold">32</p>
            <p className="text-xs text-green-500">+4 from last quarter</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Avg. Holding Period</h4>
            <p className="text-2xl font-bold">5.3 yrs</p>
            <p className="text-xs text-amber-500">+0.2 yrs from last quarter</p>
          </Card>
        </div>
      </div>

      {/* Subscription & Monetization */}
      <div>
        <h3 className="text-lg font-medium mb-4">Subscription & Monetization</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Subscription Tier Distribution</h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex justify-between">
                <span>Basic:</span>
                <span>22%</span>
              </div>
              <div className="flex justify-between">
                <span>Professional:</span>
                <span>54%</span>
              </div>
              <div className="flex justify-between">
                <span>Enterprise:</span>
                <span>24%</span>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Upgrade Rate</h4>
            <p className="text-2xl font-bold">15.7%</p>
            <p className="text-xs text-green-500">+1.9% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Renewal Rate</h4>
            <p className="text-2xl font-bold">92.3%</p>
            <p className="text-xs text-green-500">+1.8% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Average Revenue</h4>
            <p className="text-2xl font-bold">$378</p>
            <p className="text-xs text-green-500">+$27 from last month</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
