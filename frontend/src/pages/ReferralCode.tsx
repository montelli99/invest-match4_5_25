import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/utils/useToast";
import brain from "brain";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ReferralStats {
  total_referrals: number;
  converted_referrals: number;
  pending_referrals: number;
}

interface ReferralLink {
  id: string;
  code: string;
  visits?: number;
  last_visited?: string;
  created_at: string;
}

export default function ReferralCode() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user ID - In a real app, this would come from auth context
  const userId = "user123";

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setIsLoading(true);

      // Load referral code
      const codeResponse = await brain.create_referral_code({
        user_id: userId,
      });
      const codeData = await codeResponse.json();
      setReferralCode(codeData.code);

      // Load referral links
      const linksResponse = await brain.get_referral_links({ userId });
      const linksData = await linksResponse.json();
      setReferralLinks(linksData.links);

      // Load referral stats
      const statsResponse = await brain.get_referral_stats({ userId });
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading referral data:", error);
      toast({
        title: "Error",
        description: "Failed to load referral data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast({
        title: "Success",
        description: "Referral code copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy referral code. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading referral data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Your Referral Code</h1>

      {/* Referral Code Card */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Code</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <code className="bg-muted px-4 py-2 rounded-md text-lg">
            {referralCode}
          </code>
          <Button onClick={copyReferralCode}>Copy Code</Button>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.total_referrals || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Converted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {stats?.converted_referrals || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {stats?.pending_referrals || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Links Table */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Links</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Last Visit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referralLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>{link.code}</TableCell>
                  <TableCell>
                    {new Date(link.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{link.visits}</TableCell>
                  <TableCell>
                    {link.last_visited
                      ? new Date(link.last_visited).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                </TableRow>
              ))}
              {referralLinks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No referral links found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
