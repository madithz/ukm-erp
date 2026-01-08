import { Wallet, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { useTransactions, useCashBalance } from "@/hooks/useTransactions";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { useFinishedGoods } from "@/hooks/useFinishedGoods";
import { useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export default function Dashboard() {
  const balance = useCashBalance();
  const { data: rawMaterials } = useRawMaterials();
  const { data: finishedGoods } = useFinishedGoods();
  const { data: transactions } = useTransactions();

  const totalRawMaterial = useMemo(() => {
    if (!rawMaterials) return 0;
    return rawMaterials.reduce((acc, m) => acc + Number(m.quantity), 0);
  }, [rawMaterials]);

  const totalFinishedGoods = useMemo(() => {
    if (!finishedGoods) return 0;
    return finishedGoods.reduce((acc, g) => acc + g.quantity, 0);
  }, [finishedGoods]);

  const chartData = useMemo(() => {
    if (!transactions) return [];

    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, "MMM"),
        start: startOfMonth(date),
        end: endOfMonth(date),
        income: 0,
        expenses: 0,
      };
    });

    transactions.forEach((t) => {
      const txDate = new Date(t.date);
      const monthData = months.find(
        (m) => txDate >= m.start && txDate <= m.end
      );
      if (monthData) {
        if (t.type === "In") {
          monthData.income += Number(t.amount);
        } else {
          monthData.expenses += Number(t.amount);
        }
      }
    });

    return months.map(({ month, income, expenses }) => ({
      month,
      income,
      expenses,
    }));
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-header">Dashboard</h1>
        <p className="page-description">
          Overview of your textile manufacturing business
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cash Balance"
          value={formatCurrency(balance)}
          icon={Wallet}
        />
        <StatCard
          title="Raw Materials"
          value={totalRawMaterial.toLocaleString()}
          subtitle="Total stock in yards/meters"
          icon={Package}
        />
        <StatCard
          title="Finished Goods"
          value={totalFinishedGoods.toLocaleString()}
          subtitle="Pashmina & Kerudung"
          icon={ShoppingBag}
        />
        <StatCard
          title="Products This Month"
          value={finishedGoods?.length ?? 0}
          subtitle="Unique product types"
          icon={TrendingUp}
        />
      </div>

      {/* Chart */}
      <IncomeExpenseChart data={chartData} />
    </div>
  );
}