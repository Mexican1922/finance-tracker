"use client";

import { useState } from "react";
import { ArrowDownRight, Wallet, PiggyBank } from "lucide-react";
import SpendingChart from "@/components/finance/SpendingChart";
import AllCategoriesModal from "@/components/finance/AllCategoriesModal";
import { useCurrency } from "@/hooks/useCurrency";
import { useTransactions, useSavingsGoals } from "@/hooks/useFirebaseData";

export default function ReviewPage() {
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const { formatAmount } = useCurrency();
  const { transactions } = useTransactions();
  const { goals } = useSavingsGoals();

  // Calculations
  const expenses = transactions.filter((t) => t.type === "expense");
  const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const largestExpense =
    expenses.length > 0
      ? expenses.reduce(
          (max, t) => (t.amount > max.amount ? t : max),
          expenses[0],
        )
      : null;

  // Category breakdown
  const categoryTotals = expenses.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3);

  const getCategoryColor = (index: number) => {
    const colors = ["bg-blue-500", "bg-orange-500", "bg-purple-500"];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Monthly Review
        </h1>
        <p className="text-foreground/60 mt-1 text-sm sm:text-base">
          Deep dive into your financial habits and analytics.
        </p>
      </header>

      {/* Month Selector */}
      <div className="flex gap-2 pb-2 overflow-x-auto hide-scrollbar">
        {["March", "February", "January", "December"].map((month, i) => (
          <button
            key={month}
            className={`whitespace-nowrap rounded-full px-4 sm:px-5 py-2 text-sm font-medium transition-colors cursor-pointer ${
              i === 0
                ? "bg-foreground text-background"
                : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10 hover:text-foreground"
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Summary Cards — 3 compact cards */}
      <div className="grid gap-3 sm:gap-6 grid-cols-3">
        <div className="glass-card p-3 sm:p-6">
          <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
            <ArrowDownRight className="h-3.5 w-3.5 text-red-500 sm:hidden" />
            <span className="text-[10px] sm:text-sm font-medium text-foreground/60">
              Total Spent
            </span>
          </div>
          <p className="text-base sm:text-2xl font-bold tracking-tight">
            {formatAmount(totalSpent)}
          </p>
        </div>
        <div className="glass-card p-3 sm:p-6">
          <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
            <PiggyBank className="h-3.5 w-3.5 text-green-600 sm:hidden" />
            <span className="text-[10px] sm:text-sm font-medium text-foreground/60">
              Total Saved
            </span>
          </div>
          <p className="text-base sm:text-2xl font-bold tracking-tight">
            {formatAmount(totalSaved)}
          </p>
        </div>
        <div className="glass-card p-3 sm:p-6">
          <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
            <Wallet className="h-3.5 w-3.5 text-amber-500 sm:hidden" />
            <span className="text-[10px] sm:text-sm font-medium text-foreground/60 truncate">
              Biggest
            </span>
          </div>
          <p className="text-base sm:text-2xl font-bold tracking-tight truncate capitalize">
            {largestExpense ? largestExpense.category : "N/A"}
          </p>
          {largestExpense && (
            <span className="text-[10px] sm:text-xs font-medium text-foreground/50 mt-0.5 block truncate">
              {formatAmount(largestExpense.amount)}
            </span>
          )}
        </div>
      </div>

      {/* Chart + Categories */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Chart */}
        <div className="glass-card p-4 sm:p-6 h-64 sm:h-80">
          <SpendingChart />
        </div>

        {/* Top Categories Breakdown */}
        <div className="glass-card p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold tracking-tight mb-4 sm:mb-6">
              Top Categories
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {sortedCategories.length === 0 ? (
                <div className="text-center text-sm text-foreground/50 py-4">
                  No expenses recorded yet.
                </div>
              ) : (
                sortedCategories.map(([category, amountValue], index) => {
                  const amount = amountValue as number;
                  const percentage =
                    totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="capitalize">{category}</span>
                        <span>{formatAmount(amount)}</span>
                      </div>
                      <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getCategoryColor(index)} rounded-full transition-all duration-700`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => setIsCategoriesModalOpen(true)}
            className="w-full text-sm font-medium text-accent mt-4 sm:mt-6 hover:underline cursor-pointer"
          >
            View All Categories
          </button>
        </div>
      </div>

      <AllCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />
    </div>
  );
}
