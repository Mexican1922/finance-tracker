"use client";

import { useState } from "react";
import { Target, Pencil } from "lucide-react";
import AddGoalModal from "./AddGoalModal";
import EditGoalModal from "./EditGoalModal";
import { useSavingsGoals } from "@/hooks/useFirebaseData";
import { SavingsGoal } from "@/lib/firebase/firestore";
import { useCurrency } from "@/hooks/useCurrency";

export default function SavingsGoals() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const { goals, loading } = useSavingsGoals();
  const { formatAmount } = useCurrency();

  if (loading) {
    return <div className="animate-pulse h-32 bg-foreground/5 rounded-3xl" />;
  }

  const totalSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight">
            Savings Goals
          </h2>
          <p className="text-sm text-foreground/60 mt-1">
            {goals.length > 0 ? (
              <>
                <span className="font-semibold text-foreground">
                  {formatAmount(totalSaved)}
                </span>{" "}
                saved of{" "}
                <span className="font-semibold text-foreground">
                  {formatAmount(totalTarget)}
                </span>{" "}
                total
              </>
            ) : (
              "Track your progress towards your financial objectives."
            )}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="shrink-0 rounded-full bg-foreground/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/10 cursor-pointer"
        >
          + Add Goal
        </button>
      </div>

      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <EditGoalModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedGoal(null);
        }}
        goal={selectedGoal}
      />

      {goals.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Target className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
          <p className="text-foreground/50 font-medium">No savings goals yet</p>
          <p className="text-foreground/40 text-sm mt-1">
            Create one to start tracking your progress!
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-0 sm:grid sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = Math.min(
              100,
              Math.max(0, (goal.currentAmount / goal.targetAmount) * 100),
            );

            return (
              <div
                key={goal.id}
                className="glass-card p-5 sm:p-6 flex flex-col justify-between group transition-colors relative overflow-hidden"
              >
                {/* Top Row: icon + deadline + edit */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Target className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-foreground/5 rounded-md text-foreground/60">
                      {goal.deadline}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGoal(goal);
                        setIsEditModalOpen(true);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground/5 text-foreground/50 transition-colors hover:bg-accent/10 hover:text-accent cursor-pointer"
                      aria-label={`Edit ${goal.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Name + amounts */}
                <h3 className="font-semibold text-lg tracking-tight mb-1 truncate">
                  {goal.name}
                </h3>

                {/* Mobile: horizontal row | Desktop: stacked */}
                <div className="flex items-baseline gap-1.5 mb-4 sm:mb-6">
                  <span className="text-2xl font-bold tracking-tight">
                    {formatAmount(goal.currentAmount || 0)}
                  </span>
                  <span className="text-sm text-foreground/50 font-medium">
                    / {formatAmount(goal.targetAmount)}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-foreground/70">Progress</span>
                    <span
                      className={
                        progress >= 100 ? "text-green-600" : "text-foreground"
                      }
                    >
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        progress >= 100 ? "bg-green-500" : "bg-accent"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
