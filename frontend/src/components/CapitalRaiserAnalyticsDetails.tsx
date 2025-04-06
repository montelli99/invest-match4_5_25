import React from "react";
import { Card } from "@/components/ui/card";

interface CapitalRaiserAnalyticsDetailsProps {}

export function CapitalRaiserAnalyticsDetails({}: CapitalRaiserAnalyticsDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Capital Raising Success */}
      <div>
        <h3 className="text-lg font-medium mb-4">Capital Raising Success</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Total Capital Raised</h4>
            <p className="text-2xl font-bold">$847.2M</p>
            <p className="text-xs text-green-500">+$52.1M from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Deals Closed</h4>
            <p className="text-2xl font-bold">142</p>
            <p className="text-xs text-green-500">+12 from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Avg. Deal Size</h4>
            <p className="text-2xl font-bold">$5.9M</p>
            <p className="text-xs text-green-500">+$0.4M from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Target Achieved</h4>
            <p className="text-2xl font-bold">76.3%</p>
            <p className="text-xs text-green-500">+4.2% from last month</p>
          </Card>
        </div>
      </div>

      {/* Profile & Engagement */}
      <div>
        <h3 className="text-lg font-medium mb-4">Profile & Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Profile Completion</h4>
            <p className="text-2xl font-bold">93.5%</p>
            <p className="text-xs text-green-500">+2.1% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Active Capital Raisers</h4>
            <p className="text-2xl font-bold">1,245</p>
            <p className="text-xs text-green-500">+87 from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Verification Rate</h4>
            <p className="text-2xl font-bold">97.3%</p>
            <p className="text-xs text-green-500">+0.8% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Profile Views</h4>
            <p className="text-2xl font-bold">18,432</p>
            <p className="text-xs text-green-500">+2,174 from last month</p>
          </Card>
        </div>
      </div>

      {/* Sector & Industry Focus */}
      <div>
        <h3 className="text-lg font-medium mb-4">Sector & Industry Focus</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Top Sectors by Deals</h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex justify-between">
                <span>Technology:</span>
                <span>34%</span>
              </div>
              <div className="flex justify-between">
                <span>Healthcare:</span>
                <span>23%</span>
              </div>
              <div className="flex justify-between">
                <span>Financial Services:</span>
                <span>18%</span>
              </div>
              <div className="flex justify-between">
                <span>Consumer:</span>
                <span>14%</span>
              </div>
              <div className="flex justify-between">
                <span>Other:</span>
                <span>11%</span>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Capital by Sector</h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex justify-between">
                <span>Technology:</span>
                <span>$298M</span>
              </div>
              <div className="flex justify-between">
                <span>Healthcare:</span>
                <span>$213M</span>
              </div>
              <div className="flex justify-between">
                <span>Financial Services:</span>
                <span>$142M</span>
              </div>
              <div className="flex justify-between">
                <span>Other:</span>
                <span>$194M</span>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Deal Type Distribution</h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex justify-between">
                <span>Equity:</span>
                <span>62%</span>
              </div>
              <div className="flex justify-between">
                <span>Debt:</span>
                <span>21%</span>
              </div>
              <div className="flex justify-between">
                <span>Convertible:</span>
                <span>14%</span>
              </div>
              <div className="flex justify-between">
                <span>Other:</span>
                <span>3%</span>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Growth Stage</h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex justify-between">
                <span>Seed:</span>
                <span>24%</span>
              </div>
              <div className="flex justify-between">
                <span>Series A:</span>
                <span>31%</span>
              </div>
              <div className="flex justify-between">
                <span>Series B:</span>
                <span>27%</span>
              </div>
              <div className="flex justify-between">
                <span>Later Stage:</span>
                <span>18%</span>
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
            <p className="text-2xl font-bold">9,843</p>
            <p className="text-xs text-green-500">+721 from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Introductions Made</h4>
            <p className="text-2xl font-bold">1,843</p>
            <p className="text-xs text-green-500">+167 from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Avg. Response Time</h4>
            <p className="text-2xl font-bold">2.8 hrs</p>
            <p className="text-xs text-green-500">-0.4 hrs from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Network Growth</h4>
            <p className="text-2xl font-bold">+22.4%</p>
            <p className="text-xs text-green-500">+3.2% from last month</p>
          </Card>
        </div>
      </div>

      {/* Match Quality & Conversion */}
      <div>
        <h3 className="text-lg font-medium mb-4">Match Quality & Conversion</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Match Acceptance Rate</h4>
            <p className="text-2xl font-bold">72.8%</p>
            <p className="text-xs text-green-500">+4.1% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Avg. Match Score</h4>
            <p className="text-2xl font-bold">82.1%</p>
            <p className="text-xs text-green-500">+2.3% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Match to Meeting</h4>
            <p className="text-2xl font-bold">53.7%</p>
            <p className="text-xs text-green-500">+2.8% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Meeting to Deal</h4>
            <p className="text-2xl font-bold">24.3%</p>
            <p className="text-xs text-green-500">+1.7% from last month</p>
          </Card>
        </div>
      </div>

      {/* Deal Flow & Meetings */}
      <div>
        <h3 className="text-lg font-medium mb-4">Deal Flow & Meetings</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Meetings Scheduled</h4>
            <p className="text-2xl font-bold">1,243</p>
            <p className="text-xs text-green-500">+87 from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Meeting Completion</h4>
            <p className="text-2xl font-bold">91.3%</p>
            <p className="text-xs text-green-500">+1.8% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Time from Match to Capital</h4>
            <p className="text-2xl font-bold">43 days</p>
            <p className="text-xs text-green-500">-3 days from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Follow-up Deal Rate</h4>
            <p className="text-2xl font-bold">34.2%</p>
            <p className="text-xs text-green-500">+1.8% from last month</p>
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
                <span>28%</span>
              </div>
              <div className="flex justify-between">
                <span>Professional:</span>
                <span>52%</span>
              </div>
              <div className="flex justify-between">
                <span>Enterprise:</span>
                <span>20%</span>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Upgrade Rate</h4>
            <p className="text-2xl font-bold">14.3%</p>
            <p className="text-xs text-green-500">+1.7% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Renewal Rate</h4>
            <p className="text-2xl font-bold">89.7%</p>
            <p className="text-xs text-green-500">+2.3% from last month</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm mb-2">Average Revenue</h4>
            <p className="text-2xl font-bold">$312</p>
            <p className="text-xs text-green-500">+$21 from last month</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
