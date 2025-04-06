import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import brain from "brain";
import { Filter, MoreVertical, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface ReferralRecord {
  id: string;
  referral_code: string;
  status: string;
  created_at: string;
  converted_at?: string;
  commission_amount?: number;
  commission_paid: boolean;
  referred_user_id?: string;
}

interface Props {
  userId: string;
}

export function ReferralHistory({ userId }: Props) {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadReferrals();
  }, [userId]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      // Get referral tracking data
      const response = await brain.get_referral_stats({ userId });
      const data = await response.json();

      // Transform data for display
      // In a real app, we'd have an endpoint that returns the full referral history
      const mockReferrals: ReferralRecord[] = [
        {
          id: "ref-1",
          referral_code: "ABC123",
          status: "converted",
          created_at: "2024-01-01T12:00:00Z",
          converted_at: "2024-01-02T15:30:00Z",
          commission_amount: 100,
          commission_paid: true,
          referred_user_id: "user-456",
        },
        {
          id: "ref-2",
          referral_code: "DEF456",
          status: "pending",
          created_at: "2024-01-03T09:15:00Z",
          commission_paid: false,
        },
      ];

      setReferrals(mockReferrals);
    } catch (error) {
      console.error("Error loading referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "converted":
        return "success";
      case "pending":
        return "warning";
      case "expired":
        return "secondary";
      default:
        return "default";
    }
  };

  const filteredReferrals = referrals
    .filter((ref) => {
      const matchesSearch =
        searchTerm === "" ||
        ref.referral_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.referred_user_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || ref.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof ReferralRecord];
      const bValue = b[sortBy as keyof ReferralRecord];

      if (!aValue || !bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder === "desc" ? -comparison : comparison;
    });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Loading referral history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search referrals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("converted")}>
                Converted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("expired")}>
                Expired
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("created_at")}
              >
                Date
              </TableHead>
              <TableHead>Referral Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Referred User</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("commission_amount")}
              >
                Commission
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReferrals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No referrals found
                </TableCell>
              </TableRow>
            ) : (
              filteredReferrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>
                    {new Date(referral.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{referral.referral_code}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(referral.status)}>
                      {referral.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {referral.referred_user_id || "Not converted"}
                  </TableCell>
                  <TableCell>
                    {referral.commission_amount
                      ? `$${referral.commission_amount.toFixed(2)}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        {referral.status === "converted" && (
                          <DropdownMenuItem>View Payment</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
