"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { useTransactions } from "@/hooks/useFirebaseData";
import { useCurrency } from "@/hooks/useCurrency";
import { Transaction } from "@/lib/firebase/firestore";
import EditTransactionModal from "./EditTransactionModal";

function formatDate(dateObj: any) {
  if (!dateObj) return "";
  const d = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ActionMenu({
  onEdit,
  onClose,
}: {
  onEdit: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-20 min-w-[130px] overflow-hidden rounded-2xl border border-foreground/10 bg-[var(--card-bg)] shadow-xl"
    >
      <button
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
      >
        ✏️ Edit
      </button>
    </div>
  );
}

export default function TransactionList() {
  const [search, setSearch] = useState("");
  const { transactions, loading } = useTransactions();
  const { formatAmount } = useCurrency();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  if (loading) {
    return <div className="animate-pulse h-64 bg-foreground/5 rounded-3xl" />;
  }

  const filteredTransactions = transactions.filter(
    (tx) =>
      (tx.notes || tx.category).toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Recent Transactions
          </h2>

          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 h-4 w-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-foreground/10 bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none ring-accent transition-all focus:border-accent focus:ring-1"
            />
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="divide-y divide-foreground/5">
            {filteredTransactions.length === 0 ? (
              <div className="py-8 text-center text-foreground/50">
                No transactions found. Adding one will automatically sync!
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 hover:bg-foreground/[0.02] transition-colors"
                >
                  {/* Left: icon + info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tx.type === "income" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}
                    >
                      {tx.type === "income" ? (
                        <ArrowUpRight className="h-6 w-6" />
                      ) : (
                        <ArrowDownRight className="h-6 w-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold capitalize truncate">
                        {tx.notes || tx.category}
                      </p>
                      <p className="text-sm text-foreground/60 capitalize">
                        {tx.category}
                      </p>
                      <p className="text-xs text-foreground/40 mt-0.5">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>

                  {/* Right: amount + menu */}
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          tx.type === "income"
                            ? "text-green-600"
                            : "text-foreground"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatAmount(parseFloat(tx.amount as any) || 0)}
                      </p>
                      <p className="text-xs text-foreground/40 mt-0.5 capitalize">
                        {tx.type}
                      </p>
                    </div>

                    {/* Ellipsis menu trigger */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === tx.id ? null : tx.id!)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {openMenuId === tx.id && (
                        <ActionMenu
                          onEdit={() =>
                            setEditingTransaction(tx as Transaction)
                          }
                          onClose={() => setOpenMenuId(null)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <EditTransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
      />
    </>
  );
}
