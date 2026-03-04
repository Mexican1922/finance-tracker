"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import {
  predictEndOfMonthBalance,
  getPredictionMessage,
} from "@/lib/finance/predictiveBalance";
import { useTransactions, useSubscriptions } from "@/hooks/useFirebaseData";
import { useCurrency } from "@/hooks/useCurrency";

export default function PredictiveBalanceCard() {
  const { transactions, loading: txLoading } = useTransactions();
  const { subscriptions, loading: subLoading } = useSubscriptions();

  const data = useMemo(() => {
    if (txLoading || subLoading) {
      return {
        currentBalance: 0,
        averageMonthlyIncome: 1,
        averageMonthlyExpense: 0,
        knownUpcomingSubscriptions: 0,
        daysLeftInMonth: 1,
      };
    }

    const totalIncome = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

    const totalExpenses = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

    const currentBalance = totalIncome - totalExpenses;

    // Simplistic approach for MVP: treating total as average.
    // A robust approach would group and average per month over time.
    const averageMonthlyIncome = totalIncome;
    const averageMonthlyExpense = totalExpenses;

    const knownUpcomingSubscriptions = subscriptions.reduce(
      (sum, sub) => sum + (parseFloat(sub.amount) || 0),
      0,
    );

    const now = new Date();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const daysLeftInMonth = daysInMonth - now.getDate();

    return {
      currentBalance,
      averageMonthlyIncome,
      averageMonthlyExpense,
      knownUpcomingSubscriptions,
      daysLeftInMonth,
    };
  }, [transactions, subscriptions, txLoading, subLoading]);

  const predictedBalance = useMemo(
    () => predictEndOfMonthBalance(data),
    [data],
  );
  const message = useMemo(
    () => getPredictionMessage(data.currentBalance, predictedBalance),
    [data, predictedBalance],
  );
  const { currency, formatAmount } = useCurrency();
  const isGrowing = predictedBalance >= data.currentBalance;

  return (
    <div className="glass-card p-5 sm:p-6 h-full flex flex-col justify-between relative overflow-hidden">
      <div className="absolute -right-4 -top-4 text-accent/5 pointer-events-none">
        <Sparkles className="h-24 sm:h-32 w-24 sm:w-32" />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            AI Forecast
          </span>
        </div>
        <h3 className="text-foreground/70 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
          Estimated End of Month Balance
        </h3>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-4xl font-bold tracking-tight">
            {formatAmount(predictedBalance)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-sm font-medium">
          {isGrowing ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-orange-500" />
          )}
          <span className={isGrowing ? "text-green-600" : "text-orange-600"}>
            {message.replace(/by /, `by ${currency.symbol}`)}
          </span>
        </div>
      </div>

      <p className="text-xs text-foreground/40 mt-4 sm:mt-6 leading-relaxed">
        Based on your average spending velocity and upcoming recurring payments.
      </p>
    </div>
  );
}
