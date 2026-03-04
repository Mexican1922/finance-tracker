"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { addTransaction } from "@/lib/firebase/firestore";
import { useCurrency } from "@/hooks/useCurrency";

export default function AddTransactionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await addTransaction({
        uid: user.uid,
        amount: parseFloat(amount),
        type,
        category,
        notes,
        isRecurring: false,
        date: new Date(date + "T12:00:00"),
      });

      // Reset form and close
      setAmount("");
      setCategory("food");
      setNotes("");
      setDate(new Date().toISOString().split("T")[0]);
      setType("expense");
      onClose();
    } catch (error) {
      console.error("Error adding transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md overflow-hidden rounded-3xl bg-background/60 p-6 shadow-2xl backdrop-blur-xl border border-foreground/10 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                Add Transaction
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Type Toggle */}
              <div className="flex rounded-xl bg-foreground/5 p-1">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${type === "expense" ? "bg-background shadow-sm text-foreground" : "text-foreground/60 hover:text-foreground"}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${type === "income" ? "bg-background shadow-sm text-foreground" : "text-foreground/60 hover:text-foreground"}`}
                >
                  Income
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-foreground/40">
                    {currency.symbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full rounded-2xl border border-foreground/10 bg-transparent py-4 pl-8 pr-4 text-2xl font-semibold outline-none ring-accent transition-all focus:border-accent focus:ring-1"
                  />
                </div>
              </div>

              {/* Category Input */}
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-foreground/10 bg-[var(--card-bg)] text-foreground px-4 py-3 outline-none ring-accent transition-all focus:border-accent focus:ring-1 appearance-none"
                >
                  <option value="food">Food & Dining</option>
                  <option value="transport">Transportation</option>
                  <option value="shopping">Shopping</option>
                  <option value="bills">Bills & Utilities</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Note Input */}
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What was this for?"
                  className="w-full rounded-2xl border border-foreground/10 bg-transparent px-4 py-3 outline-none ring-accent transition-all focus:border-accent focus:ring-1"
                />
              </div>

              {/* Date Input */}
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-2xl border border-foreground/10 bg-transparent px-4 py-3 outline-none ring-accent transition-all focus:border-accent focus:ring-1 text-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full rounded-2xl bg-foreground text-background py-3.5 font-medium transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Saving..." : "Save Transaction"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
