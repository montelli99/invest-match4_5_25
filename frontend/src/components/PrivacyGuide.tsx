import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function PrivacyGuide() {
  return (
    <div className="space-y-6 p-6">
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Privacy & Data Protection Guide
        </h2>
        <p className="text-muted-foreground mb-6">
          At InvestMatch, we take your privacy seriously. This guide explains
          how we handle your data and the controls available to you.
        </p>

        <div className="grid gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Data We Collect</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Profile Information</h4>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Full name and company details</li>
                  <li>Professional credentials and accreditation status</li>
                  <li>Investment preferences and history</li>
                  <li>Contact information</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Usage Data</h4>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Match interactions and preferences</li>
                  <li>Messages and communications</li>
                  <li>Platform activity and analytics</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              Your Privacy Controls
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Profile Visibility</h4>
                <p className="text-muted-foreground">
                  Control who can see your profile through subscription tier
                  settings:
                </p>
                <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                  <li>Basic: Limited profile visibility</li>
                  <li>
                    Professional: Enhanced visibility with control options
                  </li>
                  <li>
                    Enterprise: Full visibility control and custom settings
                  </li>
                </ul>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Data Export</h4>
                <p className="text-muted-foreground">
                  Export your data at any time in multiple formats (JSON, CSV,
                  PDF):
                </p>
                <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                  <li>Profile information</li>
                  <li>Match history and preferences</li>
                  <li>Messages and communications</li>
                  <li>Analytics and activity data</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              Data Protection Measures
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Security</h4>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>End-to-end encryption for messages</li>
                  <li>Secure data storage with industry-standard encryption</li>
                  <li>Regular security audits and updates</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Compliance</h4>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>GDPR compliance for EU users</li>
                  <li>International data protection standards</li>
                  <li>Regular compliance audits</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Managing Your Data</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Data Export Steps</h4>
                <ol className="list-decimal pl-6 text-muted-foreground">
                  <li>Go to your Profile settings</li>
                  <li>Click on "Export Data"</li>
                  <li>Select the data types you want to export</li>
                  <li>Choose your preferred format (JSON, CSV, PDF)</li>
                  <li>Set the date range if needed</li>
                  <li>Click Export and download your data</li>
                </ol>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Data Deletion</h4>
                <p className="text-muted-foreground">
                  To request data deletion:
                </p>
                <ol className="list-decimal pl-6 mt-2 text-muted-foreground">
                  <li>Contact our support team</li>
                  <li>Verify your identity</li>
                  <li>Specify what data you want deleted</li>
                  <li>Receive confirmation once completed</li>
                </ol>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
