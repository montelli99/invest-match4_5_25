/**
 * @fileoverview Documentation component explaining the user profile flow
 */

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Props {
  className?: string;
}

export function ProfileFlow({ className }: Props) {
  return (
    <Card className={className}>
      <ScrollArea className="h-[600px] w-full p-6">
        <div className="prose dark:prose-invert max-w-none">
          <h1>User Profile Flow Documentation</h1>

          <h2>New User Profile Behavior</h2>

          <h3>Overview</h3>
          <p>
            When a new user accesses InvestMatch, they are automatically guided
            through a profile creation process. This document outlines the
            expected behavior and technical flow.
          </p>

          <h3>User Experience</h3>
          <ol>
            <li>New user logs into the platform</li>
            <li>
              User is automatically redirected to the profile creation page
            </li>
            <li>
              User must complete profile creation before accessing the dashboard
            </li>
            <li>
              Once profile is created, user gains full access to the platform
            </li>
          </ol>

          <h3>Technical Flow</h3>
          <ol>
            <li>User authentication succeeds</li>
            <li>
              Dashboard component loads and attempts to fetch user profile
            </li>
            <li>
              If no profile exists:
              <ul>
                <li>API returns 404 status code</li>
                <li>Dashboard detects missing profile</li>
                <li>User is redirected to `/CreateProfile`</li>
                <li>404 logs are generated (expected behavior)</li>
              </ul>
            </li>
            <li>
              After profile creation:
              <ul>
                <li>Profile is stored in the system</li>
                <li>User is redirected back to Dashboard</li>
                <li>Normal platform access is granted</li>
              </ul>
            </li>
          </ol>

          <h3>Profile Creation Requirements</h3>
          <p>Based on user role, different profile information is required:</p>

          <h4>Fund Manager Profile</h4>
          <ul>
            <li>Fund name</li>
            <li>Fund type</li>
            <li>Fund size</li>
            <li>Investment focus</li>
            <li>Historical returns</li>
            <li>Risk profile</li>
          </ul>

          <h4>Limited Partner Profile</h4>
          <ul>
            <li>Investment interests</li>
            <li>Typical commitment size</li>
            <li>Risk tolerance</li>
            <li>Investment horizon</li>
          </ul>

          <h4>Capital Raiser Profile</h4>
          <ul>
            <li>Industry focus</li>
            <li>Deals raised</li>
            <li>Typical deal size</li>
            <li>Track record</li>
          </ul>

          <h3>Common Profile Fields</h3>
          <ul>
            <li>Full name</li>
            <li>Company name</li>
            <li>Contact details</li>
            <li>Role selection</li>
            <li>Optional: Profile image</li>
            <li>Optional: Social links</li>
            <li>Optional: Calendly link</li>
          </ul>

          <h3>Notes for Developers</h3>
          <ul>
            <li>
              404 errors in logs during profile checks are expected for new
              users
            </li>
            <li>Profile checks occur on Dashboard load</li>
            <li>Redirect to profile creation is automatic</li>
            <li>Profile data is validated based on user role</li>
            <li>Profile completion is required for platform access</li>
          </ul>

          <h3>Error Handling</h3>
          <ul>
            <li>Missing profiles return 404 status code</li>
            <li>Invalid profile data returns 400 status code</li>
            <li>Server errors return 500 status code</li>
          </ul>

          <h3>Storage</h3>
          <ul>
            <li>Profiles are stored in JSON format</li>
            <li>Searchable index is maintained for user discovery</li>
            <li>Profile images are stored separately with secure URLs</li>
          </ul>
        </div>
      </ScrollArea>
    </Card>
  );
}
