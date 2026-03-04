"use client";

import SavingsGoals from "@/components/finance/SavingsGoals";
import SubscriptionList from "@/components/finance/SubscriptionList";

export default function GoalsPage() {
  return (
    <div className="space-y-12 pb-12">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Planning & Goals
        </h1>
        <p className="text-foreground/60 mt-1 text-sm sm:text-base">
          Manage subscriptions and long-term financial objectives.
        </p>
      </header>

      {/* Subscriptions Tracker */}
      <section>
        <SubscriptionList />
      </section>

      {/* Divider */}
      <div className="h-px w-full bg-foreground/5" />

      {/* Savings Goals Tracker */}
      <section>
        <SavingsGoals />
      </section>
    </div>
  );
}
