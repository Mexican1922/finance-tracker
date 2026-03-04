"use client";

import { useMemo } from "react";
import { useTransactions } from "./useFirebaseData";
import { useSavingsGoals } from "./useFirebaseData";
import { useSubscriptions } from "./useFirebaseData";

export type NotificationType = "warning" | "success" | "info";

export type NotificationIcon =
  | "trophy"
  | "target"
  | "calendar"
  | "trending-up"
  | "lightbulb";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: NotificationIcon;
}

export function useNotifications() {
  const { transactions } = useTransactions();
  const { goals } = useSavingsGoals();
  const { subscriptions } = useSubscriptions();

  const notifications = useMemo<AppNotification[]>(() => {
    const alerts: AppNotification[] = [];

    // ── 1. Goal Milestones ──
    goals.forEach((goal) => {
      const progress =
        goal.targetAmount > 0
          ? (goal.currentAmount / goal.targetAmount) * 100
          : 0;

      if (progress >= 100) {
        alerts.push({
          id: `goal-done-${goal.id}`,
          type: "success",
          icon: "trophy",
          title: "Goal Reached!",
          message: `You've fully funded your "${goal.name}" goal. Congratulations!`,
        });
      } else if (progress >= 80) {
        alerts.push({
          id: `goal-near-${goal.id}`,
          type: "info",
          icon: "target",
          title: "Almost There!",
          message: `Your "${goal.name}" goal is ${progress.toFixed(0)}% funded. Keep going!`,
        });
      }
    });

    // ── 2. Subscription Reminders ──
    const today = new Date();
    subscriptions.forEach((sub) => {
      if (sub.nextBillingDate) {
        const billing = new Date(sub.nextBillingDate);
        const daysUntil = Math.ceil(
          (billing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysUntil >= 0 && daysUntil <= 7) {
          alerts.push({
            id: `sub-due-${sub.id}`,
            type: "warning",
            icon: "calendar",
            title: "Subscription Due Soon",
            message: `Your ${sub.name} ($${sub.amount}) bills ${daysUntil === 0 ? "today" : `in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`}.`,
          });
        }
      }
    });

    // ── 3. Overspending Alert ──
    if (transactions.length > 0) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const getMonthExpenses = (month: number, year: number) =>
        transactions
          .filter((t: any) => {
            if (t.type !== "expense") return false;
            const d = t.date?.toDate ? t.date.toDate() : new Date(t.date);
            return d.getMonth() === month && d.getFullYear() === year;
          })
          .reduce((sum: number, t: any) => sum + t.amount, 0);

      const thisMonthTotal = getMonthExpenses(currentMonth, currentYear);
      const lastMonthTotal = getMonthExpenses(lastMonth, lastMonthYear);

      if (lastMonthTotal > 0 && thisMonthTotal > lastMonthTotal * 1.2) {
        alerts.push({
          id: "overspend-month",
          type: "warning",
          icon: "trending-up",
          title: "Spending Elevated",
          message: `You're spending 20%+ more than last month. Consider reviewing your expenses.`,
        });
      }
    }

    // ── 4. Low Savings Momentum ──
    const totalGoalProgress = goals.reduce((sum, g) => {
      return sum + (g.targetAmount > 0 ? g.currentAmount / g.targetAmount : 0);
    }, 0);
    const avgProgress = goals.length > 0 ? totalGoalProgress / goals.length : 1;

    if (goals.length > 0 && avgProgress < 0.1) {
      alerts.push({
        id: "low-savings",
        type: "info",
        icon: "lightbulb",
        title: "Kick-start Your Goals",
        message:
          "Your savings goals are less than 10% funded. Try adding some income transactions!",
      });
    }

    return alerts;
  }, [transactions, goals, subscriptions]);

  return { notifications, count: notifications.length };
}
