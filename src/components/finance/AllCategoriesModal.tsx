"use client";

import { X, PieChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/hooks/useCurrency";
import { useTransactions } from "@/hooks/useFirebaseData";

interface AllCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_COLORS = [
  "bg-blue-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-pink-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-emerald-500",
];

const CATEGORY_LABELS: Record<string, string> = {
  food: "Food & Dining",
  transport: "Transportation",
  shopping: "Shopping",
  bills: "Bills & Utilities",
  entertainment: "Entertainment",
  salary: "Salary",
  freelance: "Freelance",
  investment: "Investment",
  transfer: "Transfer",
  other: "Other",
};

export default function AllCategoriesModal({
  isOpen,
  onClose,
}: AllCategoriesModalProps) {
  const { formatAmount } = useCurrency();
  const { transactions } = useTransactions();

  // Build category data from real transactions
  const expenses = transactions.filter((t) => t.type === "expense");
  const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

  const categoryTotals = expenses.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([category, amount], index) => ({
      name: CATEGORY_LABELS[category] || category,
      amount: amount as number,
      percent:
        totalSpent > 0
          ? Math.round(((amount as number) / totalSpent) * 100)
          : 0,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-x-0 bottom-0 z-[60] mx-auto w-full max-w-md overflow-hidden rounded-t-3xl bg-background/95 shadow-2xl backdrop-blur-xl border-t border-foreground/10 sm:inset-x-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
          >
            <div className="max-h-[85vh] overflow-y-auto px-4 pb-12 pt-6 sm:px-6 sm:pb-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <PieChart className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                      All Categories
                    </h2>
                    {totalSpent > 0 && (
                      <p className="text-xs text-foreground/50">
                        Total: {formatAmount(totalSpent)}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {sortedCategories.length === 0 ? (
                  <div className="text-center py-8 text-foreground/50 text-sm">
                    No expenses recorded yet. Add a transaction to see your
                    spending breakdown.
                  </div>
                ) : (
                  sortedCategories.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex justify-between text-sm font-medium mb-1.5">
                        <span className="text-foreground/80 capitalize">
                          {cat.name}
                        </span>
                        <span className="text-foreground">
                          {formatAmount(cat.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 bg-foreground/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${cat.color} rounded-full transition-all duration-700`}
                            style={{ width: `${cat.percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground/50 w-8 text-right">
                          {cat.percent}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={onClose}
                className="mt-8 w-full rounded-2xl bg-foreground/5 text-foreground py-3.5 font-medium transition-colors hover:bg-foreground/10 active:scale-[0.98] cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
