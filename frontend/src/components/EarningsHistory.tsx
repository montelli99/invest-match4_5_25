import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import brain from "brain";
import { useEffect, useState } from "react";

interface Props {
  userId: string;
}

interface EarningsRecord {
  id: string;
  amount: number;
  date: string;
  status: string;
  referral_id: string;
  commission_rate: number;
}

export function EarningsHistory({ userId }: Props) {
  const [earnings, setEarnings] = useState<EarningsRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEarnings() {
      try {
        const response = await brain.get_commission_payments({
          affiliateId: userId,
        });
        const data = await response.json();
        setEarnings(data.payments);
      } catch (error) {
        console.error("Error loading earnings history:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEarnings();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Loading earnings history...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Referral ID</TableHead>
              <TableHead>Commission Rate</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {earnings.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {new Date(record.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{record.referral_id}</TableCell>
                <TableCell>
                  {(record.commission_rate * 100).toFixed(1)}%
                </TableCell>
                <TableCell>${record.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {record.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
