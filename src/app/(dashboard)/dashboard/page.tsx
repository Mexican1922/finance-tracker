"use client";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import SpendingChart from "@/components/finance/SpendingChart";
import HealthScoreCard from "@/components/finance/HealthScoreCard";
import TransactionList from "@/components/finance/TransactionList";
import PredictiveBalanceCard from "@/components/finance/PredictiveBalanceCard";
import SavingsGoals from "@/components/finance/SavingsGoals";
import { useTransactions } from "@/hooks/useFirebaseData";
import { useCurrency } from "@/hooks/useCurrency";
import { useAuth } from "@/components/auth/AuthProvider";

export default function DashboardPage() {
  const { transactions } = useTransactions();
  const { formatAmount } = useCurrency();
  const { user } = useAuth();

  const totalIncome = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

  const totalBalance = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const firstName = user?.displayName?.split(" ")[0] || "there";

  // Determine greeting based on hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <header className="pt-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {greeting}, {firstName}
        </h1>
        <p className="text-foreground/60 mt-1 text-sm sm:text-base">
          Here&apos;s your financial overview.
        </p>
      </header>

      {/* ── Metric Cards ────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {/* Total Balance — full width on mobile */}
        <div className="col-span-2 glass-card p-5 sm:p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Wallet className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-medium text-foreground/60 block mb-0.5">
              Total Balance
            </span>
            <span
              className={`text-2xl sm:text-3xl font-bold tracking-tight block ${
                totalBalance >= 0 ? "text-foreground" : "text-red-500"
              }`}
            >
              {formatAmount(totalBalance)}
            </span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="glass-card p-4 sm:p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-foreground/60">
              Income
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-green-600">
            +{formatAmount(totalIncome)}
          </span>
        </div>

        {/* Monthly Expenses */}
        <div className="glass-card p-4 sm:p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <ArrowDownRight className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-foreground/60">
              Expenses
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-red-500">
            -{formatAmount(totalExpenses)}
          </span>
        </div>
      </div>

      {/* ── Savings Rate Indicator (compact) ────────────────────────── */}
      <div className="glass-card px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {savingsRate >= 0 ? (
            <TrendingUp className="h-5 w-5 text-green-600 shrink-0" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Savings Rate
            </p>
            <p className="text-xs text-foreground/50">
              {savingsRate >= 20
                ? "Great job — you're saving well!"
                : savingsRate >= 0
                  ? "Try to save at least 20% of income."
                  : "You're spending more than you earn."}
            </p>
          </div>
        </div>
        <span
          className={`text-xl font-bold shrink-0 ${
            savingsRate >= 20
              ? "text-green-600"
              : savingsRate >= 0
                ? "text-amber-500"
                : "text-red-500"
          }`}
        >
          {savingsRate.toFixed(0)}%
        </span>
      </div>

      {/* ── Charts & Insights Row ───────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Spending Chart — takes 2 cols on desktop */}
        <div className="lg:col-span-2">
          <div className="glass-card p-5 sm:p-6 h-72">
            <SpendingChart />
          </div>
        </div>

        {/* Right Column - Health + Prediction stacked */}
        <div className="lg:col-span-1 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
          <div className="min-h-[240px]">
            <HealthScoreCard />
          </div>
          <div className="min-h-[240px]">
            <PredictiveBalanceCard />
          </div>
        </div>
      </div>

      {/* ── Transactions ────────────────────────────────────────────── */}
      <TransactionList />

      {/* ── Savings Goals ───────────────────────────────────────────── */}
      <div className="pt-4 border-t border-foreground/5">
        <SavingsGoals />
      </div>
    </div>
  );
}
