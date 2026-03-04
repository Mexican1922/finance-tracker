/**
 * Calculates a Financial Health Score from 0 to 100 based on standard financial rules.
 *
 * Factors considered:
 * 1. Savings Rate (50% of score): How much of income is saved vs spent
 *    - Ideal is >= 20%
 * 2. Emergency Fund Ratio (30% of score): Months of expenses saved
 *    - Ideal is >= 3 months
 * 3. Spending Velocity (20% of score): Rate of spending early in the month
 *    - Lower is better
 */

export interface HealthFactors {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  daysIntoMonth: number; // 1-31
}

export function calculateHealthScore(factors: HealthFactors): number {
  const { monthlyIncome, monthlyExpenses, totalSavings, daysIntoMonth } =
    factors;

  if (monthlyIncome === 0) return 0;

  // 1. Savings Rate (Max 50 points)
  // Target: 20% savings rate (expenses should be <= 80% of income)
  const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome;
  let savingsRateScore = 0;
  if (savingsRate >= 0.2) savingsRateScore = 50;
  else if (savingsRate > 0) savingsRateScore = (savingsRate / 0.2) * 50;
  else savingsRateScore = 0; // Negative savings rate = 0 points

  // 2. Emergency Fund Ratio (Max 30 points)
  // Target: 3 months of expenses saved
  // If no expenses yet, default to a reasonable baseline or 100% score if savings exist
  const monthlyExpenseRunRate =
    monthlyExpenses > 0 ? (monthlyExpenses / daysIntoMonth) * 30 : 0;

  let emergencyFundScore = 0;
  if (monthlyExpenseRunRate > 0) {
    const monthsSaved = totalSavings / monthlyExpenseRunRate;
    if (monthsSaved >= 3) emergencyFundScore = 30;
    else emergencyFundScore = (monthsSaved / 3) * 30;
  } else if (totalSavings > 0) {
    emergencyFundScore = 30; // Have savings, but haven't spent anything yet
  }

  // 3. Spending Velocity (Max 20 points)
  // Are we pacing to overspend our income this month?
  let velocityScore = 20;
  if (monthlyExpenseRunRate > monthlyIncome) {
    // We are pacing to overspend. Determine how badly.
    const overspendRatio =
      (monthlyExpenseRunRate - monthlyIncome) / monthlyIncome;
    velocityScore = Math.max(0, 20 - overspendRatio * 20 * 2); // Penalize faster
  }

  // Calculate final score, bounded 0-100
  const finalScore = Math.round(
    savingsRateScore + emergencyFundScore + velocityScore,
  );
  return Math.max(0, Math.min(100, finalScore));
}

// Helper to determine the color associated with a score
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

// Helper to determine the message associated with a score
export function getScoreMessage(score: number): string {
  if (score >= 80) return "You are in excellent financial health!";
  if (score >= 60)
    return "You are doing well, but there is room for improvement.";
  if (score >= 40) return "Your financial health needs attention.";
  return "Critical: Please review your spending habits immediately.";
}
