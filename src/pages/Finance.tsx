import { useState, useMemo } from "react";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions, useCreateTransaction, useCashBalance } from "@/hooks/useTransactions";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Finance() {
  const { data: transactions, isLoading } = useTransactions();
  const createTransaction = useCreateTransaction();
  const balance = useCashBalance();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    category: "Operational" as "Operational" | "Sales" | "Purchase",
    type: "In" as "In" | "Out",
    amount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTransaction.mutateAsync({
      ...form,
      amount: parseFloat(form.amount),
    });
    setForm({
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      category: "Operational",
      type: "In",
      amount: "",
    });
    setOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate running balance for each transaction
  const transactionsWithBalance = useMemo(() => {
    if (!transactions) return [];
    
    // Sort by date ascending to calculate running balance
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let runningBalance = 0;
    const withBalance = sorted.map((t) => {
      if (t.type === "In") {
        runningBalance += Number(t.amount);
      } else {
        runningBalance -= Number(t.amount);
      }
      return { ...t, runningBalance };
    });
    
    // Return in descending order (most recent first)
    return withBalance.reverse();
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Finance Management</h1>
        <p className="page-description">
          Track cash flow and manage transactions
        </p>
      </div>

      {/* Balance Card */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Cash Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cn(
            "text-3xl font-bold",
            balance >= 0 ? "text-success" : "text-destructive"
          )}>
            {formatCurrency(balance)}
          </p>
        </CardContent>
      </Card>

      {/* Transactions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Transactions</h3>
            <p className="text-sm text-muted-foreground">
              Record all cash in and cash out entries
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="e.g., Sale of 10 Pashminas"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(value: "Operational" | "Sales" | "Purchase") =>
                        setForm({ ...form, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operational">Operational</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Purchase">Purchase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={form.type}
                      onValueChange={(value: "In" | "Out") =>
                        setForm({ ...form, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In">Cash In</SelectItem>
                        <SelectItem value="Out">Cash Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (IDR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="1000"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    placeholder="0"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createTransaction.isPending}
                >
                  {createTransaction.isPending ? "Adding..." : "Add Transaction"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : transactionsWithBalance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No transactions yet. Add your first transaction above.
                  </TableCell>
                </TableRow>
              ) : (
                transactionsWithBalance.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {transaction.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          transaction.type === "In"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {transaction.type === "In" ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {transaction.type}
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        transaction.type === "In"
                          ? "text-success"
                          : "text-destructive"
                      )}
                    >
                      {transaction.type === "In" ? "+" : "-"}
                      {formatCurrency(Number(transaction.amount))}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(transaction.runningBalance)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}