import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import brain from "brain";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DownloadIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "./DatePicker";

interface ExportFormat {
  start_date: string;
  end_date: string;
  format: string;
  metrics: string[];
}

interface Props {
  itemsPerPage?: number;
  userId: string;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
  subscription_period_start?: string;
  subscription_period_end?: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string;
  items: Array<{
    description: string;
    period?: string;
    amount: number;
  }>;
  created_at: string;
}

export function BillingHistory({ userId, itemsPerPage = 10 }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const [currentInvoicePage, setCurrentInvoicePage] = useState(1);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState<Date | undefined>();
  const [exportEndDate, setExportEndDate] = useState<Date | undefined>();
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const { toast } = useToast();

  const PaginationControls = ({ 
    currentPage, 
    totalItems, 
    onPageChange 
  }: { 
    currentPage: number; 
    totalItems: number; 
    onPageChange: (page: number) => void 
  }) => {
    const pageCount = getPageCount(totalItems);
    
    return pageCount > 1 ? (
      <div className="flex justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          Next
        </Button>
      </div>
    ) : null;
  };

  const getPaginatedData = <T extends any>(items: T[], currentPage: number): T[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const getPageCount = (totalItems: number): number => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  const paginatedTransactions = getPaginatedData(transactions, currentTransactionPage);
  const paginatedInvoices = getPaginatedData(invoices, currentInvoicePage);

  useEffect(() => {
    if (userId) {
      loadBillingHistory();
    }
  }, [userId]);

  const loadBillingHistory = async () => {
    try {
      const [transactionsResponse, invoicesResponse] = await Promise.all([
        brain.get_transactions({ userId }),
        brain.get_invoices({ userId }),
      ]);

      const [transactionsData, invoicesData] = await Promise.all([
        transactionsResponse.json(),
        invoicesResponse.json(),
      ]);

      setTransactions(transactionsData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Error loading billing history:", error);
      toast({
        title: "Error",
        description: "Failed to load billing history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      paid: "default",
      pending: "secondary",
      failed: "destructive",
      overdue: "destructive",
    };

    return (
      <Badge variant={variants[status.toLowerCase()] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const handleExportHistory = async () => {
    if (!exportStartDate || !exportEndDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await brain.export_analytics({
        start_date: exportStartDate.toISOString(),
        end_date: exportEndDate.toISOString(),
        format: exportFormat,
        metrics: ["transactions", "invoices"],
      });

      // Handle the response based on format
      if (exportFormat === "csv") {
        const blob = new Blob([await response.text()], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "transaction_history.csv";
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (exportFormat === "json") {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "transaction_history.json";
        a.click();
        window.URL.revokeObjectURL(url);
      }

      setExportDialogOpen(false);
      toast({
        title: "Success",
        description: "Transaction history exported successfully",
      });
    } catch (error) {
      console.error("Error exporting history:", error);
      toast({
        title: "Error",
        description: "Failed to export transaction history",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReceipt = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/payment/export-receipt/${transactionId}?format=pdf`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${transactionId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Receipt downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to download receipt',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Loading billing history...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>View your recent transactions and invoices</span>
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Export History</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Transaction History</DialogTitle>
                <DialogDescription>
                  Select a date range and format to export your transaction history
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label>Start Date</label>
                    <DatePicker
                      date={exportStartDate}
                      onSelect={setExportStartDate}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label>End Date</label>
                    <DatePicker
                      date={exportEndDate}
                      onSelect={setExportEndDate}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label>Export Format</label>
                  <Select
                    value={exportFormat}
                    onValueChange={setExportFormat}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleExportHistory}>Export</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actions</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDownloadReceipt(transaction.id)}
                                >
                                  <DownloadIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Download Receipt</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          {format(new Date(transaction.created_at), "PP")}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          {formatCurrency(
                            transaction.amount,
                            transaction.currency,
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <PaginationControls
              currentPage={currentTransactionPage}
              totalItems={transactions.length}
              onPageChange={setCurrentTransactionPage}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Invoices</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length > 0 ? (
                    paginatedInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          {format(new Date(invoice.created_at), "PP")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.due_date), "PP")}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        No invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <PaginationControls
              currentPage={currentInvoicePage}
              totalItems={invoices.length}
              onPageChange={setCurrentInvoicePage}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

