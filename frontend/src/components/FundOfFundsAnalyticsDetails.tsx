import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const FundOfFundsAnalyticsDetails = () => {
  return (
    <div className="space-y-8 mt-4">
      {/* Investment Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Investment Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Total AUM</h4>
            <p className="text-2xl font-bold">$8.2B</p>
            <p className="text-xs text-green-500">+12.4% YoY</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Funds in Portfolio</h4>
            <p className="text-2xl font-bold">127</p>
            <p className="text-xs text-green-500">+14 since last quarter</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Average Commitment</h4>
            <p className="text-2xl font-bold">$24.7M</p>
            <p className="text-xs text-green-500">+$1.8M YoY</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Net IRR</h4>
            <p className="text-2xl font-bold">15.2%</p>
            <p className="text-xs text-green-500">+1.8% above benchmark</p>
          </Card>
        </div>
      </div>

      {/* Profile & Engagement Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile & Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Profile Completion</h4>
            <p className="text-2xl font-bold">94%</p>
            <div className="mt-2">
              <Progress value={94} className="h-2" />
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Active Users</h4>
            <p className="text-2xl font-bold">78%</p>
            <p className="text-xs text-green-500">+4% from previous month</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Verification Rate</h4>
            <p className="text-2xl font-bold">97%</p>
            <div className="mt-2">
              <Progress value={97} className="h-2" />
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Platform Sessions</h4>
            <p className="text-2xl font-bold">7.3</p>
            <p className="text-xs text-muted-foreground">per user/week</p>
          </Card>
        </div>
      </div>

      {/* Investment Focus */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Investment Focus</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Strategy Diversification</h4>
            <div className="space-y-3 mt-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Venture Capital</span>
                  <span>35%</span>
                </div>
                <Progress value={35} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Growth Equity</span>
                  <span>25%</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Buyout</span>
                  <span>20%</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Real Estate</span>
                  <span>12%</span>
                </div>
                <Progress value={12} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Infrastructure</span>
                  <span>8%</span>
                </div>
                <Progress value={8} className="h-2" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Geographic Distribution</h4>
            <div className="space-y-3 mt-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>North America</span>
                  <span>48%</span>
                </div>
                <Progress value={48} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Europe</span>
                  <span>32%</span>
                </div>
                <Progress value={32} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Asia</span>
                  <span>15%</span>
                </div>
                <Progress value={15} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Rest of World</span>
                  <span>5%</span>
                </div>
                <Progress value={5} className="h-2" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Due Diligence & Fund Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Due Diligence & Fund Selection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Due Diligence Time</h4>
            <p className="text-2xl font-bold">4.2</p>
            <p className="text-xs text-green-500">-0.8 months vs industry avg</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Fund Selection Ratio</h4>
            <p className="text-2xl font-bold">8.3%</p>
            <p className="text-xs text-muted-foreground">of opportunities reviewed</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Manager Retention</h4>
            <p className="text-2xl font-bold">87%</p>
            <p className="text-xs text-green-500">+3% from previous year</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Emerging Managers</h4>
            <p className="text-2xl font-bold">23%</p>
            <p className="text-xs text-green-500">+5% allocation increase</p>
          </Card>
        </div>
      </div>

      {/* Match Quality & Platform Engagement */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Match Quality & Platform Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Match Acceptance</h4>
            <p className="text-2xl font-bold">41.2%</p>
            <p className="text-xs text-green-500">+6.7% from previous quarter</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Match Score</h4>
            <p className="text-2xl font-bold">83.7%</p>
            <div className="mt-2">
              <Progress value={83.7} className="h-2" />
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Meetings per Match</h4>
            <p className="text-2xl font-bold">2.4</p>
            <p className="text-xs text-green-500">+0.3 from previous quarter</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Deal Conversion</h4>
            <p className="text-2xl font-bold">15.8%</p>
            <p className="text-xs text-green-500">of matched opportunities</p>
          </Card>
        </div>
      </div>

      {/* Portfolio Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">TVPI</h4>
            <p className="text-2xl font-bold">1.62x</p>
            <p className="text-xs text-green-500">Top quartile performance</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">DPI</h4>
            <p className="text-2xl font-bold">0.78x</p>
            <p className="text-xs text-green-500">+0.12x from last report</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">RVPI</h4>
            <p className="text-2xl font-bold">0.84x</p>
            <p className="text-xs text-amber-500">-0.04x from last report</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Alpha Generation</h4>
            <p className="text-2xl font-bold">3.8%</p>
            <p className="text-xs text-green-500">vs benchmark</p>
          </Card>
        </div>
      </div>

      {/* Subscription & Revenue */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Subscription & Revenue</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Premium Tier</h4>
            <p className="text-2xl font-bold">72%</p>
            <p className="text-xs text-muted-foreground">of FoF users</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Upgrade Rate</h4>
            <p className="text-2xl font-bold">38%</p>
            <p className="text-xs text-green-500">after free trial</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Annual Plans</h4>
            <p className="text-2xl font-bold">81%</p>
            <p className="text-xs text-green-500">+7% from last year</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">ARPU</h4>
            <p className="text-2xl font-bold">$8,720</p>
            <p className="text-xs text-green-500">highest among user types</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
