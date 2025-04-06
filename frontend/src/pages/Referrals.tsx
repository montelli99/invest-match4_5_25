import { ReferralDashboard } from "../components/ReferralDashboard";

export default function Referrals() {
  // TODO: Get actual user ID from auth context
  const userId = "demo-user";

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Referral Program</h1>
        <ReferralDashboard userId={userId} />
      </div>
    </div>
  );
}
