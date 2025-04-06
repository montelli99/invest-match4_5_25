import { Card } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose max-w-none">
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Introduction</h2>
          <p className="text-muted-foreground mb-4">
            At InvestMatch, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our platform.
          </p>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>
              Personal identification information (Name, email address, phone
              number, etc.)
            </li>
            <li>
              Professional information (Company details, investment history,
              etc.)
            </li>
            <li>Account credentials</li>
            <li>Usage data and platform analytics</li>
            <li>Communication data between users</li>
          </ul>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>To provide and maintain our platform services</li>
            <li>To notify you about changes to our services</li>
            <li>To allow you to participate in interactive features</li>
            <li>To provide customer support</li>
            <li>
              To gather analysis or valuable information to improve our services
            </li>
            <li>To monitor the usage of our services</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Data Security</h2>
          <p className="text-muted-foreground mb-4">
            We implement appropriate technical and organizational security
            measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction.
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and audits</li>
            <li>Access controls and authentication measures</li>
            <li>Secure data storage and backup procedures</li>
          </ul>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
          <p className="text-muted-foreground mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Request data portability</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions about this Privacy Policy, please contact
            us:
          </p>
          <ul className="list-none text-muted-foreground space-y-2">
            <li>Email: privacy@investmatch.com</li>
            <li>Address: [Company Address]</li>
            <li>Phone: +1 (555) 123-4567</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Updates to This Policy</h2>
          <p className="text-muted-foreground">
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date.
          </p>
          <p className="text-muted-foreground mt-4">
            Last updated: November 22, 2024
          </p>
        </Card>
      </div>
    </div>
  );
}
