import { Card } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <div className="prose max-w-none">
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using InvestMatch, you accept and agree to be bound
            by the terms and provision of this agreement. If you do not agree to
            abide by the above, please do not use this service.
          </p>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            2. Description of Service
          </h2>
          <p className="text-muted-foreground mb-4">
            InvestMatch is a platform that connects fund managers, capital
            raisers, and limited partners. We provide the following services:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Profile creation and management</li>
            <li>Matching algorithm for investment opportunities</li>
            <li>Secure messaging system</li>
            <li>Document sharing capabilities</li>
            <li>Analytics and reporting tools</li>
          </ul>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">3. User Obligations</h2>
          <p className="text-muted-foreground mb-4">Users agree to:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of their account</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Not misuse the platform or its services</li>
            <li>Respect the privacy and rights of other users</li>
          </ul>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            4. Subscription and Payments
          </h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Subscription fees are billed according to the selected plan</li>
            <li>All fees are non-refundable unless otherwise stated</li>
            <li>We reserve the right to modify pricing with notice</li>
            <li>
              Cancellation policies apply as specified in subscription terms
            </li>
          </ul>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            5. Intellectual Property
          </h2>
          <p className="text-muted-foreground">
            All content, features, and functionality of the InvestMatch platform
            are owned by InvestMatch and are protected by international
            copyright, trademark, patent, trade secret, and other intellectual
            property laws.
          </p>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            6. Limitation of Liability
          </h2>
          <p className="text-muted-foreground">
            InvestMatch shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages, including without
            limitation, loss of profits, data, use, goodwill, or other
            intangible losses.
          </p>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">7. Termination</h2>
          <p className="text-muted-foreground">
            We reserve the right to terminate or suspend access to our service
            immediately, without prior notice or liability, for any reason
            whatsoever, including without limitation if you breach the Terms.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">8. Contact Information</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions about these Terms, please contact us:
          </p>
          <ul className="list-none text-muted-foreground space-y-2">
            <li>Email: legal@investmatch.com</li>
            <li>Address: [Company Address]</li>
            <li>Phone: +1 (555) 123-4567</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
