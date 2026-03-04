"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { SavingsGoal } from "@/lib/firebase/firestore";
import { useCurrency } from "@/hooks/useCurrency";

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export default function EditGoalModal({
  isOpen,
  onClose,
  goal,
}: EditGoalModalProps) {
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currency } = useCurrency();

  useEffect(() => {
    if (goal && isOpen) {
      setCurrentAmount(goal.currentAmount.toString());
      setTargetAmount(goal.targetAmount.toString());
      setDeadline(goal.deadline);
    }
  }, [goal, isOpen]);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAmount || !targetAmount || !deadline) return;

    setIsSubmitting(true);
    try {
      const goalRef = doc(db, "goals", goal.id as string);
      await updateDoc(goalRef, {
        currentAmount: parseFloat(currentAmount),
        targetAmount: parseFloat(targetAmount),
        deadline,
      });
      onClose();
    } catch (error) {
      console.error("Error updating goal: ", error);
      alert("Failed to update goal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass-card relative w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-foreground/5 px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Edit '{goal.name}'
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-foreground/50 hover:bg-foreground/5 hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground/80">
              Current Saved Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50">
                {currency.symbol}
              </span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full rounded-xl border border-foreground/10 bg-foreground/[0.02] py-2.5 pl-8 pr-4 text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground/80">
              Target Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50">
                {currency.symbol}
              </span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full rounded-xl border border-foreground/10 bg-foreground/[0.02] py-2.5 pl-8 pr-4 text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground/80">
              Target Date
            </label>
            <input
              type="text"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-foreground/10 bg-foreground/[0.02] px-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
              placeholder="e.g. Dec 2026"
            />
          </div>

          <div className="mt-6 flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-foreground/5 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer flex justify-center items-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
