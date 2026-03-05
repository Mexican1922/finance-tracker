"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Transaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/firebase/firestore";
import { useCurrency } from "@/hooks/useCurrency";

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

function toDateString(dateObj: any): string {
  if (!dateObj) return new Date().toISOString().split("T")[0];
  const d = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
  return d.toISOString().split("T")[0];
}

const CATEGORIES = [
  { value: "food", label: "Food & Dining" },
  { value: "transport", label: "Transportation" },
  { value: "shopping", label: "Shopping" },
  { value: "bills", label: "Bills & Utilities" },
  { value: "entertainment", label: "Entertainment" },
  { value: "salary", label: "Salary" },
  { value: "freelance", label: "Freelance" },
  { value: "investment", label: "Investment" },
  { value: "other", label: "Other" },
];

export default function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
}: EditTransactionModalProps) {
  const { currency } = useCurrency();
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Pre-fill form when transaction changes
  useEffect(() => {
    if (transaction && isOpen) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setNotes(transaction.notes || "");
      setDate(toDateString(transaction.date));
      setConfirmDelete(false);
    }
  }, [transaction, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction?.id) return;

    setIsLoading(true);
    try {
      await updateTransaction(transaction.id, {
        type,
        amount: parseFloat(amount),
        category,
        notes,
        date: new Date(date + "T12:00:00"),
      });
      onClose();
    } catch (error) {
      console.error("Error updating transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction?.id) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      await deleteTransaction(transaction.id);
      onClose();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && transaction && (
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
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md overflow-hidden rounded-t-3xl bg-background/80 px-4 pb-8 pt-6 shadow-2xl backdrop-blur-xl border-t border-foreground/10 sm:inset-x-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:pb-6"
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Edit Transaction
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
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    type === "expense"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    type === "income"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Amount */}
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
                    className="w-full rounded-2xl border border-foreground/10 bg-transparent py-4 pl-8 pr-4 text-2xl font-semibold outline-none ring-accent transition-all focus:border-accent focus:ring-1 text-foreground"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-foreground/10 bg-[var(--card-bg)] text-foreground px-4 py-3 outline-none ring-accent transition-all focus:border-accent focus:ring-1 appearance-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What was this for?"
                  className="w-full rounded-2xl border border-foreground/10 bg-transparent px-4 py-3 outline-none ring-accent transition-all focus:border-accent focus:ring-1 text-foreground"
                />
              </div>

              {/* Date */}
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

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                {/* Delete button */}
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all disabled:opacity-50 ${
                    confirmDelete
                      ? "bg-red-500 text-white w-full"
                      : "bg-red-500/10 text-red-500 hover:bg-red-500/20 w-12 shrink-0"
                  }`}
                >
                  <Trash2 className="h-4 w-4 shrink-0" />
                  {confirmDelete &&
                    (isDeleting ? "Deleting..." : "Confirm Delete")}
                </button>

                {/* Save button */}
                {!confirmDelete && (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 rounded-2xl bg-accent py-3.5 font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                )}
              </div>

              {confirmDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="w-full rounded-2xl bg-foreground/5 py-3 text-sm font-medium text-foreground/70 hover:bg-foreground/10 transition-colors"
                >
                  Cancel
                </button>
              )}
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
