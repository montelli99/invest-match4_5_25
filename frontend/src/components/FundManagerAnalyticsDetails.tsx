import React from "react";
import { Card } from "@/components/ui/card";

interface FundManagerAnalyticsDetailsProps {}

export function FundManagerAnalyticsDetails({}: FundManagerAnalyticsDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Fund Manager Success */}
      <div>
        <h3 className="text-lg font-medium mb-4">Fund Manager Success Rate</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Match to Deal Conversion</h4>
            <p className="text-2xl font-bold">23.7%</p>
            <p className="text-xs text-green-500">+2.3% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Capital Partnerships</h4>
            <p className="text-2xl font-bold">47</p>
            <p className="text-xs text-green-500">+8 from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Top Performing Sector</h4>
            <p className="text-lg font-bold">Technology</p>
            <p className="text-xs text-green-500">31.4% of deals</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Risk Profile</h4>
            <p className="text-lg font-bold">Moderate-High</p>
            <p className="text-xs">58% of fund managers</p>
          </Card>
        </div>
      </div>

      {/* Profile & Engagement */}
      <div>
        <h3 className="text-lg font-medium mb-4">Profile & Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Profile Completion</h4>
            <p className="text-2xl font-bold">87.2%</p>
            <p className="text-xs text-green-500">+4.1% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Active Managers</h4>
            <p className="text-2xl font-bold">1,847</p>
            <p className="text-xs text-green-500">+142 from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Verification Rate</h4>
            <p className="text-2xl font-bold">92.3%</p>
            <p className="text-xs text-green-500">+1.7% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Profile Views</h4>
            <p className="text-2xl font-bold">14,327</p>
            <p className="text-xs text-green-500">+1,240 from last month</p>
          </Card>
        </div>
      </div>

      {/* Fund Performance */}
      <div>
        <h3 className="text-lg font-medium mb-4">Fund Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Historical Returns</h4>
            <p className="text-2xl font-bold">21.8%</p>
            <p className="text-xs text-green-500">+2.4% from last year</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Fund Type Distribution</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span>Venture: 28%</span>
              <span>Growth: 34%</span>
              <span>Buyout: 19%</span>
              <span>Debt: 11%</span>
              <span>Other: 8%</span>
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Experience Level</h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex justify-between">
                <span>Junior:</span>
                <span>14%</span>
              </div>
              <div className="flex justify-between">
                <span>Mid-level:</span>
                <span>43%</span>
              </div>
              <div className="flex justify-between">
                <span>Senior:</span>
                <span>43%</span>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Investment Horizon</h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex justify-between">
                <span>Short-term:</span>
                <span>23%</span>
              </div>
              <div className="flex justify-between">
                <span>Medium-term:</span>
                <span>42%</span>
              </div>
              <div className="flex justify-between">
                <span>Long-term:</span>
                <span>35%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Networking & Communication */}
      <div>
        <h3 className="text-lg font-medium mb-4">Networking & Communication</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Contacts Uploaded</h4>
            <p className="text-2xl font-bold">8,743</p>
            <p className="text-xs text-green-500">+642 from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Introductions Made</h4>
            <p className="text-2xl font-bold">1,237</p>
            <p className="text-xs text-green-500">+108 from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Avg. Response Time</h4>
            <p className="text-2xl font-bold">4.3 hrs</p>
            <p className="text-xs text-green-500">-0.8 hrs from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Network Growth</h4>
            <p className="text-2xl font-bold">+18.7%</p>
            <p className="text-xs text-green-500">+2.3% from last month</p>
          </Card>
        </div>
      </div>

      {/* Match Quality & Satisfaction */}
      <div>
        <h3 className="text-lg font-medium mb-4">Match Quality & Satisfaction</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Match Acceptance Rate</h4>
            <p className="text-2xl font-bold">68.4%</p>
            <p className="text-xs text-green-500">+3.2% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Avg. Match Score</h4>
            <p className="text-2xl font-bold">78.3%</p>
            <p className="text-xs text-green-500">+1.8% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">High Confidence Matches</h4>
            <p className="text-2xl font-bold">42.7%</p>
            <p className="text-xs text-green-500">+2.1% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">User Satisfaction</h4>
            <p className="text-2xl font-bold">4.3/5</p>
            <p className="text-xs text-green-500">+0.2 from last month</p>
          </Card>
        </div>
      </div>

      {/* Deal Flow & Meetings */}
      <div>
        <h3 className="text-lg font-medium mb-4">Deal Flow & Meetings</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Meetings Scheduled</h4>
            <p className="text-2xl font-bold">873</p>
            <p className="text-xs text-green-500">+54 from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Meeting Completion</h4>
            <p className="text-2xl font-bold">89.2%</p>
            <p className="text-xs text-green-500">+1.4% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Avg. Deal Size</h4>
            <p className="text-2xl font-bold">$3.7M</p>
            <p className="text-xs text-green-500">+$0.3M from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Time to Deal</h4>
            <p className="text-2xl font-bold">34 days</p>
            <p className="text-xs text-green-500">-3 days from last month</p>
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
                <span>34%</span>
              </div>
              <div className="flex justify-between">
                <span>Professional:</span>
                <span>48%</span>
              </div>
              <div className="flex justify-between">
                <span>Enterprise:</span>
                <span>18%</span>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Upgrade Rate</h4>
            <p className="text-2xl font-bold">12.7%</p>
            <p className="text-xs text-green-500">+1.3% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Renewal Rate</h4>
            <p className="text-2xl font-bold">87.3%</p>
            <p className="text-xs text-green-500">+2.1% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Average Revenue</h4>
            <p className="text-2xl font-bold">$284</p>
            <p className="text-xs text-green-500">+$18 from last month</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
