import { useAuth } from "@/components/AuthWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { useEffect, useState } from "react";

interface AuditLog {
  timestamp: string;
  action: string;
  performed_by: string;
  target_user: string;
  details: Record<string, any>;
}

export const UserActivityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await brain.get_audit_logs({
        body: {
          token: {
            idToken: await user?.getIdToken(),
          },
        },
        queryArgs: { limit: 100 },
      });
      const data = await response.json();
      setLogs(data.logs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user]);

  const getFilteredLogs = () => {
    return logs.filter(
      (log) =>
        log.performed_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={loadLogs} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Performed By</TableHead>
            <TableHead>Target User</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLogs.map((log, index) => (
            <TableRow key={index}>
              <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell className="font-mono">{log.performed_by}</TableCell>
              <TableCell className="font-mono">{log.target_user}</TableCell>
              <TableCell>
                <pre className="text-xs overflow-auto max-w-xs">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
