"use client";

import { useMemo } from "react";
import {
  calculateHealthScore,
  getScoreColor,
  getScoreMessage,
} from "@/lib/finance/healthScore";
import { useTransactions, useSavingsGoals } from "@/hooks/useFirebaseData";

export default function HealthScoreCard() {
  const { transactions, loading: txLoading } = useTransactions();
  const { goals, loading: goalsLoading } = useSavingsGoals();

  const factors = useMemo(() => {
    if (txLoading || goalsLoading) {
      return {
        monthlyIncome: 1,
        monthlyExpenses: 0,
        totalSavings: 0,
        daysIntoMonth: 1,
      };
    }

    const monthlyIncome = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

    const monthlyExpenses = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

    const totalSavings = goals.reduce(
      (sum, g) => sum + (parseFloat(g.currentAmount) || 0),
      0,
    );

    const now = new Date();
    const daysIntoMonth = now.getDate();

    return { monthlyIncome, monthlyExpenses, totalSavings, daysIntoMonth };
  }, [transactions, goals, txLoading, goalsLoading]);

  const score = useMemo(() => calculateHealthScore(factors), [factors]);
  const colorClass = useMemo(() => getScoreColor(score), [score]);
  const message = useMemo(() => getScoreMessage(score), [score]);

  return (
    <div className="glass-card p-5 sm:p-6 h-full flex flex-col items-center justify-center text-center relative overflow-hidden group">
      {/* Decorative background glow based on score */}
      <div
        className={`absolute inset-0 bg-current opacity-5 blur-3xl transition-opacity group-hover:opacity-10 ${colorClass}`}
      />

      <div className="relative z-10 flex flex-col items-center w-full">
        <span
          className={`text-5xl sm:text-7xl font-bold tracking-tighter mb-1 transition-colors ${colorClass}`}
        >
          {score}
        </span>
        <span className="text-lg sm:text-xl font-semibold tracking-tight">
          Financial Health
        </span>

        <p className="text-xs sm:text-sm text-foreground/60 mt-2 sm:mt-3 max-w-[220px] leading-relaxed">
          {message}
        </p>

        {/* Progress bar visualizer */}
        <div className="w-full mt-4 sm:mt-6 h-2 bg-foreground/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out bg-current ${colorClass}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}
