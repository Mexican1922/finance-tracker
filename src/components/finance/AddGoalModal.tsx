"use client";

import { useState } from "react";
import { X, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import { addGoal } from "@/lib/firebase/firestore";
import { useCurrency } from "@/hooks/useCurrency";

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddGoalModal({ isOpen, onClose }: AddGoalModalProps) {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await addGoal({
        uid: user.uid,
        name,
        targetAmount: parseFloat(target),
        currentAmount: 0,
        deadline,
        createdAt: new Date(),
      });

      // Reset form and close
      setName("");
      setTarget("");
      setDeadline("");
      onClose();
    } catch (error) {
      console.error("Error adding goal:", error);
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
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Target className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Create Goal
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground/70">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vacation Fund"
                  className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-3 px-4 outline-none ring-accent transition-all focus:border-accent focus:bg-transparent focus:ring-1"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground/70">
                  Target Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 font-medium">
                    {currency.symbol}
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-3 pl-8 pr-4 outline-none ring-accent transition-all focus:border-accent focus:bg-transparent focus:ring-1"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground/70">
                  Target Deadline
                </label>
                <input
                  type="month"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-3 px-4 outline-none ring-accent transition-all focus:border-accent focus:bg-transparent focus:ring-1 text-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full rounded-2xl bg-foreground text-background py-3.5 font-medium transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Saving..." : "Save Goal"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
