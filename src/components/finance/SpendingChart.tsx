"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { useTransactions } from "@/hooks/useFirebaseData";
import { useCurrency } from "@/hooks/useCurrency";
import { useState, useEffect } from "react";

export default function SpendingChart() {
  const { transactions } = useTransactions();
  const { currency } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const expenses = transactions.filter((t) => t.type === "expense");

    // Group by Date "MMM D"
    const grouped = expenses.reduce((acc: any, curr) => {
      const d = curr.date?.toDate ? curr.date.toDate() : new Date(curr.date);
      const day = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      if (!acc[day]) acc[day] = 0;
      acc[day] += parseFloat(curr.amount) || 0;
      return acc;
    }, {});

    // Transactions fetch sorts desc, so we reverse it to ascending for the chart
    return Object.entries(grouped)
      .map(([name, spend]) => ({ name, spend }))
      .reverse();
  }, [transactions]);

  if (!mounted) {
    return (
      <div className="h-[248px] w-full bg-foreground/5 animate-pulse rounded-2xl" />
    );
  }

  return (
    <div className="h-full w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Spending Analytics</h3>
        <select className="bg-transparent text-sm text-foreground/60 outline-none">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="h-[200px] w-full min-w-0">
        <ResponsiveContainer width="99%" height="100%">
          <AreaChart
            data={
              chartData.length > 0 ? chartData : [{ name: "No Data", spend: 0 }]
            }
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--card-border)"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.5 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.5 }}
              tickFormatter={(value) => `${currency.symbol}${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card-bg)",
                borderRadius: "12px",
                border: "1px solid var(--card-border)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
              itemStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              labelStyle={{
                color: "var(--foreground)",
                opacity: 0.6,
                marginBottom: "4px",
              }}
            />
            <Area
              type="monotone"
              dataKey="spend"
              stroke="var(--accent)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSpend)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "var(--accent)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
