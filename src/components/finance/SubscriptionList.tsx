"use client";

import { useState } from "react";
import { CreditCard, Calendar, Pencil } from "lucide-react";
import AddSubscriptionModal from "./AddSubscriptionModal";
import EditSubscriptionModal from "./EditSubscriptionModal";
import { useSubscriptions } from "@/hooks/useFirebaseData";
import { Subscription } from "@/lib/firebase/firestore";
import { useCurrency } from "@/hooks/useCurrency";

export default function SubscriptionList() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const { subscriptions, loading } = useSubscriptions();
  const { formatAmount } = useCurrency();

  if (loading) {
    return <div className="animate-pulse h-32 bg-foreground/5 rounded-3xl" />;
  }

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight">
            Active Subscriptions
          </h2>
          <p className="text-sm text-foreground/60 mt-1">
            {subscriptions.length > 0 ? (
              <>
                You are spending{" "}
                <span className="font-semibold text-foreground">
                  {formatAmount(totalMonthly)}
                </span>{" "}
                per month on subscriptions.
              </>
            ) : (
              "Track your recurring payments and subscriptions."
            )}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="shrink-0 rounded-full bg-foreground/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/10 cursor-pointer"
        >
          + Add
        </button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <CreditCard className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
          <p className="text-foreground/50 font-medium">No subscriptions yet</p>
          <p className="text-foreground/40 text-sm mt-1">
            Add your recurring payments to keep track of them.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-0 sm:grid sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="glass-card p-4 sm:p-5 flex items-center sm:flex-col sm:items-stretch gap-4 sm:gap-0 group transition-transform hover:scale-[1.01] sm:hover:scale-[1.02]"
            >
              {/* Mobile: horizontal layout | Desktop: vertical card */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white sm:mb-4">
                <CreditCard className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0 sm:flex-initial">
                <div className="flex items-center justify-between sm:mb-0">
                  <h3 className="font-semibold text-foreground tracking-tight truncate">
                    {sub.name}
                  </h3>
                  <span className="text-lg font-semibold ml-3 sm:hidden">
                    {formatAmount(sub.amount || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-foreground/50">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {sub.billingCycle === "yearly" ? "Yearly" : "Monthly"}
                  </span>
                </div>
                {/* Desktop amount */}
                <div className="hidden sm:flex sm:items-center sm:justify-between sm:mt-4">
                  <span className="text-lg font-semibold">
                    {formatAmount(sub.amount || 0)}
                  </span>
                </div>
              </div>

              {/* Edit button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSub(sub);
                  setIsEditModalOpen(true);
                }}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-foreground/5 text-foreground/50 transition-colors hover:bg-accent/10 hover:text-accent cursor-pointer"
                aria-label={`Edit ${sub.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <EditSubscriptionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSub(null);
        }}
        subscription={selectedSub}
      />
    </div>
  );
}
