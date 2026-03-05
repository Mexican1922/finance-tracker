"use client";

import { useState } from "react";
import { X, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import { addSubscription } from "@/lib/firebase/firestore";
import { useCurrency } from "@/hooks/useCurrency";

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Entertainment",
  "Music",
  "Software",
  "Health",
  "Utilities",
  "Other",
];

export default function AddSubscriptionModal({
  isOpen,
  onClose,
}: AddSubscriptionModalProps) {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await addSubscription({
        uid: user.uid,
        name,
        amount: parseFloat(amount),
        billingCycle,
        category,
        createdAt: new Date(),
      });

      // Reset form and close
      setName("");
      setAmount("");
      setBillingCycle("monthly");
      setCategory(CATEGORIES[0]);
      onClose();
    } catch (error) {
      console.error("Error adding subscription:", error);
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    Add Subscription
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground/70">
                    Service Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Netflix"
                    className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-3 px-4 outline-none ring-accent transition-all focus:border-accent focus:bg-transparent focus:ring-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground/70">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 font-medium">
                        {currency.symbol}
                      </span>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-3 pl-8 pr-4 outline-none ring-accent transition-all focus:border-accent focus:bg-transparent focus:ring-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground/70">
                      Billing Cycle
                    </label>
                    <select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value)}
                      className="w-full rounded-2xl border border-foreground/10 bg-[var(--card-bg)] text-foreground py-3 px-4 outline-none ring-accent transition-all focus:border-accent focus:ring-1 appearance-none"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground/70">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-foreground/10 bg-[var(--card-bg)] text-foreground py-3 px-4 outline-none ring-accent transition-all focus:border-accent focus:ring-1 appearance-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 w-full rounded-2xl bg-foreground text-background py-3.5 font-medium transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Adding..." : "Add Subscription"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
